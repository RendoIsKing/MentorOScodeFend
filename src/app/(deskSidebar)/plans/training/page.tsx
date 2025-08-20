"use client";
import { useEffect, useState } from "react";
import { useUserOnboardingContext } from "@/context/UserOnboarding";
import { useRouter } from "next/navigation";
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
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [editMode, setEditMode] = useState(false);

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
          {/* Sticky intra-page nav */}
          <div className="sticky top-0 z-10 bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b py-2">
            <div className="flex flex-wrap gap-2">
              {plan.map((s:any, idx:number)=> (
                <a key={idx} href={`#s-${idx}`} className="text-xs px-2 py-1 rounded-md border hover:bg-muted">{s.day || `Økt ${idx+1}`}</a>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plan.map((session:any, idx:number)=>(
              <Card key={idx} id={`s-${idx}`} style={{ breakInside: 'avoid' }}>
                <CardHeader>
                  <CardTitle className="text-base">{session.day || `Økt ${idx+1}`}</CardTitle>
                  <CardDescription>{session.focus}</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Completion summary */}
                  <div className="mb-2 text-xs text-muted-foreground flex items-center gap-2">
                    {(() => { const total = (session.sets||[]).length; const d = Object.keys(done).filter(k=>k.startsWith(`${idx}-`) && done[k]).length; return <span>{d}/{total} done</span>; })()}
                    <button className="px-2 py-0.5 rounded border hover:bg-muted" onClick={()=>{
                      setDone(prev=>{ const next={...prev}; (session.sets||[]).forEach((_:any,i:number)=>{ next[`${idx}-${i}`]=true; }); return next; });
                    }}>Mark all done</button>
                  </div>
                  <div className="space-y-1 text-sm">
                    {(session.sets||[]).map((x:any,i:number)=>{
                      const key = `${idx}-${i}`;
                      return editMode ? (
                        <div key={i} className="grid grid-cols-12 gap-2 items-center">
                          <input className="col-span-7 px-2 py-1 rounded border bg-background" value={x.exercise} onChange={(e)=>{
                            setPlan((p:any)=>{
                              const np = [...p]; np[idx] = { ...np[idx], sets: np[idx].sets.map((s:any, si:number)=> si===i? { ...s, exercise: e.target.value } : s) }; return np;
                            });
                          }} />
                          <input type="number" className="col-span-2 px-2 py-1 rounded border bg-background" value={x.sets} onChange={(e)=>{
                            const v = Math.max(1, parseInt(e.target.value||'1',10));
                            setPlan((p:any)=>{ const np=[...p]; np[idx]={...np[idx], sets: np[idx].sets.map((s:any,si:number)=> si===i?{...s, sets:v}:s)}; return np;});
                          }} />
                          <input type="number" className="col-span-2 px-2 py-1 rounded border bg-background" value={x.reps} onChange={(e)=>{
                            const v = Math.max(1, parseInt(e.target.value||'1',10));
                            setPlan((p:any)=>{ const np=[...p]; np[idx]={...np[idx], sets: np[idx].sets.map((s:any,si:number)=> si===i?{...s, reps:v}:s)}; return np;});
                          }} />
                          <button className="col-span-1 text-xs" onClick={()=>{
                            setPlan((p:any)=>{ const np=[...p]; np[idx]={...np[idx], sets: np[idx].sets.filter((_:any,si:number)=> si!==i)}; return np;});
                          }}>✕</button>
                        </div>
                      ) : (
                        <div key={i} className="flex items-start gap-2">
                          <input type="checkbox" checked={!!done[key]} onChange={()=>setDone(prev=>({ ...prev, [key]: !prev[key] }))} className="mt-0.5" aria-label="mark done"/>
                          <span className={done[key]? 'line-through opacity-60' : ''}>{x.exercise} — {x.sets}x{x.reps}{x.weight?` @ ${x.weight}kg`:''}</span>
                        </div>
                      );
                    })}
                    {editMode && (
                      <button className="text-xs px-2 py-1 rounded-md border hover:bg-muted" onClick={()=>{
                        setPlan((p:any)=>{ const np=[...p]; const add={ exercise:'New exercise', sets:3, reps:8 }; np[idx]={...np[idx], sets:[...np[idx].sets, add]}; return np; });
                      }}>+ Add</button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {plan?.[0]?.guidelines?.length ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Retningslinjer</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 text-sm">
                  {plan?.[0]?.guidelines.map((g:string, i:number)=>(<li key={i}>{g}</li>))}
                </ul>
              </CardContent>
            </Card>
          ) : null}
          {plan?.[0]?.sourceText ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Full tekst</CardTitle>
                <CardDescription>Original instruksjon fra Coach</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-xs">{plan?.[0]?.sourceText}</pre>
              </CardContent>
            </Card>
          ) : null}
        </div>
      ) : (
        <div className="text-muted-foreground text-sm">Ingen plan</div>
      )}
    </div>
  );
}


