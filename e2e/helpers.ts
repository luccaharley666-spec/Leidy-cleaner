import { Page } from '@playwright/test';

/**
 * Utilitários para testes E2E
 * Reduzir duplicação de código
 */

export class TestHelpers {
  /**
   * Fazer login com email e senha
   */
  static async login(page: Page, email: string, password: string) {
    await page.goto('/login');
    await page.fill('[data-testid=email-input]', email);
    await page.fill('[data-testid=password-input]', password);
    await page.click('[data-testid=login-button]');
    await page.waitForURL(/.*dashboard.*/, { timeout: 5000 });
  }

  /**
   * Fazer logout
   */
  static async logout(page: Page) {
    await page.click('[data-testid=logout-button]');
    await page.waitForURL(/.*login.*/);
  }

  /**
   * Criar um novo agendamento
   */
  static async createBooking(
    page: Page, 
    service: string = 'limpeza-residencial',
    date: string = '2026-03-15',
    time: string = '10:00',
    address: string = 'Rua das Flores, 123',
    phone: string = '(11) 98765-4321',
    duration: string = '2'
  ) {
    await page.click('[data-testid=new-booking-button]');
    await page.waitForURL(/.*booking\/(new|create).*/);

    await page.selectOption('[data-testid=service-select]', service);
    await page.fill('[data-testid=date-input]', date);
    await page.fill('[data-testid=time-input]', time);
    await page.fill('[data-testid=address-input]', address);
    await page.fill('[data-testid=phone-input]', phone);
    await page.selectOption('[data-testid=duration-select]', duration);

    await page.click('[data-testid=[REDACTED_TOKEN]]');
    await page.waitForSelector('[data-testid=booking-success]', { timeout: 5000 });

    return {
      service,
      date,
      time,
      address,
      phone,
      duration
    };
  }

  /**
   * Fazer pagamento com dados de teste
   */
  static async processPayment(
    page: Page,
    cardNumber: string = '4242424242424242',
    expDate: string = '12/26',
    cvc: string = '123'
  ) {
    await page.waitForURL(/.*payment.*/);

    // Preencher dados de cartão
    const frameHandle = await page.$('iframe[title="Iframe do Stripe"]');
    if (frameHandle) {
      const frame = await frameHandle.contentFrame();
      if (frame) {
        await frame.fill('[data-testid=cardnumber]', cardNumber);
        await frame.fill('[data-testid=exp-date]', expDate);
        await frame.fill('[data-testid=cvc]', cvc);
      }
    }

    // Clicar em pagar
    await page.click('[data-testid=pay-button]');
  }

  /**
   * Criar uma review
   */
  static async createReview(
    page: Page,
    rating: number = 5,
    comment: string = 'Serviço excelente!'
  ) {
    // Navegar para booking concluído
    await page.goto('/bookings/completed');
    
    // Clicar em "Deixar avaliação"
    await page.click('[data-testid=write-review-button] >> nth=0');
    
    // Preencher review
    await page.click(`[data-testid=star-rating-${rating}]`);
    await page.fill('[data-testid=review-comment]', comment);
    
    // Submeter
    await page.click('[data-testid=[REDACTED_TOKEN]]');
    
    // Esperar sucesso
    await page.waitForSelector('[data-testid=review-success]', { timeout: 5000 });
  }

  /**
   * Esperar por elemento e clicar
   */
  static async waitAndClick(page: Page, selector: string, timeout: number = 5000) {
    await page.waitForSelector(selector, { timeout });
    await page.click(selector);
  }

  /**
   * Esperar por elemento e preencher
   */
  static async waitAndFill(page: Page, selector: string, value: string, timeout: number = 5000) {
    await page.waitForSelector(selector, { timeout });
    await page.fill(selector, value);
  }

  /**
   * Obter valor de elemento
   */
  static async getText(page: Page, selector: string): Promise<string> {
    const element = await page.$(selector);
    return element?.textContent() || '';
  }

  /**
   * Verificar se elemento está visível
   */
  static async isVisible(page: Page, selector: string): Promise<boolean> {
    const element = await page.$(selector);
    return element?.isVisible() || false;
  }

  /**
   * Medir tempo de carregamento de página
   */
  static async measurePageLoadTime(page: Page, url: string): Promise<number> {
    const startTime = Date.now();
    await page.goto(url);
    return Date.now() - startTime;
  }

  /**
   * Interceptar requisição HTTP e verificar
   */
  static async interceptRequest(
    page: Page,
    urlPattern: string | RegExp,
    callback: (request: any) => void
  ) {
    await page.on('request', (request) => {
      if (typeof urlPattern === 'string') {
        if (request.url().includes(urlPattern)) callback(request);
      } else {
        if (urlPattern.test(request.url())) callback(request);
      }
    });
  }

  /**
   * Esperar por resposta HTTP
   */
  static async waitForResponse(
    page: Page,
    urlPattern: string | RegExp,
    timeout: number = 5000
  ) {
    return page.waitForResponse(
      (response) => {
        if (typeof urlPattern === 'string') {
          return response.url().includes(urlPattern);
        }
        return urlPattern.test(response.url());
      },
      { timeout }
    );
  }

  /**
   * Capturar screenshot com timestamp
   */
  static async takeScreenshot(page: Page, name: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return page.screenshot({
      path: `test-results/screenshots/${name}-${timestamp}.png`
    });
  }

  /**
   * Limpar dados de teste (cleanup)
   */
  static async cleanupTestData(page: Page) {
    // Logout
    await page.click('[data-testid=logout-button]').catch(() => {});
    
    // Voltar para home
    await page.goto('/');
  }
}

/**
 * Credenciais de teste padrão
 */
export const TEST_USERS = {
  regularUser: {
    email: 'user@example.com',
    password: 'password123',
    name: 'Test User'
  },
  admin: {
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Admin User'
  },
  staff: {
    email: 'staff@example.com',
    password: 'staff123',
    name: 'Staff Member'
  }
};

/**
 * URLs principais
 */
export const TEST_URLS = {
  login: '/login',
  dashboard: '/dashboard',
  bookings: '/bookings',
  newBooking: '/bookings/new',
  payment: '/payment',
  reviews: '/reviews',
  adminDashboard: '/admin/dashboard',
  adminBookings: '/admin/bookings',
  adminUsers: '/admin/users',
  adminReviews: '/admin/reviews'
};
