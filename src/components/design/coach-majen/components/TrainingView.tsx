import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Calendar, TrendingUp, CheckCircle, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { WorkoutCard } from './widgets/WorkoutCard';
import { TrainingPlanDialog } from './widgets/TrainingPlanDialog';
import { TrainingPlanOverviewDialog } from './widgets/TrainingPlanOverviewDialog';
import { WorkoutPerformanceDialog } from './widgets/WorkoutPerformanceDialog';
import { ExerciseSet } from './widgets/ExerciseSetsHistoryDialog';
import { ScrollArea } from './ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { allScheduledWorkouts } from '../data/workoutSchedule';

interface SetDetail {
  setNumber: number;
  completed: boolean;
  weight: string;
  reps: string;
  restTime: string;
}

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  notes?: string;
  completed?: boolean;
  setDetails?: SetDetail[];
  exerciseNotes?: string;
  recommendedWeight?: string;
  recommendedRPE?: string;
}

interface ScheduledWorkout {
  id: string;
  name: string;
  date: string;
  dateObj: Date;
  duration: string;
  exercises: Exercise[];
  difficulty: string;
  focus: string[];
  day: string;
  isRestDay?: boolean;
}

interface CompletedExercise {
  name: string;
  targetSets: number;
  targetReps: string;
  completedSets: number;
  completedReps: string;
  rest: string;
  notes?: string;
  setDetails?: SetDetail[];
}

interface CompletedWorkoutDetail {
  id: string;
  name: string;
  date: string;
  duration: string;
  targetDuration: string;
  difficulty: string;
  focus: string[];
  completionPercentage: number;
  workoutNotes?: string;
  energyLevel?: number;
  exercises: CompletedExercise[];
}

interface TrainingViewProps {
  onAddExerciseSet?: (set: ExerciseSet) => void;
  completedWorkouts?: any[];
  // Optional: prefer backend-generated schedule (preserves export UI, just changes data source)
  scheduleOverride?: ScheduledWorkout[];
}

// Add missing type definitions
interface DayWorkout {
  day: string;
  date: string;
  workoutName: string;
  duration: string;
  difficulty: string;
  focus: string[];
  exercises: Exercise[];
  isRestDay?: boolean;
  isCompleted?: boolean;
  workoutId?: string;
}

