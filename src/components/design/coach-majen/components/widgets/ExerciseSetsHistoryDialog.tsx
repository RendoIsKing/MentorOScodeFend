import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dumbbell, Calendar, Weight as WeightIcon, Repeat } from 'lucide-react';

export interface ExerciseSet {
  id: string;
  exerciseName: string;
  weight: number;
  reps: number;
  date: string;
  dateObj: Date;
  workoutName?: string;
  notes?: string;
}

interface ExerciseSetsHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exerciseName: string;
  sets: ExerciseSet[];
}

export function ExerciseSetsHistoryDialog({ 
  open, 
  onOpenChange, 
  exerciseName, 
  sets 
}: ExerciseSetsHistoryDialogProps) {
  // Sort sets by date (newest first)
  const sortedSets = [...sets].sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());

  // Find personal record
  const personalRecord = sortedSets.reduce((max, set) => {
    const setScore = set.weight * set.reps; // Simple calculation
    const maxScore = max.weight * max.reps;
    return setScore > maxScore ? set : max;
  }, sortedSets[0]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-stats-secondary to-stats-primary">
              <Dumbbell className="h-5 w-5 text-white" />
            </div>
            {exerciseName} - Set History
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Personal Record Card */}
          {personalRecord && (
            <Card className="p-4 bg-gradient-to-br from-stats-primary/10 to-stats-secondary/10 border-stats-primary/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Personal Record</p>
                  <p className="text-2xl text-foreground">
                    {personalRecord.weight} kg × {personalRecord.reps} reps
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{personalRecord.date}</p>
                </div>
                <Badge className="bg-stats-primary text-white">PR</Badge>
              </div>
            </Card>
          )}

          {/* All Sets */}
          <div className="space-y-2">
            <h4 className="text-sm text-muted-foreground">All Sets ({sortedSets.length})</h4>
            <div className="space-y-2">
              {sortedSets.map((set) => {
                const isPR = set.id === personalRecord?.id;
                return (
                  <Card 
                    key={set.id} 
                    className={`p-4 ${isPR ? 'border-stats-primary/50 bg-stats-primary/5' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <div className="flex items-center gap-2">
                            <WeightIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-foreground">{set.weight} kg</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Repeat className="h-4 w-4 text-muted-foreground" />
                            <span className="text-foreground">{set.reps} reps</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{set.date}</span>
                          </div>
                          {set.workoutName && (
                            <span>• {set.workoutName}</span>
                          )}
                        </div>
                        
                        {set.notes && (
                          <p className="text-xs text-muted-foreground mt-2 italic">{set.notes}</p>
                        )}
                      </div>
                      
                      {isPR && (
                        <Badge className="bg-stats-primary text-white ml-2">PR</Badge>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
