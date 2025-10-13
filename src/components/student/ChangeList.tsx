"use client";
import { useEffect, useState } from 'react';
import { fetchRecentChanges } from '@/lib/api/student';

type Item = { id:string; date:string; type:string; summary:string; rationale?:string; actor?:string; before?:any; after?:any };

export default function ChangeList({ userId='me', onSelect }:{ userId?:string; onSelect?:(it:Item)=>void }){
  const [items, setItems] = useState<Item[]|null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|undefined>();
  useEffect(()=>{
    let cancelled = false;
    (async ()=>{
      setLoading(true); setError(undefined);
      try {
        const res = await fetchRecentChanges(userId, 10);
        if (!cancelled) setItems(res.items || []);
      } catch (e:any) {
        if (!cancelled) setError('Kunne ikke hente endringer');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return ()=>{ cancelled = true; };
  }, [userId]);

  if (loading) return <div className="text-sm text-muted-foreground">Laster endringer…</div>;
  if (error) return <div className="text-sm text-destructive">{error}</div>;
  if (!items?.length) return <div className="text-sm text-muted-foreground">Ingen endringer ennå.</div>;

  return (
    <ul className="space-y-2">
      {items.slice(0,10).map((it)=> (
        <li key={it.id} className="rounded border px-3 py-2 text-sm flex items-center justify-between">
          <div>
            <div className="font-medium">{it.summary}</div>
            <div className="text-xs text-muted-foreground">{new Date(it.date).toLocaleString()} • {it.type}</div>
          </div>
          <button className="px-2 py-1 border rounded hover:bg-muted text-xs" onClick={()=> onSelect?.(it)}>Se detaljer</button>
        </li>
      ))}
    </ul>
  );
}


