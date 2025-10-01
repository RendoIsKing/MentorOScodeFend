import { test, expect } from '@playwright/test';
import { ensureLoggedIn } from './utils';

test('Feed tabs render and report button exists', async ({ page }) => {
  await ensureLoggedIn(page);
  await page.goto('/home');

  // Switcher should exist
  const switcher = page.getByRole('button', { name: /Feed|Following|Subscribed/i });
  await expect(switcher).toBeVisible();

  // Try each tab; UI should remain responsive
  await switcher.click();
  await page.getByRole('menuitem', { name: 'Feed' }).click();
  await page.waitForTimeout(200);
  await switcher.click();
  await page.getByRole('menuitem', { name: 'Following' }).click();
  await page.waitForTimeout(200);
  await switcher.click();
  await page.getByRole('menuitem', { name: 'Subscribed' }).click();

  // If any post is visible, expect the Report button to be present on at least one
  const report = page.locator('[data-test="report-button"]').first();
  await expect(report).toBeVisible({ timeout: 5_000 });
});


