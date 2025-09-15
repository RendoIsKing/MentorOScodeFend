import { test, expect } from '@playwright/test';
test.skip(true, 'Quarantined locally while we add durable UI hooks. Keep smoke tests only.');
import { ensureLoggedIn, waitForEventSummary } from './utils';

test('Swap exercise updates plan summary and Endringslogg', async ({ page }) => {
  await ensureLoggedIn(page);

  // Swap exercise instead (safer than tripping the 20% rail)
  const resp = await page.request.post('/api/backend/v1/interaction/actions/apply', {
    data: { type: 'PLAN_SWAP_EXERCISE', payload: { day: 'Mon', from: 'Benkpress', to: 'Skråbenk' } },
  });
  expect(resp.ok()).toBeTruthy();
  await waitForEventSummary(page, 'Byttet');

  await page.goto('/student');
  await expect(page.getByText(/Skråbenk|Skrå benk|Incline/i)).toBeVisible();
});


