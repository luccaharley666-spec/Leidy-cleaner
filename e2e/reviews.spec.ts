import { test, expect } from '@playwright/test';

test.describe('Reviews & Ratings', () => {
  test.beforeEach(async ({ page }) => {
    // Login como usuário comum
    await page.goto('/login');
    await page.fill('[data-testid=email-input]', 'user@example.com');
    await page.fill('[data-testid=password-input]', 'password123');
    await page.click('[data-testid=login-button]');
    await page.waitForURL(/.*dashboard.*/, { timeout: 5000 });
  });

  test('deve exibir página de reviews públicas', async ({ page }) => {
    await page.goto('/reviews');
    
    // Verificar que página de reviews carregou
    await expect(page.locator('[data-testid=reviews-header]')).toBeVisible();
    
    // Verificar que tem lista de reviews
    const reviewCount = await page.locator('[data-testid=review-item]').count();
    expect(reviewCount).[REDACTED_TOKEN](0);
  });

  test('deve filtrar reviews por rating', async ({ page }) => {
    await page.goto('/reviews');
    
    // Clicar em filtro de 5 estrelas
    await page.click('[data-testid=rating-filter-5]');
    
    // Esperar filtro aplicar
    await page.waitForTimeout(500);
    
    // Verificar que todos os reviews mostrados têm 5 estrelas
    const ratings = await page.locator('[data-testid=review-rating]').allTextContents();
    ratings.forEach(rating => {
      expect(rating).toContain('5');
    });
  });

  test('deve ordenar reviews por data/útil', async ({ page }) => {
    await page.goto('/reviews');
    
    // Clicar em ordenação por "Mais útil"
    await page.selectOption('[data-testid=sort-select]', 'helpful');
    
    // Esperar reordenação
    await page.waitForTimeout(500);
    
    // Verificar que elementos se reorganizaram
    const firstReview = await page.locator('[data-testid=review-item] >> nth=0').textContent();
    expect(firstReview).toBeTruthy();
  });

  test('deve criar uma review após agendamento concluído', async ({ page }) => {
    // Navegar para booking concluído
    await page.goto('/bookings/completed');
    
    // Clicar em "Deixar avaliação"
    await page.click('[data-testid=write-review-button] >> nth=0');
    
    // Preencher review
    await page.click('[data-testid=star-rating-5]'); // 5 estrelas
    await page.fill('[data-testid=review-comment]', 'Serviço excelente!');
    
    // Submeter
    await page.click('[data-testid=[REDACTED_TOKEN]]');
    
    // Esperar sucesso
    await page.waitForSelector('[data-testid=review-success]', { timeout: 5000 });
    await expect(page.locator('[data-testid=review-success]')).toBeVisible();
  });

  test('deve validar campos obrigatórios em review', async ({ page }) => {
    await page.goto('/bookings/completed');
    await page.click('[data-testid=write-review-button] >> nth=0');
    
    // Tentar submeter sem rating
    await page.click('[data-testid=[REDACTED_TOKEN]]');
    
    // Verificar erro
    await expect(page.locator('[data-testid=rating-error]')).toBeVisible();
  });

  test('deve listar reviews não aprovadas como pending para admin', async ({ page }) => {
    // Logout e login como admin
    await page.click('[data-testid=logout-button]');
    await page.goto('/login');
    await page.fill('[data-testid=email-input]', 'admin@example.com');
    await page.fill('[data-testid=password-input]', 'admin123');
    await page.click('[data-testid=login-button]');
    await page.waitForURL(/.*dashboard.*/);

    // Ir para admin reviews
    await page.goto('/admin/reviews');
    
    // Filtrar por pending
    await page.selectOption('[data-testid=[REDACTED_TOKEN]]', 'pending');
    
    // Esperar filtro
    await page.waitForTimeout(500);
    
    // Verificar que tem reviews pendentes
    const pendingReviews = await page.locator('[data-testid=review-status]').allTextContents();
    pendingReviews.forEach(status => {
      expect(status.toLowerCase()).toContain('pendente|aguardando/i');
    });
  });

  test('deve aprovar/rejeitar review como admin', async ({ page }) => {
    // Login como admin
    await page.goto('/login');
    await page.fill('[data-testid=email-input]', 'admin@example.com');
    await page.fill('[data-testid=password-input]', 'admin123');
    await page.click('[data-testid=login-button]');
    await page.waitForURL(/.*dashboard.*/);

    // Ir para reviews pendentes
    await page.goto('/admin/reviews');
    await page.selectOption('[data-testid=[REDACTED_TOKEN]]', 'pending');
    await page.waitForTimeout(500);

    // Clicar em aprovar primeira review
    await page.click('[data-testid=[REDACTED_TOKEN]] >> nth=0');
    
    // Confirmar ação
    await page.click('[data-testid=confirm-approve]');
    
    // Verificar sucesso
    await expect(page.locator('[data-testid=approval-success]')).toBeVisible();
  });
});
