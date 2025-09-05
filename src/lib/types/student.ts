export type WeightEntry = { date: string; kg: number };

export type TrainingSet = {
  exercise: string;
  sets: number;
  reps: number;
  weight?: number;
  notes?: string;
};
export type TrainingSession = {
  id: string;
  date: string;
  focus: string;
  sets: TrainingSet[];
};

export type Meal = {
  name: string;
  kcal?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  items?: string[];
};
export type NutritionDay = {
  date: string;
  meals: Meal[];
  dailyTargets?: { kcal?: number; protein?: number; carbs?: number; fat?: number };
};

export type PlanChange = {
  id: string;
  date: string;
  author: 'coach-engh' | 'system';
  area: 'training' | 'nutrition';
  summary: string;
  reason?: string;
};

export type AtAGlance = {
  nextSession?: { date: string; focus: string };
  adherence7d?: number; // 0..1
  adherence28d?: number; // 0..1
  lastCheckIn?: string; // ISO
  activeGoals?: string[];
};

export type GoalPlan = {
  shortTerm?: string[];
  mediumTerm?: string[];
  longTerm?: string[];
  tips?: string[];
};

export type CurrentGoal = {
  targetWeightKg?: number;
  strengthTargets?: string;
  horizonWeeks?: number;
  sourceText?: string;
  caloriesDailyDeficit?: number;
  weeklyWeightLossKg?: number;
  weeklyExerciseMinutes?: number;
  hydrationLiters?: number;
  plan?: GoalPlan;
};

export type StudentSnapshot = {
  weightTrend: WeightEntry[];
  currentTrainingPlan: TrainingSession[];
  currentNutritionPlan: NutritionDay[];
  planChanges: PlanChange[];
  glance: AtAGlance;
  topExercises?: string[];
  goals?: string[];
  currentGoal?: CurrentGoal;
};


