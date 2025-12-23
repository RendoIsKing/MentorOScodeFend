import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { ScrollArea } from '../ui/scroll-area';
import { CheckCircle, Dumbbell, Clock, StickyNote, Info } from 'lucide-react';
import { getExerciseDetail } from '../../lib/exerciseDatabase';
import { ExerciseDetailsDialog } from './ExerciseDetailsDialog';
import { exerciseDetailsData } from '../../data/exerciseDetails';

export interface SetDetail {
  setNumber: number;
  completed: boolean;
  weight: string;
  reps: string;
  restTime: string;
  recommendedWeight?: string;  // Coach's recommended weight for this specific set
  recommendedReps?: string;    // Coach's recommended reps for this specific set
  recommendedRPE?: string;     // Coach's recommended RPE for this specific set
}

interface ExerciseTrackingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exerciseName: string;
  targetSets: number;
  targetReps: string;
  targetRest: string;
  setDetails: SetDetail[];
  exerciseNotes: string;
  onSave: (setDetails: SetDetail[], notes: string) => void;
  recommendedWeight?: string;  // Coach's recommended weight
  recommendedRPE?: string;     // Coach's recommended RPE
}

export function ExerciseTrackingDialog({
  open,
  onOpenChange,
  exerciseName,
  targetSets,
  targetReps,
  targetRest,
  setDetails: initialSetDetails,
  exerciseNotes: initialNotes,
  onSave,
  recommendedWeight,
  recommendedRPE,
}: ExerciseTrackingDialogProps) {
  const [setDetails, setSetDetails] = useState<SetDetail[]>(initialSetDetails);
  const [notes, setNotes] = useState(initialNotes);
  const [showExerciseInfo, setShowExerciseInfo] = useState(false);
  const [showExerciseDetailsDialog, setShowExerciseDetailsDialog] = useState(false);

  // Update local state when props change AND pre-fill with recommended weight if empty
  useEffect(() => {
    // Pre-fill each set with its recommended values if the fields are empty
    const updatedSetDetails = initialSetDetails.map(set => {
      const updates: Partial<SetDetail> = {};
      
      // Pre-fill weight from per-set recommendation or fallback to general recommendation
      if (!set.weight) {
        if (set.recommendedWeight) {
          // Extract numeric value from recommendedWeight (e.g., "75kg" -> "75", "BW+10kg" -> "10")
          const weightMatch = set.recommendedWeight.match(/(\d+(?:\.\d+)?)/);
          updates.weight = weightMatch ? weightMatch[1] : '';
        } else if (recommendedWeight) {
          // Fallback to general recommended weight
          const weightMatch = recommendedWeight.match(/(\d+(?:\.\d+)?)/);
          updates.weight = weightMatch ? weightMatch[1] : '';
        }
      }
      
      // Pre-fill reps from per-set recommendation
      if (!set.reps && set.recommendedReps) {
        updates.reps = set.recommendedReps;
      }
      
      return Object.keys(updates).length > 0 ? { ...set, ...updates } : set;
    });
    
    setSetDetails(updatedSetDetails);
    setNotes(initialNotes);
  }, [initialSetDetails, initialNotes, recommendedWeight]);

  const exerciseDetail = getExerciseDetail(exerciseName);
  const exerciseDetailsInfo = exerciseDetailsData[exerciseName];
  const completedSets = setDetails.filter(s => s.completed).length;
  const completionPercentage = Math.round((completedSets / targetSets) * 100);

  const handleSetToggle = (setNumber: number) => {
    setSetDetails(prev => prev.map(set => 
      set.setNumber === setNumber 
        ? { ...set, completed: !set.completed }
        : set
    ));
  };

  const handleSetChange = (setNumber: number, field: 'weight' | 'reps' | 'restTime', value: string) => {
    setSetDetails(prev => prev.map(set =>
      set.setNumber === setNumber
        ? { ...set, [field]: value }
        : set
    ));
  };

  const handleSave = () => {
    onSave(setDetails, notes);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl h-[90vh] flex flex-col overflow-hidden p-0">
          <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b">
            <DialogTitle className="text-xl mb-3 pr-8 text-left">{exerciseName}</DialogTitle>
            
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant="outline" className="bg-energy/10 text-white border-energy/10">
                {targetSets} sets × {targetReps} reps
              </Badge>
              <Badge variant="outline" className="bg-muted/50 text-white border-border">
                <Clock className="h-3 w-3 mr-1" />
                {targetRest} rest
              </Badge>
              {exerciseDetailsInfo && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExerciseDetailsDialog(true)}
                  className="flex-shrink-0 ml-auto"
                >
                  <Info className="h-4 w-4 mr-1.5" />
                  Info
                </Button>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white">Progress</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white">
                    {completedSets} / {targetSets} sets
                  </span>
                  <Badge 
                    variant="outline" 
                    className={`${
                      completionPercentage === 100 
                        ? 'bg-success/10 text-success border-success/10' 
                        : 'bg-energy/10 text-white border-energy/10'
                    }`}
                  >
                    {completionPercentage}%
                  </Badge>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    completionPercentage === 100 
                      ? 'bg-gradient-to-r from-success to-success/80' 
                      : 'bg-gradient-to-r from-energy to-energy-dark'
                  }`}
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 min-h-0">
            <div className="space-y-6 py-4 px-6">
              {/* Coach Recommendations Card */}
              {(recommendedWeight || recommendedRPE) && (
                <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/10">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-lg bg-primary text-white flex-shrink-0">
                      🎯
                    </div>
                    <div className="flex-1">
                      <h4 className="text-foreground mb-2">Coach Majen's Recommendation</h4>
                      <div className="flex flex-wrap items-center gap-3">
                        {recommendedWeight && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-white">Weight:</span>
                            <Badge className="bg-primary/20 text-white border-primary/10">
                              {recommendedWeight}
                            </Badge>
                          </div>
                        )}
                        {recommendedRPE && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-white">Target RPE:</span>
                            <Badge className="bg-primary/20 text-white border-primary/10">
                              {recommendedRPE}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Pre-filled below - adjust as needed based on how you feel today
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Exercise Instructions (collapsible) */}
              {showExerciseInfo && exerciseDetail && (
                <Card className="p-4 bg-primary/5 border-primary/10">
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm mb-2 text-primary">Muscles Targeted</h4>
                      <div className="flex flex-wrap gap-1">
                        {(exerciseDetail.primaryMuscles || []).map((muscle, idx) => (
                          <Badge
                            key={`primary-${idx}`}
                            className={
                              idx === 0
                                ? "bg-energy/10 text-white border-energy/10 text-xs"
                                : "text-xs"
                            }
                            variant={idx === 0 ? undefined : "outline"}
                          >
                            {muscle}
                          </Badge>
                        ))}
                        {exerciseDetail.secondaryMuscles.map((muscle, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">{muscle}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm mb-1 text-primary">Pro Tip</h4>
                      <p className="text-sm text-white italic">
                        {(exerciseDetail as any)?.proTip || exerciseDetail.tips?.[0] || "Focus on form and control."}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Set Tracking */}
              <div>
                <h4 className="text-foreground mb-3 flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-white" />
                  Set Details
                </h4>
                <div className="space-y-3">
                  {setDetails.map((set) => (
                    <Card 
                      key={set.setNumber}
                      className={`p-4 transition-all ${
                        set.completed 
                          ? 'bg-success/5 border-success/10' 
                          : 'bg-card border-border'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Checkbox */}
                        <div className="flex items-center pt-2">
                          <button
                            onClick={() => handleSetToggle(set.setNumber)}
                            className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all group ${
                              set.completed
                                ? 'bg-success border-success text-white'
                                : 'bg-success/5 border-success/50 hover:bg-success hover:border-success hover:text-white'
                            }`}
                          >
                            {set.completed ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              <>
                                <span className="text-foreground group-hover:hidden">{set.setNumber}</span>
                                <CheckCircle className="h-5 w-5 hidden group-hover:block" />
                              </>
                            )}
                          </button>
                        </div>

                        {/* Input Fields */}
                        <div className="flex-1 grid grid-cols-3 gap-3">
                          <div>
                            <label className="text-xs text-white mb-1 block">
                              Weight (kg)
                            </label>
                            <Input
                              type="text"
                              placeholder="60"
                              value={set.weight}
                              onChange={(e) => handleSetChange(set.setNumber, 'weight', e.target.value)}
                              className="h-9"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-white mb-1 block">
                              Reps
                            </label>
                            <Input
                              type="text"
                              placeholder={targetReps}
                              value={set.reps}
                              onChange={(e) => handleSetChange(set.setNumber, 'reps', e.target.value)}
                              className="h-9"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-white mb-1 block">
                              Rest (sec)
                            </label>
                            <Input
                              type="text"
                              placeholder={targetRest.replace('s', '')}
                              value={set.restTime}
                              onChange={(e) => handleSetChange(set.setNumber, 'restTime', e.target.value)}
                              className="h-9"
                            />
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Exercise Notes */}
              <div>
                <h4 className="text-foreground mb-3 flex items-center gap-2">
                  <StickyNote className="h-4 w-4 text-white" />
                  Exercise Notes
                </h4>
                <Textarea
                  placeholder="How did this exercise feel? Any observations or adjustments made..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
                <p className="text-xs text-white mt-2">
                  Track your form, how you felt, any pain, or modifications made
                </p>
              </div>
            </div>
          </ScrollArea>

          {/* Footer Actions */}
          <div className="flex-shrink-0 px-6 py-4 border-t bg-muted/10 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {completedSets === targetSets ? (
                <span className="text-success flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  All sets completed!
                </span>
              ) : (
                <span className="text-white">
                  {targetSets - completedSets} set{targetSets - completedSets !== 1 ? 's' : ''} remaining
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                className="bg-gradient-to-r from-energy to-energy-dark hover:from-energy-dark hover:to-energy"
              >
                Save Progress
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Exercise Details Dialog */}
      {exerciseDetailsInfo && (
        <ExerciseDetailsDialog
          open={showExerciseDetailsDialog}
          onOpenChange={setShowExerciseDetailsDialog}
          exerciseName={exerciseName}
          details={exerciseDetailsInfo}
          recommendedWeight={recommendedWeight}
          recommendedRPE={recommendedRPE}
        />
      )}
    </>
  );
}