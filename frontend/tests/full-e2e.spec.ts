import { test, expect } from '@playwright/test';

const scenarios = [
  'cadastro', 'login', 'agendamento', 'admin', 'backup', 'relatorios', 'assinatura', 'notificacoes', 'blog', 'newsletter'
];

test.describe('Testes E2E completos', () => {
  for (let i = 0; i < 9; i++) {
    test(`Execução #${i+1} - todos cenários`, async ({ page }) => {
      // Cadastro
      await page.goto('http://localhost:3000/auth/register');
      await page.fill('input[name="name"]', `Teste Usuário ${i}`);
      await page.fill('input[name="email"]', `teste${i}_${Date.now()}@mail.com`);
      await page.fill('input[name="phone"]', '11999999999');
      await page.fill('input[name="password"]', 'senha123');
      await page.fill('input[name="confirmPassword"]', 'senha123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/');
      await expect(page).toHaveURL(/\/$/);

      // Login
      await page.goto('http://localhost:3000/auth/login');
      await page.fill('input[type="email"]', `teste${i}_${Date.now()}@mail.com`);
      await page.fill('input[type="password"]', 'senha123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/');

      // Agendamento
      await page.goto('http://localhost:3000/services');
      await expect(page.locator('text=Todos os Serviços')).toBeVisible();

      // Admin
      await page.goto('http://localhost:3000/admin/relatorios');
      await expect(page.locator('text=Relatórios e Exportação de Dados')).toBeVisible();

      // Backup
      await page.goto('http://localhost:3000/admin/backup');
      await expect(page.locator('text=Backup e Restore de Dados')).toBeVisible();

      // Assinatura
      await page.goto('http://localhost:3000/assinatura');
      await expect(page.locator('text=Assinatura, Trial e Cancelamento')).toBeVisible();

      // Notificações
      await page.goto('http://localhost:3000/notificacoes');
      await expect(page.locator('text=Notificações Push, SMS e WhatsApp')).toBeVisible();

      // Blog
      await page.goto('http://localhost:3000/blog');
      await expect(page.locator('text=Blog LimpezaPro')).toBeVisible();

      // Newsletter
      await page.goto('http://localhost:3000/newsletter');
      await expect(page.locator('text=Assine nossa Newsletter')).toBeVisible();
    });
  }
});
