import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { CheckCircle, Clock, Dumbbell, Target, ChevronDown, ChevronUp, Zap, Heart } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';

interface SetPerformance {
  setNumber: number;
  weight: string;
  reps: string;
  restTime: string;
  completed: boolean;
}

interface ExercisePerformance {
  name: string;
  targetSets: number;
  targetReps: string;
  completedSets: number;
  completedReps: string;
  rest: string;
  notes?: string;
  setDetails?: SetPerformance[];
  exerciseNotes?: string;
}

interface WorkoutPerformance {
  name: string;
  date: string;
  duration: string;
  targetDuration: string;
  difficulty: string;
  focus: string[];
  exercises: ExercisePerformance[];
  completionPercentage: number;
  workoutNotes?: string;
  energyLevel?: number;
  workoutSatisfaction?: number;
}

interface WorkoutPerformanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workout: WorkoutPerformance | null;
}

export function WorkoutPerformanceDialog({ open, onOpenChange, workout }: WorkoutPerformanceDialogProps) {
  const [expandedExercises, setExpandedExercises] = useState<Set<number>>(new Set());

  if (!workout) return null;

  const toggleExercise = (index: number) => {
    const newExpanded = new Set(expandedExercises);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedExercises(newExpanded);
  };

  const difficultyColors: Record<string, string> = {
    'Beginner': 'bg-success/10 text-success border-success/30',
    'Intermediate': 'bg-energy/10 text-white border-energy/30',
    'Advanced': 'bg-destructive/10 text-destructive border-destructive/30',
  };

  const completedExercises = workout.exercises.filter(ex => ex.completedSets >= ex.targetSets).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden p-0">
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4">
          <div className="space-y-3">
            <div>
              <DialogTitle className="text-center mb-1">{workout.name}</DialogTitle>
              <DialogDescription className="sr-only">
                Workout performance details for {workout.name}
              </DialogDescription>
              <p className="text-sm text-muted-foreground text-center">{workout.date}</p>
            </div>
            <div>
              <Badge className="bg-success/10 text-success border-success/30">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="space-y-6 px-6 pb-6">
            {/* Performance Summary */}
            <div className={`grid grid-cols-2 gap-2 ${
              workout.energyLevel && workout.energyLevel > 0 ? 'md:grid-cols-4' : 'md:grid-cols-3'
            } ${
              (workout as any).workoutSatisfaction && (workout as any).workoutSatisfaction > 0 ? 'lg:grid-cols-5' : ''
            }`}>
              <Card className="p-3 bg-gradient-to-br from-energy/5 to-energy/10 border-energy/20">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-energy/20 flex-shrink-0">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="text-sm text-foreground">{workout.duration}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-3 bg-gradient-to-br from-success/5 to-success/10 border-success/20">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-success/20 flex-shrink-0">
                    <Target className="h-4 w-4 text-success" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Completion</p>
                    <p className="text-sm text-foreground">{completedExercises}/{workout.exercises.length}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-3 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-primary/20 flex-shrink-0">
                    <Dumbbell className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Difficulty</p>
                    <p className="text-sm text-foreground">{workout.difficulty}</p>
                  </div>
                </div>
              </Card>

              {workout.energyLevel && workout.energyLevel > 0 && (
                <Card className={`p-3 bg-gradient-to-br border ${
                  workout.energyLevel <= 3
                    ? 'from-energy-dark/10 to-energy-dark/20 border-energy-dark/30'
                    : workout.energyLevel <= 6
                    ? 'from-energy/10 to-energy/20 border-energy/30'
                    : 'from-energy/10 to-amber-400/20 border-amber-400/30'
                }`}>
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-md flex-shrink-0 ${
                      workout.energyLevel <= 3
                        ? 'bg-energy-dark/20'
                        : workout.energyLevel <= 6
                        ? 'bg-energy/20'
                        : 'bg-gradient-to-br from-energy/30 to-amber-400/30'
                    }`}>
                      <Zap className={`h-4 w-4 ${
                        workout.energyLevel <= 3
                          ? 'text-energy-dark fill-energy-dark/20'
                          : workout.energyLevel <= 6
                          ? 'text-energy fill-energy/20'
                          : 'text-amber-400 fill-amber-400/20'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Energy</p>
                      <p className="text-sm text-foreground">{workout.energyLevel}/10</p>
                    </div>
                  </div>
                </Card>
              )}

              {(workout as any).workoutSatisfaction && (workout as any).workoutSatisfaction > 0 && (
                <Card className={`p-3 bg-gradient-to-br border ${
                  (workout as any).workoutSatisfaction <= 3
                    ? 'from-destructive/10 to-destructive/20 border-destructive/30'
                    : (workout as any).workoutSatisfaction <= 6
                    ? 'from-primary/10 to-primary/20 border-primary/30'
                    : 'from-goals/10 to-goals-secondary/20 border-goals/30'
                }`}>
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-md flex-shrink-0 ${
                      (workout as any).workoutSatisfaction <= 3
                        ? 'bg-destructive/20'
                        : (workout as any).workoutSatisfaction <= 6
                        ? 'bg-primary/20'
                        : 'bg-gradient-to-br from-goals/30 to-goals-secondary/30'
                    }`}>
                      <Heart className={`h-4 w-4 ${
                        (workout as any).workoutSatisfaction <= 3
                          ? 'text-destructive'
                          : (workout as any).workoutSatisfaction <= 6
                          ? 'text-primary'
                          : 'text-goals fill-goals/20'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Enjoyment</p>
                      <p className="text-sm text-foreground">{(workout as any).workoutSatisfaction}/10</p>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Workout Details */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="outline" className={`border text-foreground ${difficultyColors[workout.difficulty] || ''}`}>
                  {workout.difficulty}
                </Badge>
                <div className="flex gap-1">
                  {workout.focus.map((f, idx) => (
                    <Badge key={idx} className="bg-muted text-foreground border-border text-xs">{f}</Badge>
                  ))}
                </div>
              </div>

              {workout.workoutNotes && (
                <Card className="p-4 mb-4 bg-muted/50">
                  <p className="text-sm text-white italic">
                    <strong>Workout Notes:</strong> {workout.workoutNotes}
                  </p>
                </Card>
              )}
            </div>

            {/* Exercise Performance */}
            <div>
              <h4 className="text-foreground mb-3">Exercise Performance</h4>
              <div className="space-y-3">
                {workout.exercises.map((exercise, index) => {
                  const isFullyCompleted = exercise.completedSets >= exercise.targetSets;
                  const completionRate = (exercise.completedSets / exercise.targetSets) * 100;

                  return (
                    <Card 
                      key={index} 
                      className={`p-4 ${isFullyCompleted ? 'bg-success/5 border-success/30' : 'bg-muted/30'}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 ${
                          isFullyCompleted 
                            ? 'bg-success/20 text-success' 
                            : 'bg-energy/20 text-white'
                        }`}>
                          {isFullyCompleted ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <span className="text-sm">{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h5 className="text-foreground mb-1">{exercise.name}</h5>
                              {exercise.notes && (
                                <p className="text-sm text-muted-foreground italic mb-2">{exercise.notes}</p>
                              )}
                              {exercise.exerciseNotes && (
                                <p className="text-sm text-muted-foreground mb-2">💭 {exercise.exerciseNotes}</p>
                              )}
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`ml-2 ${
                                completionRate === 100 
                                  ? 'bg-success/10 text-success border-success/30' 
                                  : completionRate >= 75
                                  ? 'bg-energy/10 text-white border-energy/30'
                                  : 'bg-muted border-muted-foreground/30 text-foreground'
                              }`}
                            >
                              {Math.round(completionRate)}%
                            </Badge>
                          </div>

                          {/* Progress Bar */}
                          <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                isFullyCompleted 
                                  ? 'bg-gradient-to-r from-success to-success/80' 
                                  : 'bg-gradient-to-r from-energy to-energy-dark'
                              }`}
                              style={{ width: `${Math.min(completionRate, 100)}%` }}
                            />
                          </div>

                          {/* Set Details - Show all sets with data entered */}
                          {exercise.setDetails && exercise.setDetails.some((s: any) => s.weight || s.reps || s.restTime) && (
                            <div className="mt-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-sm text-muted-foreground hover:text-foreground p-0 h-auto"
                                onClick={() => toggleExercise(index)}
                              >
                                {expandedExercises.has(index) ? (
                                  <ChevronUp className="h-4 w-4 mr-1" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 mr-1" />
                                )}
                                Set Details ({exercise.setDetails.filter((s: any) => s.weight || s.reps || s.restTime).length} sets tracked)
                              </Button>
                              {expandedExercises.has(index) && (
                                <div className="mt-3 space-y-1.5">
                                  {exercise.setDetails
                                    .filter((set: any) => set.weight || set.reps || set.restTime)
                                    .map((set: any, setIndex: number) => (
                                      <div 
                                        key={setIndex} 
                                        className="flex items-center justify-between p-2 rounded-md bg-background/50 border text-sm"
                                      >
                                        <div className="flex items-center gap-3">
                                          <span className={set.completed ? "text-success" : "text-muted-foreground/50"}>
                                            {set.completed ? <CheckCircle className="h-4 w-4" /> : "○"}
                                          </span>
                                          <span className="text-muted-foreground">Set {set.setNumber}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                          {set.weight && (
                                            <span className="text-foreground">
                                              <strong>{set.weight}</strong> kg
                                            </span>
                                          )}
                                          {set.reps && (
                                            <span className="text-foreground">
                                              × <strong>{set.reps}</strong> reps
                                            </span>
                                          )}
                                          {set.restTime && (
                                            <span className="text-muted-foreground text-xs">
                                              ({set.restTime}s rest)
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    ))
                                  }
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}