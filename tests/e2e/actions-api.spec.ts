import { test, expect } from '@playwright/test';

test('actions API smoke', async ({ request }) => {
  const email = 'demo@mentoros.app';

  const boot = await request.post('/api/backend/v1/dev/bootstrap', { data: { email } });
  expect(boot.ok()).toBeTruthy();

  const login = await request.post('/api/backend/v1/dev/login-as', { data: { email } });
  expect(login.ok()).toBeTruthy();

  const guard = await request.post('/api/backend/v1/interaction/actions/apply', {
    data: { type: 'NUTRITION_SET_CALORIES', payload: { kcal: 800 } },
  });
  expect(guard.status()).toBe(422);

  const ok = await request.post('/api/backend/v1/interaction/actions/apply', {
    data: { type: 'NUTRITION_SET_CALORIES', payload: { kcal: 2400 } },
  });
  expect(ok.ok()).toBeTruthy();
});


