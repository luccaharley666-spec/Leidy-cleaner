# ✅ Guia de Testes & Validação

## 🧪 Como Testar Tudo

### 1. Preparação

```bash
# Certifique-se que está no diretório frontend
cd frontend/

# Verifique dependências instaladas
npm list

# Inicie o servidor de desenvolvimento
npm run dev
# Acessar: http://localhost:3000
```

---

## 📋 Checklist de Testes Manuais

### 1. Design System

#### ✓ Cores
- [ ] Abir novo dashboard
- [ ] Verificar cores (purple, cyan, green, red, blue)
- [ ] Verificar gradientes em cards
- [ ] Verificar badges com cores diferentes
- [ ] Verificar alerts (success, error, warning)

#### ✓ Tipografia
- [ ] H1: deve ser grande, poppins, bold
- [ ] H2, H3: progressivamente menores
- [ ] Body text: inter, legível
- [ ] Tamanhos responsivos (móvel vs desktop)

#### ✓ Espaçamento
- [ ] Container: 1400px max width
- [ ] Padding horizontal: 16px mobile → 64px desktop
- [ ] Cards: 24px gap entre elas
- [ ] Y-spacing consistente

#### ✓ Sombras
- [ ] Cards: shadow-lg ao hover
- [ ] Modals: shadow-2xl
- [ ] Botões: sem sombra (apenas hover efeito)

### 2. Componentes Dashboard

#### StatsCard
```javascript
// Testar em: /dashboard-new
- [ ] Ícone exibindo (emoji)
- [ ] Número exibindo
- [ ] Trend % exibindo
- [ ] Cor diferente por tipo (purple, green, cyan)
- [ ] Hover effect (shadow + translate)
```

#### ActivityTimeline
- [ ] Ícones exibindo
- [ ] Titulo e descrição legível
- [ ] Timestamps mostrandos
- [ ] Linha conectando items

#### QuickActions
- [ ] Grid com 4 botões mobile, 6 tablet, automático desktop
- [ ] Cada botão clicável
- [ ] Rótulo visível
- [ ] Ícone visível

#### UpcomingCard
- [ ] Ícone, título, data, hora, localização
- [ ] Status badge (confirmed/pending)
- [ ] Botões de ação
- [ ] Hover efeito

### 3. Componentes UI

#### Modal
```bash
# Teste adicionando botão em página que abre modal
const { isOpen, open, close } = useModal();

- [ ] Modal abre ao clicar botão
- [ ] Modal fecha com X
- [ ] Modal fecha ao clicar fora (clickOutside)
- [ ] Ações (botões) funcionam
- [ ] Overlay semi-transparent visível
```

#### Spinner
- [ ] Anima suave
- [ ] 3 tamanhos (sm, md, lg)
- [ ] 3 cores (purple, green, cyan)
- [ ] Centralizado

#### Skeleton
- [ ] Animação carregando (fade)
- [ ] 3+ linhas exibindo
- [ ] Responsive width

#### [REDACTED_TOKEN]
```javascript
const { success, error, warning } = useNotification();

// Em qualquer lugar do componente:
success('Teste bem-sucedido!');

- [ ] Notificação aparece top-right
- [ ] Auto-desaparece em 3 segundos
- [ ] Múltiplas notificações enfileiram
- [ ] Cor verde (success), vermelho (error), amarelo (warning)
```

#### Tooltip
```jsx
<Tooltip text="Dica" position="top">
  <button>Hover aqui</button>
</Tooltip>

- [ ] Dica aparece ao hover
- [ ] Desaparece ao sair mouse
- [ ] Posições funcionam (top/bottom/left/right)
```

#### RatingStars
```jsx
<RatingStars 
  rating={4}
  onRate={(newRating) => console.log(newRating)}
/>

- [ ] 5 estrelas exibindo
- [ ] Cliquável
- [ ] Hover preview funciona
- [ ] onChange chamada corretamente
```

### 4. Componentes Form

