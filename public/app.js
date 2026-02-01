// ===== CONFIG =====
const API_URL = 'http://localhost:3001/api';
let currentUser = null;
let authToken = null;
let stripe = null;
let cardElement = null;
let currentBookingId = null;
let bookingTotal = 0;

// ===== UTILITÁRIOS DE MÁSCARA E VALIDAÇÃO =====
function maskCPF(value) {
    return value.replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function maskPhone(value) {
    return value.replace(/\D/g, '')
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .substring(0, 15);
}

function validateCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11 || /^([0-9])\1+$/.test(cpf)) return false;
    const calc = (t) => {
        let s = 0;
        for (let i = 0; i < t; i++) s += parseInt(cpf.charAt(i)) * (t + 1 - i);
        let d = 11 - (s % 11);
        return d > 9 ? 0 : d;
    };
    return calc(9) === parseInt(cpf.charAt(9)) && calc(10) === parseInt(cpf.charAt(10));
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    // Restaurar token do localStorage
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
        authToken = savedToken;
        updateAuthUI();
    }

    // Event listeners
    setupEventListeners();
    // Inicializar Stripe Elements
    initializeStripe();
    initializeDatePicker();
});

function initializeStripe() {
    try {
        const key = window.STRIPE_PUBLIC_KEY || null;
        if (!key) return console.warn('STRIPE_PUBLIC_KEY não configurada no navegador.');
        stripe = Stripe(key);
        const elements = stripe.elements();
        cardElement = elements.create('card', { hidePostalCode: true });
        // Pode falhar se #card-element não existir (render condicional)
        const mountPoint = document.getElementById('card-element');
        if (mountPoint) cardElement.mount('#card-element');
    } catch (err) {
        console.error('Erro ao inicializar Stripe:', err);
    }
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Navegação
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const section = e.target.dataset.section;
            showSection(section);
        });
    });

    // Autenticação
    document.getElementById('authForm').addEventListener('submit', handleAuth);
    document.querySelectorAll('input[name="authMode"]').forEach(radio => {
        radio.addEventListener('change', toggleAuthFields);
    });

    // Máscaras em campos do formulário
    const cpfField = document.getElementById('cpf_cnpj');
    if (cpfField) {
        cpfField.addEventListener('input', (e) => {
            e.target.value = maskCPF(e.target.value);
        });
    }

    const phoneFields = document.querySelectorAll('input[type="tel"]');
    phoneFields.forEach(f => f.addEventListener('input', (e) => {
        e.target.value = maskPhone(e.target.value);
    }));

    // Botões
    document.getElementById('btnLogin').addEventListener('click', () => showSection('auth'));
    document.getElementById('btnLogout').addEventListener('click', logout);
    document.getElementById('btnComeceLogo').addEventListener('click', () => {
        if (authToken) {
            showSection('agendar');
        } else {
            showSection('auth');
        }
    });

    // Agendamento
    document.getElementById('bookingForm').addEventListener('submit', handleBooking);
    document.getElementById('duration').addEventListener('change', calculatePrice);
    document.getElementById('hasStaff').addEventListener('change', calculatePrice);
    document.getElementById('hasQuarter').addEventListener('change', calculatePrice);
    document.getElementById('isPostWork').addEventListener('change', calculatePrice);

    // Pagamento
    document.getElementById('paymentForm').addEventListener('submit', handlePayment);
}

