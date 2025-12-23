import type { StudentSnapshot } from "@/lib/types/student";
import type { Meal as MajenMeal } from "@/components/design/coach-majen/data/nutritionPlanMeals";
import type { ScheduledWorkout } from "@/components/design/coach-majen/data/workoutSchedule";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function formatShortDate(d: Date) {
  try {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  }
}

function dayName(d: Date) {
  return d.toLocaleDateString("en-US", { weekday: "long" });
}

function nextDateForWeekday(target: string, from: Date = new Date()) {
  const map: Record<string, number> = {
    sunday: 0,
    sun: 0,
    monday: 1,
    mon: 1,
    tuesday: 2,
    tue: 2,
    wednesday: 3,
    wed: 3,
    thursday: 4,
    thu: 4,
    friday: 5,
    fri: 5,
    saturday: 6,
    sat: 6,
  };
  const key = String(target || "").trim().toLowerCase();
  const targetDow = map[key];
  if (targetDow == null) return new Date(from);
  const curDow = from.getDay();
  let diff = targetDow - curDow;
  if (diff < 0) diff += 7;
  const d = new Date(from);
  d.setDate(from.getDate() + diff);
  return d;
}

export function adaptSnapshotToMajenMeals(snapshot: StudentSnapshot | any): MajenMeal[] {
  const day0 = Array.isArray(snapshot?.currentNutritionPlan) ? snapshot.currentNutritionPlan[0] : null;
  const mealsRaw: any[] = Array.isArray(day0?.meals) ? day0.meals : [];
  if (!mealsRaw.length) return [];

  const targets = day0?.dailyTargets || {};
  const kcal = Number(targets?.kcal || 0);
  const protein = Number(targets?.protein || 0);
  const carbs = Number(targets?.carbs || 0);
  const fat = Number(targets?.fat || 0);

  const per = (n: number) => (mealsRaw.length ? Math.round(n / mealsRaw.length) : 0);
  const times = ["8:00 AM", "1:00 PM", "4:00 PM", "7:00 PM", "9:00 PM"];

  return mealsRaw.map((m, idx) => {
    const id = 1000 + idx;
    const name = String(m?.name || `Meal ${idx + 1}`);
    const items = Array.isArray(m?.items) ? m.items.map(String) : [];
    return {
      id,
      name,
      time: times[idx] || `${8 + idx * 2}:00`,
      items,
      calories: per(kcal),
      protein: per(protein),
      carbs: per(carbs),
      fats: per(fat),
      completed: false,
    };
  });
}

export function adaptSnapshotToTrainingSchedule(snapshot: StudentSnapshot | any): ScheduledWorkout[] {
  const sessions: any[] = Array.isArray(snapshot?.currentTrainingPlan) ? snapshot.currentTrainingPlan : [];
  if (!sessions.length) return [];

  const today = new Date();

  return sessions.map((s, idx) => {
    const day = String(s?.day || dayName(today));
    const focusRaw = String(s?.focus || `Session ${idx + 1}`);
    const focus = Array.isArray(s?.focus) ? s.focus.map(String) : String(focusRaw).split(/[,\|]/).map((x) => x.trim()).filter(Boolean);
    const dateObj = nextDateForWeekday(day, today);
    const date = formatShortDate(dateObj);

    const exercisesRaw: any[] = Array.isArray(s?.sets) ? s.sets : Array.isArray(s?.exercises) ? s.exercises : [];
    const exercises = exercisesRaw
      .map((e) => ({
        name: String(e?.exercise || e?.name || "Exercise"),
        sets: Number(e?.sets || 0) || 3,
        reps: String(e?.reps ?? "10"),
        rest: "90s",
        recommendedWeight: e?.weight != null ? `${Number(e.weight)}kg` : e?.load != null ? `${Number(e.load)}kg` : undefined,
        recommendedRPE: "8/10",
      }))
      .filter((e) => e.name);

    const totalSets = exercises.reduce((sum, e) => sum + (Number(e.sets) || 0), 0);
    const durationMin = Math.max(30, Math.min(90, Math.round(totalSets * 2.5)));
    const difficulty = totalSets >= 22 ? "Advanced" : totalSets >= 14 ? "Intermediate" : "Beginner";

    return {
      id: String(s?.id || `plan-${idx}-${day}`),
      name: focusRaw,
      date,
      dateObj,
      duration: `${durationMin} min`,
      difficulty,
      focus: focus.length ? focus : [focusRaw],
      day,
      exercises,
      completed: false,
    } as any;
  });
}

export function pickTodayWorkout(schedule: ScheduledWorkout[]): any | null {
  if (!schedule?.length) return null;
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const best = schedule.find((w) => w?.dateObj && w.dateObj.toISOString().slice(0, 10) === todayKey) || schedule[0];
  if (!best) return null;

  // Shape for InteractiveWorkoutWidget
  return {
    id: String(best.id),
    name: best.name,
    scheduled: `Today • ${best.day}`,
    duration: best.duration,
    difficulty: best.difficulty,
    completed: Boolean(best.completed),
    focus: best.focus,
    exercises: (best.exercises || []).map((e: any) => ({
      name: e.name,
      sets: e.sets,
      reps: String(e.reps),
      rest: String(e.rest || "90s"),
      notes: e.notes,
      recommendedWeight: e.recommendedWeight,
      recommendedRPE: e.recommendedRPE,
    })),
  };
}


