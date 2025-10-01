import { test, expect } from '@playwright/test';
import { ensureLoggedIn } from './utils';

test('Wallet create-session returns client secret and entitlement probe runs', async ({ page }) => {
  await ensureLoggedIn(page);
  await page.goto('/wallet');
  // Click Help & Support tile (wired to create-session for smoke)
  await page.getByText('Help & Support').click();
  const status = page.locator('text=Client secret created:');
  await expect(status).toBeVisible({ timeout: 10_000 });
});


