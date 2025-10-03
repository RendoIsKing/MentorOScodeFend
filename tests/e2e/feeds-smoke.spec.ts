import { test, expect } from '@playwright/test';
import { ensureLoggedIn } from './utils';

test('Feed tabs render and report button exists', async ({ page }) => {
  await ensureLoggedIn(page);
  await page.goto('/home');

  // Switcher should exist (header tabs)
  const switcher = page.locator('[data-test="feed-tabs"]');
  await expect(switcher).toBeVisible();

  // Try each tab; UI should remain responsive
  await page.getByRole('button', { name: 'Feed' }).click();
  await page.waitForTimeout(200);
  await page.getByRole('button', { name: 'Following' }).click();
  await page.waitForTimeout(200);
  await page.getByRole('button', { name: 'Subscribed' }).click();

  // If any post is visible, expect the Report button to be present on at least one
  const report = page.locator('[data-test="report-button"]').first();
  await expect(report).toBeVisible({ timeout: 5_000 });
});