#### FormGroup
```jsx
<FormGroup label="Email" required error="Email inválido">
  <input type="email" />
</FormGroup>

- [ ] Label exibindo
- [ ] Required indicator (*)
- [ ] Input focável
- [ ] Error message exibindo em vermelho
- [ ] Hint text exibindo (se provided)
```

#### DataTable
```javascript
- [ ] Colunas exibindo corretamente
- [ ] Dados aparecem em linhas
- [ ] Sorting works (clique no header)
- [ ] Selection (checkboxes) funciona
- [ ] Actions buttons aparecem
- [ ] Loading state mostra spinner
- [ ] Responsivo (scroll h em mobile)
```

#### TagInput
```jsx
<TagInput tags={['tag1']} onChange={(t) => {}} />

- [ ] Tags exibindo como badges
- [ ] Digitar + Enter adiciona tag
- [ ] Digitar + Virgula adiciona tag
- [ ] Clique X remove tag
- [ ] Placeholder visível quando vazio
```

### 5. Custom Hooks

#### useForm
```javascript
const { values, errors, handleChange, handleSubmit } = useForm(
  { email: '' },
  async (vals) => { console.log(vals); }
);

- [ ] values atualizam ao onChange
- [ ] handleSubmit é chamado ao form submit
- [ ] errors exibem validação
- [ ] isSubmitting true durante submit
```

#### useNotification
```javascript
const { success, error, warning } = useNotification();

success('Sucesso!');
error('Erro!');
warning('Aviso!');

- [ ] Notificações aparecem
- [ ] Auto-dismiss em 3s
- [ ] Múltiplas enfileiram
- [ ] Botão X fecha
```

#### useAsync
```javascript
const { value, error, status } = useAsync(
  () => fetch('/api/data').then(r => r.json())
);

- [ ] Status = 'pending' carregando
- [ ] Status = 'success' ao terminar
- [ ] Value contém dados
- [ ] Error capturado se falhar
```

#### useLocalStorage
```javascript
const [token, setToken] = useLocalStorage('token', null);

setToken('novo');
// Verificar localStorage:
localStorage.getItem('token') === 'novo'

- [ ] Salva em localStorage
- [ ] Recupera ao reload página
- [ ] Initial value usado se não existir
```

#### usePagination
```javascript
const { currentItems, nextPage, prevPage } = usePagination(items, 5);

- [ ] currentItems mostra 5 items certos
- [ ] nextPage vai para próxima página
- [ ] prevPage volta página anterior
- [ ] Não passou última/primeira página
```

---

## 📱 Testes Responsivos

### Mobile (375px - iPhone SE)
```
[ ] 1 coluna grid
[ ] Padding: 16px horizontal
[ ] Font sizes legível
[ ] Botões clickáveis (min 44px height)
[ ] Inputs com auto-zoom disabled
[ ] Horizontal scroll nunca acontece
```

### Tablet (768px - iPad)
```
[ ] 2 colunas grid
[ ] Padding: 24px horizontal
[ ] Cards bem espaçadas
[ ] Tipografia balanceada
[ ] Landscape mode funciona
```

### Desktop (1024px+)
```
[ ] 3-4 colunas grid
[ ] Padding: 32px+ horizontal
[ ] Container 1400px respeitado
[ ] Hover effects funcionam (mouse)
[ ] Tipografia grande
```

### Testes de Viewport
```bash
# No DevTools Chrome/Firefox:
1. Toggle device toolbar (Ctrl+Shift+M)
2. Testar: iPhone SE, iPhone 12, iPad, Desktop
3. Girar orientação (landscape)
4. Zoom in/out 150%/75%
5. Verificar scroll behavior
```

---

## 🌐 Testes em Navegadores

### Chrome
- [ ] Abrir DevTools (F12)
- [ ] Testar mobile (Ctrl+Shift+M)
- [ ] Verificar console (sem errors)
- [ ] Performance: Audits > Lighthouse

