import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Dumbbell, Target, AlertCircle, Zap, Flame, TrendingUp } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

interface ExerciseDetails {
  name: string;
  description: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string;
  difficulty: string;
  instructions: string[];
  tips: string[];
  benefits: string[];
  category?: string;
}

interface ExerciseDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exerciseName: string;
  details: ExerciseDetails | null;
  recommendedWeight?: string;
  recommendedRPE?: string;
}

export function ExerciseDetailsDialog({ open, onOpenChange, exerciseName, details, recommendedWeight, recommendedRPE }: ExerciseDetailsDialogProps) {
  if (!details) return null;
  
  const exercise = details;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] p-0 gap-0 bg-background border-border">
        {/* Hero Header with Gradient */}
        <div className="relative bg-gradient-to-br from-training via-training/90 to-training-accent p-8 rounded-t-lg">
          <div className="absolute inset-0 bg-grid-white/[0.05] rounded-t-lg"></div>
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Dumbbell className="h-6 w-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-white text-2xl">{exercise.name}</DialogTitle>
                  <p className="text-white/80 text-sm">{exercise.category}</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-white/90 text-sm">
                <Target className="h-4 w-4" />
                <span>{exercise.difficulty}</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/90 text-sm">
                <Dumbbell className="h-4 w-4" />
                <span>{exercise.equipment}</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/90 text-sm">
                <Zap className="h-4 w-4" />
                <span>{exercise.primaryMuscles.join(', ')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="max-h-[calc(85vh-280px)] px-8 py-6">
          <div className="space-y-6">
            {/* Coach Recommendations Section - Prominent at Top */}
            {(recommendedWeight || recommendedRPE) && (
              <Card className="p-6 bg-gradient-to-br from-purple-500/15 via-purple-500/10 to-purple-500/5 border-purple-500/10 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white flex-shrink-0 shadow-md">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <h4 className="text-foreground uppercase tracking-wide">Coach Majen's Recommendation</h4>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      {recommendedWeight && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">Target Weight</p>
                          <div className="flex items-center gap-2">
                            <Dumbbell className="h-4 w-4 text-purple-500" />
                            <span className="text-lg text-foreground">{recommendedWeight}</span>
                          </div>
                        </div>
                      )}
                      {recommendedRPE && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">Target RPE</p>
                          <div className="flex items-center gap-2">
                            <Flame className="h-4 w-4 text-purple-500" />
                            <span className="text-lg text-foreground">{recommendedRPE}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/10">
                      <p className="text-xs text-foreground leading-relaxed">
                        These values are pre-filled in your workout tracker based on your training history and progression. 
                        Feel free to adjust them based on how you feel today.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Description */}
            <Card className="p-5 bg-gradient-to-br from-training/10 to-training/5 border-training/10">
              <p className="text-sm text-foreground leading-relaxed">{exercise.description}</p>
            </Card>

            {/* Muscle Groups - 2 Column Grid */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 bg-gradient-to-br from-training/10 to-training/5 border-training/10 hover:border-training/20 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="h-5 w-5 text-training" />
                  <h4 className="text-sm text-foreground uppercase tracking-wide">Primary Muscles</h4>
                </div>
                <ul className="space-y-2">
                  {exercise.primaryMuscles.map((muscle, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-training flex-shrink-0"></div>
                      <span className="text-foreground">{muscle}</span>
                    </li>
                  ))}
                </ul>
              </Card>
              <Card className="p-6 bg-gradient-to-br from-training/5 to-transparent border-training/10 hover:border-training/20 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="h-5 w-5 text-training/60" />
                  <h4 className="text-sm text-white uppercase tracking-wide">Secondary Muscles</h4>
                </div>
                <ul className="space-y-2">
                  {exercise.secondaryMuscles.map((muscle, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-training/60 flex-shrink-0"></div>
                      <span className="text-white">{muscle}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            {/* Benefits Section */}
            {exercise.benefits && exercise.benefits.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-1 w-1 rounded-full bg-training"></div>
                  <h4 className="text-foreground uppercase tracking-wide text-sm">Benefits</h4>
                  <div className="flex-1 h-px bg-border"></div>
                </div>
                <Card className="p-5 bg-gradient-to-br from-training/5 to-transparent border-training/10">
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {exercise.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm">
                        <TrendingUp className="mt-0.5 h-4 w-4 text-training flex-shrink-0" />
                        <span className="text-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            )}

            {/* Instructions Section */}
            {exercise.instructions && exercise.instructions.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-1 w-1 rounded-full bg-training"></div>
                  <h4 className="text-foreground uppercase tracking-wide text-sm">How to Perform</h4>
                  <div className="flex-1 h-px bg-border"></div>
                </div>
                <div className="space-y-4">
                  {exercise.instructions.map((instruction, idx) => (
                    <Card key={idx} className="p-5 bg-gradient-to-br from-training/5 to-transparent border-training/10 hover:border-training/20 transition-all hover:shadow-md">
                      <div className="flex gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-training to-training-accent text-white flex-shrink-0 text-sm shadow-lg">
                          {idx + 1}
                        </div>
                        <p className="text-sm text-foreground leading-relaxed pt-1">{instruction}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Tips Section */}
            {exercise.tips && exercise.tips.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-1 w-1 rounded-full bg-training"></div>
                  <h4 className="text-foreground uppercase tracking-wide text-sm">Pro Tips</h4>
                  <div className="flex-1 h-px bg-border"></div>
                </div>
                <div className="space-y-3">
                  {exercise.tips.map((tip, idx) => (
                    <Card key={idx} className="p-4 bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/10 hover:border-amber-500/20 transition-colors">
                      <div className="flex gap-3">
                        <AlertCircle className="mt-0.5 h-4 w-4 text-amber-600 flex-shrink-0" />
                        <p className="text-sm text-foreground leading-relaxed">{tip}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-8 py-5 border-t bg-muted/10">
          <Button 
            onClick={() => onOpenChange(false)} 
            className="w-full bg-gradient-to-r from-training to-training-accent hover:from-training/90 hover:to-training-accent/90 text-white shadow-lg"
          >
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}