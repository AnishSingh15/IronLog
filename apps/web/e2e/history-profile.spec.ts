import { test, expect } from './test-utils';

test.describe('History and Profile Pages', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@ironlog.com');
    await page.fill('[data-testid="password-input"]', 'admin123');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test.describe('History Page', () => {
    test('should display workout history with calendar heatmap', async ({ page }) => {
      await page.goto('/history');

      // Check for main history elements
      await expect(page.locator('h1')).toContainText('Workout History');
      await expect(page.locator('[data-testid="calendar-heatmap"]')).toBeVisible();
      await expect(page.locator('[data-testid="stats-cards"]')).toBeVisible();
    });

    test('should navigate between months', async ({ page }) => {
      await page.goto('/history');

      // Get current month text
      const currentMonth = await page.locator('[data-testid="current-month"]').textContent();

      // Click previous month
      await page.click('[data-testid="previous-month"]');
      const previousMonth = await page.locator('[data-testid="current-month"]').textContent();

      expect(previousMonth).not.toBe(currentMonth);

      // Click next month
      await page.click('[data-testid="next-month"]');
      const nextMonth = await page.locator('[data-testid="current-month"]').textContent();

      expect(nextMonth).toBe(currentMonth);
    });

    test('should show workout details when clicking on a day', async ({ page }) => {
      await page.goto('/history');

      // Wait for calendar to load
      await page.waitForSelector('[data-testid="calendar-day"]');

      // Click on a day with workout data (if any)
      const workoutDays = page.locator('[data-testid="calendar-day"][data-has-workout="true"]');
      const count = await workoutDays.count();

      if (count > 0) {
        await workoutDays.first().click();
        await expect(page.locator('[data-testid="workout-detail"]')).toBeVisible();
      }
    });

    test('should display stats cards with workout metrics', async ({ page }) => {
      await page.goto('/history');

      await expect(page.locator('[data-testid="completed-workouts-stat"]')).toBeVisible();
      await expect(page.locator('[data-testid="current-streak-stat"]')).toBeVisible();
      await expect(page.locator('[data-testid="longest-streak-stat"]')).toBeVisible();
      await expect(page.locator('[data-testid="total-sets-stat"]')).toBeVisible();
    });
  });

  test.describe('Profile Page', () => {
    test('should display user profile information', async ({ page }) => {
      await page.goto('/profile');

      // Check for main profile elements
      await expect(page.locator('h1')).toContainText('Profile Settings');
      await expect(page.locator('[data-testid="profile-info"]')).toBeVisible();
      await expect(page.locator('[data-testid="security-settings"]')).toBeVisible();
    });

    test('should edit profile information', async ({ page }) => {
      await page.goto('/profile');

      // Click edit profile button
      await page.click('[data-testid="edit-profile-button"]');

      // Should show editable form
      await expect(page.locator('[data-testid="name-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="email-input"]')).toBeVisible();

      // Make changes
      await page.fill('[data-testid="name-input"]', 'Updated Admin User');

      // Save changes
      await page.click('[data-testid="save-profile-button"]');

      // Should show success message
      await expect(page.locator('.MuiAlert-message')).toContainText('Profile updated successfully');

      // Should show updated information
      await expect(page.locator('[data-testid="user-name"]')).toContainText('Updated Admin User');
    });

    test('should change password', async ({ page }) => {
      await page.goto('/profile');

      // Click change password button
      await page.click('[data-testid="change-password-button"]');

      // Should show password form
      await expect(page.locator('[data-testid="current-password-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="new-password-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="confirm-password-input"]')).toBeVisible();

      // Fill password form
      await page.fill('[data-testid="current-password-input"]', 'admin123');
      await page.fill('[data-testid="new-password-input"]', 'newPassword123!');
      await page.fill('[data-testid="confirm-password-input"]', 'newPassword123!');

      // Submit password change
      await page.click('[data-testid="save-password-button"]');

      // Should show success message
      await expect(page.locator('.MuiAlert-message')).toContainText(
        'Password changed successfully'
      );
    });

    test('should validate password requirements', async ({ page }) => {
      await page.goto('/profile');

      // Click change password button
      await page.click('[data-testid="change-password-button"]');

      // Try weak password
      await page.fill('[data-testid="current-password-input"]', 'admin123');
      await page.fill('[data-testid="new-password-input"]', '123');
      await page.fill('[data-testid="confirm-password-input"]', '123');

      // Submit password change
      await page.click('[data-testid="save-password-button"]');

      // Should show validation error
      await expect(page.locator('.MuiAlert-message')).toContainText('at least 8 characters');
    });

    test('should logout from profile page', async ({ page }) => {
      await page.goto('/profile');

      // Click logout button
      await page.click('[data-testid="logout-button"]');

      // Should redirect to home page
      await expect(page).toHaveURL('/');
    });
  });
});
