import { expect, test } from '@playwright/test';

test.describe('Dashboard Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@ironlog.com');
    await page.fill('[data-testid="password-input"]', 'admin123');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should display dashboard with workout overview', async ({ page }) => {
    // Check for main dashboard elements
    await expect(page.locator('[data-testid="welcome-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="workout-overview"]')).toBeVisible();
    await expect(page.locator('[data-testid="progress-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="timer-card"]')).toBeVisible();
  });

  test('should expand and interact with exercise accordion', async ({ page }) => {
    // Wait for workout data to load
    await page.waitForSelector('[data-testid="exercise-accordion"]', { timeout: 10000 });

    // Click on first exercise accordion
    const firstAccordion = page.locator('[data-testid="exercise-accordion"]').first();
    await firstAccordion.click();

    // Should show exercise details
    await expect(page.locator('[data-testid="set-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="weight-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="reps-input"]')).toBeVisible();
  });

  test('should complete a set and update progress', async ({ page }) => {
    // Wait for workout data to load
    await page.waitForSelector('[data-testid="exercise-accordion"]', { timeout: 10000 });

    // Click on first exercise accordion
    const firstAccordion = page.locator('[data-testid="exercise-accordion"]').first();
    await firstAccordion.click();

    // Fill in set data
    await page.fill('[data-testid="weight-input"]', '135');
    await page.fill('[data-testid="reps-input"]', '8');

    // Complete the set
    await page.click('[data-testid="complete-set-button"]');

    // Should show success feedback
    await expect(page.locator('.MuiAlert-message')).toBeVisible();

    // Progress should update
    await expect(page.locator('[data-testid="progress-percentage"]')).not.toContainText('0%');
  });

  test('should start and stop workout timer', async ({ page }) => {
    // Check initial timer state
    await expect(page.locator('[data-testid="timer-display"]')).toContainText('00:00');

    // Start timer using FAB
    await page.click('[data-testid="start-workout-fab"]');

    // Timer should be running
    await expect(page.locator('[data-testid="timer-display"]')).not.toContainText('00:00');

    // Stop timer
    await page.click('[data-testid="stop-timer-button"]');
  });

  test('should navigate to other pages via bottom navigation', async ({ page }) => {
    // Navigate to history
    await page.click('[data-testid="history-nav"]');
    await expect(page).toHaveURL('/history');

    // Navigate to profile
    await page.click('[data-testid="profile-nav"]');
    await expect(page).toHaveURL('/profile');

    // Navigate back to dashboard
    await page.click('[data-testid="dashboard-nav"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that layout adapts to mobile
    await expect(page.locator('[data-testid="welcome-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="bottom-navigation"]')).toBeVisible();

    // Cards should stack vertically on mobile
    const cards = page.locator('[data-testid="overview-card"]');
    const firstCard = cards.first();
    const secondCard = cards.nth(1);

    const firstBox = await firstCard.boundingBox();
    const secondBox = await secondCard.boundingBox();

    if (firstBox && secondBox) {
      // On mobile, cards should be stacked (second card should be below first)
      expect(secondBox.y).toBeGreaterThan(firstBox.y + firstBox.height - 10);
    }
  });
});
