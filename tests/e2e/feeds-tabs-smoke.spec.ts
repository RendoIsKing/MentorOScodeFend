import { test, expect } from '@playwright/test';
import { ensureLoggedIn } from './utils';

test('Feed switcher cycles Feed/Following/Subscribed', async ({ page }) => {
  await ensureLoggedIn(page);
  await page.goto('/home');
  const header = page.locator('nav >> text=Feed');
  await expect(header.first()).toBeVisible();

  // Feed
  await page.locator('nav').getByRole('button', { name: 'Feed', exact: true }).click();
  await page.waitForTimeout(150);

  // Following
  await page.locator('nav').getByRole('button', { name: 'Following', exact: true }).click();
  await page.waitForTimeout(150);

  // Subscribed
  await page.locator('nav').getByRole('button', { name: 'Subscribed', exact: true }).click();
});


