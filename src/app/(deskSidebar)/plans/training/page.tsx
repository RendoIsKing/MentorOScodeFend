"use client";
import { useEffect, useMemo, useState } from "react";
import { useUserOnboardingContext } from "@/context/UserOnboarding";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Copy, Printer } from "lucide-react";
import PlansHeader from "@/components/plans/PlansHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function TrainingPlanPage(){
  const { user } = useUserOnboardingContext();
  const [plan, setPlan] = useState<any|null>(()=>{
    try{
      const cached = sessionStorage.getItem('lastSnapshot');
      if (cached) {
        const snap = JSON.parse(cached);
        return snap?.currentTrainingPlan?.[0] || null;
      }
    }catch{}
    return null;
  });
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [editMode, setEditMode] = useState(false);

  // --- utilities ---
  const daySlug = (label: string|undefined, idx: number): string => {
    const v = String(label || '').trim().toLowerCase();
    if (!v) return `d${idx}`;
    // support Norwegian and English weekdays → 3-letter slug
    const map: Record<string,string> = {
      mandag:"mon", tirsdag:"tue", onsdag:"wed", torsdag:"thu", fredag:"fri", lørdag:"sat", lordag:"sat", søndag:"sun", sondag:"sun",
      monday:"mon", tuesday:"tue", wednesday:"wed", thursday:"thu", friday:"fri", saturday:"sat", sunday:"sun",
      mon:"mon", tue:"tue", wed:"wed", thu:"thu", fri:"fri", sat:"sat", sun:"sun",
    };
    const token = v.split(/[^a-zøæå]+/)[0];
    return map[token] || token.slice(0,3) || `d${idx}`;
  };

  function pickGuidelines(p: any, day: any): string | string[] | null {
    return p?.generalGuidelines
      ?? p?.guidelines
      ?? p?.notes
      ?? p?.meta?.generalGuidelines
      ?? day?.guidelines
      ?? null;
  }

  // selected day management (query ?day=, fallback to localStorage, else first)
  const [selected, setSelected] = useState<string | null>(null);
  useEffect(() => {
    const q = searchParams?.get('day');
    if (q) { setSelected(q.toLowerCase()); return; }
    try {
      const last = localStorage.getItem('training:lastDay');
      if (last) { setSelected(last); return; }
    } catch {}
    setSelected(null);
  }, [searchParams]);

  const selectDay = (slug: string) => {
    try { localStorage.setItem('training:lastDay', slug); } catch {}
    const sp = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    sp.set('day', slug);
    router.replace(`${pathname}?${sp.toString()}`);
    setSelected(slug);
  };

  // keyboard left/right to change day
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!Array.isArray(plan) || !plan.length) return;
      const slugs = plan.map((s:any,i:number)=> daySlug(s.day, i));
      const cur = selected ?? slugs[0];
      const idx = Math.max(0, slugs.indexOf(cur));
      if (e.key === 'ArrowRight') {
        const next = slugs[(idx + 1) % slugs.length];
        selectDay(next);
      } else if (e.key === 'ArrowLeft') {
        const next = slugs[(idx - 1 + slugs.length) % slugs.length];
        selectDay(next);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [plan, selected]);

  function copyPlan(){
    try{
      const text = Array.isArray(plan)? plan.map((s:any, idx:number)=>{
        const head = `${s.day || `Økt ${idx+1}`} — ${s.focus}`;
        const lines = (s.sets||[]).map((x:any)=>`- ${x.exercise}: ${x.sets}x${x.reps}${x.weight?` @ ${x.weight}kg`:''}`);
        return [head, ...lines, ''].join('\n');
      }).join('\n') : '';
      navigator.clipboard.writeText(text);
    }catch{}
  }

  async function savePlan(){
    try{
      const apiBase = process.env.NEXT_PUBLIC_API_SERVER || "/api/backend";
      const sessions = (Array.isArray(plan)? plan : []).map((s:any)=>({ day: s.day, focus: s.focus, exercises: s.sets?.map((x:any)=>({ name: x.exercise, sets: x.sets, reps: x.reps, load: x.weight })) || [] }));
      await fetch(`${apiBase}/v1/interaction/chat/engh/training/save`, { method:'POST', credentials:'include', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ sessions }) });
      try { window.dispatchEvent(new CustomEvent('plansUpdated')); } catch {}
    }catch{}
  }

  function sharePlan(){
    try{
      const planId = Array.isArray(plan) && plan.length ? plan[0]?.id : undefined;
      if (!planId) return;
      const base = process.env.NEXT_PUBLIC_API_SERVER || '/api/backend';
      const link = `${window.location.origin}${base}/v1/interaction/plans/share/training/${planId}`;
      navigator.clipboard.writeText(link);
    }catch{}
  }
  useEffect(()=>{
    const apiBase = process.env.NEXT_PUBLIC_API_SERVER || "/api/backend";
    (async()=>{
      try{
        let snap: any = null;
        try {
          const r1 = await fetch(`${apiBase}/v1/student/me/snapshot?period=30d`, { credentials:'include' });
          if (r1.ok) snap = await r1.json();
        } catch {}
        if (!snap) {
          const me = await fetch(`${apiBase}/v1/auth/me`, { credentials:'include' });
          const md = await me.json();
          const uid = md?.data?._id || user?._id || 'me';
          const r = await fetch(`${apiBase}/v1/student/${uid}/snapshot?period=30d`, { credentials:'include' });
          snap = await r.json();
        }
        setPlan(snap?.currentTrainingPlan || null);
      }catch{}
    })();
  }, [user?._id]);

  return (
    <div className="w-full min-h-screen bg-card px-6 md:px-8 py-4">
      <button
        onClick={() => {
          const params = new URLSearchParams(typeof window!=='undefined'?window.location.search:'');
          const from = params.get('from');
          const src = params.get('src') || '/student';
          if (from === 'chat') window.location.href = '/room/Coach%20Engh';
          else window.location.href = src || '/student';
        }}
        className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-md border hover:bg-muted"
        aria-label="Go back"
      >
        <ArrowLeft size={16} />
        Back
      </button>
      <div className="mt-2 mb-4 flex items-center justify-between gap-3">
        <PlansHeader active="training" />
        <div className="flex items-center gap-2">
          <button onClick={()=>window.print()} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border hover:bg-muted" title="Export to PDF"><Printer size={14}/> Print</button>
          <button onClick={copyPlan} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border hover:bg-muted" title="Copy plan"><Copy size={14}/> Copy</button>
          <button onClick={savePlan} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border hover:bg-muted" title="Save changes">Save</button>
          <button onClick={sharePlan} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border hover:bg-muted" title="Share link">Share</button>
          <button onClick={()=>setEditMode(e=>!e)} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border hover:bg-muted" title="Toggle edit">{editMode? 'Done' : 'Edit'}</button>
        </div>
      </div>
      {Array.isArray(plan) && plan.length ? (
        <div className="space-y-6">
          {/* Day selector */}
          <div className="sticky top-0 z-10 bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b py-2">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {plan.map((s:any, idx:number)=>{
                const slug = daySlug(s.day, idx);
                const isSel = (selected ?? slug) === slug;
                return (
                  <button
                    key={idx}
                    aria-pressed={isSel}
                    aria-label={`Select ${s.day || `Økt ${idx+1}`}`}
                    onClick={()=>selectDay(slug)}
                    className={`text-xs px-3 py-1.5 rounded-md border whitespace-nowrap ${isSel? 'bg-muted font-medium' : 'hover:bg-muted'}`}
                  >
                    {s.day || `Økt ${idx+1}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected day */}
          {(() => {
            const slugs = plan.map((s:any,i:number)=> daySlug(s.day, i));
            const cur = selected ?? slugs[0];
            const selIdx = Math.max(0, slugs.indexOf(cur));
            const session = plan[selIdx];
            return (
              <Card className="mx-auto w-full max-w-5xl rounded-2xl border border-zinc-800/60 bg-zinc-900/60 p-5 md:p-7 shadow-sm">
                <CardHeader className="p-0">
                  <CardTitle className="text-2xl md:text-3xl font-semibold">{session.day || `Økt ${selIdx+1}`}</CardTitle>
                  {session.focus ? <CardDescription className="text-lg md:text-xl text-zinc-400">{session.focus}</CardDescription> : null}
                </CardHeader>
                <CardContent className="p-0 mt-4 md:mt-6">
                  {/* Completion summary */}
                  <div className="mb-3 text-xs text-muted-foreground flex items-center gap-2">
                    {(() => { const total = (session.sets||[]).length; const d = Object.keys(done).filter(k=>k.startsWith(`${selIdx}-`) && done[k]).length; return <span>{d}/{total} done</span>; })()}
                    <button className="px-2 py-0.5 rounded border hover:bg-muted" onClick={()=>{
                      setDone(prev=>{ const next={...prev}; (session.sets||[]).forEach((_:any,i:number)=>{ next[`${selIdx}-${i}`]=true; }); return next; });
                    }}>Mark all done</button>
                  </div>

                  <div className="space-y-3 md:space-y-4 mt-2">
                    {(session.sets||[]).map((x:any,i:number)=>{
                      const key = `${selIdx}-${i}`;
                      return editMode ? (
                        <div key={i} className="grid grid-cols-12 gap-2 items-center">
                          <input className="col-span-7 px-2 py-1 rounded border bg-background" value={x.exercise} onChange={(e)=>{
                            setPlan((p:any)=>{ const np=[...p]; np[selIdx]={...np[selIdx], sets: np[selIdx].sets.map((s:any,si:number)=> si===i?{...s, exercise:e.target.value}:s)}; return np;});
                          }} />
                          <input type="number" className="col-span-2 px-2 py-1 rounded border bg-background" value={x.sets} onChange={(e)=>{
                            const v = Math.max(1, parseInt(e.target.value||'1',10));
                            setPlan((p:any)=>{ const np=[...p]; np[selIdx]={...np[selIdx], sets: np[selIdx].sets.map((s:any,si:number)=> si===i?{...s, sets:v}:s)}; return np;});
                          }} />
                          <input type="number" className="col-span-2 px-2 py-1 rounded border bg-background" value={x.reps} onChange={(e)=>{
                            const v = Math.max(1, parseInt(e.target.value||'1',10));
                            setPlan((p:any)=>{ const np=[...p]; np[selIdx]={...np[selIdx], sets: np[selIdx].sets.map((s:any,si:number)=> si===i?{...s, reps:v}:s)}; return np;});
                          }} />
                          <button className="col-span-1 text-xs" onClick={()=>{
                            setPlan((p:any)=>{ const np=[...p]; np[selIdx]={...np[selIdx], sets: np[selIdx].sets.filter((_:any,si:number)=> si!==i)}; return np;});
                          }}>✕</button>
                        </div>
                      ) : (
                        <div key={i} className="flex items-start gap-3 md:gap-4 text-base md:text-lg leading-relaxed">
                          <input type="checkbox" checked={!!done[key]} onChange={()=>setDone(prev=>({ ...prev, [key]: !prev[key] }))} className="mt-1.5" aria-label="mark done"/>
                          <span className={done[key]? 'line-through opacity-60' : ''}>
                            {x.exercise} — {x.sets}x{x.reps}{x.weight?` @ ${x.weight}kg`:''}
                          </span>
                        </div>
                      );
                    })}
                    {editMode && (
                      <button className="text-xs px-2 py-1 rounded-md border hover:bg-muted" onClick={()=>{
                        setPlan((p:any)=>{ const np=[...p]; const add={ exercise:'New exercise', sets:3, reps:8 }; np[selIdx]={...np[selIdx], sets:[...np[selIdx].sets, add]}; return np; });
                      }}>+ Add</button>
                    )}
                  </div>

                  {Array.isArray(session.notes) && session.notes.length ? (
                    <div className="mt-4">
                      <div className="text-sm text-muted-foreground mb-1">Notater</div>
                      <ul className="list-disc pl-5 text-base md:text-lg leading-relaxed">
                        {session.notes.map((n:string,i:number)=>(<li key={i}>{n}</li>))}
                      </ul>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            );
          })()}

          {/* Guidelines card */}
          {(() => {
            const slugs = plan.map((s:any,i:number)=> daySlug(s.day, i));
            const cur = selected ?? slugs[0];
            const selIdx = Math.max(0, slugs.indexOf(cur));
            const session = plan[selIdx];
            const g = pickGuidelines(plan, session);
            if (!g || (Array.isArray(g) && !g.length)) return null;
            const render = (val: any) => {
              if (Array.isArray(val)) {
                return <ul className="list-disc pl-5 text-base md:text-lg leading-relaxed">{val.map((x:any,i:number)=>(<li key={i}>{String(x)}</li>))}</ul>;
              }
              const lines = String(val).split(/\n+/).filter(Boolean);
              return <ul className="list-disc pl-5 text-base md:text-lg leading-relaxed">{lines.map((x:string,i:number)=>(<li key={i}>{x}</li>))}</ul>;
            };
            return (
              <Card className="mx-auto w-full max-w-5xl rounded-2xl border border-zinc-800/60 bg-zinc-900/60 p-5 md:p-7 shadow-sm">
                <CardHeader className="p-0"><CardTitle className="text-xl md:text-2xl font-semibold">Generelle retningslinjer</CardTitle></CardHeader>
                <CardContent className="p-0 mt-3">{render(g)}</CardContent>
              </Card>
            );
          })()}

        </div>
      ) : (
        <div className="text-muted-foreground text-sm">Ingen plan</div>
      )}
    </div>
  );
}


