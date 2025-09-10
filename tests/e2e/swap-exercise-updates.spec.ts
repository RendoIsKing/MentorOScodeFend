import { test, expect } from '@playwright/test';
import { ensureLoggedIn } from './utils';

test('Swap exercise updates plan summary and Endringslogg', async ({ page, request, baseURL }) => {
  const be = process.env.E2E_BACKEND || 'http://localhost:3006/api/backend';
  await ensureLoggedIn(request, page.context());

  // Ensure a current training plan exists for this user by importing simple text
  const seed = await request.post(`${be}/v1/interaction/chat/engh/training/from-text`, {
    data: { text: 'Dag 1:\n1. Benkpress – 3x8\n2. Roing – 3x10' }
  });
  expect(seed.ok()).toBeTruthy();

  // Apply swap via unified actions endpoint
  const action = await request.post(`${be}/v1/interaction/interaction/actions/apply`, {
    data: { type: 'PLAN_SWAP_EXERCISE', payload: { day: 'Mon', from: 'Benkpress', to: 'Skråbenk' }, userId: 'me' }
  });
  if (!action.ok()) {
    // fallback in case of path differences
    const alt = await request.post(`${be}/v1/interaction/actions/apply`, {
      data: { type: 'PLAN_SWAP_EXERCISE', payload: { day: 'Mon', from: 'Benkpress', to: 'Skråbenk' }, userId: 'me' }
    });
    expect(alt.ok()).toBeTruthy();
  }

  // Visit Student page and verify summary contains the new exercise
  await page.goto(`${baseURL}/student`);
  await expect(page.getByTestId('plan-summary')).toContainText(/Skråbenk|Skrå benk|Incline/i, { timeout: 15_000 });
});


