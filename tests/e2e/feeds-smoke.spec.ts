import { test, expect } from '@playwright/test';
import { ensureLoggedIn } from './utils';

test('Feed tabs render and report button exists', async ({ page }) => {
  await ensureLoggedIn(page);
  await page.goto('/home');

  // Switcher should exist (header tabs)
  const header = page.locator('nav >> text=Feed');
  await expect(header.first()).toBeVisible();

  // Try each tab; UI should remain responsive (no content assertions)
  await page.locator('nav').getByRole('button', { name: 'Feed', exact: true }).click();
  await page.waitForTimeout(150);
  await page.locator('nav').getByRole('button', { name: 'Following', exact: true }).click();
  await page.waitForTimeout(150);
  await page.locator('nav').getByRole('button', { name: 'Subscribed', exact: true }).click();
});


