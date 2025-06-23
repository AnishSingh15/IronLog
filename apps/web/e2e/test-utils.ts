import { test as base } from '@playwright/test';

// Extend the base test to add custom setup
export const test = base.extend({
  // Clean up browser state before each test
  page: async ({ page }, use) => {
    // Navigate to the login page first to have a valid context
    await page.goto('/login');
    
    // Clear all localStorage data before each test
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Clear all cookies
    await page.context().clearCookies();
    
    await use(page);
  },
});

export { expect } from '@playwright/test';
