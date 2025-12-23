"use client";

// Verbatim-ish port of `Edit Design Request (1)/src/pages/CoachMajenStudentCenter.tsx`
// but using the copied mini-app from `src/components/design/coach-majen/*`.

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageCircle,
  TrendingUp,
  Target,
  Dumbbell,
  Apple,
  ArrowLeft,
  BarChart3,
} from "lucide-react";

import { Button } from "@/components/design/coach-majen/components/ui/button";
import { ChatInterface } from "@/components/design/coach-majen/components/ChatInterface";
import { StatsView } from "@/components/design/coach-majen/components/StatsView";
import { GoalsView } from "@/components/design/coach-majen/components/GoalsView";
import { TrainingView } from "@/components/design/coach-majen/components/TrainingView";
import { NutritionView } from "@/components/design/coach-majen/components/NutritionView";
import { getDefaultDayMeals } from "@/components/design/coach-majen/data/nutritionPlanMeals";
import { getTodaysWorkout } from "@/components/design/coach-majen/data/workoutSchedule";
import type {
  WeightProgress,
  Message,
  CompletedWorkoutData,
  MobileTab,
  DesktopTab,
} from "@/components/design/coach-majen/types";
import type { ExerciseSet } from "@/components/design/coach-majen/components/widgets/ExerciseSetsHistoryDialog";
import { useStudentSnapshot } from "@/hooks/useStudentSnapshot";
import { addWeightEntry } from "@/lib/api/student";
import { ensureMajenThread, listMajenMessages, sendMajenMessage } from "@/lib/api/majen";
import { adaptSnapshotToMajenMeals, adaptSnapshotToTrainingSchedule, pickTodayWorkout } from "@/lib/adapters/majen";

// Initial meals template (kept from export)
const formatShort = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return iso;
  }
};

