"use client";
import { useEffect, useState } from 'react';

type Report = { id: string; post: string; reporter: string; reason: string; status: string; createdAt: string };

export default function ModerationAdminPage() {
  const [items, setItems] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const apiBase = process.env.NEXT_PUBLIC_API_SERVER ? `${process.env.NEXT_PUBLIC_API_SERVER}/v1` : '/api/backend/v1';

  const load = async () => {
    setLoading(true); setError(undefined);
    try {
      const r = await fetch(`${apiBase}/post/moderation/reports`, { credentials: 'include' });
      const j = await r.json().catch(()=>({}));
      if (!r.ok) throw new Error(j?.error?.message || 'list failed');
      setItems(Array.isArray(j.items) ? j.items : []);
    } catch (e: any) {
      setError(e?.message || 'Kunne ikke hente rapporter');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resolve = async (id: string) => {
    try {
      const r = await fetch(`${apiBase}/post/moderation/reports/${encodeURIComponent(id)}/resolve`, { method: 'POST', credentials: 'include' });
      if (r.ok) load();
    } catch {}
  };

  return (
    <div className="mx-auto max-w-3xl p-4">
      <h1 className="text-xl font-semibold mb-4">Moderation Reports</h1>
      {loading ? (<div className="text-sm text-muted-foreground">Laster…</div>) : null}
      {error ? (<div className="text-sm text-destructive">{error}</div>) : null}
      {!loading && !error && !items.length ? (
        <div className="text-sm text-muted-foreground">Ingen rapporter</div>
      ) : null}
      <ul className="space-y-3">
        {items.map((it)=> (
          <li key={it.id} className="rounded border p-3 text-sm">
            <div className="flex items-center justify-between">
              <div className="font-medium">{it.reason}</div>
              <div className="text-xs text-muted-foreground">{new Date(it.createdAt).toLocaleString()}</div>
            </div>
            <div className="text-xs text-muted-foreground mt-1">post: {it.post} • reporter: {it.reporter} • status: {it.status}</div>
            {it.status !== 'resolved' ? (
              <button className="mt-2 inline-flex items-center rounded border px-2 py-1 text-xs hover:bg-muted" onClick={()=> resolve(it.id)}>Resolve</button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}