### Firefox
- [ ] Inspector (F12)
- [ ] Responsive Design Mode (Ctrl+Shift+M)
- [ ] Console check

### Safari (se possível)
- [ ] Web Inspector
- [ ] Responsive é manual (resize window)
- [ ] Console

### Edge
- [ ] Similar Chrome (mesmo engine)
- [ ] DevTools similar

---

## ⚡ Performance Testing

### Lighthouse (Chrome DevTools)
```bash
1. Abrir DevTools (F12)
2. Ir para "Lighthouse"
3. Selecionar "Desktop"
4. "Generate report"

Targets:
[ ] Performance: > 90
[ ] Accessibility: > 90
[ ] Best Practices: > 85
[ ] SEO: > 90
```

### Bundle Size
```bash
npm run build

# Procurar na output:
# ✓ Route (size)

Verificar:
[ ] Nenhum erro de build
[ ] Tamanhos razoáveis (<50KB por página)
[ ] Nenhuma warning de unused deps
```

### Load Times
```bash
# No DevTools > Network:
1. Hard refresh (Ctrl+Shift+R)
2. Verificar:
   [ ] Tempo total < 5s
   [ ] DOM interactive < 2s
   [ ] CSS carregado < 500ms
   [ ] JS carregado < 1s
```

---

## 🎨 Testes de Acessibilidade

### Keyboard Navigation
```bash
# Teste usando TAB e SHIFT+TAB:
[ ] Pode navegar todos os botões/inputs
[ ] Focus visível (outline/ring)
[ ] Ordem lógica (esquerda→direita, cima→baixo)
[ ] Modals capturam focus (tab permanece dentro)
[ ] ESC fecha modals
```

### Screen Reader
```bash
# NVDA (Windows) ou JAWS:
[ ] Headings anunciados corretamente
[ ] Buttons anunciados com labels
[ ] Form inputs com labels
[ ] Images com alt text
[ ] Lists anunciadas como lists
```

### Color Contrast
```bash
DevTools > Lighthouse > Accessibility

[ ] Texto branco em purple OK
[ ] Texto escuro em cyan OK
[ ] Badges legível
[ ] Error messages com ícone + cor (não só cor)
```

---

## 🔍 Testes Funcionais

### Dashboard Page
```bash
URL: /dashboard-new

1. Load Page
   [ ] Página carrega sem erro
   [ ] Headers renderizam
   [ ] Stats cards mostram dados
   [ ] Timeline exibe atividades
   [ ] Quick actions clicáveis

2. Tabs
   [ ] Overview tab ativo
   [ ] Clicar "Bookings" muda tab
   [ ] Clicar "Profile" muda tab
   [ ] Clicar "Payments" muda tab

3. Interactions
   [ ] QuickActions cliques funcionam
   [ ] Upcoming cards cliques
   [ ] Modals abrem/fecham

4. Responsive
   [ ] Mobile: 1 coluna
   [ ] Tablet: 2 colunas
   [ ] Desktop: 4 colunas
```

### Form Interactions
```javascript
// Teste qualquer FormSection:

1. Fill Form
   [ ] Valores atualizam ao digitar
   [ ] Email validation funciona
   [ ] Required fields indicados
   [ ] Errors aparecem após blur

2. Submit
   [ ] onClick dispara handleSubmit
   [ ] Loading state mostra spinner
   [ ] Success notification aparece
   [ ] Redirect ocorre

3. Validation
   [ ] Email: format check
   [ ] Tel: format check
   [ ] Required: não undefined/empty
```

### Modal Tests
```javascript
1. Open Modal
   [ ] Botão abre modal
   [ ] Overlay preto aparece
   [ ] Scroll disabled no body

2. Close Modal
   [ ] X button fecha
   [ ] Cancel button fecha
   [ ] Click overlay fecha
   [ ] ESC key fecha

3. Actions
   [ ] Save/Confirm botões funcionam
   [ ] Dados salvam corretamente
```

---

## 🐛 Debugging

