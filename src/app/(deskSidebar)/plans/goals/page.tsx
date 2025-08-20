"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Copy, Printer } from "lucide-react";
import PlansHeader from "@/components/plans/PlansHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function GoalsPage(){
  const [goal, setGoal] = useState<any|null>(null);
  const router = useRouter();
  useEffect(()=>{
    const apiBase = process.env.NEXT_PUBLIC_API_SERVER || "/api/backend";
    (async()=>{
      try{
        // prefer snapshot to include structured goal
        let snap: any = null;
        try{
          const rs = await fetch(`${apiBase}/v1/student/me/snapshot?period=30d`, { credentials:'include' });
          if (rs.ok) snap = await rs.json();
        }catch{}
        if (snap?.currentGoal) setGoal(snap.currentGoal);
        else {
          const r = await fetch(`${apiBase}/v1/interaction/chat/engh/goals/current`, { credentials:'include' });
          if (r.status === 200) {
            const { data } = await r.json();
            setGoal(data);
          }
        }
      }catch{}
    })();
  }, []);

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
        <PlansHeader active="goals" />
        <div className="flex items-center gap-2">
          <button onClick={()=>window.print()} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border hover:bg-muted" title="Export to PDF"><Printer size={14}/> Print</button>
          <button onClick={()=>{
            try{
              const text = goal ? [
                `Vektmål: ${goal.targetWeightKg ?? '-' } kg`,
                `Styrke: ${goal.strengthTargets ?? '-' }`,
                `Horisont: ${goal.horizonWeeks ?? '-' } uker`,
              ].join('\n') : '';
              navigator.clipboard.writeText(text);
            }catch{}
          }} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border hover:bg-muted" title="Copy goals"><Copy size={14}/> Copy</button>
        </div>
      </div>
      {goal ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Vektmål</CardTitle>
              <CardDescription>Målvekt</CardDescription>
            </CardHeader>
            <CardContent className="text-lg">{goal.targetWeightKg ?? '-'} kg</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Styrke</CardTitle>
              <CardDescription>Spesifikke mål</CardDescription>
            </CardHeader>
            <CardContent className="text-sm">{goal.strengthTargets ?? '-'}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Horisont</CardTitle>
              <CardDescription>Tidsramme</CardDescription>
            </CardHeader>
            <CardContent className="text-lg">{goal.horizonWeeks ?? '-'} uker</CardContent>
          </Card>
          {goal.weeklyWeightLossKg || goal.caloriesDailyDeficit || goal.weeklyExerciseMinutes || goal.hydrationLiters ? (
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle className="text-base">Nøkkeltall</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div><div className="text-muted-foreground">Vektreduksjon</div><div className="text-base font-medium">{goal.weeklyWeightLossKg ? `${goal.weeklyWeightLossKg} kg/uke` : '—'}</div></div>
                  <div><div className="text-muted-foreground">Kalori‑defisit</div><div className="text-base font-medium">{goal.caloriesDailyDeficit ? `${goal.caloriesDailyDeficit} kcal/dag` : '—'}</div></div>
                  <div><div className="text-muted-foreground">Trening</div><div className="text-base font-medium">{goal.weeklyExerciseMinutes ? `${goal.weeklyExerciseMinutes} min/uke` : '—'}</div></div>
                  <div><div className="text-muted-foreground">Hydrering</div><div className="text-base font-medium">{goal.hydrationLiters ? `${goal.hydrationLiters} L/dag` : '—'}</div></div>
                </div>
              </CardContent>
            </Card>
          ) : null}
          {(goal.plan?.shortTerm?.length || goal.plan?.mediumTerm?.length || goal.plan?.longTerm?.length) ? (
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle className="text-base">Plan</CardTitle>
                <CardDescription>SMART mål</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="font-medium mb-2">Kort sikt (1–3 mnd)</div>
                    <ul className="list-disc pl-5 text-sm">{(goal.plan?.shortTerm||[]).map((x:string,i:number)=>(<li key={i}>{x}</li>))}</ul>
                  </div>
                  <div>
                    <div className="font-medium mb-2">Mellomlang sikt (3–6 mnd)</div>
                    <ul className="list-disc pl-5 text-sm">{(goal.plan?.mediumTerm||[]).map((x:string,i:number)=>(<li key={i}>{x}</li>))}</ul>
                  </div>
                  <div>
                    <div className="font-medium mb-2">Lang sikt (6–12 mnd)</div>
                    <ul className="list-disc pl-5 text-sm">{(goal.plan?.longTerm||[]).map((x:string,i:number)=>(<li key={i}>{x}</li>))}</ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}
          {goal.plan?.tips?.length ? (
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle className="text-base">Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 text-sm">{goal.plan.tips.map((x:string,i:number)=>(<li key={i}>{x}</li>))}</ul>
              </CardContent>
            </Card>
          ) : null}
        </div>
      ) : (
        <div className="text-muted-foreground text-sm">Ingen mål satt</div>
      )}
    </div>
  );
}


