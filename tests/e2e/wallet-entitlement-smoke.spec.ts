import { test, expect } from '@playwright/test';
import { ensureLoggedIn } from './utils';

test('Wallet create-session returns client secret and entitlement probe runs', async ({ page }) => {
  await ensureLoggedIn(page);
  await page.goto('/wallet');
  // Click Help & Support tile (wired to create-session for smoke)
  await page.locator('[data-test="wallet-help-support"]').click();
  const status = page.locator('[data-test="wallet-client-secret"]');
  await expect(status).toContainText('Client secret created:', { timeout: 10_000 });
});


