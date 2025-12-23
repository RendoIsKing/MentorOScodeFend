import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dumbbell, TrendingUp, TrendingDown, Star, ChevronDown, ChevronUp, Weight as WeightIcon, Repeat, Calendar, Info } from 'lucide-react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { useState } from 'react';
import { ExerciseSet } from './ExerciseSetsHistoryDialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { ExerciseDetailsDialog } from './ExerciseDetailsDialog';
import { exerciseDetailsData } from '../../data/exerciseDetails';

interface Exercise {
  name: string;
  start: number;
  current: number;
  unit: string;
  improvement: number;
  reverse?: boolean;
  isFavorite?: boolean;
  category?: string;
}

interface AllExercisesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercises: Exercise[];
  onToggleFavorite?: (exerciseName: string) => void;
  allExerciseSets?: Record<string, ExerciseSet[]>;
}

export function AllExercisesDialog({ open, onOpenChange, exercises, onToggleFavorite, allExerciseSets }: AllExercisesDialogProps) {
  const [expandedExercises, setExpandedExercises] = useState<Record<string, boolean>>({});
  const [expandedExerciseDetails, setExpandedExerciseDetails] = useState<Record<string, boolean>>({});
  const [selectedExerciseForDetails, setSelectedExerciseForDetails] = useState<string | null>(null);
  
  // Group exercises by category
  const categories = Array.from(new Set(exercises.map(e => e.category || 'Other')));
  
  const favoriteExercises = exercises.filter(e => e.isFavorite);
  const totalImprovement = exercises.reduce((acc, e) => acc + Math.abs(e.improvement), 0) / exercises.length;

  const handleToggleFavorite = (exerciseName: string) => {
    if (onToggleFavorite) {
      onToggleFavorite(exerciseName);
    }
  };

  const toggleExerciseExpanded = (exerciseName: string) => {
    setExpandedExercises(prev => ({
      ...prev,
      [exerciseName]: !prev[exerciseName]
    }));
  };

  const toggleExerciseDetailsExpanded = (exerciseName: string) => {
    setExpandedExerciseDetails(prev => ({
      ...prev,
      [exerciseName]: !prev[exerciseName]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        {/* Fixed Header */}
        <div className="sticky top-0 bg-background z-10 p-4 md:p-6 border-b">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-stats-secondary via-stats-primary to-stats-accent rounded-lg">
                <Dumbbell className="h-5 w-5 text-stats-primary-foreground" />
              </div>
              <div>
                <DialogTitle>All Exercise Progress</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete overview of your strength gains
                </p>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 md:p-6 space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 bg-stats-primary/5 border-stats-primary/10">
              <p className="text-xs text-white mb-1">Total Exercises</p>
              <div className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-stats-primary" />
                <p className="text-xl text-stats-primary">{exercises.length}</p>
              </div>
            </Card>
            <Card className="p-4 bg-muted">
              <p className="text-xs text-white mb-1">Avg Improvement</p>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-foreground" />
                <p className="text-xl text-foreground">{totalImprovement.toFixed(0)}%</p>
              </div>
            </Card>
            <Card className="p-4 bg-muted">
              <p className="text-xs text-white mb-1">Favorites</p>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" />
                <p className="text-xl text-foreground">{favoriteExercises.length}</p>
              </div>
            </Card>
          </div>

          {/* Exercises by Category - Accordion Style */}
          <Accordion type="multiple" className="space-y-4">
            {categories.map((category) => {
              const categoryExercises = exercises.filter(e => (e.category || 'Other') === category);
              
              return (
                <AccordionItem key={category} value={category} className="border rounded-lg">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 rounded-t-lg">
                    <div className="flex items-center justify-between w-full pr-2">
                      <h4 className="text-foreground">{category}</h4>
                      <Badge variant="outline" className="text-xs">
                        {categoryExercises.length} exercises
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-2">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {categoryExercises.map((exercise) => {
                        const exerciseSets = allExerciseSets?.[exercise.name] || [];
                        const latestBestSet = exerciseSets[0]; // First set is the latest
                        const previousSets = exerciseSets.slice(1); // All sets except the latest
                        const hasHistory = exerciseSets.length > 0;
                        const isExpanded = expandedExercises[exercise.name] || false;
                        const isDetailsExpanded = expandedExerciseDetails[exercise.name] || false;
                        const hasDetails = exerciseDetailsData[exercise.name];

                        return (
                          <Card 
                            key={exercise.name} 
                            className={`p-4 ${exercise.isFavorite ? 'bg-stats-primary/5 border-stats-primary/10' : ''}`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-transparent flex-shrink-0"
                                  onClick={() => handleToggleFavorite(exercise.name)}
                                >
                                  <Star 
                                    className={`h-5 w-5 transition-colors ${
                                      exercise.isFavorite 
                                        ? 'text-amber-500 fill-amber-500' 
                                        : 'text-white hover:text-amber-500'
                                    }`}
                                  />
                                </Button>
                                <div className="min-w-0">
                                  <p className="text-foreground truncate">{exercise.name}</p>
                                  <p className="text-xs text-white">Personal Record</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-stats-primary/10 text-stats-primary flex-shrink-0">
                                {exercise.reverse ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                                <span>{Math.abs(exercise.improvement)}%</span>
                              </div>
                            </div>
                            
                            <div className="flex items-end justify-between gap-4 mb-3">
                              <div>
                                <p className="text-xs text-white mb-1">Started</p>
                                <p className="text-foreground">{exercise.start} {exercise.unit}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-white mb-1 whitespace-nowrap">Latest Best</p>
                                {latestBestSet ? (
                                  <div className="flex items-center gap-1 justify-end">
                                    <WeightIcon className="h-3 w-3 text-white" />
                                    <span className="text-foreground">{latestBestSet.weight}kg</span>
                                    <span className="text-white text-sm">×</span>
                                    <Repeat className="h-3 w-3 text-white" />
                                    <span className="text-foreground">{latestBestSet.reps}</span>
                                  </div>
                                ) : (
                                  <p className="text-xl text-foreground">{exercise.current} {exercise.unit}</p>
                                )}
                              </div>
                            </div>
                            
                            <Progress 
                              value={exercise.reverse ? 100 - (exercise.current / exercise.start * 100) : (exercise.current / exercise.start * 100)} 
                              className="h-2 mb-3" 
                            />

                            {/* See Info Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedExerciseForDetails(exercise.name)}
                              className="w-full h-8 px-2 mb-2"
                            >
                              <Info className="h-4 w-4 mr-1" />
                              <span className="text-xs">See Info</span>
                            </Button>

                            {/* Previous Sets Section - Always visible */}
                            <div className="pt-3 border-t border-border">
                              <button
                                onClick={() => toggleExerciseExpanded(exercise.name)}
                                className="w-full flex items-center justify-between px-3 py-2 border border-border hover:border-white rounded transition-colors"
                              >
                                <span className="text-sm text-white">Previous Sets ({previousSets.length})</span>
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4 text-white" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-white" />
                                )}
                              </button>
                              {isExpanded && (
                                <div className="mt-2 space-y-2">
                                  {previousSets.length > 0 ? (
                                    previousSets.map((set) => (
                                      <div key={set.id} className="flex items-center justify-between px-3 py-2.5 bg-muted/30 border border-border rounded-lg">
                                        <div className="flex items-center gap-4">
                                          <div className="flex items-center gap-1.5">
                                            <WeightIcon className="h-4 w-4 text-white" />
                                            <span className="text-sm text-foreground">{set.weight}kg</span>
                                          </div>
                                          <div className="flex items-center gap-1.5">
                                            <Repeat className="h-4 w-4 text-white" />
                                            <span className="text-sm text-foreground">{set.reps}</span>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                          <Calendar className="h-4 w-4 text-white" />
                                          <span className="text-xs text-white">{set.date}</span>
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="px-3 py-4 bg-muted/20 border border-border rounded-lg text-center">
                                      <p className="text-sm text-white">No previous sets recorded yet</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>

        {/* Fixed Footer */}
        <div className="sticky bottom-0 bg-background border-t p-4 md:p-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>

      {/* Exercise Details Dialog */}
      {selectedExerciseForDetails && (
        <ExerciseDetailsDialog
          open={!!selectedExerciseForDetails}
          onOpenChange={(open) => !open && setSelectedExerciseForDetails(null)}
          exerciseName={selectedExerciseForDetails}
          details={exerciseDetailsData[selectedExerciseForDetails]}
        />
      )}
    </Dialog>
  );
}