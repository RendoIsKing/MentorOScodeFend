"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MobileMediaPicker from "@/components/upload/MobileMediaPicker";
import { addFiles as addDraftFiles, getAllDrafts, removeDraft, clearDrafts, DraftAsset } from "@/lib/idbDrafts";

export default function UploadClient() {
  const [drafts, setDrafts] = useState<DraftAsset[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const search = useSearchParams();

  useEffect(() => {
    (async () => {
      const all = await getAllDrafts();
      setDrafts(all);
      if (all.length && selectedId === null) setSelectedId(all[all.length - 1].id);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onPick(fs: File[]) {
    const added = await addDraftFiles(fs);
    setDrafts((prev) => [...prev, ...added]);
    setSelectedId(added[added.length - 1]?.id ?? null);
  }

  async function onRemove(id: number) {
    await removeDraft(id);
    setDrafts((prev) => prev.filter((d) => d.id !== id));
    if (selectedId === id) setSelectedId((prev) => (drafts[0]?.id && drafts[0].id !== id ? drafts[0].id : null));
  }

  function onContinue() {
    if (!selectedId) { alert("Velg et bilde først."); return; }
    router.push(`/upload/compose?draft=${selectedId}`);
  }

  const previews = useMemo(() => drafts.map(d => ({ ...d, url: URL.createObjectURL(d.blob) })), [drafts]);

  return (
    <main className="mx-auto max-w-screen-md p-4 pb-24 md:pb-0">
      <h1 className="text-lg font-semibold mb-3">Create</h1>
      <div className="mb-3 md:hidden">
        <MobileMediaPicker onPick={onPick} />
      </div>
      {previews.length > 0 && (
        <div className="mb-4 grid grid-cols-3 gap-2 md:hidden">
          {previews.map((d)=> (
            <div key={d.id} onClick={()=>setSelectedId(d.id)} className={`relative aspect-square w-full overflow-hidden rounded-lg border ${selectedId===d.id?"ring-2 ring-[#6C4DF7]":"border-transparent"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={d.url} alt={d.name} className="h-full w-full object-cover" />
              <button aria-label="Remove" onClick={(e)=>{e.stopPropagation(); onRemove(d.id);}} className="absolute left-1 top-1 h-6 w-6 rounded-full bg-black/50 text-white grid place-items-center">×</button>
            </div>
          ))}
        </div>
      )}
      {error && <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</div>}
      <div className="md:hidden flex items-center gap-2">
        <button onClick={onContinue} disabled={!selectedId || busy} className="h-11 rounded-xl bg-primary px-4 text-primary-foreground disabled:opacity-50" data-test="go-compose">{busy?"…":"Publish"}</button>
        {drafts.length>0 && !busy && <button onClick={()=>{ clearDrafts().then(()=>setDrafts([])); setSelectedId(null); }} className="h-11 rounded-xl border px-4">Clear</button>}
      </div>
      <div className="hidden md:block">{/* <DesktopUploader …/> */}</div>
    </main>
  );
}


