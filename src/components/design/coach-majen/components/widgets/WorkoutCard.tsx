import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Clock, Dumbbell, CheckCircle, Circle, Info, ChevronLeft, StickyNote, Zap, ChevronDown } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';
import { ScrollArea } from '../ui/scroll-area';
import { getExerciseDetail, ExerciseDetail } from '../../lib/exerciseDatabase';
import { ExerciseTrackingDialog, SetDetail } from './ExerciseTrackingDialog';
import { Textarea } from '../ui/textarea';
import { ExerciseDetailsDialog } from './ExerciseDetailsDialog';
import { exerciseDetailsData } from '../../data/exerciseDetails';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  notes?: string;
  completed?: boolean;
  setDetails?: SetDetail[];
  exerciseNotes?: string;
  recommendedWeight?: string;  // Coach's recommended weight
  recommendedRPE?: string;     // Coach's recommended RPE
}

interface Workout {
  id: number | string;
  name: string;
  duration: string;
  exercises: Exercise[];
  difficulty: string;
  scheduled: string;
  completed: boolean;
  focus: string[];
  workoutNotes?: string;
  energyLevel?: number;
  workoutSatisfaction?: number; // 1-10 rating for workout satisfaction
}

interface WorkoutCardProps {
  workout: Workout;
  onWorkoutComplete?: (workoutId: number | string, completed: boolean, exercises?: Exercise[], workoutNotes?: string, energyLevel?: number, workoutSatisfaction?: number) => void;
  onClick?: () => void;
  isActive?: boolean;
}

