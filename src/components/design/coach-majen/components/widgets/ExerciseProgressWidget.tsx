import { useState } from 'react';
import { Card } from '../ui/card';
import { TrendingUp, TrendingDown, Dumbbell, List, Calendar, Weight as WeightIcon, Repeat, History, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { AllExercisesDialog } from './AllExercisesDialog';
import { ExerciseSetsHistoryDialog, ExerciseSet } from './ExerciseSetsHistoryDialog';
import { Badge } from '../ui/badge';
import { ExerciseDetailsDialog } from './ExerciseDetailsDialog';
import { exerciseDetailsData } from '../../data/exerciseDetails';

interface ExerciseProgress {
  name: string;
  start: number;
  current: number;
  unit: string;
  improvement: number;
  reverse?: boolean;
  isFavorite?: boolean;
  category?: string;
  latestSets?: ExerciseSet[];
}

interface ExerciseProgressWidgetProps {
  exercises: ExerciseProgress[];
  allExercises?: ExerciseProgress[];
  handleToggleFavorite?: (exerciseName: string) => void;
  allExerciseSets?: Record<string, ExerciseSet[]>;
}

export function ExerciseProgressWidget({ exercises, allExercises, handleToggleFavorite, allExerciseSets }: ExerciseProgressWidgetProps) {
  const [isAllExercisesDialogOpen, setIsAllExercisesDialogOpen] = useState(false);
  const [selectedExerciseForHistory, setSelectedExerciseForHistory] = useState<string | null>(null);
  const [expandedExercises, setExpandedExercises] = useState<Record<string, boolean>>({});
  const [selectedExerciseForDetails, setSelectedExerciseForDetails] = useState<string | null>(null);
  const exercisesToShow = allExercises || exercises;

  const toggleExerciseExpanded = (exerciseName: string) => {
    setExpandedExercises(prev => ({
      ...prev,
      [exerciseName]: !prev[exerciseName]
    }));
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-training-primary/20 via-training-primary/10 to-training-secondary/20 backdrop-blur-sm border border-training-primary/30">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-stats-secondary via-stats-primary to-stats-accent">
            <Dumbbell className="h-6 w-6 text-stats-primary-foreground" />
          </div>
          <div>
            <h3 className="text-foreground">Exercise Progress</h3>
            <p className="text-sm text-white">Recent sets and strength gains</p>
          </div>
        </div>
        {allExercises && allExercises.length > exercises.length && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsAllExercisesDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <List className="h-4 w-4" />
            See All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-4">
        {exercises.map((exercise) => {
          const exerciseSets = allExerciseSets?.[exercise.name] || exercise.latestSets || [];
          const latestBestSet = exerciseSets[0]; // First set is the latest
          const previousSets = exerciseSets.slice(1); // All sets except the latest
          const hasHistory = exerciseSets.length > 0;
          const isExpanded = expandedExercises[exercise.name] || false;

          return (
            <Card key={exercise.name} className="p-5 bg-gradient-to-br from-orange-600/40 via-red-500/30 to-orange-700/20 border border-orange-500/10 hover:border-orange-500/20 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-white mb-1">{exercise.name}</p>
                  <p className="text-xs text-white">Personal Record</p>
                </div>
                <div className="flex items-center gap-1 px-4 py-2 rounded-full text-xs bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 text-white shadow-lg shadow-orange-500/50 animate-pulse">
                  {exercise.reverse ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                  <span className="font-semibold">{Math.abs(exercise.improvement)}%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between gap-6 mb-4">
                <div className="flex-1">
                  <p className="text-xs text-white mb-1">Started</p>
                  <p className="text-white">{exercise.start} {exercise.unit}</p>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-xs text-white mb-1">Latest Best</p>
                  {latestBestSet ? (
                    <div className="flex items-center gap-1.5 justify-end">
                      <WeightIcon className="h-3.5 w-3.5 text-white" />
                      <span className="text-white">{latestBestSet.weight}kg</span>
                      <span className="text-white">×</span>
                      <Repeat className="h-3.5 w-3.5 text-white" />
                      <span className="text-white">{latestBestSet.reps}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 justify-end">
                      <WeightIcon className="h-3.5 w-3.5 text-white" />
                      <span className="text-white">{exercise.current}{exercise.unit}</span>
                      <span className="text-white">×</span>
                      <Repeat className="h-3.5 w-3.5 text-white" />
                      <span className="text-white">{exercise.current}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* See Info Button */}
              {exercise.isFavorite && exerciseDetailsData[exercise.name] && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedExerciseForDetails(exercise.name)}
                  className="w-full h-8 px-2 mb-2 bg-white/10 hover:bg-white/20 text-white border border-gray-700/50"
                >
                  <Info className="h-4 w-4 mr-1" />
                  <span className="text-xs">See Info</span>
                </Button>
              )}

              {/* Previous Sets Section - Always visible */}
              <div className="pt-4 border-t border-gray-700/50">
                <button
                  onClick={() => toggleExerciseExpanded(exercise.name)}
                  className="w-full flex items-center justify-between px-3 py-2 border border-gray-700/50 hover:border-gray-600/70 rounded transition-colors"
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
                        <div key={set.id} className="flex items-center justify-between px-3 py-2.5 bg-black/30 border border-gray-700/50 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                              <WeightIcon className="h-4 w-4 text-white" />
                              <span className="text-sm text-white">{set.weight}kg</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Repeat className="h-4 w-4 text-white" />
                              <span className="text-sm text-white">{set.reps}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-white" />
                            <span className="text-xs text-white">{set.date}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-4 bg-black/20 border border-gray-700/50 rounded-lg text-center">
                        <p className="text-sm text-white">No previous sets recorded yet</p>
                      </div>
                    )}
                  </div>
                )}
                {exerciseSets.length > 4 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2 h-8 px-2 text-xs bg-white/10 hover:bg-white/20 text-white border border-gray-700/50"
                    onClick={() => setSelectedExerciseForHistory(exercise.name)}
                  >
                    <History className="h-3 w-3 mr-1" />
                    View All ({exerciseSets.length})
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* All Exercises Dialog */}
      <AllExercisesDialog
        open={isAllExercisesDialogOpen}
        onOpenChange={setIsAllExercisesDialogOpen}
        exercises={exercisesToShow}
        onToggleFavorite={handleToggleFavorite}
        allExerciseSets={allExerciseSets}
      />

      {/* Exercise Sets History Dialog */}
      {selectedExerciseForHistory && allExerciseSets && (
        <ExerciseSetsHistoryDialog
          open={!!selectedExerciseForHistory}
          onOpenChange={(open) => !open && setSelectedExerciseForHistory(null)}
          exerciseName={selectedExerciseForHistory}
          sets={allExerciseSets[selectedExerciseForHistory] || []}
        />
      )}

      {/* Exercise Details Dialog */}
      {selectedExerciseForDetails && (
        <ExerciseDetailsDialog
          open={!!selectedExerciseForDetails}
          onOpenChange={(open) => !open && setSelectedExerciseForDetails(null)}
          exerciseName={selectedExerciseForDetails}
          details={exerciseDetailsData[selectedExerciseForDetails]}
        />
      )}
    </Card>
  );
}