// ===== AUTENTICAÇÃO =====
async function handleAuth(e) {
    e.preventDefault();
    const mode = document.querySelector('input[name="authMode"]:checked').value;

    const credentials = {
        email: mode === 'login' ? document.getElementById('email').value : document.getElementById('regEmail').value,
        password: mode === 'login' ? document.getElementById('password').value : document.getElementById('regPassword').value
    };

    if (mode === 'register') {
        credentials.name = document.getElementById('name').value;
        credentials.phone = document.getElementById('phone').value;
        const rawCpf = document.getElementById('cpf_cnpj').value;
        credentials.cpf_cnpj = rawCpf;
        // Validar CPF simples antes de enviar
        if (!validateCPF(rawCpf)) {
            showAlert('CPF inválido. Verifique e tente novamente.', 'error');
            return;
        }
        credentials.address = document.getElementById('address').value;
        credentials.city = document.getElementById('city').value;
        credentials.state = document.getElementById('state').value;
        credentials.zip_code = document.getElementById('zip_code').value;
    }

    try {
        const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });

        if (!response.ok) {
            const error = await response.json();
            showAlert(error.message || 'Erro na autenticação', 'error');
            return;
        }

        const data = await response.json();
        authToken = data.token;
        localStorage.setItem('authToken', authToken);
        
        updateAuthUI();
        showAlert(`${mode === 'login' ? 'Login' : 'Conta criada'} com sucesso!`, 'success');
        showSection('home');
    } catch (error) {
        showAlert('Erro ao conectar com servidor', 'error');
        console.error(error);
    }
}

function toggleAuthFields() {
    const mode = document.querySelector('input[name="authMode"]:checked').value;
    document.getElementById('loginFields').style.display = mode === 'login' ? 'flex' : 'none';
    document.getElementById('registerFields').style.display = mode === 'register' ? 'flex' : 'none';
}

function updateAuthUI() {
    if (authToken) {
        document.getElementById('btnLogin').style.display = 'none';
        document.getElementById('btnLogout').style.display = 'block';
        
        // Mostrar opções de usuário
        document.getElementById('nav-agendar').style.display = 'block';
        document.getElementById('nav-meus').style.display = 'block';
        document.getElementById('nav-fid').style.display = 'block';
    } else {
        document.getElementById('btnLogin').style.display = 'block';
        document.getElementById('btnLogout').style.display = 'none';
        
        // Esconder opções de usuário
        document.getElementById('nav-agendar').style.display = 'none';
        document.getElementById('nav-meus').style.display = 'none';
        document.getElementById('nav-fid').style.display = 'none';
    }
}

function logout() {
    authToken = null;
    localStorage.removeItem('authToken');
    updateAuthUI();
    showSection('home');
    showAlert('Você saiu da conta', 'info');
}

// ===== AGENDAMENTO =====
function calculatePrice() {
    const basePrices = { 1: 40, 2: 60, 3: 80, 4: 100, 5: 120 };
    const duration = parseInt(document.getElementById('duration').value) || 1;
    let basePrice = basePrices[duration] || 40;

    let totalPrice = basePrice;
    let quarterFee = 0;
    let staffFee = 0;
    let postWorkAdjustment = 0;

    // Quarter do trabalho (+25%)
    if (document.getElementById('hasQuarter').checked) {
        quarterFee = basePrice * 0.25;
        totalPrice += quarterFee;
        document.getElementById('quarterItem').style.display = 'flex';
        document.getElementById('quarterFee').textContent = `R$ ${quarterFee.toFixed(2)}`;
    } else {
        document.getElementById('quarterItem').style.display = 'none';
    }

    // Taxa funcionária (+40%)
    if (document.getElementById('hasStaff').checked) {
        staffFee = totalPrice * 0.40;
        totalPrice += staffFee;
        document.getElementById('staffFeeItem').style.display = 'flex';
        document.getElementById('staffFee').textContent = `R$ ${staffFee.toFixed(2)}`;
    } else {
        document.getElementById('staffFeeItem').style.display = 'none';
    }

    // Pós-obra (×1.5)
    if (document.getElementById('isPostWork').checked) {
        postWorkAdjustment = totalPrice * 0.50;
        totalPrice += postWorkAdjustment;
        document.getElementById('postWorkItem').style.display = 'flex';
        document.getElementById('postWorkFee').textContent = `R$ ${postWorkAdjustment.toFixed(2)}`;
    } else {
        document.getElementById('postWorkItem').style.display = 'none';
    }

    // Atualizar display
    document.getElementById('priceBase').textContent = `R$ ${basePrice.toFixed(2)}`;
    document.getElementById('totalPrice').textContent = `R$ ${totalPrice.toFixed(2)}`;
    document.getElementById('paymentAmount').value = `R$ ${totalPrice.toFixed(2)}`;
}