export default function CoachMajenStudentCenterDesign() {
  const [isStudentCenterOpen, setIsStudentCenterOpen] = useState(false);
  const [mobileActiveTab, setMobileActiveTab] = useState<MobileTab>("chat");
  const [desktopActiveTab, setDesktopActiveTab] = useState<DesktopTab>("stats");
  const coachName = "Coach Majen";

  const { data: snap, refresh: refreshSnap } = useStudentSnapshot("me", "30d");
  const [weightProgress, setWeightProgress] = useState<WeightProgress>({ start: 0, current: 0, target: 0, history: [] });
  useEffect(() => {
    const series = Array.isArray((snap as any)?.weightTrend) ? ((snap as any).weightTrend as any[]) : [];
    const history = series
      .filter((w) => w?.date && w?.kg != null)
      .map((w) => ({ date: formatShort(String(w.date)), weight: Number(w.kg) }))
      .filter((w) => !Number.isNaN(w.weight));
    const start = history.length ? history[0].weight : 0;
    const current = history.length ? history[history.length - 1].weight : start;
    const target = Number((snap as any)?.currentGoal?.targetWeightKg ?? (snap as any)?.glance?.targetWeightKg ?? 0) || 0;
    setWeightProgress({ start, current, target: target || current, history });
  }, [snap]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hey! Welcome to your fitness journey! I'm Coach Majen, and I'm here to help you achieve your goals. 💪",
      sender: "coach",
      timestamp: new Date(Date.now() - 7200000),
    },
    {
      id: "2",
      text: "I've set up your Student Center where you can track your progress, view your personalized training and nutrition plans, and see how far you've come.",
      sender: "coach",
      timestamp: new Date(Date.now() - 7100000),
    },
    {
      id: "3",
      text: "Click 'Student Center' to explore your dashboard. You can ask me questions anytime while viewing it!",
      sender: "coach",
      timestamp: new Date(Date.now() - 7000000),
    },
    {
      id: "4",
      text: "Thanks Majen! I'm excited to get started!",
      sender: "user",
      timestamp: new Date(Date.now() - 6900000),
    },
  ]);

  const [completedWorkouts, setCompletedWorkouts] = useState<CompletedWorkoutData[]>([]);
  const completedWorkoutIds = useMemo(() => {
    const ids = new Set<string>();
    const initialCompletedIds = [
      "workout-2025-11-09",
      "workout-2025-11-07",
      "workout-2025-11-05",
      "workout-2025-11-02",
      "workout-2025-10-31",
      "workout-2025-10-29",
      "workout-2025-10-27",
      "workout-2025-10-24",
      "workout-2025-10-22",
      "workout-2025-10-20",
    ];
    initialCompletedIds.forEach((id) => ids.add(id));
    completedWorkouts.forEach(({ workoutId }) => ids.add(workoutId));
    return ids;
  }, [completedWorkouts]);

  const [allExerciseSets, setAllExerciseSets] = useState<Record<string, ExerciseSet[]>>({});
  const handleAddExerciseSet = (set: ExerciseSet) => {
    setAllExerciseSets((prev) => ({
      ...prev,
      [set.exerciseName]: [set, ...(prev[set.exerciseName] || [])],
    }));
  };

  // Note: export uses getTodaysWorkout() for quick access; the TrainingView manages schedule internally.
  useEffect(() => {
    // default to chat on mobile first load
    setMobileActiveTab("chat");
  }, []);

  // Majen DM wiring (polling). Keep state in wrapper, feed ChatInterface UI.
  const lastSyncedRef = useRef<string>("");
  useEffect(() => {
    let timer: any;
    let cancelled = false;
    async function tick() {
      try {
        await ensureMajenThread();
        const list = await listMajenMessages();
        if (cancelled) return;
        const mapped: Message[] = list.map((m) => ({
          id: m.id,
          text: m.text,
          sender: m.sender === "me" ? "user" : "coach",
          timestamp: new Date(m.createdAt),
        }));
        const lastId = mapped.length ? mapped[mapped.length - 1].id : "";
        if (lastId && lastId !== lastSyncedRef.current) {
          lastSyncedRef.current = lastId;
          setMessages(mapped);
        }
      } catch {}
      timer = setTimeout(tick, 2000);
    }
    tick();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, []);

  const onSendText = async (text: string) => {
    const t = String(text || "").trim();
    if (!t) return;
    try {
      await sendMajenMessage(t);
      // polling will pick up server-confirmed messages + replies
    } catch {}
  };

  const onWeighIn = async (data: { weight: number; date: Date; condition: string; notes?: string }) => {
    try {
      const iso = data.date.toISOString().slice(0, 10);
      await addWeightEntry("me", { date: iso, kg: Number(data.weight) } as any);
      await refreshSnap();
    } catch {}
  };

  // Build backend-driven "today" widgets + schedule/meals for tabs (fallback handled downstream).
  const backendMeals = useMemo(() => adaptSnapshotToMajenMeals(snap as any), [snap]);
  const backendSchedule = useMemo(() => adaptSnapshotToTrainingSchedule(snap as any), [snap]);
  const todayWorkout = useMemo(() => pickTodayWorkout(backendSchedule), [backendSchedule]);

  const mobileTabs = [
    { id: "chat" as const, label: "Chat", icon: MessageCircle },
    { id: "stats" as const, label: "Stats", icon: TrendingUp },
    { id: "goals" as const, label: "Goals", icon: Target },
    { id: "training" as const, label: "Training", icon: Dumbbell },
    { id: "nutrition" as const, label: "Nutrition", icon: Apple },
  ];

  const desktopTabs = [
    { id: "stats" as const, label: "Stats", icon: BarChart3 },
    { id: "goals" as const, label: "Goals", icon: Target },
    { id: "training" as const, label: "Training", icon: Dumbbell },
    { id: "nutrition" as const, label: "Nutrition", icon: Apple },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white" data-test="design-coach-majen-student-center">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => {
                if (isStudentCenterOpen) setIsStudentCenterOpen(false);
              }}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="text-sm text-gray-500">Coach</div>
              <div className="text-gray-900 font-semibold">{coachName}</div>
            </div>
          </div>
          <Button
            className="rounded-xl bg-gradient-to-r from-[#00AEEF] to-[#0078D7] hover:from-[#0078D7] hover:to-[#004C97] text-white shadow-lg shadow-[#00AEEF]/20"
            onClick={() => setIsStudentCenterOpen((v) => !v)}
          >
            {isStudentCenterOpen ? "Close Student Center" : "Student Center"}
          </Button>
        </div>
      </div>

      {/* Mobile Tabs */}
      <div className="lg:hidden">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {mobileTabs.map((t) => {
              const Icon = t.icon;
              const active = mobileActiveTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setMobileActiveTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                    active
                      ? "bg-gradient-to-r from-[#00AEEF] to-[#0078D7] text-white shadow-lg shadow-[#00AEEF]/30"
                      : "bg-white text-gray-600 border-2 border-gray-100 hover:border-[#0078D7]/30"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
          {/* Left: Chat */}
          <div className="order-2 lg:order-1">
            {(mobileActiveTab === "chat" || !isStudentCenterOpen) && (
              <ChatInterface
                coachName={coachName}
                isStudentCenterOpen={isStudentCenterOpen}
                onToggleStudentCenter={() => setIsStudentCenterOpen((v) => !v)}
                messages={messages}
                setMessages={setMessages}
                onSendText={onSendText}
                onWeighIn={onWeighIn}
                onWorkoutComplete={(workoutId: string, completedWorkout: any, progress: any) =>
                  setCompletedWorkouts((prev) => [{ workoutId, completedWorkout, progress }, ...prev])
                }
                todaysWorkout={
                  todayWorkout ||
                  getTodaysWorkout(new Set((completedWorkouts || []).map((w: any) => String(w?.workoutId || ""))))
                }
                todaysMeals={(backendMeals.length ? backendMeals : getDefaultDayMeals()) as any}
              />
            )}
          </div>

          {/* Right: Student Center */}
          <div className="order-1 lg:order-2">
            <AnimatePresence initial={false}>
              {isStudentCenterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  {/* Desktop tabs */}
                  <div className="hidden lg:block border-b border-gray-100 bg-white">
                    <div className="flex items-center gap-2 p-4">
                      {desktopTabs.map((t) => {
                        const Icon = t.icon;
                        const active = desktopActiveTab === t.id;
                        return (
                          <button
                            key={t.id}
                            onClick={() => setDesktopActiveTab(t.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                              active
                                ? "bg-gradient-to-r from-[#00AEEF] to-[#0078D7] text-white shadow-md"
                                : "text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            {t.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-4">
                    {/* Mobile: render selected tab within student center */}
                    <div className="lg:hidden">
                      {mobileActiveTab === "stats" && (
                        <StatsView
                          weightProgress={weightProgress}
                          allExerciseSets={allExerciseSets}
                          onWeighIn={onWeighIn}
                        />
                      )}
                      {mobileActiveTab === "goals" && <GoalsView />}
                      {mobileActiveTab === "training" && (
                        <TrainingView
                          onAddExerciseSet={handleAddExerciseSet}
                          completedWorkouts={completedWorkouts as any}
                          scheduleOverride={backendSchedule.length ? backendSchedule : undefined}
                        />
                      )}
                      {mobileActiveTab === "nutrition" && (
                        <NutritionView meals={(backendMeals.length ? backendMeals : undefined) as any} />
                      )}
                    </div>

                    {/* Desktop: render selected tab */}
                    <div className="hidden lg:block">
                      {desktopActiveTab === "stats" && (
                        <StatsView
                          weightProgress={weightProgress}
                          allExerciseSets={allExerciseSets}
                          onWeighIn={onWeighIn}
                        />
                      )}
                      {desktopActiveTab === "goals" && <GoalsView />}
                      {desktopActiveTab === "training" && (
                        <TrainingView
                          onAddExerciseSet={handleAddExerciseSet}
                          completedWorkouts={completedWorkouts as any}
                          scheduleOverride={backendSchedule.length ? backendSchedule : undefined}
                        />
                      )}
                      {desktopActiveTab === "nutrition" && (
                        <NutritionView meals={(backendMeals.length ? backendMeals : undefined) as any} />
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!isStudentCenterOpen && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-600">
                Open <span className="font-semibold text-gray-900">Student Center</span> to see stats, goals, training, and nutrition.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


