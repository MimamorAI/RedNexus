import { test, expect } from '@playwright/test';

test('Dashboard screenshot', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('text=Dashboard')).toBeVisible();
  await page.screenshot({ path: 'screenshots/dashboard.png' });
});

test('Exposure page screenshot', async ({ page }) => {
  await page.goto('/exposure');
  await expect(page.locator('text=Exposure Intelligence')).toBeVisible();
  await page.screenshot({ path: 'screenshots/exposure.png' });
});
