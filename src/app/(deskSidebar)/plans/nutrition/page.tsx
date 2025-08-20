"use client";
import { useEffect, useState } from "react";
import { useUserOnboardingContext } from "@/context/UserOnboarding";
import { useRouter } from "next/navigation";
import { ArrowLeft, Copy, Printer } from "lucide-react";
import PlansHeader from "@/components/plans/PlansHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function NutritionPlanPage(){
  const { user } = useUserOnboardingContext();
  const [plan, setPlan] = useState<any|null>(null);
  const [uiDay, setUiDay] = useState(0);
  const [uiDays, setUiDays] = useState<any[]|null>(null);
  const [editMode, setEditMode] = useState(false);
  const router = useRouter();
  useEffect(()=>{
    const apiBase = process.env.NEXT_PUBLIC_API_SERVER || "/api/backend";
    (async()=>{
      try{
        // First, try client cache to avoid SSR mismatch
        try {
          const cached = sessionStorage.getItem('lastSnapshot');
          if (cached) {
            const snap = JSON.parse(cached);
            if (snap?.currentNutritionPlan?.[0]) setPlan(snap.currentNutritionPlan[0]);
          }
        } catch {}
        // Then prefer direct me/snapshot – avoids /auth/me dependency
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
        if (snap?.currentNutritionPlan?.[0]) { setPlan(snap.currentNutritionPlan[0]); setUiDay(0); }
      }catch{}
    })();
  }, [user?._id]);

  // Build client-side day structure as a fallback if backend didn't provide days
  useEffect(()=>{
    function parseDaysFromSource(src: string){
      const text = (src||'').replace(/\r/g,'').replace(/\n\s*---+\s*\n/g,'\n');
      const parts = text.split(/\n\s*#?\s*(?:Dag|Day)\s*(\d+)\s*:?[\t ]*\n/i);
      const result: any[] = [];
      if (parts.length>1){
        for (let i=1;i<parts.length;i+=2){
          const label = `Dag ${parts[i]}`;
          const block = (parts[i+1]||'');
          const meals: any[] = [];

          // Detect headers at line starts, optionally preceded by a bullet
          const headerIter = block.matchAll(/(^|\n)\s*(?:[-•]\s*)?(Frokost|Lunsj|Middag|Snack|Breakfast|Lunch|Dinner)\s*:/gim);
          const headers: {name:string; index:number}[] = [];
          for (const m of headerIter) {
            const full = m[0];
            const name = m[2];
            const matchStart = (m as any).index as number; // start of the whole match
            // compute the start index of the name inside the block
            const nameOffset = full.toLowerCase().lastIndexOf(name.toLowerCase());
            const nameIndex = matchStart + (nameOffset >= 0 ? nameOffset : 0);
            headers.push({ name, index: nameIndex });
          }

          const endIdx = block.length;
          for (let h=0; h<headers.length; h++){
            const start = headers[h].index;
            const stop = h+1 < headers.length ? headers[h+1].index : endIdx;
            const section = block.slice(start, stop);
            const body = section.replace(/^.*?:\s*/s, '');
            const items = body
              .split(/\n/)
              .map(l=>l.replace(/^\s*[\-•]\s*/, '').trim())
              .filter(Boolean)
              // drop any stray lines that start another header pattern within items
              .filter(l=>!/(^|\s)(Frokost|Lunsj|Middag|Snack|Breakfast|Lunch|Dinner)\s*:/i.test(l));
            if (items.length) meals.push({ name: headers[h].name, items });
          }

          if (meals.length) result.push({ label, meals });
        }
      }
      return result;
    }
    if (plan){
      if (Array.isArray((plan as any).days) && (plan as any).days.length){
        // sanitize existing days from backend to avoid header bleed-through
        const sanitize = (days:any[]) => days.map(d=>({
          ...d,
          meals: (d.meals||[]).map((m:any)=>({
            ...m,
            items: (m.items||[])
              .map((x:string)=>x.replace(/^\s*[\-•]\s*/, '').trim())
              .filter((x:string)=>!/(^|\s)(Frokost|Lunsj|Middag|Snack|Breakfast|Lunch|Dinner)\s*:/i.test(x))
          }))
        }));
        setUiDays(sanitize((plan as any).days));
      } else if (plan.sourceText){
        const parsed = parseDaysFromSource(plan.sourceText);
        setUiDays(parsed.length?parsed:null);
      } else {
        setUiDays(null);
      }
    }
  }, [plan]);

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
        <PlansHeader active="nutrition" />
        <div className="flex items-center gap-2">
          <button onClick={()=>window.print()} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border hover:bg-muted" title="Export to PDF"><Printer size={14}/> Print</button>
          <button onClick={()=>{
            try{
              const d = uiDays?.[uiDay||0];
              if(!d) return;
              const lines = (d.meals||[]).flatMap((m:any)=>[m.name, ...(m.items||[]).map((x:string)=>`- ${x}`), '']);
              navigator.clipboard.writeText([d.label, '', ...lines].join('\n'));
            }catch{}
          }} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border hover:bg-muted" title="Copy day"><Copy size={14}/> Copy</button>
          <button onClick={()=>{
            try{
              const planId = (plan as any)?.id;
              if(!planId) return;
              const base = process.env.NEXT_PUBLIC_API_SERVER || '/api/backend';
              const link = `${window.location.origin}${base}/v1/interaction/plans/share/nutrition/${planId}`;
              navigator.clipboard.writeText(link);
            }catch{}
          }} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border hover:bg-muted" title="Share link">Share</button>
          <button onClick={()=>setEditMode(e=>!e)} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border hover:bg-muted" title="Toggle edit">{editMode? 'Done' : 'Edit'}</button>
        </div>
      </div>
      {plan ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mål</CardTitle>
              <CardDescription>Dagsmål for makroer</CardDescription>
            </CardHeader>
            <CardContent className="text-sm">
              {plan.dailyTargets?.kcal} kcal
              {plan.dailyTargets?.protein?`, Protein: ${plan.dailyTargets?.protein}g`:''}
              {plan.dailyTargets?.carbs?`, Karb: ${plan.dailyTargets?.carbs}g`:''}
              {plan.dailyTargets?.fat?`, Fett: ${plan.dailyTargets?.fat}g`:''}
            </CardContent>
          </Card>
          {/* Day selector */}
          {uiDays?.length ? (
            <div className="space-y-4">
              <div className="inline-flex rounded-md border p-1 bg-background">
                {uiDays.map((d:any, idx:number)=> (
                  <button key={idx} onClick={()=>setUiDay(idx)} className={`px-3 py-1.5 text-sm rounded ${uiDay===idx ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>{d.label || `Dag ${idx+1}`}</button>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(uiDays[uiDay||0]?.meals||[]).map((m:any,i:number)=>(
                  <Card key={i}>
                    <CardHeader>
                      <CardTitle className="text-base">{m.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {editMode ? (
                        <div className="space-y-2">
                          {(m.items||[]).map((it:string, j:number)=>(
                            <div key={j} className="flex gap-2 items-center">
                              <input className="flex-1 px-2 py-1 rounded border bg-background" value={it} onChange={(e)=>{
                                setUiDays((days:any)=>{
                                  const nd = [...days]; const meals = [...nd[uiDay].meals]; const items = [...meals[i].items]; items[j]=e.target.value; meals[i] = { ...meals[i], items }; nd[uiDay] = { ...nd[uiDay], meals }; return nd;
                                });
                              }} />
                              <button className="text-xs" onClick={()=>{
                                setUiDays((days:any)=>{ const nd=[...days]; const meals=[...nd[uiDay].meals]; meals[i]={...meals[i], items: meals[i].items.filter((_:any,idx:number)=> idx!==j)}; nd[uiDay]={...nd[uiDay], meals}; return nd; });
                              }}>✕</button>
                            </div>
                          ))}
                          <button className="text-xs px-2 py-1 rounded-md border hover:bg-muted" onClick={()=>{
                            setUiDays((days:any)=>{ const nd=[...days]; const meals=[...nd[uiDay].meals]; meals[i]={...meals[i], items:[...((meals[i].items)||[]), 'New item']}; nd[uiDay]={...nd[uiDay], meals}; return nd; });
                          }}>+ Add item</button>
                        </div>
                      ) : (
                        <ul className="list-disc pl-5 text-sm">
                          {(m.items||[]).map((it:string, j:number)=>(<li key={j}>{it}</li>))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : plan.meals?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plan.meals.map((m:any,i:number)=>(
                <Card key={i}>
                  <CardHeader>
                    <CardTitle className="text-base">{m.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 text-sm">
                      {(m.items||[]).map((it:string, j:number)=>(<li key={j}>{it}</li>))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : null}
          {/* Save and macro controls */}
          <div className="flex items-center gap-2">
            <button onClick={async()=>{
              try{
                const apiBase = process.env.NEXT_PUBLIC_API_SERVER || '/api/backend';
                await fetch(`${apiBase}/v1/interaction/chat/engh/nutrition/save`, { method:'POST', credentials:'include', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ dailyTargets: plan.dailyTargets, meals: plan.meals, days: uiDays || plan.days, guidelines: plan.guidelines, sourceText: plan.sourceText }) });
                try{ window.dispatchEvent(new CustomEvent('plansUpdated')); }catch{}
              }catch{}
            }} className="inline-flex items-center gap-2 text-xs px-2 py-1 rounded-md border hover:bg-muted">Save</button>
            <div className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border">
              <span>Kcal</span>
              <button onClick={()=>setPlan((p:any)=> p? { ...p, dailyTargets:{ ...p.dailyTargets, kcal: p.dailyTargets.kcal - 100, protein: Math.round((p.dailyTargets.kcal - 100)*0.3/4), carbs: Math.round((p.dailyTargets.kcal - 100)*0.5/4), fat: Math.round((p.dailyTargets.kcal - 100)*0.2/9) } }:p)} className="px-2">-100</button>
              <button onClick={()=>setPlan((p:any)=> p? { ...p, dailyTargets:{ ...p.dailyTargets, kcal: p.dailyTargets.kcal + 100, protein: Math.round((p.dailyTargets.kcal + 100)*0.3/4), carbs: Math.round((p.dailyTargets.kcal + 100)*0.5/4), fat: Math.round((p.dailyTargets.kcal + 100)*0.2/9) } }:p)} className="px-2">+100</button>
            </div>
            <div className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border">
              <span>Tab</span>
              <button onClick={()=>setUiDay((d)=> Math.max(0, ((d-1+ (uiDays?.length||1)) % (uiDays?.length||1)) ))} className="px-2">◀</button>
              <button onClick={()=>setUiDay((d)=> ((d+1) % ((uiDays?.length||1))) )} className="px-2">▶</button>
            </div>
          </div>
          {plan.guidelines?.length ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Retningslinjer</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 text-sm">
                  {plan.guidelines.map((g:string, i:number)=>(<li key={i}>{g}</li>))}
                </ul>
              </CardContent>
            </Card>
          ) : null}
          {plan.sourceText ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Full tekst</CardTitle>
                <CardDescription>Original instruksjon fra Coach</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-xs">{plan.sourceText}</pre>
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