async function handleBooking(e) {
    e.preventDefault();

    if (!authToken) {
        showAlert('Faça login para agendar', 'error');
        showSection('auth');
        return;
    }

    const bookingData = {
        serviceId: parseInt(document.getElementById('service').value),
        date: document.getElementById('bookingDate').value,
        time: document.getElementById('bookingTime').value,
        durationHours: parseInt(document.getElementById('duration').value),
        address: document.getElementById('address').value,
        phone: document.getElementById('phone').value,
        hasStaff: document.getElementById('hasStaff').checked,
        hasExtraQuarter: document.getElementById('hasQuarter').checked,
        isPostWork: document.getElementById('isPostWork').checked,
        notes: document.getElementById('notes').value
    };

    try {
        const response = await fetch(`${API_URL}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(bookingData)
        });

        if (!response.ok) {
            const error = await response.json();
            showAlert(error.message || 'Erro ao criar agendamento', 'error');
            return;
        }

        const data = await response.json();
        showAlert('Agendamento criado! Prosseguindo para pagamento...', 'success');
        
        // Guardar booking id e total para pagamento
        currentBookingId = data?.booking?.id || data?.bookingId || data?.id || null;
        bookingTotal = data?.booking?.totalPrice || parseFloat((document.getElementById('totalPrice')?.textContent || '0').replace(/[^0-9,.-]+/g, '').replace(',', '.')) || 0;

        // Exibir valor no modal
        const paymentAmountEl = document.getElementById('paymentAmount');
        if (paymentAmountEl) paymentAmountEl.value = `R$ ${bookingTotal.toFixed(2)}`;

        // Abrir modal de pagamento
        document.getElementById('paymentModal').classList.add('show');
    } catch (error) {
        showAlert('Erro ao conectar com servidor', 'error');
        console.error(error);
    }
}

// ===== PAGAMENTO =====
async function handlePayment(e) {
    e.preventDefault();
    // Stripe Elements -> criar PaymentMethod e enviar token ao backend
    if (!stripe || !cardElement) {
        showAlert('Sistema de pagamento não inicializado. Recarregue a página.', 'error');
        return;
    }

    const cardName = document.getElementById('cardName')?.value || '';

    const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: { name: cardName }
    });

    if (error) {
        showAlert(error.message || 'Erro ao processar cartão', 'error');
        return;
    }

    const paymentPayload = {
        bookingId: currentBookingId,
        amount: bookingTotal,
        paymentMethod: paymentMethod.id
    };

    try {
        const response = await fetch(`${API_URL}/payments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(paymentPayload)
        });

        const result = await response.json();
        if (!response.ok || !result.success) {
            showAlert(result.error || 'Erro no pagamento', 'error');
            return;
        }

        showAlert('Pagamento realizado com sucesso!', 'success');
        closePaymentModal();
        document.getElementById('bookingForm').reset();
        calculatePrice();

        // Carregar agendamentos
        setTimeout(() => {
            loadUserBookings();
            showSection('meus-agendamentos');
        }, 1000);
    } catch (err) {
        showAlert('Erro ao processar pagamento', 'error');
        console.error(err);
    }
}

