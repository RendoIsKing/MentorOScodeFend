import { test, expect } from '@playwright/test';
import { ensureLoggedIn, waitForEventSummary } from './utils';

test('kcal rails + summary', async ({ page }) => {
  await ensureLoggedIn(page);

  const bad = await page.request.post('/api/backend/v1/interaction/actions/apply', {
    data: { type: 'NUTRITION_SET_CALORIES', payload: { kcal: 800 } },
  });
  expect(bad.status()).toBe(422);

  const ok = await page.request.post('/api/backend/v1/interaction/actions/apply', {
    data: { type: 'NUTRITION_SET_CALORIES', payload: { kcal: 2400 } },
  });
  if (!ok.ok()) throw new Error(`calories set failed: ${ok.status()} ${await ok.text()}`);
  await waitForEventSummary(page, 'Satte kalorier');
});



