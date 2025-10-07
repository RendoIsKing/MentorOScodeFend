import { test, expect } from '@playwright/test';
import { ensureLoggedIn } from './utils';

test('Entitlement gating flips 403→200 after subscribe simulate', async ({ page }) => {
  await ensureLoggedIn(page);
  // Resolve current user id
  const me = await page.request.get('/api/backend/v1/auth/me');
  const meJson = await me.json();
  const userId = meJson?.data?._id || meJson?.data?.id;

  // Force non-subscribed state
  await page.request.post('/api/backend/v1/preonboarding/convert', {
    data: { planType: 'TRIAL', userId },
  });
  const before = await page.request.get('/api/backend/v1/feature/protected-check');
  expect([401, 403]).toContain(before.status());

  // Flip to SUBSCRIBED (simulate webhook success)
  await page.request.post('/api/backend/v1/preonboarding/convert', {
    data: { planType: 'SUBSCRIBED', userId },
  });
  // Force flip + refresh session
  await page.request.post('/api/backend/v1/preonboarding/force-sub', { data: { userId } });
  // Poll briefly to allow guard to observe status flip
  let ok = false;
  for (let i = 0; i < 20; i++) {
    const resp = await page.request.get('/api/backend/v1/feature/protected-check');
    if (resp.status() === 200) { ok = true; break; }
    await page.waitForTimeout(500);
  }
  expect(ok).toBe(true);
});