// ===== AGENDAMENTOS DO USUÁRIO =====
async function loadUserBookings() {
    if (!authToken) return;

    try {
        const response = await fetch(`${API_URL}/bookings/user`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!response.ok) {
            showAlert('Erro ao carregar agendamentos', 'error');
            return;
        }

        const bookings = await response.json();
        const container = document.getElementById('bookingsList');
        
        if (!bookings.length) {
            container.innerHTML = '<p>Você ainda não tem agendamentos. <a href="#" onclick="showSection(\'agendar\')">Clique aqui</a> para agendar.</p>';
            return;
        }

        // ✅ CORRIGIDO: XSS prevention — usar createElement em vez de innerHTML
        container.innerHTML = '';
        bookings.forEach(booking => {
            const card = document.createElement('div');
            card.className = 'card';
            
            const header = document.createElement('div');
            header.style.display = 'flex';
            header.style.justifyContent = 'space-between';
            header.style.alignItems = 'start';
            
            const content = document.createElement('div');
            const title = document.createElement('h3');
            title.textContent = `Agendamento #${booking.id}`;
            content.appendChild(title);
            
            const service = document.createElement('p');
            const serviceBold = document.createElement('strong');
            serviceBold.textContent = 'Serviço: ';
            service.appendChild(serviceBold);
            const serviceName = document.createElement('span');
            serviceName.textContent = booking.service_name;
            service.appendChild(serviceName);
            content.appendChild(service);
            
            const date = document.createElement('p');
            date.textContent = `Data: ${formatDate(booking.date)} às ${booking.time}`;
            content.appendChild(date);
            
            const address = document.createElement('p');
            const addressBold = document.createElement('strong');
            addressBold.textContent = 'Local: ';
            address.appendChild(addressBold);
            const addressSpan = document.createElement('span');
            addressSpan.textContent = booking.address;
            address.appendChild(addressSpan);
            content.appendChild(address);
            
            const price = document.createElement('p');
            price.textContent = `Preço: R$ ${parseFloat(booking.final_price).toFixed(2)}`;
            content.appendChild(price);
            
            header.appendChild(content);
            
            const badge = document.createElement('span');
            badge.className = `status-badge status-${booking.status.toLowerCase()}`;
            badge.textContent = formatStatus(booking.status);
            header.appendChild(badge);
            
            card.appendChild(header);
            
            if (booking.status === 'completed' && !booking.rating) {
                const btn = document.createElement('button');
                btn.className = 'btn-primary';
                btn.style.marginTop = '10px';
                btn.textContent = 'Avaliar Serviço ⭐';
                btn.addEventListener('click', () => rateBooking(booking.id));
                card.appendChild(btn);
            }
            
            container.appendChild(card);
        });
    } catch (error) {
        showAlert('Erro ao carregar agendamentos', 'error');
        console.error(error);
    }
}

