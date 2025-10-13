"use client";
import { useEffect } from 'react';

type Item = { id:string; date:string; type:string; summary:string; rationale?:string; actor?:string; before?:any; after?:any };

export default function ChangeDetailsModal({ item, onClose }:{ item: Item|null; onClose:()=>void }){
  useEffect(()=>{
    function onKey(e:KeyboardEvent){ if (e.key==='Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return ()=> window.removeEventListener('keydown', onKey);
  }, [onClose]);
  if (!item) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center" role="dialog" aria-modal>
      <div className="bg-background rounded shadow-lg w-[95vw] max-w-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-lg font-semibold">Endringsdetaljer</div>
          <button className="px-2 py-1 border rounded" onClick={onClose} aria-label="Lukk">Lukk</button>
        </div>
        <div className="space-y-2 text-sm">
          <div><span className="text-muted-foreground">Tid:</span> {new Date(item.date).toLocaleString()}</div>
          <div><span className="text-muted-foreground">Type:</span> {item.type}</div>
          <div><span className="text-muted-foreground">Oppsummering:</span> {item.summary}</div>
          {item.rationale ? (<div><span className="text-muted-foreground">Begrunnelse:</span> {item.rationale}</div>) : null}
          {item.actor ? (<div><span className="text-muted-foreground">Utført av:</span> {String(item.actor)}</div>) : null}
          <details>
            <summary className="cursor-pointer">Før</summary>
            <pre className="text-xs bg-muted p-2 rounded overflow-auto">{JSON.stringify(item.before ?? {}, null, 2)}</pre>
          </details>
          <details>
            <summary className="cursor-pointer">Etter</summary>
            <pre className="text-xs bg-muted p-2 rounded overflow-auto">{JSON.stringify(item.after ?? {}, null, 2)}</pre>
          </details>
        </div>
      </div>
    </div>
  );
}


