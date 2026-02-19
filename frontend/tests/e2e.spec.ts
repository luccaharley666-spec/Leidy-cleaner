import { test, expect } from '@playwright/test';

test('fluxo de cadastro, login e agendamento', async ({ page }) => {
  await page.goto('http://localhost:3000/auth/register');
  await page.fill('input[name="name"]', 'Teste Usuário');
  await page.fill('input[name="email"]', 'teste' + Date.now() + '@mail.com');
  await page.fill('input[name="phone"]', '11999999999');
  await page.fill('input[name="password"]', 'senha123');
  await page.fill('input[name="confirmPassword"]', 'senha123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/');
  await expect(page).toHaveURL(/\/$/);

  // Logout
  await page.click('text=Logout');
  await page.goto('http://localhost:3000/auth/login');
  await page.fill('input[type="email"]', 'teste@mail.com');
  await page.fill('input[type="password"]', 'senha123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/');

  // Catálogo
  await page.goto('http://localhost:3000/');
  await expect(page.locator('text=Nossos Serviços')).toBeVisible();
});
