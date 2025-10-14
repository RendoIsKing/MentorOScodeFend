export const dynamic = 'force-dynamic';
export const revalidate = false;

async function probe(): Promise<{ status: number; body: any }> {
  const apiBase = process.env.NEXT_PUBLIC_API_SERVER || '/api/backend';
  try {
    const r = await fetch(`${apiBase}/v1/feature/protected-check`, {
      cache: 'no-store',
      credentials: 'include',
    });
    const body = await r.json().catch(() => ({}));
    return { status: r.status, body };
  } catch (e: any) {
    return { status: 0, body: { error: String(e?.message || e) } };
  }
}

export default async function Page() {
  const result = await probe();
  return (
    <div style={{ padding: 16 }}>
      <h1>Protected Check</h1>
      <p>Calls /api/backend/v1/feature/protected-check with credentials.</p>
      <pre style={{ background: '#111', color: '#eee', padding: 12, borderRadius: 8 }}>
        {JSON.stringify(result, null, 2)}
      </pre>
      <p>
        Status {result.status === 200 ? 'OK (authenticated)' : result.status === 401 ? 'Unauthorized (no cookie)' : `Error (${result.status})`}
      </p>
    </div>
  );
}


