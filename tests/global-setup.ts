import { request } from '@playwright/test';

export default async () => {
  const ctx = await request.newContext({ baseURL: process.env.E2E_FRONTEND || 'http://localhost:3002' });
  await ctx.post('/api/backend/v1/dev/bootstrap', { data: { email: 'demo@mentoros.app' } });
  await ctx.post('/api/backend/v1/dev/login-as', { data: { email: 'demo@mentoros.app' } });
  await ctx.dispose();
};


