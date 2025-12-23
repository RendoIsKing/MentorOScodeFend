import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { Dumbbell, ChevronLeft, ChevronRight, CheckCircle2, Info, ChevronDown } from 'lucide-react';
import { getExerciseDetail, ExerciseDetail } from '../../lib/exerciseDatabase';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  notes?: string;
  recommendedWeight?: string;  // Coach's recommended weight
  recommendedRPE?: string;     // Recommended Rate of Perceived Exertion (optional)
}

interface SetDetail {
  setNumber: number;
  completed: boolean;
  weight: string;
  reps: string;
  restTime: string;
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
  exerciseNotes?: string;
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
  exercises: CompletedExercise[];
}

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

interface TrainingPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planName: string;
  currentWeek: number;
  totalWeeks: number;
  weekWorkouts?: DayWorkout[];
  onToggleWorkoutComplete?: (workoutName: string, day: string) => void;
  onWeekChange?: (weekOffset: number) => void;
  completedWorkoutsDetails?: Record<string, CompletedWorkoutDetail>;
}

export function TrainingPlanDialog({ open, onOpenChange, planName, currentWeek, totalWeeks, weekWorkouts, onToggleWorkoutComplete, onWeekChange, completedWorkoutsDetails }: TrainingPlanDialogProps) {
  const [selectedDay, setSelectedDay] = useState<DayWorkout | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<{ exercise: Exercise; detail: ExerciseDetail; exerciseName: string } | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [expandedSetDetails, setExpandedSetDetails] = useState(false);
  
  // State for tracking which workout's coach plan is expanded
  const [expandedCoachPlan, setExpandedCoachPlan] = useState<Record<string, boolean>>({});
  // State for tracking which exercises within the coach plan are showing details
  const [expandedExerciseDetails, setExpandedExerciseDetails] = useState<Record<string, boolean>>({});

  const handleWeekChange = (newOffset: number) => {
    setWeekOffset(newOffset);
    onWeekChange?.(newOffset);
  };

  // Get completed exercise data if this workout is completed
  const getCompletedExerciseData = (): CompletedExercise | null => {
    if (!selectedDay || !selectedExercise || !selectedDay.isCompleted || !selectedDay.workoutId || !completedWorkoutsDetails) {
      return null;
    }
    
    const completedWorkout = completedWorkoutsDetails[selectedDay.workoutId];
    if (!completedWorkout) return null;
    
    return completedWorkout.exercises.find(ex => ex.name === selectedExercise.exerciseName) || null;
  };

  const completedExerciseData = getCompletedExerciseData();

  // Mock data for the week
  const defaultWeekWorkouts: DayWorkout[] = [
    {
      day: 'Monday',
      date: 'Oct 21',
      workoutName: 'Upper Body Power',
      duration: '50 min',
      difficulty: 'Advanced',
      focus: ['Chest', 'Back', 'Arms'],
      isCompleted: true,
      exercises: [
        { name: 'Bench Press', sets: 4, reps: '8-10', rest: '90s', notes: 'Focus on controlled descent', recommendedWeight: '80kg', recommendedRPE: '8/10' },
        { name: 'Pull-ups', sets: 4, reps: '6-8', rest: '90s', recommendedWeight: 'Bodyweight + 10kg', recommendedRPE: '9/10' },
        { name: 'Dumbbell Shoulder Press', sets: 3, reps: '10-12', rest: '60s', recommendedWeight: '20kg each', recommendedRPE: '7/10' },
        { name: 'Barbell Rows', sets: 4, reps: '8-10', rest: '90s', recommendedWeight: '70kg', recommendedRPE: '8/10' },
        { name: 'Tricep Dips', sets: 3, reps: '10-12', rest: '60s', recommendedWeight: 'Bodyweight', recommendedRPE: '7/10' },
        { name: 'Bicep Curls', sets: 3, reps: '12-15', rest: '45s', recommendedWeight: '15kg', recommendedRPE: '7/10' },
      ],
    },
    {
      day: 'Tuesday',
      date: 'Oct 22',
      workoutName: 'Lower Body Strength',
      duration: '55 min',
      difficulty: 'Advanced',
      focus: ['Legs', 'Glutes'],
      isCompleted: true,
      exercises: [
        { name: 'Back Squat', sets: 4, reps: '6-8', rest: '2min', recommendedWeight: '120kg', recommendedRPE: '9/10' },
        { name: 'Romanian Deadlift', sets: 4, reps: '8-10', rest: '90s', recommendedWeight: '90kg', recommendedRPE: '8/10' },
        { name: 'Bulgarian Split Squats', sets: 3, reps: '10/leg', rest: '60s', recommendedWeight: '20kg each', recommendedRPE: '8/10' },
        { name: 'Leg Press', sets: 3, reps: '12-15', rest: '60s', recommendedWeight: '180kg', recommendedRPE: '7/10' },
      ],
    },
    {
      day: 'Wednesday',
      date: 'Oct 23',
      workoutName: 'Rest Day',
      duration: '-',
      difficulty: '-',
      focus: ['Recovery'],
      exercises: [],
      isRestDay: true,
      isCompleted: true,
    },
    {
      day: 'Thursday',
      date: 'Oct 24',
      workoutName: 'HIIT Cardio',
      duration: '30 min',
      difficulty: 'Intermediate',
      focus: ['Cardio', 'Endurance'],
      isCompleted: false,
      exercises: [
        { name: 'Warm-up Jog', sets: 1, reps: '5 min', rest: '0s' },
        { name: 'Sprint Intervals', sets: 8, reps: '30s', rest: '60s', recommendedRPE: '9/10' },
        { name: 'Mountain Climbers', sets: 4, reps: '30s', rest: '30s', recommendedRPE: '8/10' },
        { name: 'Burpees', sets: 4, reps: '30s', rest: '30s', recommendedRPE: '8/10' },
      ],
    },
    {
      day: 'Friday',
      date: 'Oct 25',
      workoutName: 'Full Body Circuit',
      duration: '45 min',
      difficulty: 'Intermediate',
      focus: ['Full Body', 'Conditioning'],
      isCompleted: false,
      exercises: [
        { name: 'Deadlift', sets: 3, reps: '8-10', rest: '90s', recommendedWeight: '100kg', recommendedRPE: '8/10' },
        { name: 'Overhead Press', sets: 3, reps: '10-12', rest: '60s', recommendedWeight: '50kg', recommendedRPE: '7/10' },
        { name: 'Lunges', sets: 3, reps: '12/leg', rest: '60s', recommendedWeight: '15kg each', recommendedRPE: '7/10' },
        { name: 'Plank Hold', sets: 3, reps: '45s', rest: '30s', recommendedRPE: '7/10' },
      ],
    },
    {
      day: 'Saturday',
      date: 'Oct 26',
      workoutName: 'Active Recovery',
      duration: '30 min',
      difficulty: 'Beginner',
      focus: ['Mobility', 'Flexibility'],
      isCompleted: false,
      exercises: [
        { name: 'Yoga Flow', sets: 1, reps: '20 min', rest: '0s' },
        { name: 'Foam Rolling', sets: 1, reps: '10 min', rest: '0s' },
      ],
    },
    {
      day: 'Sunday',
      date: 'Oct 27',
      workoutName: 'Rest Day',
      duration: '-',
      difficulty: '-',
      focus: ['Recovery'],
      exercises: [],
      isRestDay: true,
      isCompleted: false,
    },
  ];

  const difficultyColors: Record<string, string> = {
    'Beginner': 'bg-success/10 text-success border-success/30',
    'Intermediate': 'bg-energy/10 text-white border-energy/30',
    'Advanced': 'bg-destructive/10 text-destructive border-destructive/30',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col overflow-hidden p-0">
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4">
          <DialogTitle>{planName}</DialogTitle>
        </DialogHeader>

        {selectedExercise ? (
          // Exercise Detail View
          <div className="flex-1 min-h-0 flex flex-col px-6 pb-6 overflow-hidden">
            <div className="flex items-center justify-between flex-shrink-0 mb-4">
              <div>
                <h3 className="text-foreground">{selectedExercise.detail.name}</h3>
                <p className="text-sm text-white">
                  {selectedExercise.exercise.sets} sets × {selectedExercise.exercise.reps} reps
                </p>
              </div>
              <Button variant="outline" onClick={() => setSelectedExercise(null)}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Workout
              </Button>
            </div>

            <ScrollArea className="flex-1 min-h-0">
              <div className="space-y-6 pr-4">
                {/* Exercise Info Card */}
                <Card className="p-6 bg-gradient-to-br from-energy/5 to-energy/10 border-energy/20">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-energy to-energy-dark">
                      <Dumbbell className="h-6 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="text-foreground mb-1">Training Details</h4>
                      <p className="text-xs text-white">Understanding your workout parameters</p>
                    </div>
                  </div>
                  
                  <div className="space-y-5">
                    {/* Sets */}
                    <div className="border-l-2 border-energy pl-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white">Sets</span>
                        <span className="text-foreground"><strong>{selectedExercise.exercise.sets}</strong></span>
                      </div>
                      <p className="text-white/95 leading-relaxed">
                        This volume is optimized for {selectedExercise.exercise.sets >= 4 ? 'maximum strength and muscle growth' : selectedExercise.exercise.sets === 3 ? 'balanced strength development' : 'skill practice and conditioning'}. Multiple sets allow you to maintain intensity and accumulate enough training stimulus.
                      </p>
                    </div>

                    {/* Reps */}
                    <div className="border-l-2 border-energy pl-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white">Reps</span>
                        <span className="text-foreground"><strong>{selectedExercise.exercise.reps}</strong></span>
                      </div>
                      <p className="text-white/95 leading-relaxed">
                        {selectedExercise.exercise.reps.includes('6') || selectedExercise.exercise.reps.includes('8') 
                          ? 'This rep range builds maximal strength and power. Lower reps with heavier weight stimulate neural adaptations and muscle fiber recruitment.'
                          : selectedExercise.exercise.reps.includes('10') || selectedExercise.exercise.reps.includes('12')
                          ? 'This rep range is ideal for muscle hypertrophy (growth). It balances mechanical tension and metabolic stress for optimal muscle building.'
                          : selectedExercise.exercise.reps.includes('15') || selectedExercise.exercise.reps.includes('20')
                          ? 'This higher rep range develops muscular endurance and metabolic conditioning while promoting blood flow and recovery.'
                          : 'This rep range is designed to match your current training goals and exercise type.'}
                      </p>
                    </div>

                    {/* Weight (if applicable) */}
                    {selectedExercise.exercise.recommendedWeight && (
                      <div className="border-l-2 border-energy pl-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white">Recommended Weight</span>
                          <span className="text-foreground"><strong>{selectedExercise.exercise.recommendedWeight}</strong></span>
                        </div>
                        <p className="text-white/95 leading-relaxed">
                          Based on your current strength level and training history, this weight should feel challenging but manageable. You should reach technical failure (form breakdown) near the end of your target rep range. Adjust as needed based on how you feel.
                        </p>
                      </div>
                    )}

                    {/* Rest */}
                    <div className="border-l-2 border-energy pl-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white">Rest Period</span>
                        <span className="text-foreground"><strong>{selectedExercise.exercise.rest}</strong></span>
                      </div>
                      <p className="text-white/95 leading-relaxed">
                        {selectedExercise.exercise.rest.includes('2min') || selectedExercise.exercise.rest.includes('120')
                          ? 'Longer rest allows full ATP-PC system recovery for maximum strength output. Use this time to mentally prepare for your next set.'
                          : selectedExercise.exercise.rest.includes('90') || selectedExercise.exercise.rest.includes('60')
                          ? 'This moderate rest period balances recovery with training density. It allows partial recovery while maintaining workout intensity and metabolic stress.'
                          : selectedExercise.exercise.rest.includes('30') || selectedExercise.exercise.rest.includes('45')
                          ? 'Short rest periods keep your heart rate elevated and create metabolic stress, which is great for conditioning and muscle endurance.'
                          : 'This rest period is calibrated for your specific exercise and training goals.'}
                      </p>
                    </div>

                    {/* RPE (if applicable) */}
                    {selectedExercise.exercise.recommendedRPE && (
                      <div className="border-l-2 border-energy pl-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white">Target RPE (Rate of Perceived Exertion)</span>
                          <span className="text-foreground"><strong>{selectedExercise.exercise.recommendedRPE}</strong></span>
                        </div>
                        <p className="text-white/95 leading-relaxed">
                          RPE helps you gauge intensity. {selectedExercise.exercise.recommendedRPE.includes('9') || selectedExercise.exercise.recommendedRPE.includes('10')
                            ? 'You should have 0-1 reps left in the tank - this is very hard effort pushing close to failure.'
                            : selectedExercise.exercise.recommendedRPE.includes('8')
                            ? 'You should have about 2 reps left in reserve - challenging but sustainable with good form.'
                            : 'This is moderate intensity - you should feel worked but not exhausted, maintaining excellent form throughout.'}
                        </p>
                      </div>
                    )}

                    {/* Coach Notes */}
                    {selectedExercise.exercise.notes && (
                      <div className="bg-primary/5 border border-primary/20 rounded-md p-4">
                        <p className="text-sm text-white mb-2">💭 Coach's Note</p>
                        <p className="text-white italic leading-relaxed">
                          {selectedExercise.exercise.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Actual Performance Data for Completed Workouts */}
                {completedExerciseData && completedExerciseData.setDetails && completedExerciseData.setDetails.some((s: SetDetail) => s.weight || s.reps || s.restTime) && (
                  <Card className="p-6 bg-gradient-to-br from-success/5 to-success/10 border-success/20">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-foreground mb-1">💪 Your Performance</h4>
                        <p className="text-sm text-white">
                          Actual data from your workout
                        </p>
                      </div>
                      {completedExerciseData.exerciseNotes && (
                        <Badge variant="outline" className="bg-card">
                          Has Notes
                        </Badge>
                      )}
                    </div>
                    
                    {completedExerciseData.exerciseNotes && (
                      <div className="mb-4 p-3 bg-background/50 rounded-md border">
                        <p className="text-sm text-foreground">💭 {completedExerciseData.exerciseNotes}</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-sm text-muted-foreground hover:text-foreground p-0 h-auto mb-2"
                        onClick={() => setExpandedSetDetails(!expandedSetDetails)}
                      >
                        {expandedSetDetails ? (
                          <ChevronLeft className="h-4 w-4 mr-1 rotate-[-90deg]" />
                        ) : (
                          <ChevronLeft className="h-4 w-4 mr-1 rotate-90" />
                        )}
                        Set Details ({completedExerciseData.setDetails.filter((s: SetDetail) => s.weight || s.reps || s.restTime).length} sets tracked)
                      </Button>
                      
                      {expandedSetDetails && (
                        <div className="space-y-1.5">
                          {completedExerciseData.setDetails
                            .filter((set: SetDetail) => set.weight || set.reps || set.restTime)
                            .map((set: SetDetail, setIndex: number) => (
                              <div 
                                key={setIndex} 
                                className="flex items-center justify-between p-3 rounded-md bg-background border"
                              >
                                <div className="flex items-center gap-3">
                                  <span className={set.completed ? "text-success" : "text-white/50"}>
                                    {set.completed ? <CheckCircle2 className="h-4 w-4" /> : "○"}
                                  </span>
                                  <span className="text-white">Set {set.setNumber}</span>
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
                                    <span className="text-white text-xs">
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
                  </Card>
                )}

                {/* Description */}
                <div>
                  <h4 className="text-foreground mb-2">About This Exercise</h4>
                  <p className="text-sm text-white">
                    {selectedExercise.detail.description}
                  </p>
                </div>

                {/* How to Perform */}
                <div>
                  <h4 className="text-foreground mb-3">How to Perform</h4>
                  <ol className="space-y-2">
                    {selectedExercise.detail.execution.map((step, index) => (
                      <li key={index} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-energy/20 text-white flex items-center justify-center text-sm">
                          {index + 1}
                        </span>
                        <p className="text-sm text-white pt-0.5">{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Tips */}
                {selectedExercise.detail.tips && selectedExercise.detail.tips.length > 0 && (
                  <Card className="p-4 bg-success/5 border-success/20">
                    <h4 className="text-foreground mb-2">💡 Pro Tips</h4>
                    <ul className="space-y-2">
                      {selectedExercise.detail.tips.map((tip, index) => (
                        <li key={index} className="flex gap-2 text-sm text-white">
                          <span className="text-success">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {/* Common Mistakes */}
                {selectedExercise.detail.commonMistakes && selectedExercise.detail.commonMistakes.length > 0 && (
                  <Card className="p-4 bg-destructive/5 border-destructive/20">
                    <h4 className="text-foreground mb-2">⚠️ Common Mistakes to Avoid</h4>
                    <ul className="space-y-2">
                      {selectedExercise.detail.commonMistakes.map((mistake, index) => (
                        <li key={index} className="flex gap-2 text-sm text-white">
                          <span className="text-destructive">•</span>
                          <span>{mistake}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
              </div>
            </ScrollArea>
          </div>
        ) : selectedDay ? (
          // Day Detail View
          <div className="flex-1 min-h-0 flex flex-col px-6 pb-6 overflow-hidden">
            <div className="flex items-center justify-between flex-shrink-0 mb-4">
              <div>
                <h3 className="text-foreground">{selectedDay.workoutName}</h3>
                <p className="text-sm text-white">{selectedDay.day}, {selectedDay.date}</p>
              </div>
              <Button variant="outline" onClick={() => setSelectedDay(null)}>
                Back to Calendar
              </Button>
            </div>

            {selectedDay.isRestDay ? (
              <Card className="p-8 text-center bg-success/10">
                <div className="max-w-md mx-auto">
                  <h4 className="text-foreground mb-2">Rest & Recovery Day</h4>
                  <p className="text-sm text-white">
                    Take this day to let your body recover. Stay active with light stretching, walking, or yoga if you'd like, but avoid intense training.
                  </p>
                </div>
              </Card>
            ) : selectedDay.isCompleted && selectedDay.workoutId && completedWorkoutsDetails?.[selectedDay.workoutId] ? (
              // Show completed workout details
              (() => {
                const completedWorkout = completedWorkoutsDetails[selectedDay.workoutId];
                const completedExercises = completedWorkout.exercises.filter(ex => ex.completedSets >= ex.targetSets).length;
                
                return (
                  <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                    {/* Completion Badge */}
                    <div className="flex-shrink-0 mb-4">
                      <Badge className="bg-success/10 text-success border-success/30">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    </div>

                    {/* Performance Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 flex-shrink-0">
                      <Card className="p-4 bg-gradient-to-br from-energy/5 to-energy/10 border-energy/20">
                        <div className="flex flex-col items-center text-center gap-2">
                          <p className="text-sm text-muted-foreground">Duration</p>
                          <p className="text-foreground">
                            <strong>{completedWorkout.duration}</strong>
                          </p>
                          <p className="text-xs text-muted-foreground">Target: {completedWorkout.targetDuration}</p>
                        </div>
                      </Card>
                      <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                        <div className="flex flex-col items-center text-center gap-2">
                          <p className="text-sm text-muted-foreground">Completion</p>
                          <p className="text-foreground">
                            <strong>{completedWorkout.completionPercentage}%</strong>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {completedExercises} of {completedWorkout.exercises.length} exercises
                          </p>
                        </div>
                      </Card>
                      <Card className="p-4 bg-gradient-to-br from-stats/5 to-stats/10 border-stats/20">
                        <div className="flex flex-col items-center text-center gap-2">
                          <p className="text-sm text-muted-foreground">Difficulty</p>
                          <Badge variant="outline" className={difficultyColors[completedWorkout.difficulty] || ''}>
                            {completedWorkout.difficulty}
                          </Badge>
                          <div className="flex flex-wrap gap-1 justify-center">
                            {completedWorkout.focus.map((f, idx) => (
                              <Badge key={idx} className="bg-muted text-foreground border-border text-xs">{f}</Badge>
                            ))}
                          </div>
                        </div>
                      </Card>
                    </div>

                    {/* Workout Notes */}
                    {completedWorkout.workoutNotes && (
                      <Card className="p-4 mb-4 bg-primary/5 border-primary/20 flex-shrink-0">
                        <p className="text-xs text-muted-foreground mb-1">💭 Workout Notes</p>
                        <p className="text-sm text-foreground italic">{completedWorkout.workoutNotes}</p>
                      </Card>
                    )}

                    {/* Exercises List */}
                    <ScrollArea className="flex-1 min-h-0">
                      <div className="space-y-3 pr-4">
                        {completedWorkout.exercises.map((exercise, index) => {
                          const isFullyCompleted = exercise.completedSets >= exercise.targetSets;
                          
                          return (
                            <Card 
                              key={index} 
                              className={`p-4 ${
                                isFullyCompleted 
                                  ? 'bg-gradient-to-br from-success/5 to-success/10 border-success/20' 
                                  : 'bg-gradient-to-br from-muted/30 to-muted/50'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 ${
                                  isFullyCompleted ? 'bg-success/20' : 'bg-muted'
                                }`}>
                                  {isFullyCompleted ? (
                                    <CheckCircle2 className="h-4 w-4 text-success" />
                                  ) : (
                                    <span className="text-white">{index + 1}</span>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-foreground mb-1">{exercise.name}</h4>
                                  
                                  {/* Performance Summary */}
                                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm mb-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-muted-foreground">Sets:</span>
                                      <span className="text-foreground">
                                        <strong>{exercise.completedSets}</strong> / {exercise.targetSets}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-muted-foreground">Reps:</span>
                                      <span className="text-foreground">
                                        <strong>{exercise.completedReps}</strong>
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-muted-foreground">Rest:</span>
                                      <span className="text-foreground">
                                        <strong>{exercise.rest}</strong>
                                      </span>
                                    </div>
                                  </div>

                                  {/* Set Details */}
                                  {exercise.setDetails && exercise.setDetails.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-border/50">
                                      <p className="text-xs text-muted-foreground mb-2">Set Details:</p>
                                      <div className="space-y-1.5">
                                        {exercise.setDetails.map((set, setIdx) => (
                                          <div 
                                            key={setIdx}
                                            className={`flex items-center justify-between text-xs p-2 rounded ${
                                              set.completed ? 'bg-success/10' : 'bg-muted/50'
                                            }`}
                                          >
                                            <span className="text-muted-foreground">Set {set.setNumber}:</span>
                                            <div className="flex items-center gap-3">
                                              <span className="text-foreground">{set.weight}</span>
                                              <span className="text-foreground">×{set.reps} reps</span>
                                              <span className="text-muted-foreground">{set.restTime} rest</span>
                                              {set.completed && (
                                                <CheckCircle2 className="h-3 w-3 text-success" />
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Exercise Notes */}
                                  {exercise.exerciseNotes && (
                                    <div className="mt-2 pt-2 border-t border-border/50">
                                      <p className="text-xs text-muted-foreground italic">{exercise.exerciseNotes}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </div>
                );
              })()
            ) : (
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                <div className="flex items-center gap-3 mb-4 flex-shrink-0">
                  <Badge variant="outline" className={`border ${difficultyColors[selectedDay.difficulty] || ''}`}>
                    {selectedDay.difficulty}
                  </Badge>
                  <span className="text-sm text-white">{selectedDay.duration}</span>
                  <div className="flex gap-1">
                    {selectedDay.focus.map((f, idx) => (
                      <Badge key={idx} className="bg-muted text-foreground border-border text-xs">{f}</Badge>
                    ))}
                  </div>
                </div>

                <ScrollArea className="flex-1 min-h-0">
                  <div className="space-y-3 pr-4">
                    {selectedDay.exercises.map((exercise, index) => (
                      <Card 
                        key={index} 
                        className="p-4 cursor-pointer hover:shadow-md hover:border-energy/40 transition-all"
                        onClick={() => setSelectedExercise({ exercise, detail: getExerciseDetail(exercise.name), exerciseName: exercise.name })}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-energy/20 text-white flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-foreground">{exercise.name}</h4>
                              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-colors">
                                <Info className="h-3.5 w-3.5 text-primary" />
                                <span className="text-xs text-primary">More Info</span>
                              </div>
                            </div>
                            {exercise.notes && (
                              <p className="text-sm text-white italic mb-2">{exercise.notes}</p>
                            )}
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm mb-2">
                              <div className="flex items-center justify-between">
                                <span className="text-white">Sets:</span>
                                <span className="text-white"><strong>{exercise.sets}</strong></span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-white">Reps:</span>
                                <span className="text-white"><strong>{exercise.reps}</strong></span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-white">Weight:</span>
                                <span className="text-white"><strong>{exercise.recommendedWeight || '-'}</strong></span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-white">Rest:</span>
                                <span className="text-white"><strong>{exercise.rest}</strong></span>
                              </div>
                            </div>
                            {exercise.recommendedRPE && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-white">Target RPE:</span>
                                <Badge variant="outline" className="bg-primary/10 text-white border-primary/30 text-xs">
                                  {exercise.recommendedRPE}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        ) : (
          // Week Calendar View
          <div className="flex-1 min-h-0 flex flex-col px-3 md:px-6 pb-4 md:pb-6 overflow-hidden">
            <div className="flex items-center justify-between flex-shrink-0 mb-3 md:mb-4 gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleWeekChange(weekOffset - 1)}
                disabled={currentWeek + weekOffset <= 1}
                className="px-2 md:px-3"
              >
                <ChevronLeft className="h-4 w-4 md:mr-1" />
                <span className="hidden md:inline">Previous Week</span>
              </Button>
              <div className="text-center flex-1">
                <p className="text-sm text-white">Week {currentWeek + weekOffset} of {totalWeeks}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleWeekChange(weekOffset + 1)}
                disabled={currentWeek + weekOffset >= totalWeeks}
                className="px-2 md:px-3"
              >
                <span className="hidden md:inline">Next Week</span>
                <ChevronRight className="h-4 w-4 md:ml-1" />
              </Button>
            </div>

            <ScrollArea className="flex-1 min-h-0">
              <div className="grid grid-cols-1 gap-3 pr-2 md:pr-4">
                {(weekWorkouts || defaultWeekWorkouts).map((dayWorkout) => (
                  <Card
                    key={dayWorkout.day}
                    className={`p-3 md:p-4 cursor-pointer hover:shadow-md transition-all border-0 ${ 
                      dayWorkout.isRestDay 
                        ? 'bg-muted/50' 
                        : dayWorkout.isCompleted
                        ? 'bg-gradient-to-br from-success/20 to-success/30'
                        : 'bg-gradient-to-br from-training-primary/20 to-training-primary/30'
                    }`}
                    onClick={() => setSelectedDay(dayWorkout)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className={dayWorkout.isRestDay ? "text-white" : "text-[rgb(255,0,0)]"}>{dayWorkout.day}</h4>
                        {dayWorkout.isCompleted && (
                          <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                            Completed
                          </Badge>
                        )}
                      </div>
                      
                      {dayWorkout.isRestDay ? (
                        <p className="text-sm mb-1 text-white italic">
                          {dayWorkout.workoutName}
                        </p>
                      ) : dayWorkout.isCompleted ? (
                        <div className="text-sm mb-1 text-white">
                          {dayWorkout.workoutName}
                        </div>
                      ) : (
                        <div className="text-sm mb-1 text-white">
                          {dayWorkout.workoutName}
                        </div>
                      )}
                      
                      {!dayWorkout.isRestDay && (
                        <>
                          <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mt-2 mb-2">
                            {dayWorkout.focus.map((f, idx) => (
                              <Badge key={idx} className="bg-muted text-foreground border-border text-xs">{f}</Badge>
                            ))}
                          </div>
                          
                          {/* Coach's Plan Collapsible Dropdown */}
                          {dayWorkout.exercises.length > 0 && (
                            <Collapsible
                              open={expandedCoachPlan[dayWorkout.day] || false}
                              onOpenChange={(isOpen) => {
                                setExpandedCoachPlan(prev => ({
                                  ...prev,
                                  [dayWorkout.day]: isOpen
                                }));
                              }}
                            >
                              <div 
                                className="bg-primary/5 border border-primary/20 rounded-lg mb-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <CollapsibleTrigger asChild>
                                  <div className="p-3 cursor-pointer hover:bg-primary/10 rounded-lg transition-colors">
                                    <div className="text-sm mb-1.5 flex items-center justify-between gap-2 text-white">
                                      <div className="flex items-center gap-1.5">
                                        <span>🎯</span>
                                        <span>Coach's Plan</span>
                                        <span className="text-white">({dayWorkout.exercises.length} exercises)</span>
                                      </div>
                                      <ChevronDown 
                                        className={`h-5 w-5 transition-transform ${
                                          expandedCoachPlan[dayWorkout.day] ? 'rotate-180' : ''
                                        }`}
                                      />
                                    </div>
                                  </div>
                                </CollapsibleTrigger>
                                
                                <CollapsibleContent className="px-2 pb-2">
                                  <div className="space-y-1.5 mt-1">
                                    {dayWorkout.exercises.map((ex, idx) => {
                                      const exerciseKey = `${dayWorkout.day}-${idx}`;
                                      const isExerciseExpanded = expandedExerciseDetails[exerciseKey] || false;
                                      
                                      return (
                                        <Collapsible
                                          key={idx}
                                          open={isExerciseExpanded}
                                          onOpenChange={(isOpen) => {
                                            setExpandedExerciseDetails(prev => ({
                                              ...prev,
                                              [exerciseKey]: isOpen
                                            }));
                                          }}
                                        >
                                          <div className="bg-background/50 rounded-md border border-primary/10">
                                            <CollapsibleTrigger asChild>
                                              <div className="p-2.5 cursor-pointer hover:bg-primary/5 rounded-md transition-colors">
                                                <div className="text-sm flex items-center justify-between text-white">
                                                  <div className="flex items-center gap-2 flex-1">
                                                    <span className="font-medium">{ex.name}</span>
                                                    <span className="text-white">
                                                      {ex.sets}×{ex.reps}
                                                    </span>
                                                  </div>
                                                  <ChevronDown 
                                                    className={`h-4.5 w-4.5 transition-transform flex-shrink-0 ml-2 ${
                                                      isExerciseExpanded ? 'rotate-180' : ''
                                                    }`}
                                                  />
                                                </div>
                                              </div>
                                            </CollapsibleTrigger>
                                            
                                            <CollapsibleContent className="px-2 pb-2">
                                              <div className="space-y-1.5 mt-1.5 pt-1.5 border-t border-primary/10">
                                                <div className="flex items-center justify-between text-xs">
                                                  <span className="text-white">
                                                    Sets:
                                                  </span>
                                                  <span className="text-white">
                                                    {ex.sets}
                                                  </span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs">
                                                  <span className="text-white">
                                                    Reps:
                                                  </span>
                                                  <span className="text-white">
                                                    {ex.reps}
                                                  </span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs">
                                                  <span className="text-white">
                                                    Weight:
                                                  </span>
                                                  <span className="text-white">
                                                    {ex.recommendedWeight || '-'}
                                                  </span>
                                                </div>
                                                {ex.recommendedRPE && (
                                                  <div className="flex items-center justify-between text-xs">
                                                    <span className="text-white">
                                                      Target RPE:
                                                    </span>
                                                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs h-5">
                                                      {ex.recommendedRPE}
                                                    </Badge>
                                                  </div>
                                                )}
                                                <div className="flex items-center justify-between text-xs">
                                                  <span className="text-white">
                                                    Rest:
                                                  </span>
                                                  <span className="text-white">
                                                    {ex.rest}
                                                  </span>
                                                </div>
                                                {ex.notes && (
                                                  <div className="text-xs pt-1">
                                                    <span className="text-white italic">
                                                      💭 {ex.notes}
                                                    </span>
                                                  </div>
                                                )}
                                              </div>
                                            </CollapsibleContent>
                                          </div>
                                        </Collapsible>
                                      );
                                    })}
                                  </div>
                                </CollapsibleContent>
                              </div>
                            </Collapsible>
                          )}
                        </>
                      )}
                      
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="flex-1 md:flex-initial bg-black text-white hover:bg-black/90">
                          View Details
                        </Button>
                        {dayWorkout.isCompleted && onToggleWorkoutComplete && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 md:flex-initial"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleWorkoutComplete(dayWorkout.workoutName, dayWorkout.day);
                            }}
                          >
                            Uncomplete
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}