export function WorkoutCard({ workout, onWorkoutComplete, onClick, isActive = false }: WorkoutCardProps) {
  const [exercises, setExercises] = useState(workout.exercises);
  const [isCompleted, setIsCompleted] = useState(workout.completed);
  const [selectedExercise, setSelectedExercise] = useState<{ exercise: Exercise; detail: ExerciseDetail } | null>(null);
  const [trackingExerciseIndex, setTrackingExerciseIndex] = useState<number | null>(null);
  const [workoutNotes, setWorkoutNotes] = useState(workout.workoutNotes || '');
  const [energyLevel, setEnergyLevel] = useState(workout.energyLevel || 5);
  const [workoutSatisfaction, setWorkoutSatisfaction] = useState(workout.workoutSatisfaction || 5);
  const [selectedExerciseForDetails, setSelectedExerciseForDetails] = useState<string | null>(null);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);

  // Initialize setDetails for exercises if they don't exist
  const initializeExerciseTracking = (exercise: Exercise): Exercise => {
    if (!exercise.setDetails) {
      return {
        ...exercise,
        setDetails: Array.from({ length: exercise.sets }, (_, i) => ({
          setNumber: i + 1,
          completed: false,
          weight: '',
          reps: '',
          restTime: '',
        })),
        exerciseNotes: exercise.exerciseNotes || '',
      };
    }
    return exercise;
  };

  // Ensure all exercises have tracking data
  useState(() => {
    const initializedExercises = workout.exercises.map(initializeExerciseTracking);
    if (JSON.stringify(initializedExercises) !== JSON.stringify(exercises)) {
      setExercises(initializedExercises);
    }
  });

  const difficultyColors: Record<string, string> = {
    'Beginner': 'bg-success/10 text-success border-success/10',
    'Intermediate': 'bg-accent text-accent-foreground border-accent-foreground/10',
    'Advanced': 'bg-destructive/10 text-destructive border-destructive/10',
  };

  const handleWorkoutToggle = (checked: boolean) => {
    setIsCompleted(checked);
    if (checked) {
      // Mark all exercises as completed
      const allCompleted = exercises.map(ex => ({ ...ex, completed: true }));
      setExercises(allCompleted);
    }
    onWorkoutComplete?.(workout.id, checked, exercises, workoutNotes, energyLevel, workoutSatisfaction);
  };

  const handleExerciseToggle = (index: number) => {
    const newExercises = [...exercises];
    newExercises[index] = { ...newExercises[index], completed: !newExercises[index].completed };
    setExercises(newExercises);

    // Check if all exercises are completed
    const allCompleted = newExercises.every(ex => ex.completed);
    if (allCompleted && !isCompleted) {
      // Show completion dialog instead of auto-completing
      setShowCompletionDialog(true);
    }
  };

  const handleCompleteWorkout = () => {
    // Mark all exercises as completed if not already
    const allCompleted = exercises.map(ex => {
      const completedSets = ex.setDetails?.map(set => ({ ...set, completed: true })) || [];
      return {
        ...ex,
        completed: true,
        setDetails: completedSets.length > 0 ? completedSets : ex.setDetails,
      };
    });
    setExercises(allCompleted);
    setIsCompleted(true);
    onWorkoutComplete?.(workout.id, true, allCompleted, workoutNotes, energyLevel, workoutSatisfaction);
  };

  const handleConfirmCompletion = () => {
    setIsCompleted(true);
    onWorkoutComplete?.(workout.id, true, exercises, workoutNotes, energyLevel, workoutSatisfaction);
    setShowCompletionDialog(false);
  };

  const handleCancelCompletion = () => {
    // Uncheck the last exercise to allow user to continue
    const lastCheckedIndex = exercises.findIndex((ex, idx) => {
      return idx === exercises.length - 1 || !exercises[idx + 1]?.completed;
    });
    if (lastCheckedIndex >= 0) {
      const newExercises = [...exercises];
      newExercises[lastCheckedIndex] = { ...newExercises[lastCheckedIndex], completed: false };
      setExercises(newExercises);
    }
    setShowCompletionDialog(false);
  };

  const handleSaveExerciseTracking = (index: number, setDetails: SetDetail[], notes: string) => {
    const newExercises = [...exercises];
    const completedSetsCount = setDetails.filter(s => s.completed).length;
    
    newExercises[index] = {
      ...newExercises[index],
      setDetails,
      exerciseNotes: notes,
      // Mark as completed if ANY sets are completed (allows partial completion)
      completed: completedSetsCount > 0,
    };
    
    setExercises(newExercises);

    // Check if all exercises are completed
    const allCompleted = newExercises.every(ex => ex.completed);
    if (allCompleted && !isCompleted) {
      setIsCompleted(true);
      onWorkoutComplete?.(workout.id, true, newExercises, workoutNotes, energyLevel, workoutSatisfaction);
    }
  };

  const completedCount = exercises.filter(ex => ex.completed).length;

  // Format date for display in completion button (e.g., "Nov 11")
  const formatDateForButton = (dateString: string): string => {
    // Handle special cases
    if (dateString.startsWith('Today')) {
      const today = new Date();
      const month = today.toLocaleDateString('en-US', { month: 'short' });
      const day = today.getDate();
      return `${month} ${day}`;
    }
    if (dateString.startsWith('Tomorrow')) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const month = tomorrow.toLocaleDateString('en-US', { month: 'short' });
      const day = tomorrow.getDate();
      return `${month} ${day}`;
    }
    
    // If it's already in "Nov 11" format, return as is
    if (dateString.match(/^[A-Za-z]{3}\s\d{1,2}$/)) {
      return dateString;
    }
    
    // Try to parse as date
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        const day = date.getDate();
        return `${month} ${day}`;
      }
    } catch (e) {
      // If parsing fails, return a fallback
    }
    
    return dateString;
  };

  if (isActive) {
    // Detailed view when workout is started
    return (
      <>
        <Card className="p-6 bg-gradient-to-br from-training-primary/20 via-training-primary/10 to-training-secondary/20 backdrop-blur-sm border border-training-primary/30">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-foreground">{workout.name}</h3>
                {isCompleted && (
                  <Badge className="bg-success/10 text-success border-success/10">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                )}
              </div>
              <p className="text-sm text-white">{workout.scheduled}</p>
            </div>
            <Badge variant="outline" className={`border ${difficultyColors[workout.difficulty]}`}>
              {workout.difficulty}
            </Badge>
          </div>

          {/* Energy Level Slider */}
          <div className="space-y-1.5">
            {/* Label */}
            <div className="flex items-center justify-between">
              <label className="text-sm text-white">Rate your energy level</label>
              <Badge variant="outline" className={`text-xs px-2 py-0.5 transition-all ${
                energyLevel <= 3
                  ? 'bg-gradient-to-br from-energy-dark/20 to-destructive/20 border-energy-dark/10 text-energy-dark'
                  : energyLevel <= 6
                  ? 'bg-gradient-to-br from-energy/20 to-energy-dark/20 border-energy/10 text-energy'
                  : 'bg-gradient-to-br from-energy/20 to-amber-400/20 border-amber-400/10 text-amber-400'
              }`}>
                {energyLevel}/10
              </Badge>
            </div>
            
            {/* Compact Slider */}
            <div className="relative">
              <input
                type="range"
                min="1"
                max="10"
                value={energyLevel}
                onChange={(e) => {
                  const level = parseInt(e.target.value);
                  setEnergyLevel(level);
                  onWorkoutComplete?.(workout.id, isCompleted, exercises, workoutNotes, level, workoutSatisfaction);
                }}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer slider-thumb-compact"
                style={{
                  background: energyLevel <= 3 
                    ? 'linear-gradient(to right, rgb(220, 38, 38), rgb(239, 68, 68))' 
                    : energyLevel <= 6 
                    ? 'linear-gradient(to right, rgb(234, 88, 12), rgb(249, 115, 22))' 
                    : 'linear-gradient(to right, rgb(249, 115, 22), rgb(251, 191, 36))'
                }}
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center text-sm text-white mb-2">
              <span>Progress</span>
              <span>{completedCount} / {exercises.length} exercises</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-success via-success to-success/80 transition-all"
                style={{ width: `${(completedCount / exercises.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            {exercises.map((exercise, index) => {
              // Use exercise directly, not initialized version, to preserve saved data
              const completedSets = exercise.setDetails?.filter(s => s.completed).length || 0;
              const totalSets = exercise.sets;
              
              // Get actual completed data from setDetails
              const completedSetDetails = exercise.setDetails?.filter(s => s.completed) || [];
              const hasCompletedData = completedSetDetails.length > 0;
              
              // Calculate average/summary of completed data
              let displayWeight = '';
              let displayReps = '';
              let displayRest = '';
              
              if (hasCompletedData) {
                const weights = completedSetDetails.map(s => s.weight).filter(w => w);
                const reps = completedSetDetails.map(s => s.reps).filter(r => r);
                const rests = completedSetDetails.map(s => s.restTime).filter(r => r);
                
                if (weights.length > 0) {
                  displayWeight = weights.length === 1 ? weights[0] : `${Math.min(...weights.map(Number))} - ${Math.max(...weights.map(Number))}`;
                }
                if (reps.length > 0) {
                  displayReps = reps.length === 1 ? reps[0] : `${Math.min(...reps.map(Number))} - ${Math.max(...reps.map(Number))}`;
                }
                if (rests.length > 0) {
                  displayRest = rests.length === 1 ? `${rests[0]}s` : `${Math.min(...rests.map(Number))} - ${Math.max(...rests.map(Number))}s`;
                }
              }
              
              return (
                <Card 
                  key={index} 
                  className={`relative overflow-hidden transition-all cursor-pointer hover:shadow-xl shadow-lg ${
                    exercise.completed ? 'bg-success/5 border-success/10' : 'bg-slate-800/30 hover:bg-slate-800/40 border-slate-700/10'
                  } p-3 md:p-5`}
                  onClick={() => setTrackingExerciseIndex(index)}
                >
                  {/* Completed - Collapsed View */}
                  {exercise.completed && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExerciseToggle(index);
                        }}
                        className="w-8 h-8 md:w-10 md:h-10 rounded-full md:rounded-lg flex items-center justify-center border border-success/10 transition-all flex-shrink-0 bg-success text-white hover:bg-success/80"
                      >
                        <CheckCircle className="h-4 w-4 md:h-5 md:w-5" />
                      </button>
                      
                      <h4 className="flex-1 line-through text-white/70">
                        {exercise.name}
                      </h4>
                      
                      <Badge variant="outline" className="text-xs px-2 py-0.5 bg-success/10 text-success border-success/10">
                        ✓ Done
                      </Badge>
                    </div>
                  )}
                  
                  {/* Not Completed - Full View */}
                  {!exercise.completed && (
                    <>
                      {/* Mobile: Vertical accent bar on left */}
                      {/* Removed orange accent bar */}
                      
                      {/* MOBILE LAYOUT (hidden on md+) */}
                      <div className="md:hidden">
                        {/* Header: Checkbox + Name + Info */}
                        <div className="flex items-center gap-3 mb-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExerciseToggle(index);
                        }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all flex-shrink-0 group ${ 
                          exercise.completed
                            ? 'bg-success border-success/10 text-white'
                            : 'bg-success/5 border-success/10 hover:bg-success hover:border-success/10 hover:text-white'
                        }`}
                      >
                        {exercise.completed ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <>
                            <span className="text-foreground text-xs group-hover:hidden">{index + 1}</span>
                            <CheckCircle className="h-4 w-4 hidden group-hover:block" />
                          </>
                        )}
                      </button>
                      
                      <h4 className={`flex-1 ${exercise.completed ? 'line-through text-white/70' : 'text-foreground'}`}>
                        {exercise.name}
                      </h4>
                      
                      {completedSets > 0 && (
                        <Badge variant="outline" className={`text-xs px-1.5 py-0 ${
                          completedSets === totalSets 
                            ? 'bg-success/10 text-success border-success/10' 
                            : 'bg-energy/10 text-white border-energy/10'
                        }`}>
                          {completedSets}/{totalSets}
                        </Badge>
                      )}
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setTrackingExerciseIndex(index);
                        }}
                        className="flex-shrink-0 px-2.5 py-1 bg-energy/10 hover:bg-energy/20 border border-energy/10 hover:border-energy rounded-md transition-all flex items-center gap-1.5"
                      >
                        <Dumbbell className="h-3.5 w-3.5 text-energy" />
                        <span className="text-xs text-energy font-medium">Log</span>
                      </button>
                    </div>
                    
                    {(() => {
                      const hasRecommendations = exercise.recommendedWeight || exercise.recommendedRPE || exercise.setDetails?.some(s => s.recommendedWeight || s.recommendedRPE);
                      const hasUserData = exercise.setDetails?.some(s => s.weight || s.reps || s.restTime);
                      const hasPerSetData = exercise.setDetails?.some(s => s.recommendedWeight || s.recommendedRPE || s.recommendedReps);
                      
                      return (
                        <>
                          {/* Coach Recommendations - Compact Mobile */}
                          {hasPerSetData && !hasUserData && (
                            <div className="space-y-3">
                              <div className="space-y-2.5">
                                {exercise.setDetails?.map((set) => (
                                  (set.recommendedWeight || set.recommendedRPE || set.recommendedReps) && (
                                    <div key={set.setNumber} className="flex items-center gap-3 text-base text-white">
                                      <span className="text-purple-400 w-8 font-semibold">#{set.setNumber}</span>
                                      {set.recommendedWeight && <span className="font-semibold">{set.recommendedWeight}</span>}
                                      {set.recommendedReps && <span>× {set.recommendedReps}</span>}
                                      {set.recommendedRPE && <span className="text-purple-400 ml-auto flex items-center gap-1.5">{(10 - parseFloat(set.recommendedRPE)).toFixed(1).replace(/\.0$/, '')} RIR</span>}
                                    </div>
                                  )
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Fallback: General Recommendations - Mobile */}
                          {hasRecommendations && !hasPerSetData && !hasUserData && (
                            <div className="space-y-2.5">
                              {Array.from({ length: exercise.sets }, (_, i) => i + 1).map((setNum) => (
                                <div key={setNum} className="flex items-center gap-3 text-base text-white">
                                  <span className="text-purple-400 w-8 font-semibold">#{setNum}</span>
                                  {exercise.recommendedWeight && <span className="font-semibold">{exercise.recommendedWeight}</span>}
                                  {exercise.reps && <span>× {exercise.reps}</span>}
                                  {exercise.recommendedRPE && <span className="text-purple-400 ml-auto">{(10 - parseFloat(exercise.recommendedRPE)).toFixed(1).replace(/\.0$/, '')} RIR</span>}
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* User's Logged Data - Mobile Compact List */}
                          {hasUserData && (
                            <div className="space-y-1.5">
                              {exercise.setDetails
                                ?.filter(set => set.weight || set.reps || set.restTime)
                                .map((set) => (
                                  <div key={set.setNumber} className="flex items-center gap-2 text-sm">
                                    <span className={`text-sm ${set.completed ? 'text-success' : 'text-white'}`}>
                                      {set.completed ? '✓' : '○'}
                                    </span>
                                    <span className="text-white w-6">#{set.setNumber}</span>
                                    <div className="flex items-center gap-1.5 text-white">
                                      {set.weight && <span className="font-medium">{set.weight}kg</span>}
                                      {set.reps && <span>× {set.reps}</span>}
                                    </div>
                                  </div>
                                ))
                              }
                            </div>
                          )}
                          
                          {/* Notes - Mobile */}
                          {(exercise.notes || exercise.exerciseNotes) && (
                            <p className="text-xs text-white italic mt-2">
                              {exercise.notes || exercise.exerciseNotes}
                            </p>
                          )}
                          
                          {/* Fallback - Mobile */}
                          {!hasRecommendations && !hasUserData && (
                            <div className="text-xs text-white">
                              {exercise.sets} sets × {exercise.reps} reps • {exercise.rest} rest
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                  
                  {/* DESKTOP LAYOUT (hidden on mobile, shown on md+) */}
                  <div className="hidden md:block">
                    {/* Header: Name + Badges + Info */}
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5 flex-wrap flex-1 min-w-0">
                        <h4 className={`${exercise.completed ? 'line-through text-white/70' : 'text-foreground'}`}>
                          {exercise.name}
                        </h4>
                        {completedSets > 0 && (
                          <Badge variant="outline" className={`text-xs px-2 py-0.5 ${
                            completedSets === totalSets 
                              ? 'bg-success/10 text-success border-success/10' 
                              : 'bg-energy/10 text-white border-energy/10'
                          }`}>
                            {completedSets}/{totalSets}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTrackingExerciseIndex(index);
                          }}
                          className="px-2.5 py-1 bg-energy/10 hover:bg-energy/20 border border-energy/10 hover:border-energy rounded-md transition-all flex items-center gap-1.5"
                        >
                          <Dumbbell className="h-3.5 w-3.5 text-energy" />
                          <span className="text-xs text-energy font-medium">Log</span>
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExerciseToggle(index);
                          }}
                          className={`w-11 h-11 rounded-lg flex items-center justify-center border transition-all ${ 
                            exercise.completed
                              ? 'bg-success border-success/10 text-white'
                              : 'bg-success/5 border-success/10 hover:bg-success hover:border-success/10 hover:text-white'
                          }`}
                        >
                          {exercise.completed ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <span className="text-foreground text-sm">{index + 1}</span>
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {(() => {
                      const hasRecommendations = exercise.recommendedWeight || exercise.recommendedRPE || exercise.setDetails?.some(s => s.recommendedWeight || s.recommendedRPE);
                      const hasUserData = exercise.setDetails?.some(s => s.weight || s.reps || s.restTime);
                      const hasPerSetData = exercise.setDetails?.some(s => s.recommendedWeight || s.recommendedRPE || s.recommendedReps);
                      
                      return (
                        <>
                          {/* Coach Recommendations - Desktop Grid */}
                          {hasPerSetData && !hasUserData && (
                            <div className="grid grid-cols-2 gap-2.5">
                              {exercise.setDetails?.map((set) => (
                                (set.recommendedWeight || set.recommendedRPE || set.recommendedReps) && (
                                  <div 
                                    key={set.setNumber}
                                    className="flex items-center gap-2.5 px-3 py-2.5 bg-purple-500/5 border border-purple-400/10 rounded-md"
                                  >
                                    <span className="text-purple-400 font-mono text-sm w-4 flex-shrink-0">{set.setNumber}</span>
                                    <div className="flex items-center gap-2 text-white flex-1 min-w-0">
                                      {set.recommendedWeight && <span className="font-medium">{set.recommendedWeight}</span>}
                                      {set.recommendedReps && <span className="text-white">× {set.recommendedReps}</span>}
                                      {set.recommendedRPE && <span className="text-purple-400/70 text-xs ml-auto">{(10 - parseFloat(set.recommendedRPE)).toFixed(1).replace(/\.0$/, '')} RIR</span>}
                                    </div>
                                  </div>
                                )
                              ))}
                            </div>
                          )}
                          
                          {/* Fallback: General Recommendations - Desktop */}
                          {hasRecommendations && !hasPerSetData && !hasUserData && (
                            <div className="grid grid-cols-2 gap-2.5">
                              <div className="flex items-center gap-2.5 px-3 py-2.5 bg-purple-500/5 border border-purple-400/10 rounded-md col-span-2">
                                <div className="flex items-center gap-2 text-white flex-1 min-w-0 flex-wrap">
                                  {exercise.recommendedWeight && (
                                    <span className="font-medium">{exercise.recommendedWeight}</span>
                                  )}
                                  {exercise.sets && exercise.reps && (
                                    <>
                                      <span className="text-white">•</span>
                                      <span className="text-white">{exercise.sets}×{exercise.reps}</span>
                                    </>
                                  )}
                                  {exercise.recommendedRPE && (
                                    <>
                                      <span className="text-white">•</span>
                                      <span className="text-purple-400/70 text-xs">{(10 - parseFloat(exercise.recommendedRPE)).toFixed(1).replace(/\.0$/, '')} RIR</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* User's Logged Data - Desktop Grid */}
                          {hasUserData && (
                            <div className="grid grid-cols-2 gap-2.5">
                              {exercise.setDetails
                                ?.filter(set => set.weight || set.reps || set.restTime)
                                .map((set) => (
                                  <div 
                                    key={set.setNumber}
                                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-md border ${
                                      set.completed 
                                        ? 'bg-success/5 border-success/10' 
                                        : 'bg-muted/20 border-muted/10'
                                    }`}
                                  >
                                    <span className={`text-base ${set.completed ? 'text-success' : 'text-white'}`}>
                                      {set.completed ? '✓' : '○'}
                                    </span>
                                    <span className="text-white font-mono text-sm w-4 flex-shrink-0">{set.setNumber}</span>
                                    <div className="flex items-center gap-2 text-white flex-1 min-w-0">
                                      {set.weight && <span className="font-medium">{set.weight}kg</span>}
                                      {set.reps && <span className="text-white">× {set.reps}</span>}
                                    </div>
                                  </div>
                                ))
                              }
                            </div>
                          )}
                          
                          {/* Notes - Desktop */}
                          {(exercise.notes || exercise.exerciseNotes) && (
                            <p className="text-sm text-white italic mt-2.5 line-clamp-2">
                              {exercise.notes || exercise.exerciseNotes}
                            </p>
                          )}
                          
                          {/* Fallback - Desktop */}
                          {!hasRecommendations && !hasUserData && (
                            <div className="text-sm text-white">
                              {exercise.sets} sets × {exercise.reps} reps • {exercise.rest} rest
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                    </>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Workout Notes */}
          <div className="mt-6 pt-6 border-t space-y-4">
            {/* Workout Satisfaction Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm text-white">How much did you enjoy this workout?</label>
                <Badge variant="outline" className={`text-xs px-2 py-0.5 transition-all ${
                  workoutSatisfaction <= 3
                    ? 'bg-destructive/20 border-destructive/10 text-destructive'
                    : workoutSatisfaction <= 6
                    ? 'bg-energy/20 border-energy/10 text-energy'
                    : 'bg-success/20 border-success/10 text-success'
                }`}>
                  {workoutSatisfaction}/10
                </Badge>
              </div>
              
              <div className="relative">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={workoutSatisfaction}
                  onChange={(e) => {
                    const rating = parseInt(e.target.value);
                    setWorkoutSatisfaction(rating);
                    onWorkoutComplete?.(workout.id, isCompleted, exercises, workoutNotes, energyLevel, rating);
                  }}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer slider-thumb-compact"
                  style={{
                    background: workoutSatisfaction <= 3 
                      ? 'linear-gradient(to right, rgb(220, 38, 38), rgb(239, 68, 68))' 
                      : workoutSatisfaction <= 6 
                      ? 'linear-gradient(to right, rgb(234, 88, 12), rgb(249, 115, 22))' 
                      : 'linear-gradient(to right, rgb(34, 197, 94), rgb(22, 163, 74))'
                  }}
                />
              </div>
            </div>

            {/* Notes Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <StickyNote className="h-4 w-4 text-white" />
                <h4 className="text-foreground">Workout Notes</h4>
              </div>
              <Textarea
                placeholder="Share your thoughts about this workout... What did you like? Any exercises that felt great or challenging? Modifications you made? How was your energy and motivation?" 
                value={workoutNotes}
                onChange={(e) => {
                  const newNotes = e.target.value;
                  setWorkoutNotes(newNotes);
                  // Auto-save the notes
                  onWorkoutComplete?.(workout.id, isCompleted, exercises, newNotes, energyLevel, workoutSatisfaction);
                }}
                className="min-h-[100px] resize-none"
              />
            </div>

            {/* Complete Workout Button */}
            {!isCompleted && (
              <Button
                onClick={handleCompleteWorkout}
                className="w-full bg-success hover:bg-success/90 text-white"
                size="lg"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Complete Workout
              </Button>
            )}
          </div>
        </Card>

        {/* Exercise Tracking Dialog */}
        {trackingExerciseIndex !== null && (
          <ExerciseTrackingDialog
            open={true}
            onOpenChange={(open) => !open && setTrackingExerciseIndex(null)}
            exerciseName={exercises[trackingExerciseIndex].name}
            targetSets={exercises[trackingExerciseIndex].sets}
            targetReps={exercises[trackingExerciseIndex].reps}
            targetRest={exercises[trackingExerciseIndex].rest}
            setDetails={initializeExerciseTracking(exercises[trackingExerciseIndex]).setDetails || []}
            exerciseNotes={exercises[trackingExerciseIndex].exerciseNotes || ''}
            recommendedWeight={exercises[trackingExerciseIndex].recommendedWeight}
            recommendedRPE={exercises[trackingExerciseIndex].recommendedRPE}
            onSave={(setDetails, notes) => handleSaveExerciseTracking(trackingExerciseIndex, setDetails, notes)}
          />
        )}

        {/* Exercise Detail Dialog */}
        {selectedExerciseForDetails && exerciseDetailsData[selectedExerciseForDetails] && (
          <ExerciseDetailsDialog
            open={!!selectedExerciseForDetails}
            onOpenChange={(open) => !open && setSelectedExerciseForDetails(null)}
            exerciseName={selectedExerciseForDetails}
            details={exerciseDetailsData[selectedExerciseForDetails]}
            recommendedWeight={exercises.find(ex => ex.name === selectedExerciseForDetails)?.recommendedWeight}
            recommendedRPE={exercises.find(ex => ex.name === selectedExerciseForDetails)?.recommendedRPE}
          />
        )}

        {/* Completion Dialog */}
        {showCompletionDialog && (
          <Dialog open={true} onOpenChange={setShowCompletionDialog}>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Confirm Workout Completion</DialogTitle>
                <DialogDescription>
                  All exercises are marked as complete! Before you finish, please rate your workout.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                {/* Energy Level Slider in Dialog */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-muted-foreground">Rate your energy level</label>
                    <Badge variant="outline" className={`text-xs px-2 py-0.5 transition-all ${
                      energyLevel <= 3
                        ? 'bg-gradient-to-br from-energy-dark/20 to-destructive/20 border-energy-dark/10 text-energy-dark'
                        : energyLevel <= 6
                        ? 'bg-gradient-to-br from-energy/20 to-energy-dark/20 border-energy/10 text-energy'
                        : 'bg-gradient-to-br from-energy/20 to-amber-400/20 border-amber-400/10 text-amber-400'
                    }`}>
                      {energyLevel}/10
                    </Badge>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={energyLevel}
                    onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer slider-thumb-compact"
                    style={{
                      background: energyLevel <= 3 
                        ? 'linear-gradient(to right, rgb(220, 38, 38), rgb(239, 68, 68))' 
                        : energyLevel <= 6 
                        ? 'linear-gradient(to right, rgb(234, 88, 12), rgb(249, 115, 22))' 
                        : 'linear-gradient(to right, rgb(249, 115, 22), rgb(251, 191, 36))'
                    }}
                  />
                </div>

                {/* Workout Satisfaction Slider in Dialog */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-muted-foreground">How much did you enjoy this workout?</label>
                    <Badge variant="outline" className={`text-xs px-2 py-0.5 transition-all ${
                      workoutSatisfaction <= 3
                        ? 'bg-destructive/20 border-destructive/10 text-destructive'
                        : workoutSatisfaction <= 6
                        ? 'bg-energy/20 border-energy/10 text-energy'
                        : 'bg-success/20 border-success/10 text-success'
                    }`}>
                      {workoutSatisfaction}/10
                    </Badge>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={workoutSatisfaction}
                    onChange={(e) => setWorkoutSatisfaction(parseInt(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer slider-thumb-compact"
                    style={{
                      background: workoutSatisfaction <= 3 
                        ? 'linear-gradient(to right, rgb(220, 38, 38), rgb(239, 68, 68))' 
                        : workoutSatisfaction <= 6 
                        ? 'linear-gradient(to right, rgb(234, 88, 12), rgb(249, 115, 22))' 
                        : 'linear-gradient(to right, rgb(34, 197, 94), rgb(22, 163, 74))'
                    }}
                  />
                </div>

                {/* Workout Notes in Dialog */}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Workout Notes (optional)</label>
                  <Textarea
                    placeholder="Share your thoughts... What did you like? Any exercises that felt great or challenging?"
                    value={workoutNotes}
                    onChange={(e) => setWorkoutNotes(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={handleCancelCompletion}
                >
                  Not Yet
                </Button>
                <Button
                  className="bg-success hover:bg-success/90"
                  onClick={handleConfirmCompletion}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Workout
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </>
    );
  }

  // Card view for upcoming workouts
  return (
    <Card 
      className={`p-5 hover:shadow-md transition-all bg-gradient-to-br from-training-primary/20 via-training-primary/10 to-training-secondary/20 backdrop-blur-sm border border-training-primary/30 ${
        isCompleted ? 'bg-success/5 border-success/10' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleWorkoutToggle(!isCompleted);
          }}
          className={`w-16 h-16 rounded-full flex items-center justify-center border transition-all flex-shrink-0 group ${ 
            isCompleted
              ? 'bg-success border-success/10 text-white'
              : 'bg-success/5 border-success/10 hover:bg-success hover:border-success/10 hover:text-white'
          }`}
        >
          {isCompleted ? (
            <CheckCircle className="h-6 w-6" />
          ) : (
            <>
              <span className="text-xs leading-tight text-center text-foreground group-hover:hidden">
                {formatDateForButton(workout.scheduled)}
              </span>
              <CheckCircle className="h-6 w-6 hidden group-hover:block" />
            </>
          )}
        </button>
        <div className="flex-1" onClick={onClick}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h4 className={`text-foreground ${isCompleted ? 'line-through' : ''}`}>{workout.name}</h4>
                <Badge variant="outline" className={`border text-xs ${difficultyColors[workout.difficulty]}`}>
                  {workout.difficulty}
                </Badge>
                {isCompleted && (
                  <Badge className="bg-success/10 text-success border-success/10 text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                )}
              </div>
              <p className="text-sm text-white mb-2">{workout.scheduled}</p>
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-sm text-white">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{workout.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Dumbbell className="h-4 w-4" />
                    <span>{workout.exercises.length} exercises</span>
                  </div>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {workout.focus.map((f, idx) => (
                    <Badge key={idx} className="bg-muted text-foreground border-border text-xs">{f}</Badge>
                  ))}
                </div>
              </div>

              {/* Show actual performance data if workout is completed */}
              {isCompleted && exercises.some(ex => ex.setDetails?.some(s => s.weight || s.reps || s.restTime)) && (
                <div className="mt-3 pt-3 border-t space-y-2">
                  {exercises.map((exercise, index) => {
                    const setsWithData = exercise.setDetails?.filter(s => s.weight || s.reps || s.restTime) || [];
                    if (setsWithData.length === 0) return null;
                    
                    return (
                      <div key={index} className="text-xs">
                        <div className="text-white mb-1">
                          <strong className="text-foreground">{exercise.name}</strong>
                          {exercise.exerciseNotes && <span className="ml-2 italic">💭 {exercise.exerciseNotes}</span>}
                        </div>
                        <div className="ml-3 space-y-0.5">
                          {setsWithData.map((set) => (
                            <div key={set.setNumber} className="text-white">
                              <span className={set.completed ? "text-success" : "text-white/50"}>
                                {set.completed ? "✓" : "○"}
                              </span>
                              <span className="ml-1">Set {set.setNumber}:</span>
                              {set.weight && <span className="ml-1"><strong>{set.weight} kg</strong></span>}
                              {set.reps && <span className="ml-1">× <strong>{set.reps}</strong></span>}
                              {set.restTime && <span className="ml-1 text-white">({set.restTime}s)</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {!isCompleted && (
                <Button>Start Workout</Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}