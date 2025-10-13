"use client";
import { useEffect, useState } from 'react';

type Report = { id: string; post: string; reporter: string; reason: string; status: string; createdAt: string };

export default function ModerationAdminPage() {
  const [items, setItems] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [status, setStatus] = useState<'all'|'open'|'resolved'>('open');
  const [cursor, setCursor] = useState<string | null>(null);
  const apiBase = process.env.NEXT_PUBLIC_API_SERVER ? `${process.env.NEXT_PUBLIC_API_SERVER}/v1` : '/api/backend/v1';

  const load = async (mode: 'reset'|'more' = 'reset') => {
    setLoading(true); setError(undefined);
    try {
      const params = new URLSearchParams();
      if (status !== 'all') params.set('status', status);
      if (mode === 'more' && cursor) params.set('cursor', cursor);
      const url = `${apiBase}/post/moderation/reports${params.toString() ? `?${params.toString()}` : ''}`;
      const r = await fetch(url, { credentials: 'include' });
      const j = await r.json().catch(()=>({}));
      if (!r.ok) throw new Error(j?.error?.message || 'list failed');
      const newItems = Array.isArray(j.items) ? j.items : [];
      if (mode === 'reset') setItems(newItems); else setItems(prev => [...prev, ...newItems]);
      setCursor(j?.nextCursor || null);
    } catch (e: any) {
      setError(e?.message || 'Kunne ikke hente rapporter');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setCursor(null); load('reset'); }, [status]);

  const resolve = async (id: string) => {
    try {
      const r = await fetch(`${apiBase}/post/moderation/reports/${encodeURIComponent(id)}/resolve`, { method: 'POST', credentials: 'include' });
      if (r.ok) load();
    } catch {}
  };

  return (
    <div className="mx-auto max-w-3xl p-4">
      <h1 className="text-xl font-semibold mb-4">Moderation Reports</h1>
      <div className="mb-3 flex items-center gap-2">
        <label className="text-sm">Status</label>
        <select value={status} onChange={e=> setStatus(e.target.value as any)} className="border rounded px-2 py-1 text-sm">
          <option value="open">Open</option>
          <option value="resolved">Resolved</option>
          <option value="all">All</option>
        </select>
      </div>
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
      <div className="mt-3">
        {cursor ? (
          <button disabled={loading} onClick={()=> load('more')} className="inline-flex items-center rounded border px-3 py-1.5 text-sm hover:bg-muted">Load more</button>
        ) : null}
      </div>
    </div>
  );
}


