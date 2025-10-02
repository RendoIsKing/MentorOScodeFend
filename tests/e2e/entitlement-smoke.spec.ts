import { test, expect } from '@playwright/test';
import { ensureLoggedIn } from './utils';

test('Entitlement gating flips 403→200 after subscribe simulate', async ({ page }) => {
  await ensureLoggedIn(page);

  // Force non-subscribed state
  await page.request.post('/api/backend/v1/preonboarding/convert', {
    data: { planType: 'TRIAL' },
  });
  const before = await page.request.get('/api/backend/v1/feature/protected-check');
  expect([401, 403]).toContain(before.status());

  // Flip to SUBSCRIBED (simulate webhook success)
  await page.request.post('/api/backend/v1/preonboarding/convert', {
    data: { planType: 'SUBSCRIBED' },
  });
  const after = await page.request.get('/api/backend/v1/feature/protected-check');
  expect(after.status()).toBe(200);
});


