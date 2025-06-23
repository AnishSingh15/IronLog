import { test as base } from '@playwright/test';

// Extend the base test to add custom setup
export const test = base.extend({
  // Add a simple page fixture that waits for the page to be ready
  page: async ({ page }, use) => {
    // Set longer timeout for slower CI environments
    page.setDefaultTimeout(60000);
    
    await use(page);
  },
});

export { expect } from '@playwright/test';
