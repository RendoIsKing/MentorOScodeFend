import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { CheckCircle, Dumbbell, Clock, ChevronRight, Play, Circle, ChevronLeft, ChevronDown, ChevronUp, Share2 } from 'lucide-react';

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
  recommendedWeight?: string;
  recommendedRPE?: string;
  completed?: boolean;
  setDetails?: SetDetail[];
  exerciseNotes?: string;
}

interface WorkoutData {
  id: string;
  name: string;
  scheduled: string;
  duration: string;
  difficulty: string;
  completed: boolean;
  focus: string[];
  exercises: Exercise[];
}

interface WorkoutProgress {
  started: boolean;
  currentExerciseIndex: number;
  exercises: Exercise[];
  isComplete: boolean;
  energyLevel?: number;
  enjoyment?: number;
  notes?: string;
}

interface InteractiveWorkoutWidgetProps {
  workout: WorkoutData;
  progress?: WorkoutProgress;
  onProgressUpdate: (progress: WorkoutProgress) => void;
  onComplete: (workout: WorkoutData, progress: WorkoutProgress) => void;
  onShare?: (workout: WorkoutData, progress?: WorkoutProgress) => void;
}

export function InteractiveWorkoutWidget({
  workout,
  progress,
  onProgressUpdate,
  onComplete,
  onShare,
}: InteractiveWorkoutWidgetProps) {
  const [workoutProgress, setWorkoutProgress] = useState<WorkoutProgress>(
    progress || {
      started: false,
      currentExerciseIndex: 0,
      exercises: workout.exercises.map(ex => ({
        ...ex,
        setDetails: Array.from({ length: ex.sets }, (_, i) => ({
          setNumber: i + 1,
          completed: false,
          weight: ex.recommendedWeight?.replace(/[^0-9.]/g, '') || '',
          reps: ex.reps?.replace(/[^0-9-]/g, '') || '',
          restTime: ex.rest?.replace(/[^0-9]/g, '') || '',
        })),
      })),
      isComplete: false,
    }
  );

  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [completionData, setCompletionData] = useState({
    energyLevel: 5,
    enjoyment: 5,
    notes: '',
  });
  const [expandedExercises, setExpandedExercises] = useState<Set<number>>(new Set());

  const handleStartWorkout = () => {
    const newProgress = { ...workoutProgress, started: true };
    setWorkoutProgress(newProgress);
    onProgressUpdate(newProgress);
  };

  const handleSetChange = (setIndex: number, field: 'weight' | 'reps' | 'restTime', value: string) => {
    const newProgress = { ...workoutProgress };
    const exercise = newProgress.exercises[newProgress.currentExerciseIndex];
    
    if (exercise.setDetails && exercise.setDetails[setIndex]) {
      exercise.setDetails[setIndex][field] = value;
    }

    setWorkoutProgress(newProgress);
    onProgressUpdate(newProgress);
  };

  const handleToggleSet = (setIndex: number) => {
    const newProgress = { ...workoutProgress };
    const exercise = newProgress.exercises[newProgress.currentExerciseIndex];
    
    if (exercise.setDetails && exercise.setDetails[setIndex]) {
      exercise.setDetails[setIndex].completed = !exercise.setDetails[setIndex].completed;
    }

    // Check if all sets are completed
    const allSetsCompleted = exercise.setDetails?.every(s => s.completed);
    
    if (allSetsCompleted) {
      exercise.completed = true;
      
      // Auto-advance to next exercise or show completion (only if not manually navigating)
      setTimeout(() => {
        if (newProgress.currentExerciseIndex < newProgress.exercises.length - 1) {
          // Move to next exercise
          newProgress.currentExerciseIndex++;
          setWorkoutProgress(newProgress);
          onProgressUpdate(newProgress);
        } else {
          // All exercises done - show completion dialog
          setShowCompletionDialog(true);
        }
      }, 300);
    } else {
      // If unchecking, mark exercise as incomplete
      exercise.completed = false;
    }

    setWorkoutProgress(newProgress);
    onProgressUpdate(newProgress);
  };

  const handlePreviousExercise = () => {
    if (workoutProgress.currentExerciseIndex > 0) {
      const newProgress = { ...workoutProgress };
      newProgress.currentExerciseIndex--;
      setWorkoutProgress(newProgress);
      onProgressUpdate(newProgress);
    }
  };

  const handleNextExercise = () => {
    if (workoutProgress.currentExerciseIndex < workoutProgress.exercises.length - 1) {
      const newProgress = { ...workoutProgress };
      newProgress.currentExerciseIndex++;
      setWorkoutProgress(newProgress);
      onProgressUpdate(newProgress);
    } else {
      // Last exercise - show completion dialog
      setShowCompletionDialog(true);
    }
  };

  const handleExerciseNotesChange = (value: string) => {
    const newProgress = { ...workoutProgress };
    const exercise = newProgress.exercises[newProgress.currentExerciseIndex];
    exercise.exerciseNotes = value;
    setWorkoutProgress(newProgress);
    onProgressUpdate(newProgress);
  };

  const handleCompleteWorkout = () => {
    const finalProgress = {
      ...workoutProgress,
      isComplete: true,
      energyLevel: completionData.energyLevel,
      enjoyment: completionData.enjoyment,
      notes: completionData.notes,
    };

    const completedWorkout = {
      ...workout,
      completed: true,
      energyLevel: completionData.energyLevel,
      workoutSatisfaction: completionData.enjoyment,
      workoutNotes: completionData.notes,
      exercises: finalProgress.exercises,
    };

    setWorkoutProgress(finalProgress);
    onComplete(completedWorkout, finalProgress);
  };

  const handleDoMore = () => {
    // Go back to the last exercise
    const newProgress = { ...workoutProgress };
    newProgress.currentExerciseIndex = newProgress.exercises.length - 1;
    setWorkoutProgress(newProgress);
    onProgressUpdate(newProgress);
    setShowCompletionDialog(false);
  };

  // If workout is complete, show summary
  if (workoutProgress.isComplete) {
    const totalSets = workoutProgress.exercises.reduce((sum, ex) => sum + ex.sets, 0);
    const completedExercises = workoutProgress.exercises.filter(ex => ex.completed).length;

    return (
      <Card className="p-4 bg-card border-training-primary/10 relative">
        {/* Share Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => {
            // Share functionality placeholder
            if (onShare) {
              onShare(workout, workoutProgress);
            }
          }}
        >
          <Share2 className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-br from-training-primary to-training-secondary">
            <CheckCircle className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-foreground">Workout Completed</h3>
        </div>

        <div className="space-y-3">
          <div className="p-3 bg-training-primary/5 rounded-xl border border-training-primary/10">
            <h4 className="text-foreground mb-1">{workout.name}</h4>
            <p className="text-xs text-white">{workout.scheduled}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-muted/50 rounded-lg">
              <p className="text-xs text-white">Exercises</p>
              <p className="text-foreground">{completedExercises}/{workout.exercises.length}</p>
            </div>
            <div className="p-2 bg-muted/50 rounded-lg">
              <p className="text-xs text-white">Total Sets</p>
              <p className="text-foreground">{totalSets}</p>
            </div>
          </div>

          {workoutProgress.energyLevel && (
            <div className="p-2 bg-muted/50 rounded-lg">
              <p className="text-xs text-white">Energy Level</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-training-primary to-training-secondary"
                    style={{ width: `${workoutProgress.energyLevel * 10}%` }}
                  />
                </div>
                <p className="text-foreground text-sm">{workoutProgress.energyLevel}/10</p>
              </div>
            </div>
          )}

          {workoutProgress.enjoyment && (
            <div className="p-2 bg-muted/50 rounded-lg">
              <p className="text-xs text-white">Enjoyment</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-training-primary to-training-secondary"
                    style={{ width: `${workoutProgress.enjoyment * 10}%` }}
                  />
                </div>
                <p className="text-foreground text-sm">{workoutProgress.enjoyment}/10</p>
              </div>
            </div>
          )}

          {workoutProgress.notes && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-white mb-1">Notes</p>
              <p className="text-sm text-foreground">{workoutProgress.notes}</p>
            </div>
          )}
        </div>
      </Card>
    );
  }

  // Show completion dialog
  if (showCompletionDialog) {
    const completedExercises = workoutProgress.exercises.filter(ex => ex.completed).length;
    const totalExercises = workoutProgress.exercises.length;
    const allExercisesCompleted = completedExercises === totalExercises;

    const toggleExercise = (idx: number) => {
      const newExpanded = new Set(expandedExercises);
      if (newExpanded.has(idx)) {
        newExpanded.delete(idx);
      } else {
        newExpanded.add(idx);
      }
      setExpandedExercises(newExpanded);
    };

    return (
      <Card className="p-4 bg-card border-training-primary/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-foreground">Complete Workout</h3>
          {allExercisesCompleted ? (
            <Badge className="bg-success/10 text-success border-success/10">
              All Exercises Done! 🎉
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-training-primary/10 text-training-primary border-training-primary/10">
              {completedExercises}/{totalExercises} Exercises
            </Badge>
          )}
        </div>

        <p className="text-sm text-white mb-4">
          {allExercisesCompleted 
            ? "Great work! Please rate your workout before finishing."
            : `You've completed ${completedExercises} out of ${totalExercises} exercises. Rate your workout to finish.`
          }
        </p>

        {/* Exercise Details Breakdown */}
        <div className="space-y-2 mb-4">
          <Label className="text-sm text-white">Exercise Breakdown</Label>
          {workoutProgress.exercises.map((exercise, idx) => {
            const completedSetsCount = exercise.setDetails?.filter(s => s.completed).length || 0;
            const totalSetsCount = exercise.sets;
            const isFullyCompleted = completedSetsCount === totalSetsCount;
            const isExpanded = expandedExercises.has(idx);

            return (
              <div key={idx}>
                <button
                  onClick={() => toggleExercise(idx)}
                  className={`w-full p-3 rounded-lg border-2 transition-all ${
                    isFullyCompleted 
                      ? 'bg-success/5 border-success/10' 
                      : 'bg-destructive/5 border-destructive/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-white" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-white" />
                      )}
                      <span className={`text-sm ${
                        isFullyCompleted ? 'text-success' : 'text-destructive'
                      }`}>
                        {exercise.name}
                      </span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        isFullyCompleted 
                          ? 'bg-success/10 text-success border-success/10' 
                          : 'bg-destructive/10 text-destructive border-destructive/10'
                      }`}
                    >
                      {completedSetsCount}/{totalSetsCount} sets
                    </Badge>
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-2 ml-6 space-y-2 p-3 bg-muted/30 rounded-lg border border-border">
                    {exercise.setDetails?.map((set, setIdx) => (
                      <div 
                        key={setIdx} 
                        className={`p-2 rounded-md ${
                          set.completed ? 'bg-success/10' : 'bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs ${
                            set.completed ? 'text-success' : 'text-white'
                          }`}>
                            Set {set.setNumber}
                          </span>
                          {set.completed && (
                            <CheckCircle className="h-3 w-3 text-success" />
                          )}
                        </div>
                        <div className="flex gap-3 mt-1 text-xs text-foreground">
                          <span>Weight: {set.weight || '-'} kg</span>
                          <span>Reps: {set.reps || '-'}</span>
                          <span>Rest: {set.restTime || '-'}s</span>
                        </div>
                      </div>
                    ))}
                    {exercise.exerciseNotes && (
                      <div className="mt-2 p-2 bg-primary/5 border border-primary/10 rounded-md">
                        <p className="text-xs text-white mb-1">💭 Exercise Notes</p>
                        <p className="text-xs text-foreground italic">{exercise.exerciseNotes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Energy Level</Label>
              <Badge variant="outline" className="text-xs bg-training-primary/10 text-training-primary border-training-primary/30">
                {completionData.energyLevel}/10
              </Badge>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={completionData.energyLevel}
              onChange={(e) => setCompletionData({ ...completionData, energyLevel: parseInt(e.target.value) })}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: 'linear-gradient(to right, rgb(234, 88, 12), rgb(249, 115, 22))'
              }}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Enjoyment</Label>
              <Badge variant="outline" className="text-xs bg-training-primary/10 text-training-primary border-training-primary/30">
                {completionData.enjoyment}/10
              </Badge>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={completionData.enjoyment}
              onChange={(e) => setCompletionData({ ...completionData, enjoyment: parseInt(e.target.value) })}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: 'linear-gradient(to right, rgb(234, 88, 12), rgb(249, 115, 22))'
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              placeholder="How did the workout feel?"
              value={completionData.notes}
              onChange={(e) => setCompletionData({ ...completionData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <Button
            onClick={handleCompleteWorkout}
            className="w-full bg-gradient-to-r from-training-primary to-training-secondary text-white hover:opacity-90"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Complete Workout
          </Button>

          <Button
            onClick={handleDoMore}
            className="w-full bg-gradient-to-r from-training-primary to-training-secondary text-white hover:opacity-90"
          >
            <ChevronRight className="h-4 w-4 mr-2" />
            Do More
          </Button>
        </div>
      </Card>
    );
  }

  // Show start workout card
  if (!workoutProgress.started) {
    return (
      <Card 
        className="p-4 relative border border-training-primary/30"
        style={{
          background: '#ffffff',
          backgroundColor: '#ffffff',
          backgroundImage: 'none',
        }}
      >
        {/* Share Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8"
          style={{ color: '#6b7280' }}
          onClick={() => {
            // Share functionality placeholder
            if (onShare) {
              onShare(workout);
            }
          }}
        >
          <Share2 className="h-4 w-4" style={{ color: '#6b7280' }} />
        </Button>

        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-br from-training-primary to-training-secondary">
            <Dumbbell className="h-5 w-5 text-white" />
          </div>
          <h3 style={{ color: '#111827' }}>{workout.name}</h3>
        </div>

        <div className="space-y-3 mb-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
              <p className="text-xs" style={{ color: '#6b7280' }}>Duration</p>
              <p style={{ color: '#111827' }}>{workout.duration}</p>
            </div>
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
              <p className="text-xs" style={{ color: '#6b7280' }}>Difficulty</p>
              <p style={{ color: '#111827' }}>{workout.difficulty}</p>
            </div>
          </div>

          <div className="p-3 rounded-lg" style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
            <p className="text-xs mb-2" style={{ color: '#6b7280' }}>Exercises ({workout.exercises.length})</p>
            <div className="space-y-1">
              {workout.exercises.map((ex, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <Circle className="h-3 w-3" style={{ color: '#9ca3af' }} />
                  <span style={{ color: '#111827' }}>{ex.name}</span>
                  <span className="text-xs ml-auto" style={{ color: '#6b7280' }}>{ex.sets} sets</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            {workout.focus.map((f, idx) => (
              <Badge key={idx} variant="outline" className="text-xs bg-training-primary/10 text-training-primary border-training-primary/30">
                {f}
              </Badge>
            ))}
          </div>
        </div>

        <Button
          onClick={handleStartWorkout}
          className="w-full bg-gradient-to-r from-training-primary to-training-secondary text-white hover:opacity-90"
        >
          <Play className="h-4 w-4 mr-2" />
          Start Workout
        </Button>
      </Card>
    );
  }

  // Show current exercise
  const currentExercise = workoutProgress.exercises[workoutProgress.currentExerciseIndex];
  if (!currentExercise) return null;

  const completedSets = currentExercise.setDetails?.filter(s => s.completed).length || 0;

  return (
    <Card className="p-4 bg-card border-training-primary/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-training-primary to-training-secondary">
            <Dumbbell className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-foreground">{currentExercise.name}</h3>
            <p className="text-xs text-white">
              Exercise {workoutProgress.currentExerciseIndex + 1} of {workout.exercises.length}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-xs bg-training-primary/10 text-training-primary border-training-primary/30">
          {completedSets}/{currentExercise.sets} sets
        </Badge>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-training-primary to-training-secondary transition-all"
            style={{ width: `${(completedSets / currentExercise.sets) * 100}%` }}
          />
        </div>
      </div>

      {/* Notes */}
      {currentExercise.notes && (
        <div className="mb-4 p-2 bg-muted/50 rounded-lg">
          <p className="text-xs text-white italic">💡 {currentExercise.notes}</p>
        </div>
      )}

      {/* Sets */}
      <div className="space-y-3">
        <Label className="text-sm text-white">Sets</Label>
        {currentExercise.setDetails?.map((set, idx) => (
          <div key={idx}>
            {set.completed ? (
              // Collapsed completed set
              <div className="p-2 rounded-lg bg-success/5 border border-success/30 flex items-center gap-3">
                <button
                  onClick={() => handleToggleSet(idx)}
                  className="w-6 h-6 rounded-full flex items-center justify-center bg-success border-success text-white hover:opacity-80 transition-all"
                >
                  <CheckCircle className="h-4 w-4" />
                </button>
                <span className="text-sm text-success">Set {set.setNumber} completed</span>
              </div>
            ) : (
              // Expanded editable set
              <div className="p-3 rounded-lg border-2 bg-card border-border">
                <div className="flex items-center gap-3 mb-2">
                  <button
                    onClick={() => handleToggleSet(idx)}
                    className="w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all bg-transparent border-training-primary/50 text-training-primary hover:bg-training-primary hover:text-white"
                  >
                    <span className="text-sm">{idx + 1}</span>
                  </button>
                  <span className="text-sm text-foreground">Set {set.setNumber}</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor={`weight-${idx}`} className="text-xs text-white">Weight (kg)</Label>
                    <Input
                      id={`weight-${idx}`}
                      type="number"
                      step="0.5"
                      value={set.weight}
                      onChange={(e) => handleSetChange(idx, 'weight', e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`reps-${idx}`} className="text-xs text-white">Reps</Label>
                    <Input
                      id={`reps-${idx}`}
                      type="text"
                      value={set.reps}
                      onChange={(e) => handleSetChange(idx, 'reps', e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`rest-${idx}`} className="text-xs text-white">Rest (s)</Label>
                    <Input
                      id={`rest-${idx}`}
                      type="number"
                      value={set.restTime}
                      onChange={(e) => handleSetChange(idx, 'restTime', e.target.value)}
                      className="h-9"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Exercise Notes */}
      <div className="space-y-2 mt-4">
        <Label className="text-sm text-white">Exercise Notes (optional)</Label>
        <Textarea
          placeholder="How did this exercise feel? Any observations?"
          value={currentExercise.exerciseNotes || ''}
          onChange={(e) => handleExerciseNotesChange(e.target.value)}
          rows={2}
          className="resize-none"
        />
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between mt-4">
        <Button
          onClick={handlePreviousExercise}
          className="bg-gradient-to-r from-training-primary to-training-secondary text-white hover:opacity-90"
          disabled={workoutProgress.currentExerciseIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button
          onClick={handleNextExercise}
          className="bg-gradient-to-r from-training-primary to-training-secondary text-white hover:opacity-90"
        >
          {workoutProgress.currentExerciseIndex === workoutProgress.exercises.length - 1 ? 'Finish' : 'Next'}
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </Card>
  );
}