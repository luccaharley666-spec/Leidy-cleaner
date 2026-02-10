// Configuração
const API_BASE = 'http://localhost:3001/api';
let authToken = localStorage.getItem('authToken');
let refreshToken = localStorage.getItem('refreshToken');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
let socket = null;
let revenueChart = null;

// INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 App inicializado');
  
  if (authToken) {
    verifyToken();
  } else {
    showPage('login');
  }

  setupUploadDragDrop();
  connectSocket();
});

// Reconnect socket with new token
function reconnectSocket() {
  if (socket) {
    try { socket.disconnect(); } catch (e) {}
    socket = null;
  }
  connectSocket();
}

// Socket.io
function connectSocket() {
  socket = io(API_BASE.replace('/api', ''), {
    auth: { token: authToken }
  });

  socket.on('connect', () => console.log('✅ Socket conectado'));
  socket.on('disconnect', (reason) => console.log('Socket desconectado:', reason));
  socket.on('new-message', (data) => {
    const messagesDiv = document.getElementById('chatMessages');
    if (messagesDiv) addChatMessage(data);
  });
  socket.on('user-joined', (data) => console.log('👤 Usuário entrou:', data.user));
}

// Wrapper fetch com refresh token automático
async function apiFetch(path, options = {}) {
  const headers = options.headers || {};
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  options.headers = headers;

  let res = await fetch(`${API_BASE}${path}`, options);

  if (res.status === 401 && refreshToken) {
    // tentar renovar
    try {
      const r = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });
      const data = await r.json();
      if (r.ok && data.success && data.accessToken) {
        authToken = data.accessToken;
        localStorage.setItem('authToken', authToken);
        // reconectar socket com novo token
        reconnectSocket();
        // refazer requisição original
        headers['Authorization'] = `Bearer ${authToken}`;
        options.headers = headers;
        res = await fetch(`${API_BASE}${path}`, options);
        return res;
      }
    } catch (e) {
      console.warn('Falha ao renovar token:', e);
    }
    logout();
    throw new Error('Unauthorized');
  }

  return res;
}

// AUTENTICAÇÃO
async function login() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    alert('Email e senha são obrigatórios');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (data.success) {
      authToken = data.tokens?.accessToken || data.accessToken || null;
      refreshToken = data.tokens?.refreshToken || data.refreshToken || null;
      currentUser = data.user;
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      document.getElementById('userInfo').textContent = `👤 ${currentUser.name}`;
      reconnectSocket();
      showPage('home');
      loadDashboard();
    } else {
      alert(data.error || data.message || 'Erro ao fazer login');
    }
  } catch (error) {
    console.error('Erro no login:', error);
    alert('Erro ao conectar com servidor');
  }
}

async function logout() {
  try {
    await apiFetch('/auth/logout', { method: 'POST' });
  } catch (e) {}
  authToken = null;
  refreshToken = null;
  currentUser = null;
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('currentUser');
  if (socket) try { socket.disconnect(); } catch (e) {}
  showPage('login');
}