### Console Errors
```javascript
// DevTools Console (F12)
[ ] Nenhum erro vermelho
[ ] Nenhum warning laranja (se possível)

Common issues:
- Missing components: ImportError
- Hook rules: "rules of hooks" error
- Props undefined: "cannot read property"
```

### React DevTools
```javascript
1. Install extensão React DevTools
2. Abrir DevTools Components tab
3. Navegar tree
4. Verificar:
   [ ] State valores corretos
   [ ] Props passados corretamente
   [ ] Hooks estado ok
```

### Network Tab
```bash
DevTools > Network tab (Ctrl+Shift+N)

Verificar:
[ ] Todos assets carregam (200 status)
[ ] Nenhuma 404 (missing files)
[ ] CSS minificado
[ ] JS minificado
[ ] Images otimizadas
```

---

## 📊 Teste Checklist Final

```
DESIGN TOKENS:
[ ] Cores aplicadas corretamente
[ ] Tipografia responsiva
[ ] Spacing consistente
[ ] Shadows suave
[ ] Animations smooth

COMPONENTES:
[ ] 6 Dashboard widgets funcionam
[ ] 9 UI components funcionam
[ ] 6 Form components funcionam
[ ] 10 Hooks operam corretamente

RESPONSIVIDADE:
[ ] Mobile (<640px) OK
[ ] Tablet (640-1024px) OK
[ ] Desktop (>1024px) OK
[ ] Todos navegadores OK
[ ] Teste no real device

ACESSIBILIDADE:
[ ] Keyboard navigation OK
[ ] Focus visível OK
[ ] Labels/ARIA OK
[ ] Color contrast OK

PERFORMANCE:
[ ] Lighthouse >90
[ ] Bundle size OK
[ ] Load time <5s
[ ] Nenhum console error

FUNCIONALIDADE:
[ ] Forms submit OK
[ ] Modals abrem/fecham OK
[ ] Notifications trabalham OK
[ ] Data exibe corretamente OK
[ ] Validações funcionam OK
```

---

## 🚀 Próximos Passos Após Testes

### Se Tudo OK ✅
1. Commitar código
2. Criar PR (Pull Request)
3. deploy para staging
4. Link para QA testar
5. Merge para main

### Se Houver Bugs 🐛
1. Documentar bug (erro + screenshot)
2. Procurar em qual componente
3. Adicionar console.log para debug
4. Verificar props/state
5. Corrigir e reteste

---

## 📞 Problemas Comuns

### "Component is not defined"
```javascript
// ✗ Erro
import StatsCard from './DashboardWidgets'

// ✓ Correto
import { StatsCard } from './DashboardWidgets'
```

### "Styles not applying"
```css
/* Verificar globals.css foi importado */
@import './globals.css';

/* Ou em _app.jsx */
import '../styles/globals.css';
```

### "Not a function"
```javascript
// Verificar é exported corretamente
export const useForm = () => { ... }

// E importado com {}
import { useForm } from '@/hooks/useDashboard'
```

### "prop is undefined"
```javascript
// Verificar props estão sendo passadas
<StatsCard
  icon="📅"  // ← required
  label="Test"  // ← required
  value={10}  // ← required
/>
```

---

## 📝 Reportar Bugs

Quando encontrar um bug, documente:

```markdown
### Bug Report

**Página:** /dashboard-new
**Componente:** StatsCard
**Navegador:** Chrome 120

**Passos para Reproduzir:**
1. Abrir /dashboard-new
2. Aguardar carregamento
3. Ver primeira card

**Expected:** Card exibe número "12"
**Actual:** Card mostra "undefined"

**Screenshot:** [Opcional]

**Console Errors:** [Se houver]
```

---

## ✅ Validação Completa!

Seguindo este guia, você terá confiança que:
- ✅ Design system está funcionando
- ✅ Componentes são reutilizáveis
- ✅ Responsividade está OK
- ✅ Acessibilidade está OK
- ✅ Performance está OK
- ✅ Sem bugs críticos

**Pronto para Deploy! 🚀**
