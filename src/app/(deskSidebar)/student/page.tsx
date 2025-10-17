"use client";
import { useEffect, useState } from 'react';
import Header from './components/Header';
import WeightChart from './components/WeightChart';
import ExerciseChart from './components/ExerciseChart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { fetchStudentSnapshot } from '@/lib/api/student';
import { baseServerUrl } from '@/lib/utils';
import { useStudentSnapshot } from '@/hooks/useStudentSnapshot';
import { useTypedSelector } from '@/redux/store';
import { selectIsAuthenticated } from '@/redux/slices/auth';
import { useUserOnboardingContext } from '@/context/UserOnboarding';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { logEvent } from '@/lib/analytics';
import type { StudentSnapshot } from '@/lib/types/student';
import { useToast } from '@/components/ui/use-toast';
import { onSnapshotRefresh } from '@/lib/snapshotBus';
import ChangeList from '@/components/student/ChangeList';
import ChangeDetailsModal from '@/components/student/ChangeDetailsModal';

export default function StudentCenterPage() {
  const [period, setPeriod] = useState<'7d'|'30d'|'90d'|'ytd'>('30d');
  const { user } = useUserOnboardingContext();
  const { data, loading, error, refresh } = useStudentSnapshot(user?._id || 'me', period);
  const [exercise, setExercise] = useState<string>('');
  const [exerciseSeries, setExerciseSeries] = useState<{date:string; value:number}[] | null>(null);
  const todayStr = new Date().toISOString().slice(0,10);
  const isLoggedIn = useTypedSelector(selectIsAuthenticated);
  const router = useRouter();
  const { toast } = useToast();
  const [selectedChange, setSelectedChange] = useState<any|null>(null);

  useEffect(() => {
    // If not logged in yet, try to hydrate from backend cookie-based session
    if (!isLoggedIn) {
      (async ()=>{
        try {
          const apiBase = process.env.NEXT_PUBLIC_API_SERVER || '/api/backend';
          const r = await fetch(`${apiBase}/v1/auth/me`, { credentials: 'include' });
          const j = await r.json();
          if (r.ok && j?.data?._id) {
            // minimal redux bootstrap: accept session auth for this view
          } else {
            try { router.push('/signin'); } catch {}
            return;
          }
        } catch { try { router.push('/signin'); } catch {} return; }
      })();
    }
    // Use cookie-resolved snapshot first for consistency
    (async ()=>{
      try {
        const lsEx = localStorage.getItem('student.ex');
        const lsP = localStorage.getItem('student.p');
        if (lsEx) setExercise(lsEx);
        if (lsP === '7d' || lsP === '30d' || lsP === '90d' || lsP === 'ytd') setPeriod(lsP as any);
      } catch {}
      const snapshot = (await (async ()=>{
        try {
          const apiBase = process.env.NEXT_PUBLIC_API_SERVER || '/api/backend';
          const r = await fetch(`${apiBase}/v1/student/me/snapshot?period=${period}`, { credentials:'include' });
          if (r.ok) return await r.json();
        } catch {}
        return data ?? await fetchStudentSnapshot(user?._id || 'me', period);
      })());
      try { sessionStorage.setItem('lastSnapshot', JSON.stringify(snapshot)); } catch {}
      const urlEx = new URLSearchParams(window.location.search).get('ex');
      if (urlEx) {
        setExercise(urlEx);
      }
    })();
    logEvent('student_center.viewed', { userId: user?._id });
  }, [period, user?._id]);

  // Live refresh when other parts of the app emit snapshot updates
  useEffect(() => onSnapshotRefresh(() => refresh()), [refresh]);

  // Listen for plan updates and refresh snapshot
  useEffect(()=>{
    const onUpdate = ()=>{ 
      Promise.resolve(refresh()).then(()=>{
        try { toast({ description: 'Student Center oppdatert' }); } catch {}
      }).catch(()=>{});
    };
    window.addEventListener('plansUpdated', onUpdate);
    window.addEventListener('student-snapshot-refresh', onUpdate);
    return ()=> { 
      window.removeEventListener('plansUpdated', onUpdate);
      window.removeEventListener('student-snapshot-refresh', onUpdate);
    };
  }, [period, user?._id, refresh]);

  // Load exercise progress whenever period or selected exercise changes
  useEffect(() => {
    let didCancel = false;
    async function load() {
      if (!exercise) return;
      const mod = await import('@/lib/api/student');
      const res: any = await mod.fetchExerciseProgress('me', exercise, period);
      setExerciseSeries(res.series || []);
      if (!didCancel) setExerciseSeries(res.series);
      logEvent('student_center.exercise_graph.viewed', { userId: user?._id, exercise, period });
    }
    load();
    return () => { didCancel = true; };
  }, [exercise, period, user?._id]);

  return (
    <div className="mx-auto max-w-screen-xl px-6 md:px-8 py-6 md:py-8 space-y-6 md:space-y-8">
      <Header
        name={user?.fullName || user?.userName || 'Student'}
        avatarUrl={(data as any)?.photo?.path ? `${baseServerUrl}/${(data as any).photo.path}` : (user?.photo?.path ? `${baseServerUrl}/${user.photo.path}` : undefined)}
        onPeriodChange={setPeriod}
      />
      {/* Inline weight logger removed as requested */}

      {/* Row B: Weight trend and At-a-Glance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card className="md:col-span-2" aria-label="Vektutvikling">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle>Vektutvikling</CardTitle>
                <CardDescription>Siste {period.toUpperCase()}</CardDescription>
              </div>
              <div className="inline-flex rounded-md border p-1">
                {(['7d','30d','90d','ytd'] as const).map(p => (
                  <button key={p} onClick={()=>setPeriod(p)} className={`px-3 py-1 text-xs rounded ${period===p ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>{p.toUpperCase()}</button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {data ? (
              <WeightChart
                entries={data.weightTrend}
                period={period}
                onEntriesChange={(e)=>{
                  // optimistic local update and trigger a refresh fetch
                  try {
                    const prev = data as any;
                    (prev as any).weightTrend = e;
                  } catch {}
                  refresh();
                }}
              />
            ) : (
              <div className="h-56 md:h-64 rounded bg-muted animate-pulse" />
            )}
            {data && (
              <div className="mt-3 grid grid-cols-3 text-sm">
                <div>Start: {data.weightTrend?.[0]?.kg != null ? data.weightTrend?.[0]?.kg?.toFixed(1) + ' kg' : '—'}</div>
                <div data-testid="weight-last">Nå: {data.weightTrend?.length ? data.weightTrend?.[data.weightTrend.length-1]?.kg?.toFixed(1) + ' kg' : '—'}</div>
                <div>Δ: {data.weightTrend?.length ? ((data.weightTrend?.[data.weightTrend.length-1]?.kg - data.weightTrend?.[0]?.kg)).toFixed(1) + ' kg' : '—'}</div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card aria-label="At-a-Glance">
          <CardHeader>
            <CardTitle>At‑a‑Glance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Kpi label="Neste økt" value={data?.glance?.nextSession ? `${new Date(data.glance.nextSession.date).toLocaleDateString()} • ${data.glance.nextSession.focus}` : 'Ingen økter planlagt'} />
              <Kpi label="Adherence 7d" value={`${Math.round((data?.glance?.adherence7d ?? 0)*100)}%`} />
              <Kpi label="Adherence 28d" value={`${Math.round((data?.glance?.adherence28d ?? 0)*100)}%`} />
              <Kpi label="Siste check‑in" value={data?.glance?.lastCheckIn ? new Date(data.glance.lastCheckIn).toLocaleDateString() : '—'} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row C: Exercise Progress */}
      <Card aria-label="Øvelsesprogresjon">
        <CardHeader>
          <CardTitle>Øvelsesprogresjon</CardTitle>
          <CardDescription>Velg øvelse</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-3 w-full flex flex-wrap gap-2 items-center">
            <div className="w-full max-w-xs">
              <Select onValueChange={(v)=>{
                setExercise(v);
                const url = new URL(window.location.href);
                url.searchParams.set('ex', v);
                window.history.replaceState({}, '', url.toString());
                logEvent('student_center.exercise.changed', { exercise: v, period });
                try { localStorage.setItem('student.ex', v); } catch {}
              }} value={exercise || undefined}>
                <SelectTrigger aria-label="Velg øvelse">
                  <SelectValue placeholder="Velg øvelse" />
                </SelectTrigger>
                <SelectContent>
                  {(data?.topExercises ?? ['Markløft','Knebøy','Benkpress']).map(ex => (
                    <SelectItem key={ex} value={ex}>{ex}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="inline-flex rounded-md border p-1 ml-auto">
              {(['7d','30d','90d','ytd'] as const).map(p => (
                <button key={p} onClick={()=>{ setPeriod(p); try { localStorage.setItem('student.p', p); } catch {} }} className={`px-3 py-1 text-xs rounded ${period===p ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>{p.toUpperCase()}</button>
              ))}
            </div>
          </div>
          {exercise && exerciseSeries ? (
            <ExerciseChart series={exerciseSeries} period={period} />
          ) : (
            <div className="h-56 md:h-64 rounded bg-muted flex items-center justify-center text-sm text-muted-foreground">Velg øvelse for å se progresjon</div>
          )}
          <form className="flex items-center gap-2 mt-3 text-sm" onSubmit={async (e)=>{
            e.preventDefault();
            const dateInput = (e.currentTarget.querySelector('[name=ex-date]') as HTMLInputElement);
            const valInput = (e.currentTarget.querySelector('[name=ex-val]') as HTMLInputElement);
            const date = dateInput.value.trim();
            const valStr = valInput.value.trim();
            if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return toast({ description: 'Dato må være YYYY-MM-DD', variant: 'destructive' });
            const num = Number(valStr);
            if (Number.isNaN(num)) return toast({ description: 'Ugyldig verdi', variant: 'destructive' });
            try {
              const mod = await import('@/lib/api/student');
              const exists = (exerciseSeries || []).some(p => p.date === date);
              if (exists) await (mod as any).updateExerciseProgress('me', exercise || (data?.topExercises?.[0] ?? ''), { date, value: num });
              else await (mod as any).addExerciseProgress('me', exercise || (data?.topExercises?.[0] ?? ''), { date, value: num });
              const res: any = await (mod as any).fetchExerciseProgress('me', exercise || (data?.topExercises?.[0] ?? ''), period);
              setExerciseSeries(res.series);
              valInput.value = '';
            } catch (err) {
              // show basic toast-like feedback via alert for now
              console.error(err);
              toast({ description: 'Kunne ikke lagre øvelsesprogresjon', variant: 'destructive' });
            }
          }}>
            <input name="ex-date" type="date" defaultValue={todayStr} className="px-2 py-1 border rounded" />
            <input name="ex-val" placeholder="Kg" className="w-24 px-2 py-1 border rounded" />
            <button type="submit" className="px-3 py-1 rounded border hover:bg-muted">Lagre (kg)</button>
          </form>
          {exercise && exerciseSeries?.length ? (
            <div className="mt-3">
              <div className="text-sm font-medium mb-1">Historikk</div>
              <div className="border rounded">
                <div className="grid grid-cols-5 text-xs font-medium px-3 py-2 border-b bg-muted/50">
                  <div className="col-span-2">Dato</div>
                  <div className="col-span-2">Verdi</div>
                  <div className="text-right">Handling</div>
                </div>
                {[...exerciseSeries].slice().reverse().slice(0,10).map((it)=> (
                  <div key={it.date} className="grid grid-cols-5 items-center px-3 py-2 border-b last:border-b-0 text-sm">
                    <div className="col-span-2">{it.date}</div>
                    <div className="col-span-2">{it.value}</div>
                    <div className="text-right space-x-2">
                      <button className="px-2 py-0.5 border rounded hover:bg-muted" onClick={async ()=>{
                        const val = prompt('Ny verdi', String(it.value));
                        if (!val) return;
                        const mod = await import('@/lib/api/student');
                        await (mod as any).updateExerciseProgress('me', exercise || (data?.topExercises?.[0] ?? ''), { date: it.date, value: Number(val) });
                        const res: any = await (mod as any).fetchExerciseProgress('me', exercise || (data?.topExercises?.[0] ?? ''), period);
                        setExerciseSeries(res.series);
                      }}>Rediger</button>
                      <button className="px-2 py-0.5 border rounded hover:bg-muted" onClick={async ()=>{
                        const mod = await import('@/lib/api/student');
                        await (mod as any).deleteExerciseProgress('me', exercise || (data?.topExercises?.[0] ?? ''), it.date);
                        const res: any = await (mod as any).fetchExerciseProgress('me', exercise || (data?.topExercises?.[0] ?? ''), period);
                        setExerciseSeries(res.series);
                      }}>Slett</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Row D: Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card aria-label="Treningsplan" className="cursor-pointer" onClick={()=>{
          const src = typeof window !== 'undefined' ? window.location.pathname : '/student';
          router.push(`/plans/training?from=student&src=${encodeURIComponent(src)}`);
        }}>
          <CardHeader>
            <CardTitle>Treningsplan</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.currentTrainingPlan?.[0] ? (
              <>
                <ul className="space-y-2 text-sm" data-testid="plan-summary">
                  {data.currentTrainingPlan[0].sets.slice(0,3).map((s,i)=>(
                    <li key={i}>{s.exercise} — {s.sets}x{s.reps}{s.weight?` @ ${s.weight}kg`:''}</li>
                  ))}
                </ul>
                {data.currentTrainingPlan[0].guidelines?.length ? (
                  <div className="text-xs text-muted-foreground mt-2">
                    {data.currentTrainingPlan[0].guidelines.slice(0,2).join(' • ')}
                  </div>
                ) : null}
              </>
            ) : (
              <div className="text-muted-foreground text-sm">Ingen plan ennå – be om forslag</div>
            )}
          </CardContent>
        </Card>
        <Card aria-label="Kostholdsplan" className="cursor-pointer" onClick={()=>{
          const src = typeof window !== 'undefined' ? window.location.pathname : '/student';
          router.push(`/plans/nutrition?from=student&src=${encodeURIComponent(src)}`);
        }}>
          <CardHeader>
            <CardTitle>Kostholdsplan</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.currentNutritionPlan?.[0] ? (
              <>
                <div className="text-sm mb-2">Mål: <span data-testid="nutrition-kcal">{data.currentNutritionPlan[0].dailyTargets?.kcal}</span> kcal</div>
                {Array.isArray((data.currentNutritionPlan[0] as any).days) && (data.currentNutritionPlan[0] as any).days.length ? (
                  <div className="space-y-3 text-sm">
                    {(() => {
                      const days = (data.currentNutritionPlan[0] as any).days;
                      const names = ['Søndag','Mandag','Tirsdag','Onsdag','Torsdag','Fredag','Lørdag'];
                      const todayIdx = new Date().getDay();
                      // try to match a day whose label includes today's name; otherwise pick first
                      const matchIdx = days.findIndex((d:any)=> (d.label||'').toLowerCase().includes(names[todayIdx].toLowerCase()));
                      const idx = matchIdx >= 0 ? matchIdx : 0;
                      const label = days[idx]?.label || `Dag ${idx+1}`;
                      return <div className="text-xs text-muted-foreground">{label} (i dag)</div>;
                    })()}
                    {(() => {
                      const days = (data.currentNutritionPlan[0] as any).days;
                      const names = ['Søndag','Mandag','Tirsdag','Onsdag','Torsdag','Fredag','Lørdag'];
                      const todayIdx = new Date().getDay();
                      const matchIdx = days.findIndex((d:any)=> (d.label||'').toLowerCase().includes(names[todayIdx].toLowerCase()));
                      const idx = matchIdx >= 0 ? matchIdx : 0;
                      return days[idx]?.meals?.slice(0,3).map((m:any,i:number)=> (
                      <div key={i}>
                        <div className="font-medium">{m.name}</div>
                        <ul className="list-disc pl-5">
                          {(m.items||[]).slice(0,3).map((it:string,j:number)=>(<li key={j}>{it}</li>))}
                        </ul>
                      </div>
                      ));
                    })()}
                  </div>
                ) : (
                  <ul className="space-y-3 text-sm">
                    {data.currentNutritionPlan[0].meals.slice(0,3).map((m:any,i:number)=> (
                      <li key={i}>
                        <div className="font-medium">{m.name}</div>
                        <ul className="list-disc pl-5">
                          {(m.items||[]).slice(0,3).map((it:string,j:number)=>(<li key={j}>{it}</li>))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <div className="text-muted-foreground text-sm">Ingen plan ennå – be om forslag</div>
            )}
          </CardContent>
        </Card>
        <Card aria-label="Goals" className="cursor-pointer" onClick={()=>{
          const src = typeof window !== 'undefined' ? window.location.pathname : '/student';
          router.push(`/plans/goals?from=student&src=${encodeURIComponent(src)}`);
        }}>
          <CardHeader>
            <CardTitle>Goals</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.currentGoal ? (
              <div className="space-y-2 text-sm">
                <div>
                  <div className="text-muted-foreground">Horisont</div>
                  <div className="font-medium">{data.currentGoal.horizonWeeks ?? '-'} uker</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-muted-foreground">Målvekt</div>
                    <div className="font-medium">{data.currentGoal.targetWeightKg ?? '-'} kg</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Kalori‑defisit</div>
                    <div className="font-medium">{data.currentGoal.caloriesDailyDeficit ? `${data.currentGoal.caloriesDailyDeficit} kcal/dag` : '—'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Vekt/uke</div>
                    <div className="font-medium">{data.currentGoal.weeklyWeightLossKg ? `${data.currentGoal.weeklyWeightLossKg} kg` : '—'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Trening</div>
                    <div className="font-medium">{data.currentGoal.weeklyExerciseMinutes ? `${data.currentGoal.weeklyExerciseMinutes} min/uke` : '—'}</div>
                  </div>
                </div>
                {data.currentGoal.strengthTargets ? (
                  <div>
                    <div className="text-muted-foreground">Styrke</div>
                    <div className="font-medium">{data.currentGoal.strengthTargets}</div>
                  </div>
                ) : null}
                {data.currentGoal.plan?.shortTerm?.length ? (
                  <div>
                    <div className="text-muted-foreground mb-1">Fokus (neste 1–3 mnd)</div>
                    <ul className="list-disc pl-5">
                      {data.currentGoal.plan.shortTerm.slice(0,3).map((x,i)=>(<li key={i}>{x}</li>))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : (
              <ul className="space-y-2 text-sm">
                {data?.goals?.length ? (
                  data.goals.map((g,i)=>(<li key={i}>{g}</li>))
                ) : (
                  <li className="text-muted-foreground">Ingen mål satt.</li>
                )}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card aria-label="Endringer">
          <CardHeader>
            <CardTitle>Siste endringer</CardTitle>
          </CardHeader>
          <CardContent>
            <ChangeList userId={user?._id || 'me'} onSelect={(it)=> setSelectedChange(it)} />
          </CardContent>
        </Card>
      </div>
      <ChangeDetailsModal item={selectedChange} onClose={()=> setSelectedChange(null)} />
    </div>
  );
}

function Kpi({label, value}:{label:string; value?:string}){
  return (
    <div className="rounded-md border p-3" aria-label={label}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium mt-1">{value ?? '—'}</div>
    </div>
  );
}