async function verifyToken() {
  try {
    const res = await apiFetch('/auth/verify', { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      currentUser = data.user;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      document.getElementById('userInfo').textContent = `👤 ${currentUser.name}`;
      showPage('home');
      loadDashboard();
    } else {
      logout();
    }
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    logout();
  }
}

// NAVEGAÇÃO
function showPage(pageName) {
  // Esconder todas as páginas
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  
  // Mostrar página selecionada
  const page = document.getElementById(pageName);
  if (page) {
    page.classList.add('active');
  }

  // Atualizar menu
  document.querySelectorAll('.menu-link').forEach(link => {
    link.classList.remove('active');
  });

  // Carregar dados conforme necessário
  switch(pageName) {
    case 'bookings':
      loadBookings();
      break;
    case 'reviews':
      loadPublicReviews();
      break;
    case 'admin-dashboard':
      loadAdminDashboard();
      break;
    case 'staff-dashboard':
      loadStaffDashboard();
      break;
    case 'chat':
      loadChatBookings();
      break;
    case 'photos':
      loadPhotoBookings();
      break;
  }

  // Atualizar título
  const titles = {
    'login': 'Login',
    'home': 'Home',
    'bookings': 'Meus Agendamentos',
    'reviews': 'Avaliações Públicas',
    'admin-dashboard': 'Dashboard Admin',
    'staff-dashboard': 'Dashboard Funcionária',
    'chat': 'Chat',
    'photos': 'Fotos'
  };
  
  document.getElementById('pageTitle').textContent = titles[pageName] || 'Leidy Cleaner';
}

// DASHBOARD HOME
async function loadDashboard() {
  if (!authToken) return;

  try {
    const res = await apiFetch(`/bookings/${currentUser.id}`, { method: 'GET' });
    const bookings = await res.json();
    const upcomingTable = document.getElementById('upcomingBookings');
    
    const upcoming = bookings.filter(b => new Date(b.date) > new Date()).slice(0, 5);
    
    if (upcoming.length > 0) {
      upcomingTable.innerHTML = upcoming.map(b => `
        <tr>
          <td>${new Date(b.date).toLocaleDateString('pt-BR')}</td>
          <td>${b.time}</td>
          <td>${b.service}</td>
          <td><span class="badge badge-${getStatusColor(b.status)}">${b.status}</span></td>
        </tr>
      `).join('');
    }
  } catch (error) {
    console.error('Erro ao carregar dashboard:', error);
  }
}

// AGENDAMENTOS
async function loadBookings() {
  if (!authToken) return;

  try {
    const res = await apiFetch(`/bookings/${currentUser.id}`, { method: 'GET' });
    const bookings = await res.json();
    const tbody = document.querySelector('#bookingsList tbody');
    
    tbody.innerHTML = bookings.map(b => `
      <tr>
        <td>${new Date(b.date).toLocaleDateString('pt-BR')}</td>
        <td>${b.time}</td>
        <td>${b.service}</td>
        <td>${b.location}</td>
        <td>R$ ${b.price.toFixed(2)}</td>
        <td><span class="badge badge-${getStatusColor(b.status)}">${b.status}</span></td>
        <td>
          <button class="btn btn-secondary" onclick="editBooking(${b.id})" style="padding: 5px 10px; font-size: 12px;">Editar</button>
          <button class="btn btn-danger" onclick="cancelBooking(${b.id})" style="padding: 5px 10px; font-size: 12px;">Cancelar</button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Erro ao carregar agendamentos:', error);
  }
}

function openBookingModal() {
  document.getElementById('bookingModal').classList.add('active');
}

function closeBookingModal() {
  document.getElementById('bookingModal').classList.remove('active');
}

async function createBooking() {
  const date = document.getElementById('bookingDate').value;
  const time = document.getElementById('bookingTime').value;
  const service = document.getElementById('bookingService').value;
  const notes = document.getElementById('bookingNotes').value;

  if (!date || !time) {
    alert('Data e hora são obrigatórias');
    return;
  }

  try {
    const res = await apiFetch('/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date,
        time,
        service,
        notes,
        location: 'A definir',
        price: getPriceForService(service)
      })
    });

    const data = await res.json();
    if (data.success) {
      alert('✅ Agendamento criado com sucesso!');
      closeBookingModal();
      loadBookings();
    } else {
      alert(data.message || 'Erro ao criar agendamento');
    }
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao criar agendamento');
  }
}

function getPriceForService(service) {
  const prices = {
    'limpeza-rapida': 30,
    'limpeza-completa': 60,
    'limpeza-profunda': 120,
    'limpeza-organizacao': 150
  };
  return prices[service] || 0;
}

function getStatusColor(status) {
  const colors = {
    'pending': 'warning',
    'confirmed': 'info',
    'completed': 'success',
    'cancelled': 'danger'
  };
  return colors[status] || 'info';
}

// AVALIAÇÕES PÚBLICAS
async function loadPublicReviews() {
  try {
    const res = await apiFetch('/public-reviews', { method: 'GET' });
    const reviews = await res.json();

    const statsRes = await apiFetch('/reviews-stats/public', { method: 'GET' });
    const stats = await statsRes.json();

    document.getElementById('avgRating').textContent = (stats.average_rating || 0).toFixed(1);
    document.getElementById('totalReviews').textContent = stats.total_reviews || 0;
    document.getElementById('fiveStarCount').textContent = stats.five_star_count || 0;

    const reviewsHtml = reviews.map(r => `
      <div class="review-item">
        <div class="review-header">
          <div>
            <div class="review-name">${r.customer_name}</div>
            <div class="review-rating">${'⭐'.repeat(r.rating)}</div>
          </div>
          <div style="font-size: 12px; color: #718096;">${new Date(r.created_at).toLocaleDateString('pt-BR')}</div>
        </div>
        <div class="review-text">${r.comment}</div>
        ${r.admin_response ? `<div class="review-response"><strong>Resposta Admin:</strong> ${r.admin_response}</div>` : ''}
      </div>
    `).join('');

    document.getElementById('reviewsList').innerHTML = reviewsHtml;
  } catch (error) {
    console.error('Erro ao carregar avaliações:', error);
  }
}

// ADMIN DASHBOARD
async function loadAdminDashboard() {
  if (currentUser?.role !== 'admin') {
    alert('Acesso restrito a administradores');
    showPage('home');
    return;
  }

  try {
    const res = await apiFetch('/admin/dashboard', { method: 'GET' });
    const data = await res.json();
    
    // Atualizar cards
    document.getElementById('totalRevenue').textContent = `R$ ${(data.monthlyRevenue.total_revenue || 0).toFixed(2)}`;
    document.getElementById('totalBookings').textContent = data.monthlyRevenue.total_bookings || 0;
    document.getElementById('activeStaff').textContent = data.staffCount || 0;
    document.getElementById('pendingBookings').textContent = data.pendingBookings || 0;

    // Gráfico de receita
    loadRevenueChart();

    // Top funcionárias
    const staffTable = document.getElementById('staffEarningsTable tbody');
    if (data.staffEarnings) {
      staffTable.innerHTML = data.staffEarnings.map(s => `
        <tr>
          <td>${s.name}</td>
          <td>${s.bookings_completed}</td>
          <td>R$ ${(s.total_earnings || 0).toFixed(2)}</td>
          <td>${(s.average_rating || 0).toFixed(1)} ⭐</td>
        </tr>
      `).join('');
    }
  } catch (error) {
    console.error('Erro ao carregar admin dashboard:', error);
  }
}

function loadRevenueChart() {
  const ctx = document.getElementById('revenueChart');
  if (!ctx) return;

  if (revenueChart) revenueChart.destroy();

  revenueChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'],
      datasets: [{
        label: 'Receita (R$)',
        data: [150, 200, 180, 250, 300, 400, 350],
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return 'R$ ' + value;
            }
          }
        }
      }
    }
  });
}

// STAFF DASHBOARD
async function loadStaffDashboard() {
  if (currentUser?.role !== 'staff') {
    alert('Acesso restrito a funcionárias');
    showPage('home');
    return;
  }

  try {
    const res = await apiFetch('/staff/dashboard', { method: 'GET' });
    const data = await res.json();

    document.getElementById('staffTotalEarnings').textContent = `R$ ${(data.totalEarnings || 0).toFixed(2)}`;
    document.getElementById('staffMonthEarnings').textContent = `R$ ${(data.monthEarnings || 0).toFixed(2)}`;
    document.getElementById('staffRating').textContent = (data.averageRating || 0).toFixed(1) + ' ⭐';
    document.getElementById('staffStreak').textContent = data.fiveStarStreak || 0;

    // Agendamentos próximos
    const bookingsTable = document.getElementById('staffBookingsTable tbody');
    if (data.upcomingBookings) {
      bookingsTable.innerHTML = data.upcomingBookings.map(b => `
        <tr>
          <td>${new Date(b.date).toLocaleDateString('pt-BR')} ${b.time}</td>
          <td>${b.customer_name}</td>
          <td>${b.service}</td>
          <td><span class="badge badge-${getStatusColor(b.status)}">${b.status}</span></td>
          <td>
            <button class="btn btn-success" onclick="confirmBooking(${b.id})" style="padding: 5px 10px; font-size: 12px;">Confirmar</button>
            <button class="btn btn-primary" onclick="completeBooking(${b.id})" style="padding: 5px 10px; font-size: 12px;">Concluir</button>
          </td>
        </tr>
      `).join('');
    }

    // Relatório para pagamento
    const paymentTable = document.getElementById('paymentReportTable tbody');
    if (data.paymentReport) {
      paymentTable.innerHTML = data.paymentReport.map(p => `
        <tr>
          <td>${p.period}</td>
          <td>${p.bookings}</td>
          <td>R$ ${(p.revenue || 0).toFixed(2)}</td>
          <td>R$ ${(p.commission || 0).toFixed(2)}</td>
        </tr>
      `).join('');
    }
  } catch (error) {
    console.error('Erro ao carregar staff dashboard:', error);
  }
}

async function confirmBooking(bookingId) {
  try {
    const res = await apiFetch(`/staff/bookings/${bookingId}/confirm`, { method: 'POST' });
    if (res.ok) {
      alert('✅ Agendamento confirmado!');
      loadStaffDashboard();
    }
  } catch (error) {
    console.error('Erro:', error);
  }
}

async function completeBooking(bookingId) {
  try {
    const res = await apiFetch(`/staff/bookings/${bookingId}/complete`, { method: 'POST' });
    if (res.ok) {
      alert('✅ Agendamento concluído!');
      loadStaffDashboard();
    }
  } catch (error) {
    console.error('Erro:', error);
  }
}

// CHAT
async function loadChatBookings() {
  if (!authToken) return;

  try {
    const res = await apiFetch(`/bookings/${currentUser.id}`, { method: 'GET' });
    const bookings = await res.json();
    const select = document.getElementById('chatBookingSelect');
    
    select.innerHTML = '<option value="">-- Selecione um agendamento --</option>' +
      bookings.map(b => `<option value="${b.id}">${new Date(b.date).toLocaleDateString('pt-BR')} - ${b.service}</option>`).join('');
  } catch (error) {
    console.error('Erro:', error);
  }
}

function joinBookingChat() {
  const bookingId = document.getElementById('chatBookingSelect').value;
  if (!bookingId) return;

  socket.emit('join-booking', {
    bookingId: parseInt(bookingId),
    userId: currentUser.id,
    userRole: currentUser.role
  });

  document.getElementById('chatContainer').style.display = 'flex';
  document.getElementById('chatMessages').innerHTML = '';
}

function sendMessage() {
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  const bookingId = document.getElementById('chatBookingSelect').value;

  if (!message) return;

  socket.emit('send-message', {
    bookingId: parseInt(bookingId),
    userId: currentUser.id,
    message: message
  });

  input.value = '';
}

function handleChatKeypress(e) {
  if (e.key === 'Enter') sendMessage();
}

function addChatMessage(data) {
  const messagesDiv = document.getElementById('chatMessages');
  const isOwn = data.user_id === currentUser.id;
  
  const messageEl = document.createElement('div');
  messageEl.className = `chat-message ${isOwn ? 'message-mine' : ''}`;
  messageEl.innerHTML = `
    <div class="message-bubble">${data.message}</div>
    <div class="message-timestamp">${new Date(data.created_at).toLocaleTimeString('pt-BR')}</div>
  `;
  
  messagesDiv.appendChild(messageEl);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// FOTOS
async function loadPhotoBookings() {
  try {
    const res = await apiFetch(`/bookings/${currentUser.id}`, { method: 'GET' });
    const bookings = await res.json();
    const select = document.getElementById('photoBookingSelect');
    
    select.innerHTML = '<option value="">-- Selecione um agendamento --</option>' +
      bookings.map(b => `<option value="${b.id}">${new Date(b.date).toLocaleDateString('pt-BR')} - ${b.service}</option>`).join('');
  } catch (error) {
    console.error('Erro:', error);
  }
}

async function loadBookingPhotos() {
  const bookingId = document.getElementById('photoBookingSelect').value;
  if (!bookingId) return;

  document.getElementById('photoSection').style.display = 'block';

  try {
    const res = await apiFetch(`/bookings/${bookingId}/photos`, { method: 'GET' });
    const photos = await res.json();
    const gallery = document.getElementById('bookingGallery');
    
    gallery.innerHTML = photos.map(p => `
      <div class="gallery-item">
        <img src="${p.url}" alt="Foto">
        <div class="[REDACTED_TOKEN]">
          <button onclick="deletePhoto(${p.id})">Deletar</button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Erro:', error);
  }
}

function setupUploadDragDrop() {
  const uploadArea = document.getElementById('uploadArea');
  if (!uploadArea) return;

  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    uploadPhotos({ target: { files } });
  });

  uploadArea.addEventListener('click', () => {
    document.getElementById('photoInput').click();
  });
}

async function uploadPhotos(e) {
  const bookingId = document.getElementById('photoBookingSelect').value;
  if (!bookingId) {
    alert('Selecione um agendamento primeiro');
    return;
  }

  const files = e.target.files || [];
  if (files.length === 0) return;

  const formData = new FormData();
  for (let file of files) {
    formData.append('photos', file);
  }

  try {
    const res = await apiFetch(`/bookings/${bookingId}/photos`, {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      alert('✅ Fotos enviadas com sucesso!');
      loadBookingPhotos();
    }
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao enviar fotos');
  }
}

async function deletePhoto(photoId) {
  if (!confirm('Tem certeza que deseja deletar esta foto?')) return;

  try {
    const res = await apiFetch(`/photos/${photoId}`, { method: 'DELETE' });
    if (res.ok) {
      alert('✅ Foto deletada!');
      loadBookingPhotos();
    }
  } catch (error) {
    console.error('Erro:', error);
  }
}

// HELPERS
function editBooking(id) {
  alert('Editar agendamento ' + id + ' (em desenvolvimento)');
}

function cancelBooking(id) {
  if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
    alert('Agendamento cancelado (em desenvolvimento)');
  }
}
