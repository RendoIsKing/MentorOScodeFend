import { APIRequestContext, BrowserContext } from '@playwright/test';

const FE = process.env.E2E_FRONTEND || 'http://localhost:3002';
const BE = process.env.E2E_BACKEND || 'http://localhost:3006/api/backend';

export async function ensureLoggedIn(request: APIRequestContext, context: BrowserContext, email?: string) {
  const userEmail = email || process.env.E2E_EMAIL || `e2e_${Date.now()}@mentoros.app`;

  // Try dev login (POST)
  const r1 = await request.post(`${BE}/v1/dev/login-as`, { data: { email: userEmail } });
  if (r1.ok()) {
    const cookies = (await request.storageState()).cookies.filter((c) => c.domain.includes('localhost'));
    await context.addCookies(
      cookies.map((c) => ({ name: c.name, value: c.value, domain: 'localhost', path: c.path, expires: c.expires, httpOnly: c.httpOnly, secure: c.secure, sameSite: c.sameSite as any }))
    );
    return { email: userEmail };
  }

  // Fallback: register a user via auth API; this sets auth_token cookie
  const password = 'P@ssw0rd123!';
  const payload = {
    firstName: 'E2E',
    lastName: 'User',
    email: userEmail,
    phoneNumber: '00000000',
    dialCode: '47',
    country: 'NO',
    password,
  } as any;
  const reg = await request.post(`${BE}/v1/auth/register`, { data: payload });
  if (!reg.ok()) {
    const txt = await reg.text();
    throw new Error(`register failed: ${reg.status()} ${txt}`);
  }
  // Apply cookies to page context
  const cookies = (await request.storageState()).cookies.filter((c) => c.domain.includes('localhost'));
  await context.addCookies(
    cookies.map((c) => ({ name: c.name, value: c.value, domain: 'localhost', path: c.path, expires: c.expires, httpOnly: c.httpOnly, secure: c.secure, sameSite: c.sameSite as any }))
  );
  return { email: userEmail };
}