// ===== FIDELIDADE =====
async function loadLoyaltyInfo() {
    if (!authToken) return;

    try {
        const response = await fetch(`${API_URL}/loyalty`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!response.ok) return;

        const loyalty = await response.json();
        const container = document.getElementById('loyaltyInfo');

        const progressPercent = (loyalty.five_star_streak / 10) * 100;

        // ✅ CORRIGIDO: Construir DOM com createElement (seguro contra XSS)
        container.innerHTML = '';
        
        const badge = document.createElement('div');
        badge.className = 'loyalty-badge';
        badge.textContent = `🎁 ${loyalty.five_star_streak}/10 Avaliações 5⭐`;
        container.appendChild(badge);
        
        const progress = document.createElement('div');
        progress.style.cssText = 'background: #f0f0f0; border-radius: 10px; padding: 20px;';
        
        const label = document.createElement('p');
        label.style.marginBottom = '10px';
        label.textContent = 'Progresso para bônus de R$ 100:';
        progress.appendChild(label);
        
        const progressBar = document.createElement('div');
        progressBar.style.cssText = 'background: white; border-radius: 5px; height: 30px; overflow: hidden;';
        const fill = document.createElement('div');
        fill.style.cssText = `background: linear-gradient(90deg, var(--color-primary), var(--color-primary-600)); height: 100%; width: ${progressPercent}%; transition: width 0.3s;`;
        progressBar.appendChild(fill);
        progress.appendChild(progressBar);
        
        const status = document.createElement('p');
        status.style.cssText = 'margin-top: 10px; color: #666; font-size: 14px;';
        status.textContent = loyalty.five_star_streak < 10 
            ? `Faltam ${10 - loyalty.five_star_streak} avaliações para ganhar R$ 100!`
            : '🎉 Você ganhou R$ 100!';
        progress.appendChild(status);
        container.appendChild(progress);
        
        if (loyalty.loyalty_bonus > 0) {
            const bonusDiv = document.createElement('div');
            bonusDiv.className = 'card';
            bonusDiv.style.cssText = 'background: #fff3cd; border-left-color: #ffc107; margin-top: 20px;';
            const bonusH3 = document.createElement('h3');
            bonusH3.textContent = `💰 Bônus Disponível: R$ ${loyalty.loyalty_bonus.toFixed(2)}`;
            const bonusP = document.createElement('p');
            bonusP.textContent = 'Este desconto será aplicado automaticamente no seu próximo agendamento!';
            bonusDiv.appendChild(bonusH3);
            bonusDiv.appendChild(bonusP);
            container.appendChild(bonusDiv);
        }
        
        const title = document.createElement('h3');
        title.style.cssText = 'color: var(--color-primary); margin-top: 30px; margin-bottom: 15px;';
        title.textContent = 'Como Funciona?';
        container.appendChild(title);
        
        const tips = [
            '✅ Cada serviço bem avaliado com 5⭐ adiciona 1 ponto ao seu streak',
            '🎁 Ao atingir 10 avaliações 5⭐ seguidas, você ganha R$ 100 de bônus!',
            '💳 O bônus é aplicado automaticamente no seu próximo agendamento',
            '🔄 Após usar o bônus, seu streak reseta e você pode ganhar outro!'
        ];
        
        tips.forEach(tip => {
            const card = document.createElement('div');
            card.className = 'card';
            const p = document.createElement('p');
            p.textContent = tip;
            card.appendChild(p);
            container.appendChild(card);
        });
    } catch (error) {
        console.error(error);
    }
}

// ===== UTILITÁRIOS =====
function showSection(sectionId) {
    // Esconder todas as seções
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // Mostrar seção selecionada
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
    }

    // Atualizar nav
    document.querySelector(`[data-section="${sectionId}"]`)?.classList.add('active');

    // Carregar dados se necessário
    if (sectionId === 'meus-agendamentos' && authToken) {
        loadUserBookings();
    } else if (sectionId === 'fidelidade' && authToken) {
        loadLoyaltyInfo();
    }
}

function showAlert(message, type = 'info') {
    const alertBox = document.getElementById('alertBox');
    alertBox.className = `alert ${type}`;
    alertBox.textContent = message;

    setTimeout(() => {
        alertBox.className = 'alert';
    }, 4000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

function formatStatus(status) {
    const statuses = {
        'pending': '⏳ Pendente',
        'confirmed': '✅ Confirmado',
        'completed': '✔️ Concluído',
        'cancelled': '❌ Cancelado'
    };
    return statuses[status.toLowerCase()] || status;
}

function initializeDatePicker() {
    const dateInput = document.getElementById('bookingDate');
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
}

function closePaymentModal() {
    document.getElementById('paymentModal').classList.remove('show');
}

async function rateBooking(bookingId) {
    const rating = prompt('Digite sua avaliação (1-5 estrelas):', '5');
    if (!rating) return;

    const review = prompt('Deixe um comentário (opcional):');

    try {
        const response = await fetch(`${API_URL}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                bookingId,
                rating: parseInt(rating),
                review: review || ''
            })
        });

        if (!response.ok) {
            showAlert('Erro ao avaliar', 'error');
            return;
        }

        showAlert('Avaliação enviada com sucesso! ⭐', 'success');
        loadUserBookings();
    } catch (error) {
        showAlert('Erro ao enviar avaliação', 'error');
        console.error(error);
    }
}

// Iniciar interface
updateAuthUI();
