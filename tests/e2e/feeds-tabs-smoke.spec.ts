import { test, expect } from '@playwright/test';
import { ensureLoggedIn } from './utils';

test('Feed switcher cycles Feed/Following/Subscribed', async ({ page }) => {
  await ensureLoggedIn(page);
  await page.goto('/home');
  const switcher = page.locator('[data-test="feed-tabs"]');
  await expect(switcher).toBeVisible();

  // Feed
  await page.getByRole('button', { name: 'Feed' }).click();
  await expect(page.locator('[data-test="right-rail"]').first()).toBeVisible({ timeout: 5000 });

  // Following
  await page.getByRole('button', { name: 'Following' }).click();
  await expect(page.locator('[data-test="right-rail"]').first()).toBeVisible({ timeout: 5000 });

  // Subscribed
  await page.getByRole('button', { name: 'Subscribed' }).click();
  await expect(page.locator('[data-test="right-rail"]').first()).toBeVisible({ timeout: 5000 });
});


