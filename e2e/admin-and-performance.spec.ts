import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login como admin
    await page.goto('/login');
    await page.fill('[data-testid=email-input]', 'admin@example.com');
    await page.fill('[data-testid=password-input]', 'admin123');
    await page.click('[data-testid=login-button]');
    await page.waitForURL(/.*dashboard.*/, { timeout: 5000 });
  });

  test('deve exibir dashboard admin com estatísticas', async ({ page }) => {
    await page.goto('/admin/dashboard');
    
    // Verificar que existem cards de estatísticas
    await expect(page.locator('[data-testid=revenue-card]')).toBeVisible();
    await expect(page.locator('[data-testid=bookings-card]')).toBeVisible();
    await expect(page.locator('[data-testid=users-card]')).toBeVisible();
    await expect(page.locator('[data-testid=reviews-card]')).toBeVisible();
  });

  test('deve listar agendamentos no admin', async ({ page }) => {
    await page.goto('/admin/bookings');
    
    // Esperar tabela carregar
    await page.waitForSelector('[data-testid=bookings-table]');
    
    // Verificar que a tabela não está vazia
    const rows = await page.locator('[data-testid=booking-row]').count();
    expect(rows).toBeGreaterThan(0);
  });

  test('deve visualizar detalhes de um agendamento', async ({ page }) => {
    await page.goto('/admin/bookings');
    
    // Clique no primeiro agendamento
    await page.click('[data-testid=booking-row] >> nth=0');
    
    // Verificar detalhes
    await expect(page.locator('[data-testid=[REDACTED_TOKEN]]')).toBeVisible();
    await expect(page.locator('[data-testid=booking-id]')).toBeVisible();
    await expect(page.locator('[data-testid=booking-customer]')).toBeVisible();
    await expect(page.locator('[data-testid=booking-status]')).toBeVisible();
  });

  test('deve filtrar agendamentos por status', async ({ page }) => {
    await page.goto('/admin/bookings');
    
    // Selecionar filtro por status
    await page.selectOption('[data-testid=status-filter]', 'completed');
    
    // Esperar resultados
    await page.waitForTimeout(500); // Esperar busca
    
    // Verificar que todos os itens têm status 'completed'
    const statusCells = await page.locator('[data-testid=booking-status]').allTextContents();
    statusCells.forEach(status => {
      expect(status.toLowerCase()).toContain('concluído');
    });
  });

  test('deve listar usuários no admin', async ({ page }) => {
    await page.goto('/admin/users');
    
    // Esperar tabela carregar
    await page.waitForSelector('[data-testid=users-table]');
    
    // Verificar cabeçalhos de coluna
    await expect(page.locator('[data-testid=user-name-header]')).toBeVisible();
    await expect(page.locator('[data-testid=user-email-header]')).toBeVisible();
    await expect(page.locator('[data-testid=user-status-header]')).toBeVisible();
  });

  test('deve pesquisar usuários por email', async ({ page }) => {
    await page.goto('/admin/users');
    
    // Preencher campo de busca
    await page.fill('[data-testid=user-search]', 'john@example.com');
    
    // Esperar resultados
    await page.waitForTimeout(500);
    
    // Verificar que resultados contêm o email procurado
    const emails = await page.locator('[data-testid=user-email]').allTextContents();
    expect(emails.some(e => e.includes('john@example.com'))).toBeTruthy();
  });

  test('deve exibir analytics/relatórios', async ({ page }) => {
    await page.goto('/admin/analytics');
    
    // Verificar que gráficos estão presentes
    await expect(page.locator('[data-testid=revenue-chart]')).toBeVisible();
    await expect(page.locator('[data-testid=bookings-chart]')).toBeVisible();
    
    // Verificar que tem dados (não vazio)
    const chartPoints = await page.locator('[data-testid=chart-point]').count();
    expect(chartPoints).toBeGreaterThan(0);
  });
});

test.describe('Health & Performance', () => {
  test('deve retornar status 200 no health check', async ({ page }) => {
    const response = await page.goto('/api/health');
    expect(response?.status()).toBe(200);
  });

  test('deve retornar status 200 no health/live', async ({ page }) => {
    const response = await page.goto('/api/health/live');
    expect(response?.status()).toBe(200);
  });

  test('deve carregar dashboard admin em menos de 3 segundos', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid=email-input]', 'admin@example.com');
    await page.fill('[data-testid=password-input]', 'admin123');
    await page.click('[data-testid=login-button]');
    await page.waitForURL(/.*dashboard.*/);

    const startTime = Date.now();
    await page.goto('/admin/dashboard');
    await page.waitForSelector('[data-testid=revenue-card]');
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(3000);
  });

  test('deve listar agendamentos em menos de 2 segundos', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid=email-input]', 'user@example.com');
    await page.fill('[data-testid=password-input]', 'password123');
    await page.click('[data-testid=login-button]');
    await page.waitForURL(/.*dashboard.*/);

    const startTime = Date.now();
    await page.goto('/bookings');
    await page.waitForSelector('[data-testid=booking-list]');
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(2000);
  });
});
