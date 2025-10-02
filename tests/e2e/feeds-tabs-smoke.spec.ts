import { test, expect } from '@playwright/test';
import { ensureLoggedIn } from './utils';

test('Feed switcher cycles Feed/Following/Subscribed', async ({ page }) => {
  await ensureLoggedIn(page);
  await page.goto('/home');
  const switcher = page.getByRole('button', { name: /Feed|Following|Subscribed/i });
  await expect(switcher).toBeVisible();

  // Feed
  await switcher.click();
  await page.getByRole('menuitem', { name: 'Feed' }).click();
  await expect(page.locator('[data-test="right-rail"]').first()).toBeVisible({ timeout: 5000 });

  // Following
  await switcher.click();
  await page.getByRole('menuitem', { name: 'Following' }).click();
  await expect(page.locator('[data-test="right-rail"]').first()).toBeVisible({ timeout: 5000 });

  // Subscribed
  await switcher.click();
  await page.getByRole('menuitem', { name: 'Subscribed' }).click();
  await expect(page.locator('[data-test="right-rail"]').first()).toBeVisible({ timeout: 5000 });
});


