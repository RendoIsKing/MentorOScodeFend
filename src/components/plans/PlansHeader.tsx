"use client";
import { useRouter } from "next/navigation";
import React from "react";

type Tab = "training" | "nutrition" | "goals";

export default function PlansHeader({ active }: { active: Tab }) {
  const router = useRouter();
  const tabs: { key: Tab; label: string; href: string }[] = [
    { key: "training", label: "Training", href: "/plans/training" },
    { key: "nutrition", label: "Meal", href: "/plans/nutrition" },
    { key: "goals", label: "Goals", href: "/plans/goals" },
  ];
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold truncate">{tabs.find(t=>t.key===active)?.label} plan</h1>
        <p className="text-sm text-muted-foreground mt-1">Switch between plans</p>
      </div>
      <div className="inline-flex rounded-md border p-1 bg-background ml-auto">
        {tabs.map((t)=> (
          <button
            key={t.key}
            onClick={()=> router.push(t.href)}
            className={`px-3 py-1.5 text-sm rounded ${active===t.key ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            aria-current={active===t.key ? 'page' : undefined}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}


