import { Page, expect } from '@playwright/test';

export async function ensureLoggedIn(page: Page, email = 'demo@mentoros.app') {
  await page.request.post('/api/backend/v1/dev/bootstrap', { data: { email } });
  const r = await page.request.post('/api/backend/v1/dev/login-as', { data: { email } });
  if (!r.ok()) throw new Error(`dev login failed: ${r.status()} ${await r.text()}`);
  return { email };
}

export async function waitForEventSummary(page: Page, text: string, timeout = 8000) {
  await expect
    .poll(async () => {
      const ev = await page.request.get('/api/backend/v1/events');
      const j = await ev.json();
      const summaries: string[] = (j?.items ?? []).map((e: any) => e?.summary ?? '');
      return summaries.join('\n');
    }, { timeout })
    .toContain(text);
}