export function TrainingView({ onAddExerciseSet, completedWorkouts = [], scheduleOverride }: TrainingViewProps) {
  console.log('TrainingView render - completedWorkouts prop:', completedWorkouts);
  const schedule = scheduleOverride && scheduleOverride.length ? scheduleOverride : allScheduledWorkouts;
  
  const [activeWorkoutId, setActiveWorkoutId] = useState<string | null>(null);
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [selectedCompletedWorkout, setSelectedCompletedWorkout] = useState<any>(null);
  const [planWeekOffset, setPlanWeekOffset] = useState(0);
  const [isRecentWorkoutsOpen, setIsRecentWorkoutsOpen] = useState(true);
  const [isOverviewDialogOpen, setIsOverviewDialogOpen] = useState(false);
  const [isUpcomingWorkoutsOpen, setIsUpcomingWorkoutsOpen] = useState(true);

  // SINGLE SOURCE OF TRUTH: Track which workouts are completed by ID
  const [completedWorkoutIds, setCompletedWorkoutIds] = useState<Set<string>>(new Set([
    'workout-2025-11-09',
    'workout-2025-11-07',
    'workout-2025-11-05',
    'workout-2025-11-02',
    'workout-2025-10-31',
    'workout-2025-10-29',
    'workout-2025-10-27',
    'workout-2025-10-24',
    'workout-2025-10-22',
    'workout-2025-10-20',
  ]));

  // State to store workout data (including exercise details)
  const [workoutData, setWorkoutData] = useState<Record<string, ScheduledWorkout>>({});

  // Process completed workouts from chat
  useEffect(() => {
    console.log('TrainingView: completedWorkouts changed:', completedWorkouts);
    console.log('Current completedWorkoutIds:', Array.from(completedWorkoutIds));
    
    if (completedWorkouts && completedWorkouts.length > 0) {
      // Build new IDs and details to add
      const newIds: string[] = [];
      const newDetails: Record<string, CompletedWorkoutDetail> = {};
      
      completedWorkouts.forEach(({ workoutId, completedWorkout, progress }) => {
        console.log('Checking workout:', workoutId, 'Already in set?', completedWorkoutIds.has(workoutId));
        
        // Check if we haven't processed this workout yet
        if (!completedWorkoutIds.has(workoutId) && !newDetails[workoutId]) {
          console.log('Will add new completed workout:', workoutId);
          newIds.push(workoutId);
          
          // Find the workout in the schedule to get the date
          const workout = schedule.find(w => w.id === workoutId);
          const workoutDate = workout?.dateObj || new Date();
          
          // Add exercise sets to the shared state (same logic as handleWorkoutComplete)
          if (onAddExerciseSet && progress.exercises) {
            progress.exercises.forEach((ex: any) => {
              if (ex.setDetails && ex.setDetails.length > 0) {
                // Find the best set (heaviest weight with most reps)
                const bestSet = ex.setDetails
                  .filter((s: any) => s.completed && s.weight && s.reps)
                  .reduce((best: any, current: any) => {
                    const currentWeight = parseFloat(current.weight) || 0;
                    const currentReps = parseInt(current.reps) || 0;
                    const bestWeight = parseFloat(best?.weight) || 0;
                    const bestReps = parseInt(best?.reps) || 0;
                    
                    // Prioritize weight first, then reps
                    if (currentWeight > bestWeight || (currentWeight === bestWeight && currentReps > bestReps)) {
                      return current;
                    }
                    return best;
                  }, ex.setDetails[0]);
                
                if (bestSet && bestSet.weight && bestSet.reps) {
                  const setData: ExerciseSet = {
                    id: `set-${workoutId}-${ex.name}-${Date.now()}`,
                    exerciseName: ex.name,
                    weight: parseFloat(bestSet.weight),
                    reps: parseInt(bestSet.reps),
                    date: workoutDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    dateObj: workoutDate,
                    workoutName: completedWorkout.name,
                    notes: ex.exerciseNotes,
                  };
                  console.log('Adding exercise set to global history:', setData);
                  onAddExerciseSet(setData);
                }
              }
            });
          }
          
          // Create completion details from the workout data
          const completedExercises = progress.exercises.map((ex: any) => {
            const completedSetsCount = ex.setDetails?.filter((s: any) => s.completed).length || 0;
            const totalRepsCompleted = ex.setDetails
              ?.filter((s: any) => s.completed && s.reps)
              .map((s: any) => parseInt(s.reps) || 0)
              .reduce((a: number, b: number) => a + b, 0) || 0;
            
            return {
              name: ex.name,
              targetSets: ex.sets,
              targetReps: ex.reps,
              completedSets: completedSetsCount,
              completedReps: totalRepsCompleted > 0 ? totalRepsCompleted.toString() : ex.reps,
              rest: ex.rest,
              notes: ex.notes,
              setDetails: ex.setDetails,
            };
          });

          const completionPercentage = Math.round(
            (progress.exercises.filter((ex: any) => ex.completed).length / progress.exercises.length) * 100
          );

          newDetails[workoutId] = {
            id: workoutId,
            name: completedWorkout.name,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            duration: completedWorkout.duration || '0 min',
            targetDuration: completedWorkout.duration || '0 min',
            difficulty: completedWorkout.difficulty || 'Intermediate',
            focus: completedWorkout.focus || [],
            completionPercentage,
            workoutNotes: progress.notes || 'Completed via chat!',
            energyLevel: progress.energyLevel || 5,
            exercises: completedExercises,
          };
        }
      });
      
      // Batch update if we have new workouts
      if (newIds.length > 0) {
        console.log('Adding workout IDs:', newIds);
        setCompletedWorkoutIds(prev => {
          const newSet = new Set(prev);
          newIds.forEach(id => newSet.add(id));
          console.log('New completedWorkoutIds Set:', Array.from(newSet));
          return newSet;
        });
        
        setCompletedWorkoutsDetails(prev => {
          const updated = { ...prev, ...newDetails };
          console.log('New completedWorkoutsDetails:', updated);
          return updated;
        });
      }
    }
  }, [completedWorkouts, completedWorkoutIds]);

  // State to store completed workout details with performance data
  const [completedWorkoutsDetails, setCompletedWorkoutsDetails] = useState<Record<string, CompletedWorkoutDetail>>({
    'workout-2025-11-09': {
      id: 'workout-2025-11-09',
      name: 'Core & Abs Blast',
      date: 'Nov 9, 2025',
      duration: '23 min',
      targetDuration: '25 min',
      difficulty: 'Intermediate',
      focus: ['Core', 'Abs'],
      completionPercentage: 95,
      workoutNotes: 'Felt strong today, pushed through the last set!',
      exercises: [
        { name: 'Plank Hold', targetSets: 4, targetReps: '60s', completedSets: 4, completedReps: '60s', rest: '30s' },
        { name: 'Russian Twists', targetSets: 3, targetReps: '20', completedSets: 3, completedReps: '20', rest: '45s' },
        { name: 'Bicycle Crunches', targetSets: 3, targetReps: '20', completedSets: 3, completedReps: '18', rest: '45s' },
        { name: 'Mountain Climbers', targetSets: 3, targetReps: '30s', completedSets: 3, completedReps: '30s', rest: '45s' },
        { name: 'Leg Raises', targetSets: 3, targetReps: '15', completedSets: 3, completedReps: '15', rest: '45s' },
        { name: 'Dead Bug', targetSets: 3, targetReps: '12', completedSets: 3, completedReps: '12', rest: '45s' },
      ],
    },
    'workout-2025-11-07': {
      id: 'workout-2025-11-07',
      name: 'Full Body Circuit',
      date: 'Nov 7, 2025',
      duration: '58 min',
      targetDuration: '60 min',
      difficulty: 'Advanced',
      focus: ['Full Body', 'Conditioning'],
      completionPercentage: 100,
      workoutNotes: 'Great workout, hit all targets!',
      exercises: [
        { name: 'Deadlift', targetSets: 4, targetReps: '8-10', completedSets: 4, completedReps: '10', rest: '90s', notes: 'Used 102 kg' },
        { name: 'Overhead Press', targetSets: 3, targetReps: '10-12', completedSets: 3, completedReps: '12', rest: '60s' },
        { name: 'Lunges', targetSets: 3, targetReps: '12/leg', completedSets: 3, completedReps: '12/leg', rest: '60s' },
        { name: 'Pull-ups', targetSets: 3, targetReps: '8-10', completedSets: 3, completedReps: '9', rest: '90s' },
        { name: 'Plank Hold', targetSets: 3, targetReps: '45s', completedSets: 3, completedReps: '45s', rest: '30s' },
      ],
    },
    'workout-2025-11-05': {
      id: 'workout-2025-11-05',
      name: 'Upper Body Power',
      date: 'Nov 5, 2025',
      duration: '52 min',
      targetDuration: '50 min',
      difficulty: 'Advanced',
      focus: ['Chest', 'Back', 'Arms'],
      completionPercentage: 88,
      workoutNotes: 'Struggled with last set of pull-ups',
      exercises: [
        { name: 'Bench Press', targetSets: 4, targetReps: '8-10', completedSets: 4, completedReps: '9', rest: '90s', notes: 'Focus on controlled descent' },
        { name: 'Pull-ups', targetSets: 4, targetReps: '6-8', completedSets: 3, completedReps: '6', rest: '90s', notes: 'Skipped last set - fatigue' },
        { name: 'Dumbbell Shoulder Press', targetSets: 3, targetReps: '10-12', completedSets: 3, completedReps: '11', rest: '60s' },
        { name: 'Barbell Rows', targetSets: 4, targetReps: '8-10', completedSets: 4, completedReps: '10', rest: '90s' },
        { name: 'Tricep Dips', targetSets: 3, targetReps: '10-12', completedSets: 3, completedReps: '12', rest: '60s' },
        { name: 'Bicep Curls', targetSets: 3, targetReps: '12-15', completedSets: 3, completedReps: '14', rest: '45s' },
      ],
    },
    'workout-2025-11-02': {
      id: 'workout-2025-11-02',
      name: 'Lower Body Strength',
      date: 'Nov 2, 2025',
      duration: '57 min',
      targetDuration: '55 min',
      difficulty: 'Advanced',
      focus: ['Legs', 'Glutes'],
      completionPercentage: 100,
      workoutNotes: 'New PR on squats! 🎉',
      exercises: [
        { name: 'Back Squat', targetSets: 4, targetReps: '6-8', completedSets: 4, completedReps: '8', rest: '2min', notes: 'PR: 125 kg!' },
        { name: 'Romanian Deadlift', targetSets: 4, targetReps: '8-10', completedSets: 4, completedReps: '10', rest: '90s' },
        { name: 'Bulgarian Split Squats', targetSets: 3, targetReps: '10/leg', completedSets: 3, completedReps: '10/leg', rest: '60s' },
        { name: 'Leg Press', targetSets: 3, targetReps: '12-15', completedSets: 3, completedReps: '15', rest: '60s' },
      ],
    },
    'workout-2025-10-31': {
      id: 'workout-2025-10-31',
      name: 'HIIT Cardio',
      date: 'Oct 31, 2025',
      duration: '28 min',
      difficulty: 'Intermediate',
      focus: ['Cardio', 'Endurance'],
      targetDuration: '30 min',
      completionPercentage: 92,
      workoutNotes: 'Strong intervals. Keep breathing steady between rounds.',
      exercises: [
        { name: 'Warm-up Jog', targetSets: 1, targetReps: '5 min', completedSets: 1, completedReps: '5 min', rest: '0s' },
        { name: 'Sprint Intervals', targetSets: 8, targetReps: '30s', completedSets: 8, completedReps: '30s', rest: '60s', notes: 'Max effort' },
        { name: 'Mountain Climbers', targetSets: 4, targetReps: '30s', completedSets: 4, completedReps: '30s', rest: '30s' },
        { name: 'Burpees', targetSets: 4, targetReps: '30s', completedSets: 4, completedReps: '30s', rest: '30s' },
      ],
    },
    'workout-2025-10-29': {
      id: 'workout-2025-10-29',
      name: 'Upper Body Hypertrophy',
      date: 'Oct 29, 2025',
      duration: '62 min',
      targetDuration: '60 min',
      difficulty: 'Advanced',
      focus: ['Chest', 'Back', 'Shoulders'],
      completionPercentage: 100,
      workoutNotes: 'Great pump! Shoulders felt strong.',
      exercises: [
        { name: 'Incline Bench Press', targetSets: 4, targetReps: '10-12', completedSets: 4, completedReps: '11', rest: '90s' },
        { name: 'Lat Pulldown', targetSets: 4, targetReps: '10-12', completedSets: 4, completedReps: '12', rest: '75s' },
        { name: 'Dumbbell Flyes', targetSets: 3, targetReps: '12-15', completedSets: 3, completedReps: '14', rest: '60s' },
        { name: 'Cable Rows', targetSets: 4, targetReps: '10-12', completedSets: 4, completedReps: '15', rest: '75s' },
        { name: 'Lateral Raises', targetSets: 3, targetReps: '15-20', completedSets: 3, completedReps: '18', rest: '45s' },
      ],
    },
    'workout-2025-10-27': {
      id: 'workout-2025-10-27',
      name: 'Leg Day',
      date: 'Oct 27, 2025',
      duration: '54 min',
      targetDuration: '55 min',
      difficulty: 'Advanced',
      focus: ['Legs', 'Glutes'],
      completionPercentage: 100,
      workoutNotes: 'Solid workout, hit PRs on squats',
      exercises: [
        { name: 'Back Squat', targetSets: 4, targetReps: '6-8', completedSets: 4, completedReps: '8', rest: '2min' },
        { name: 'Leg Press', targetSets: 3, targetReps: '12-15', completedSets: 3, completedReps: '15', rest: '90s' },
        { name: 'Walking Lunges', targetSets: 3, targetReps: '10/leg', completedSets: 3, completedReps: '10/leg', rest: '60s' },
        { name: 'Leg Curls', targetSets: 3, targetReps: '12-15', completedSets: 3, completedReps: '14', rest: '60s' },
      ],
    },
  });

  const currentPlan = {
    name: '12-Week Transformation',
    duration: '12 weeks',
    weeklyWorkouts: 5,
    currentWeek: 8,
    focus: 'Strength building & fat loss',
    startDate: 'Sep 1, 2025',
    endDate: 'Nov 24, 2025',
  };

  // Workout schedule is now imported from /data/workoutSchedule.ts

  // Derive upcoming workouts (next 3 non-rest, non-completed workouts)
  console.log('Calculating upcomingWorkouts, completedWorkoutIds:', Array.from(completedWorkoutIds));
  const upcomingWorkouts = schedule
    .filter(w => {
      const isCompleted = completedWorkoutIds.has(w.id);
      console.log(`Workout ${w.id}: isCompleted=${isCompleted}, isRestDay=${w.isRestDay}`);
      return !isCompleted && !w.isRestDay;
    })
    .slice(0, 3)
    .map((w, index) => {
      // Calculate the scheduled label based on position
      let scheduled;
      const today = new Date('2025-11-11');
      const daysDiff = Math.floor((w.dateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 0) {
        scheduled = 'Today, 6:00 PM';
      } else if (daysDiff === 1) {
        scheduled = 'Tomorrow, 6:00 PM';
      } else {
        scheduled = w.date;
      }
      
      return {
        id: w.id,
        name: w.name,
        duration: w.duration,
        exercises: w.exercises,
        difficulty: w.difficulty,
        scheduled,
        completed: false,
        focus: w.focus,
      };
    });

  console.log('Calculated upcomingWorkouts:', upcomingWorkouts);

  // Derive future workouts until next rest day (for dropdown)
  const allUpcomingIncludingRest = schedule
    .filter(w => !completedWorkoutIds.has(w.id))
    .map((w, index) => {
      let scheduled;
      const today = new Date('2025-11-11');
      const daysDiff = Math.floor((w.dateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 0) {
        scheduled = 'Today, 6:00 PM';
      } else if (daysDiff === 1) {
        scheduled = 'Tomorrow, 6:00 PM';
      } else {
        scheduled = w.date;
      }
      
      return {
        ...w,
        scheduled,
        completed: false,
      };
    });

  // Future workouts until next rest day (excluding today's workout)
  const futureWorkoutsUntilRest = upcomingWorkouts.slice(1);

  // Total completed workouts count
  const totalCompletedWorkouts = completedWorkoutIds.size;

  // Process completed workouts from prop to derive recent completed workouts
  // Update the state with completed workout details from props
  useEffect(() => {
    if (completedWorkouts && completedWorkouts.length > 0) {
      const newDetails: Record<string, any> = {};
      completedWorkouts.forEach(({ workoutId, completedWorkout }) => {
        newDetails[workoutId] = completedWorkout;
      });
      
      setCompletedWorkoutsDetails(prev => ({
        ...prev,
        ...newDetails
      }));
    }
  }, [completedWorkouts]);

  // Find all completed workouts since last rest day
  const completedSinceLastRest = [];
  for (const workout of schedule) {
    if (workout.isRestDay && completedWorkoutIds.has(workout.id)) {
      break;
    }
    if (completedWorkoutIds.has(workout.id)) {
      completedSinceLastRest.unshift(workout);
    }
  }
  
  const recentCompletedWorkouts = completedSinceLastRest
    .map(w => {
      // If we have detailed completion data, use it
      // Otherwise, create a default completed workout from scheduled data
      if (completedWorkoutsDetails[w.id]) {
        return completedWorkoutsDetails[w.id];
      }
      return {
        id: w.id,
        name: w.name,
        duration: w.duration,
        targetDuration: w.duration,
        completionPercentage: 100,
        workoutNotes: '',
        exercises: w.exercises.map(ex => ({
          name: ex.name,
          targetSets: ex.sets,
          targetReps: ex.reps,
          completedSets: ex.sets,
          completedReps: ex.reps,
          rest: ex.rest,
          notes: ex.notes,
          setDetails: ex.setDetails,
        })),
        difficulty: w.difficulty,
        date: w.date,
        focus: w.focus,
      };
    });

  // Group completed workouts by weeks for the history view
  const completedWorkoutsByWeek = [
    // This week
    schedule
      .filter(w => completedWorkoutIds.has(w.id))
      .filter(w => {
        const date = w.dateObj;
        return date >= new Date('2025-11-04') && date <= new Date('2025-11-10');
      })
      .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime())
      .map(w => completedWorkoutsDetails[w.id]),
    // Last week
    schedule
      .filter(w => completedWorkoutIds.has(w.id))
      .filter(w => {
        const date = w.dateObj;
        return date >= new Date('2025-10-28') && date <= new Date('2025-11-03');
      })
      .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime())
      .map(w => completedWorkoutsDetails[w.id]),
    // 2 weeks ago
    schedule
      .filter(w => completedWorkoutIds.has(w.id))
      .filter(w => {
        const date = w.dateObj;
        return date >= new Date('2025-10-20') && date <= new Date('2025-10-27');
      })
      .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime())
      .map(w => completedWorkoutsDetails[w.id]),
  ].filter(week => week.length > 0);

  // Generate week workouts for training plan (all workouts in a week view)
  const generateWeekWorkouts = (weekOffsetValue: number): DayWorkout[] => {
    // Calculate date ranges for different weeks
    let startDate: Date;
    let endDate: Date;
    
    if (weekOffsetValue === 0) {
      startDate = new Date('2025-11-11');
      endDate = new Date('2025-11-17');
    } else if (weekOffsetValue === -1) {
      startDate = new Date('2025-11-04');
      endDate = new Date('2025-11-10');
    } else if (weekOffsetValue === -2) {
      startDate = new Date('2025-10-28');
      endDate = new Date('2025-11-03');
    } else if (weekOffsetValue === -3) {
      startDate = new Date('2025-10-20');
      endDate = new Date('2025-10-27');
    } else if (weekOffsetValue === 1) {
      startDate = new Date('2025-11-18');
      endDate = new Date('2025-11-24');
    } else {
      startDate = new Date('2025-11-11');
      endDate = new Date('2025-11-17');
    }
    
    return schedule
      .filter(w => {
        const date = w.dateObj;
        return date >= startDate && date <= endDate;
      })
      .map(w => ({
        day: w.day,
        date: w.date,
        workoutName: w.name,
        duration: w.duration,
        difficulty: w.difficulty,
        focus: w.focus,
        exercises: w.exercises,
        isRestDay: w.isRestDay,
        isCompleted: completedWorkoutIds.has(w.id),
        workoutId: w.id,
      }));
  };

  const currentWeekWorkouts = completedWorkoutsByWeek[planWeekOffset] || [];
  const totalWeeksOfHistory = completedWorkoutsByWeek.length;

  const handleStartWorkout = (workoutId: string) => {
    setActiveWorkoutId(workoutId);
  };

  const handleWorkoutComplete = (workoutId: number | string, completed: boolean, exercises?: Exercise[], workoutNotes?: string, energyLevel?: number) => {
    const workoutIdStr = workoutId.toString();
    
    if (completed) {
      // Mark workout as completed - use the actual workout ID
      setCompletedWorkoutIds((prev) => {
        const next = new Set(prev);
        next.add(workoutIdStr);
        return next;
      });
      
      // Save the detailed workout performance data
      if (exercises) {
        const workout = schedule.find(w => w.id === workoutIdStr);
        if (workout) {
          // Add exercise sets to the shared state
          if (onAddExerciseSet) {
            exercises.forEach(ex => {
              if (ex.setDetails && ex.setDetails.length > 0) {
                // Find the best set (heaviest weight with most reps)
                const bestSet = ex.setDetails
                  .filter(s => s.completed && s.weight && s.reps)
                  .reduce((best, current) => {
                    const currentWeight = parseFloat(current.weight) || 0;
                    const currentReps = parseInt(current.reps) || 0;
                    const bestWeight = parseFloat(best?.weight) || 0;
                    const bestReps = parseInt(best?.reps) || 0;
                    
                    // Prioritize weight first, then reps
                    if (currentWeight > bestWeight || (currentWeight === bestWeight && currentReps > bestReps)) {
                      return current;
                    }
                    return best;
                  }, ex.setDetails[0]);
                
                if (bestSet && bestSet.weight && bestSet.reps) {
                  const setData: ExerciseSet = {
                    id: `set-${workoutIdStr}-${ex.name}-${Date.now()}`,
                    exerciseName: ex.name,
                    weight: parseFloat(bestSet.weight),
                    reps: parseInt(bestSet.reps),
                    date: workout.dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    dateObj: workout.dateObj,
                    workoutName: workout.name,
                    notes: ex.exerciseNotes,
                  };
                  onAddExerciseSet(setData);
                }
              }
            });
          }
          
          // Store the completed workout detail
          const completedWorkoutDetail: CompletedWorkoutDetail = {
            id: workoutIdStr,
            name: workout.name,
            date: workout.dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            duration: workout.duration,
            targetDuration: workout.duration,
            difficulty: workout.difficulty,
            focus: workout.focus,
            completionPercentage: 100,
            workoutNotes: workoutNotes || '',
            energyLevel: energyLevel,
            exercises: exercises.map(ex => ({
              name: ex.name,
              targetSets: ex.sets,
              targetReps: ex.reps,
              completedSets: ex.setDetails ? ex.setDetails.filter(s => s.completed).length : ex.sets,
              completedReps: ex.reps,
              rest: ex.rest,
              notes: ex.exerciseNotes,
            })),
          };
          
          setCompletedWorkoutsDetails(prev => ({
            ...prev,
            [workoutIdStr]: completedWorkoutDetail,
          }));
        }
      }
      
      // Close active workout
      setActiveWorkoutId(null);
    } else {
      // Remove from completed
      setCompletedWorkoutIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(workoutIdStr);
        return newSet;
      });
    }
  };

  const handleToggleWorkoutComplete = (workoutName: string, day: string) => {
    // Find the workout by name and day
    const workout = schedule.find(w => w.name === workoutName && w.day === day);
    if (workout) {
      setCompletedWorkoutIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(workout.id)) {
          newSet.delete(workout.id);
        } else {
          newSet.add(workout.id);
        }
        return newSet;
      });
    }
  };

  const handleUncompleteWorkout = (workoutId: string) => {
    setCompletedWorkoutIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(workoutId);
      return newSet;
    });
  };

  const activeWorkout = upcomingWorkouts.find(w => w.id.toString() === activeWorkoutId);

  return (
    <div className="space-y-4 md:space-y-6 max-w-6xl p-3 md:p-6 min-h-full w-full" style={{ background: 'oklch(0.14 0.012 240)' }}>
      {/* Current Training Plan */}
      {!activeWorkout && (
        <Card 
          className="p-4 md:p-6 bg-gradient-to-br from-training-primary to-training-secondary border-0 cursor-pointer hover:shadow-md transition-all"
          onClick={() => setIsPlanDialogOpen(true)}
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-0">
            <div className="flex items-start gap-3 md:gap-4">
              <div className="p-2 md:p-3 bg-white/20 rounded-xl flex-shrink-0">
                <Calendar className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="text-white">{currentPlan.name}</h3>
                  <Badge variant="outline" className="bg-white/20 text-white border-white/30">Active</Badge>
                </div>
                <p className="text-sm text-white mb-2 md:mb-3">{currentPlan.focus}</p>
                <div className="flex items-center gap-3 md:gap-4 text-sm text-white flex-wrap">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>Week {currentPlan.currentWeek} of {currentPlan.duration.split(' ')[0]}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={(e) => { e.stopPropagation(); setIsOverviewDialogOpen(true); }}
                className="flex-1 md:flex-initial bg-white/10 text-white border-white/30 hover:bg-white/20"
              >
                About Plan
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={(e) => { e.stopPropagation(); setIsPlanDialogOpen(true); }}
                className="flex-1 md:flex-initial bg-white/10 text-white border-white/30 hover:bg-white/20"
              >
                View Full Plan
              </Button>
            </div>
          </div>
          <div className="mt-3 md:mt-4">
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/40"
                style={{ width: `${(currentPlan.currentWeek / parseInt(currentPlan.duration.split(' ')[0])) * 100}%` }}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Active Workout or Upcoming Workouts */}
      {activeWorkout ? (
        <div>
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h3 className="text-foreground">Active Workout</h3>
            <Button variant="outline" onClick={() => setActiveWorkoutId(null)} size="sm">
              Close Workout
            </Button>
          </div>
          <WorkoutCard
            workout={activeWorkout}
            onWorkoutComplete={handleWorkoutComplete}
            isActive={true}
          />
        </div>
      ) : (
        <div>
          {/* Today's Workout */}
          {upcomingWorkouts.length > 0 && (
            <div className="mb-4 md:mb-6">
              <div className="mb-3 md:mb-4">
                <h3 className="text-foreground text-2xl font-semibold">Today's Workout</h3>
                <p className="text-white text-sm md:text-base">Your scheduled training session for today</p>
              </div>
              <WorkoutCard
                key={upcomingWorkouts[0].id}
                workout={upcomingWorkouts[0]}
                onClick={() => handleStartWorkout(upcomingWorkouts[0].id)}
                onWorkoutComplete={handleWorkoutComplete}
              />
            </div>
          )}

          {/* Future Upcoming Workouts in Collapsible */}
          {futureWorkoutsUntilRest.length > 0 && (
            <Collapsible open={isUpcomingWorkoutsOpen} onOpenChange={setIsUpcomingWorkoutsOpen}>
              <CollapsibleTrigger asChild>
                <Card className="p-4 cursor-pointer hover:bg-accent/50 transition-colors mb-3 md:mb-4 bg-gradient-to-br from-training-primary/20 via-training-primary/10 to-training-secondary/20 backdrop-blur-sm border border-training-primary/30">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-foreground">Upcoming Workouts</h3>
                        <Badge className="bg-training-primary/20 text-training-primary border-0">
                          {futureWorkoutsUntilRest.length}
                        </Badge>
                      </div>
                      <p className="text-white text-sm md:text-base">Workouts before your next rest day</p>
                    </div>
                    <ChevronDown 
                      className={`h-5 w-5 text-foreground transition-transform ${ 
                        isUpcomingWorkoutsOpen ? 'rotate-180' : ''
                      }`} 
                    />
                  </div>
                </Card>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-3">
                  {futureWorkoutsUntilRest.map((workout) => (
                    <WorkoutCard
                      key={workout.id}
                      workout={workout}
                      onClick={() => handleStartWorkout(workout.id)}
                      onWorkoutComplete={handleWorkoutComplete}
                    />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      )}

      {/* Recent Activity */}
      {!activeWorkout && (
        <Collapsible open={isRecentWorkoutsOpen} onOpenChange={setIsRecentWorkoutsOpen} className="md:block">
          {/* Mobile: Clickable header */}
          <CollapsibleTrigger asChild className="md:pointer-events-none">
            <Card className="p-4 md:p-0 md:bg-transparent md:border-0 md:shadow-none cursor-pointer md:cursor-default hover:bg-accent/50 md:hover:bg-transparent transition-colors mb-3 md:mb-4 bg-gradient-to-br from-training-primary/20 via-training-primary/10 to-training-secondary/20 backdrop-blur-sm md:bg-transparent border-training-primary/30 md:border-0">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-foreground">Recent Activity</h3>
                    <Badge className="bg-stats-primary/20 text-stats-primary border-0">
                      {totalCompletedWorkouts}
                    </Badge>
                  </div>
                  <p className="text-white text-sm md:text-base">Your completed workouts</p>
                </div>
                <ChevronDown 
                  className={`h-5 w-5 text-foreground transition-transform md:hidden ${ 
                    isRecentWorkoutsOpen ? 'rotate-180' : ''
                  }`} 
                />
              </div>
            </Card>
          </CollapsibleTrigger>

          {/* Content */}
          <CollapsibleContent className="md:block">
            <ScrollArea className="max-h-[400px]">
              <Card className="p-3 md:p-4" style={{ background: 'oklch(0.16 0.012 240)' }}>
                {recentCompletedWorkouts.length > 0 ? (
                  <div className="space-y-2 md:space-y-3 pr-2 md:pr-4">
                    {recentCompletedWorkouts.map((workout, index) => (
                      <div
                        key={index}
                        className="flex flex-col md:flex-row md:items-center md:justify-between py-3 px-3 rounded-lg hover:bg-muted transition-colors gap-3 md:gap-0"
                      >
                        <div 
                          className="flex items-start md:items-center gap-3 flex-1 cursor-pointer"
                          onClick={() => setSelectedCompletedWorkout(workout)}
                        >
                          <div className="p-2 bg-training-primary/10 rounded-lg flex-shrink-0">
                            <CheckCircle className="h-4 w-4 text-training-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <p className="text-foreground">{workout.name}</p>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  workout.completionPercentage === 100 
                                    ? 'bg-success/10 text-success border-0'
                                    : 'bg-muted'
                                }`}
                              >
                                {workout.completionPercentage}% complete
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-white flex-wrap">
                              <span>{workout.date}</span>
                              <span>•</span>
                              <span>{workout.duration}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUncompleteWorkout(workout.id)}
                          className="w-full md:w-auto"
                        >
                          Mark Incomplete
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-white">No completed workouts yet</p>
                  </div>
                )}
              </Card>
            </ScrollArea>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Dialogs */}
      <TrainingPlanDialog
        open={isPlanDialogOpen}
        onOpenChange={setIsPlanDialogOpen}
        planName={currentPlan.name}
        currentWeek={currentPlan.currentWeek}
        totalWeeks={parseInt(currentPlan.duration.split(' ')[0])}
        weekWorkouts={generateWeekWorkouts(planWeekOffset)}
        onToggleWorkoutComplete={handleToggleWorkoutComplete}
        onWeekChange={(offset) => setPlanWeekOffset(offset)}
        completedWorkoutsDetails={completedWorkoutsDetails}
      />
      <TrainingPlanOverviewDialog
        open={isOverviewDialogOpen}
        onOpenChange={setIsOverviewDialogOpen}
      />
      {selectedCompletedWorkout && (
        <WorkoutPerformanceDialog
          workout={selectedCompletedWorkout}
          open={true}
          onOpenChange={(open) => !open && setSelectedCompletedWorkout(null)}
        />
      )}
    </div>
  );
};

export default TrainingView;