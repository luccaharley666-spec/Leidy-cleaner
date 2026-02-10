import { test, expect } from '@playwright/test';

test.describe('Fluxo Completo de Agendamento', () => {
  test('deve navegar até página de login', async ({ page }) => {
    await page.goto('/');
    expect(page).toHaveURL(/.*\//);
  });

  test('deve fazer login com credenciais válidas', async ({ page }) => {
    await page.goto('/login');
    
    // Verificar que o formulário existe
    await expect(page.locator('[data-testid=login-form]')).toBeVisible();
    
    // Preencher email e senha
    await page.fill('[data-testid=email-input]', 'user@example.com');
    await page.fill('[data-testid=password-input]', 'password123');
    
    // Clicar em login
    await page.click('[data-testid=login-button]');
    
    // Esperar redirecionamento para dashboard
    await page.waitForURL(/.*dashboard.*/, { timeout: 5000 });
    expect(page).toHaveURL(/.*dashboard/);
  });

  test('deve criar um novo agendamento', async ({ page }) => {
    // Fazer login primeiro
    await page.goto('/login');
    await page.fill('[data-testid=email-input]', 'user@example.com');
    await page.fill('[data-testid=password-input]', 'password123');
    await page.click('[data-testid=login-button]');
    await page.waitForURL(/.*dashboard.*/);

    // Navegar para novo agendamento
    await page.click('[data-testid=new-booking-button]');
    await page.waitForURL(/.*booking\/(new|create).*/);

    // Preencher formulário de agendamento
    await page.selectOption('[data-testid=service-select]', 'limpeza-residencial');
    await page.fill('[data-testid=date-input]', '2026-03-15');
    await page.fill('[data-testid=time-input]', '10:00');
    await page.fill('[data-testid=address-input]', 'Rua das Flores, 123');
    await page.fill('[data-testid=phone-input]', '(11) 98765-4321');
    await page.selectOption('[data-testid=duration-select]', '2');

    // Submeter formulário
    await page.click('[data-testid=[REDACTED_TOKEN]]');

    // Esperar confirmação
    await page.waitForSelector('[data-testid=booking-success]', { timeout: 5000 });
    await expect(page.locator('[data-testid=booking-success]')).toBeVisible();
  });

  test('deve processar pagamento com sucesso', async ({ page }) => {
    // Setup: fazer login e criar agendamento
    await page.goto('/login');
    await page.fill('[data-testid=email-input]', 'user@example.com');
    await page.fill('[data-testid=password-input]', 'password123');
    await page.click('[data-testid=login-button]');
    await page.waitForURL(/.*dashboard.*/);

    // Ir para página de pagamento
    await page.click('[data-testid=new-booking-button]');
    await page.selectOption('[data-testid=service-select]', 'limpeza-residencial');
    await page.fill('[data-testid=date-input]', '2026-03-15');
    await page.fill('[data-testid=time-input]', '10:00');
    await page.fill('[data-testid=address-input]', 'Rua das Flores, 123');
    await page.fill('[data-testid=phone-input]', '(11) 98765-4321');
    await page.click('[data-testid=[REDACTED_TOKEN]]');

    // Aguardar página de pagamento
    await page.waitForURL(/.*payment.*/);

    // Preencher dados de pagamento (Stripe)
    const frameHandle = await page.$('iframe[title="Iframe do Stripe"]');
    if (frameHandle) {
      const frame = await frameHandle.contentFrame();
      if (frame) {
        await frame.fill('[data-testid=cardnumber]', '4242424242424242');
        await frame.fill('[data-testid=exp-date]', '12/26');
        await frame.fill('[data-testid=cvc]', '123');
      }
    }

    // Clicar em pagar
    await page.click('[data-testid=pay-button]');

    // Esperar sucesso
    await page.waitForSelector('[data-testid=payment-success]', { timeout: 10000 });
    await expect(page.locator('[data-testid=payment-success]')).toBeVisible();
  });

  test('deve exibir erro em pagamento com cartão inválido', async ({ page }) => {
    // Setup
    await page.goto('/login');
    await page.fill('[data-testid=email-input]', 'user@example.com');
    await page.fill('[data-testid=password-input]', 'password123');
    await page.click('[data-testid=login-button]');
    await page.waitForURL(/.*dashboard.*/);

    // Criar agendamento
    await page.click('[data-testid=new-booking-button]');
    await page.selectOption('[data-testid=service-select]', 'limpeza-residencial');
    await page.fill('[data-testid=date-input]', '2026-03-15');
    await page.fill('[data-testid=time-input]', '10:00');
    await page.fill('[data-testid=address-input]', 'Rua das Flores, 123');
    await page.fill('[data-testid=phone-input]', '(11) 98765-4321');
    await page.click('[data-testid=[REDACTED_TOKEN]]');

    // Ir para pagamento
    await page.waitForURL(/.*payment.*/);

    // Preencher com cartão rejeitado
    const frameHandle = await page.$('iframe[title="Iframe do Stripe"]');
    if (frameHandle) {
      const frame = await frameHandle.contentFrame();
      if (frame) {
        await frame.fill('[data-testid=cardnumber]', '4000000000000002');
        await frame.fill('[data-testid=exp-date]', '12/26');
        await frame.fill('[data-testid=cvc]', '123');
      }
    }

    // Clicar em pagar
    await page.click('[data-testid=pay-button]');

    // Esperar mensagem de erro
    await page.waitForSelector('[data-testid=payment-error]', { timeout: 5000 });
    await expect(page.locator('[data-testid=payment-error]')).toContainText(/recusado|inválido|erro/i);
  });

  test('deve validar campos obrigatórios no formulário de agendamento', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid=email-input]', 'user@example.com');
    await page.fill('[data-testid=password-input]', 'password123');
    await page.click('[data-testid=login-button]');
    await page.waitForURL(/.*dashboard.*/);

    // Ir para novo agendamento
    await page.click('[data-testid=new-booking-button]');

    // Tentar submeter sem preencher nada
    await page.click('[data-testid=[REDACTED_TOKEN]]');

    // Verificar mensagens de erro
    await expect(page.locator('[data-testid=service-error]')).toBeVisible();
    await expect(page.locator('[data-testid=date-error]')).toBeVisible();
    await expect(page.locator('[data-testid=time-error]')).toBeVisible();
  });

  test('deve exibir mensagens de erro para email inválido no login', async ({ page }) => {
    await page.goto('/login');
    
    // Preencher com email inválido
    await page.fill('[data-testid=email-input]', 'invalid-email');
    await page.fill('[data-testid=password-input]', 'password123');
    await page.click('[data-testid=login-button]');

    // Verificar erro
    await expect(page.locator('[data-testid=email-error]')).toBeVisible();
    await expect(page.locator('[data-testid=email-error]')).toContainText(/email inválido|formato/i);
  });

  test('deve fazer logout corretamente', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid=email-input]', 'user@example.com');
    await page.fill('[data-testid=password-input]', 'password123');
    await page.click('[data-testid=login-button]');
    await page.waitForURL(/.*dashboard.*/);

    // Clicar em logout
    await page.click('[data-testid=logout-button]');

    // Esperar volta ao login
    await page.waitForURL(/.*login.*/);
    expect(page).toHaveURL(/.*login/);

    // Verificar que não tem acesso a dashboard agora
    await page.goto('/dashboard');
    expect(page).toHaveURL(/.*login.*/);
  });
});
