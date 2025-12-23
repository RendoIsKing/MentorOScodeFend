// Shared type definitions for the Coach Majen platform

export interface WeightEntry {
  date: string;
  weight: number;
}

export interface WeightProgress {
  start: number;
  current: number;
  target: number;
  history: WeightEntry[];
}

export interface Recipe {
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  difficulty: string;
}

export interface Meal {
  id: number;
  name: string;
  time: string;
  items: string[];
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  completed?: boolean;
  isModified?: boolean;
  recipe?: Recipe;
}

export interface Message {
  id: string;
  text?: string;
  sender: 'user' | 'coach';
  timestamp: Date;
  widget?: 'weigh-in' | 'today-workout' | 'today-meals';
  workoutData?: any;
  mealsData?: any[];
  submittedWeighInData?: {
    weight: number;
    date: Date;
    condition: string;
    notes?: string;
  };
  workoutProgress?: {
    started: boolean;
    currentExerciseIndex: number;
    // Some widgets track set-level progress; others don't. Keep optional for compatibility.
    currentSetIndex?: number;
    exercises: any[];
    isComplete: boolean;
    energyLevel?: number;
    enjoyment?: number;
    notes?: string;
  };
}

export interface CompletedWorkoutData {
  workoutId: string;
  completedWorkout: any;
  progress: any;
}

export type MobileTab = 'chat' | 'stats' | 'goals' | 'training' | 'nutrition';
export type DesktopTab = 'stats' | 'goals' | 'training' | 'nutrition';
