"use client";
import { useEffect, useState } from 'react';
import Header from './components/Header';
import WeightChart from './components/WeightChart';
import ExerciseChart from './components/ExerciseChart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { fetchStudentSnapshot } from '@/lib/api/student';
import { useTypedSelector } from '@/redux/store';
import { selectIsAuthenticated } from '@/redux/slices/auth';
import { useUserOnboardingContext } from '@/context/UserOnboarding';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { logEvent } from '@/lib/analytics';
import type { StudentSnapshot } from '@/lib/types/student';

export default function StudentCenterPage() {
  const [period, setPeriod] = useState<'7d'|'30d'|'90d'|'ytd'>('30d');
  const [data, setData] = useState<StudentSnapshot | null>(null);
  const [exercise, setExercise] = useState<string>('');
  const [exerciseSeries, setExerciseSeries] = useState<{date:string; value:number}[] | null>(null);
  const isLoggedIn = useTypedSelector(selectIsAuthenticated);
  const { user } = useUserOnboardingContext();
  const router = useRouter();

  useEffect(() => {
    // Redirect unauthenticated users (simple guard; final routing can be in middleware)
    if (!isLoggedIn) {
      try { router.push('/signin'); } catch {}
      return;
    }
    // Use cookie-resolved snapshot first for consistency
    (async ()=>{
      let snapshot: any = null;
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_SERVER || '/api/backend';
        const r = await fetch(`${apiBase}/v1/student/me/snapshot?period=${period}`, { credentials:'include' });
        if (r.ok) snapshot = await r.json();
      } catch {}
      if (!snapshot) snapshot = await fetchStudentSnapshot(user?._id || 'me', period);
      setData(snapshot);
      try { sessionStorage.setItem('lastSnapshot', JSON.stringify(snapshot)); } catch {}
      // default exercise if none selected
      const urlEx = new URLSearchParams(window.location.search).get('ex');
      if (urlEx) {
        setExercise(urlEx);
      } else if (!exercise && snapshot.topExercises && snapshot.topExercises.length > 0) {
        setExercise(snapshot.topExercises[0]);
      }
    })();
    logEvent('student_center.viewed', { userId: user?._id });
  }, [period, user?._id]);

  // Listen for plan updates and refresh snapshot
  useEffect(()=>{
    const onUpdate = ()=>{
      fetchStudentSnapshot(user?._id || 'me', period).then((snapshot)=> setData(snapshot));
    };
    window.addEventListener('plansUpdated', onUpdate);
    return ()=> window.removeEventListener('plansUpdated', onUpdate);
  }, [period, user?._id]);

  // Load exercise progress whenever period or selected exercise changes
  useEffect(() => {
    let didCancel = false;
    async function load() {
      if (!exercise) return;
      const mod = await import('@/lib/api/student');
      const res: any = await mod.fetchExerciseProgress(user?._id || 'me', exercise, period);
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
        avatarUrl={user?.photo?.path ? `${process.env.NEXT_PUBLIC_API_SERVER}/${user.photo.path}` : undefined}
        onPeriodChange={setPeriod}
      />

      {/* Row B: Weight trend and At-a-Glance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card className="md:col-span-2" aria-label="Vektutvikling">
          <CardHeader>
            <CardTitle>Vektutvikling</CardTitle>
            <CardDescription>Siste {period.toUpperCase()}</CardDescription>
          </CardHeader>
          <CardContent>
            {data ? (
              <WeightChart
                entries={data.weightTrend}
                period={period}
                onEntriesChange={(e)=>{
                  setData(prev => prev ? { ...prev, weightTrend: e } : prev);
                }}
              />
            ) : (
              <div className="h-56 md:h-64 rounded bg-muted animate-pulse" />
            )}
            {data && (
              <div className="mt-3 grid grid-cols-3 text-sm">
                <div>Start: {data.weightTrend?.[0]?.kg != null ? data.weightTrend?.[0]?.kg?.toFixed(1) + ' kg' : '—'}</div>
                <div>Nå: {data.weightTrend?.length ? data.weightTrend?.[data.weightTrend.length-1]?.kg?.toFixed(1) + ' kg' : '—'}</div>
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
          <div className="mb-3 w-full max-w-xs">
            <Select onValueChange={(v)=>{
              setExercise(v);
              const url = new URL(window.location.href);
              url.searchParams.set('ex', v);
              window.history.replaceState({}, '', url.toString());
              logEvent('student_center.exercise.changed', { exercise: v, period });
            }} value={exercise || (data?.topExercises?.[0] ?? '')}>
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
          {exerciseSeries ? (
            <ExerciseChart series={exerciseSeries} period={period} />
          ) : (
            <div className="h-56 md:h-64 rounded bg-muted animate-pulse" />
          )}
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
                <ul className="space-y-2 text-sm">
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
                <div className="text-sm mb-2">Mål: {data.currentNutritionPlan[0].dailyTargets?.kcal} kcal</div>
                <ul className="space-y-2 text-sm">
                  {data.currentNutritionPlan[0].meals.map((m,i)=>(<li key={i}>{m.name}: {m.items?.join(', ')}</li>))}
                </ul>
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
            <ul className="space-y-2 text-sm">
              {data?.goals?.length ? (
                data.goals.map((g,i)=>(<li key={i}>{g}</li>))
              ) : (
                <li className="text-muted-foreground">Ingen mål satt.</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
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


