import { test, expect } from '@playwright/test';

test('FE→BE health', async ({ request, baseURL }) => {
  const res = await request.get(`${baseURL}/api/backend/health`);
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json?.ok).toBe(true);
  expect(typeof json?.version).toBe('string');
});


