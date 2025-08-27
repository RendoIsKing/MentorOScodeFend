"use client";
import React from "react";

type Preview = {
  trainingWeek: { day: string; focus: string; exercises?: { name: string; sets: number; reps: string; rpe?: string; rationale?: string }[] }[];
  nutrition: { kcal: number; proteinGrams: number; carbsGrams: number; fatGrams: number; rationale?: string };
};

export default function PlanPreviewCard({ data }: { data: Preview }) {
  return (
    <div className="rounded-2xl border p-4 space-y-4">
      <h3 className="text-xl font-semibold">Plan-preview (første uke)</h3>
      <div className="grid md:grid-cols-2 gap-4">
        {data.trainingWeek.map((d, i) => (
          <div key={i} className="rounded-xl border p-3">
            <div className="font-medium">{d.day} — {d.focus}</div>
            <ul className="mt-2 space-y-1 text-sm">
              {d.exercises?.map((e, j) => (
                <li key={j}>
                  {e.name} — {e.sets}×{e.reps}{e.rpe ? ` (${e.rpe})` : ""} {e.rationale ? <span className="text-xs opacity-70">• {e.rationale}</span> : null}
                </li>
              )) ?? <li>—</li>}
            </ul>
          </div>
        ))}
      </div>
      <div className="rounded-xl border p-3">
        <div className="font-medium">Ernæring</div>
        <div className="text-sm mt-1">
          {data.nutrition.kcal} kcal • Protein {data.nutrition.proteinGrams}g • Karb {data.nutrition.carbsGrams}g • Fett {data.nutrition.fatGrams}g
          {data.nutrition.rationale ? <div className="opacity-70 mt-1">{data.nutrition.rationale}</div> : null}
        </div>
      </div>
    </div>
  );
}


