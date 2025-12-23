import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Target, TrendingUp, Dumbbell, Heart, Zap, Award, Calendar, Users, ChevronDown } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { useState } from 'react';

interface TrainingPlanOverviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TrainingPlanOverviewDialog({ open, onOpenChange }: TrainingPlanOverviewDialogProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    philosophy: true,
    trainingSplit: true,
    coreExercises: true,
    targetMuscles: true,
    transformation: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[95vh] max-h-[95vh] p-0 gap-0 bg-background border rounded-lg my-auto flex flex-col">
        {/* Hero Header */}
        <div className="relative bg-gradient-to-r from-training-primary to-training-secondary px-6 py-6 border-b border-training-primary/20 rounded-t-lg">
          <div className="space-y-2">
            <DialogTitle className="text-white">12-Week Transformation</DialogTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-white/20 text-white border-gray-600/60 text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                12 Weeks
              </Badge>
              <Badge className="bg-white/20 text-white border-gray-600/60 text-xs">
                <Dumbbell className="h-3 w-3 mr-1" />
                5 Days/Week
              </Badge>
              <Badge className="bg-white/20 text-white border-gray-600/60 text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                Progressive Overload
              </Badge>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 overflow-auto">
          <div className="space-y-6 px-6 py-6">
            {/* Program Philosophy */}
            <div>
              <button
                onClick={() => toggleSection('philosophy')}
                className="flex items-center gap-2 mb-4 w-full hover:opacity-80 transition-opacity"
              >
                <div className="h-1 w-1 rounded-full bg-training-primary"></div>
                <h4 className="text-foreground uppercase tracking-wide text-sm">Program Philosophy</h4>
                <div className="flex-1 h-px bg-border"></div>
                <ChevronDown className={`h-4 w-4 text-foreground transition-transform ${expandedSections.philosophy ? '' : '-rotate-90'}`} />
              </button>
              {expandedSections.philosophy && (
                <Card className="p-6 bg-gradient-to-br from-training-primary/10 to-training-primary/5 border-training-primary/30">
                  <p className="text-foreground leading-relaxed mb-4">
                    This 12-week transformation program is designed to build <strong>strength</strong> while simultaneously promoting <strong>fat loss</strong>. 
                    The program follows a periodized approach, combining heavy compound movements with strategic accessory work to maximize muscle growth 
                    and metabolic conditioning.
                  </p>
                  <p className="text-foreground leading-relaxed">
                    Each phase progressively increases in intensity, utilizing proven principles of progressive overload to ensure continuous adaptation 
                    and improvement. The program balances pushing your limits with adequate recovery to prevent overtraining and promote sustainable progress.
                  </p>
                </Card>
              )}
            </div>

            {/* Training Split & Focus */}
            <div>
              <button
                onClick={() => toggleSection('trainingSplit')}
                className="flex items-center gap-2 mb-4 w-full hover:opacity-80 transition-opacity"
              >
                <div className="h-1 w-1 rounded-full bg-training-primary"></div>
                <h4 className="text-foreground uppercase tracking-wide text-sm">Training Split & Focus</h4>
                <div className="flex-1 h-px bg-border"></div>
                <ChevronDown className={`h-4 w-4 text-foreground transition-transform ${expandedSections.trainingSplit ? '' : '-rotate-90'}`} />
              </button>
              {expandedSections.trainingSplit && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-5 bg-gradient-to-br from-training-primary/10 to-transparent border-training-primary/30">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-training-primary/20 rounded-lg">
                        <Dumbbell className="h-5 w-5 text-training-primary" />
                      </div>
                      <h5 className="text-foreground">Weekly Structure</h5>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-training-primary mt-1">•</span>
                        <span className="text-foreground"><strong>Day 1:</strong> Upper Body Power (Chest, Back, Arms)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-training-primary mt-1">•</span>
                        <span className="text-foreground"><strong>Day 2:</strong> Lower Body Strength (Legs, Glutes)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-training-primary mt-1">•</span>
                        <span className="text-foreground"><strong>Day 3:</strong> Rest or Active Recovery</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-training-primary mt-1">•</span>
                        <span className="text-foreground"><strong>Day 4:</strong> HIIT Cardio & Conditioning</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-training-primary mt-1">•</span>
                        <span className="text-foreground"><strong>Day 5:</strong> Full Body Circuit</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-training-primary mt-1">•</span>
                        <span className="text-foreground"><strong>Day 6:</strong> Core & Mobility</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-training-primary mt-1">•</span>
                        <span className="text-foreground"><strong>Day 7:</strong> Rest Day</span>
                      </li>
                    </ul>
                  </Card>

                  <Card className="p-5 bg-gradient-to-br from-training-secondary/10 to-transparent border-training-secondary/30">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-training-secondary/20 rounded-lg">
                        <Zap className="h-5 w-5 text-training-secondary" />
                      </div>
                      <h5 className="text-foreground">Training Style</h5>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-white mb-2">Primary Focus:</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="bg-training-primary/20 text-white border-training-primary/40">
                            Hypertrophy
                          </Badge>
                          <Badge variant="outline" className="bg-training-primary/20 text-white border-training-primary/40">
                            Strength
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-white mb-2">Secondary Focus:</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="bg-training-secondary/20 text-white border-training-secondary/40">
                            Fat Loss
                          </Badge>
                          <Badge variant="outline" className="bg-training-secondary/20 text-white border-training-secondary/40">
                            Conditioning
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-foreground leading-relaxed mt-3">
                          Rep ranges vary from <strong>5-8 reps</strong> for strength, 
                          <strong> 8-12 reps</strong> for hypertrophy, and <strong>15-20 reps</strong> for endurance and conditioning work.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>

            {/* Key Exercises */}
            <div>
              <button
                onClick={() => toggleSection('coreExercises')}
                className="flex items-center gap-2 mb-4 w-full hover:opacity-80 transition-opacity"
              >
                <div className="h-1 w-1 rounded-full bg-training-primary"></div>
                <h4 className="text-foreground uppercase tracking-wide text-sm">Core Exercises</h4>
                <div className="flex-1 h-px bg-border"></div>
                <ChevronDown className={`h-4 w-4 text-foreground transition-transform ${expandedSections.coreExercises ? '' : '-rotate-90'}`} />
              </button>
              {expandedSections.coreExercises && (
                <Card className="p-6 bg-gradient-to-br from-training-primary/5 to-transparent border-training-primary/20">
                  <p className="text-sm text-white mb-4">
                    This program centers around proven compound movements that deliver maximum results:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h6 className="text-foreground mb-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-training-primary" />
                        Primary Compound Lifts
                      </h6>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-training-primary flex-shrink-0"></div>
                          <span className="text-foreground"><strong>Back Squat</strong> - Lower body power & mass</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-training-primary flex-shrink-0"></div>
                          <span className="text-foreground"><strong>Deadlift</strong> - Total body strength</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-training-primary flex-shrink-0"></div>
                          <span className="text-foreground"><strong>Bench Press</strong> - Upper body pushing power</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-training-primary flex-shrink-0"></div>
                          <span className="text-foreground"><strong>Pull-ups</strong> - Back width & strength</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-training-primary flex-shrink-0"></div>
                          <span className="text-foreground"><strong>Overhead Press</strong> - Shoulder development</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h6 className="text-foreground mb-3 flex items-center gap-2">
                        <Zap className="h-4 w-4 text-training-secondary" />
                        Strategic Accessory Work
                      </h6>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-training-secondary flex-shrink-0"></div>
                          <span className="text-foreground"><strong>Bulgarian Split Squats</strong> - Unilateral leg strength</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-training-secondary flex-shrink-0"></div>
                          <span className="text-foreground"><strong>Barbell Rows</strong> - Back thickness</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-training-secondary flex-shrink-0"></div>
                          <span className="text-foreground"><strong>Dumbbell Work</strong> - Muscle balance & control</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-training-secondary flex-shrink-0"></div>
                          <span className="text-foreground"><strong>Core Exercises</strong> - Stability & aesthetics</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-training-secondary flex-shrink-0"></div>
                          <span className="text-foreground"><strong>HIIT Cardio</strong> - Fat loss & conditioning</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Target Muscle Groups */}
            <div>
              <button
                onClick={() => toggleSection('targetMuscles')}
                className="flex items-center gap-2 mb-4 w-full hover:opacity-80 transition-opacity"
              >
                <div className="h-1 w-1 rounded-full bg-training-primary"></div>
                <h4 className="text-foreground uppercase tracking-wide text-sm">Target Muscle Groups</h4>
                <div className="flex-1 h-px bg-border"></div>
                <ChevronDown className={`h-4 w-4 text-foreground transition-transform ${expandedSections.targetMuscles ? '' : '-rotate-90'}`} />
              </button>
              {expandedSections.targetMuscles && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { name: 'Chest', frequency: 'High' },
                    { name: 'Back', frequency: 'High' },
                    { name: 'Legs', frequency: 'High' },
                    { name: 'Shoulders', frequency: 'Medium' },
                    { name: 'Arms', frequency: 'Medium' },
                    { name: 'Core', frequency: 'High' },
                    { name: 'Glutes', frequency: 'High' },
                    { name: 'Calves', frequency: 'Low' },
                  ].map((muscle) => (
                    <Card 
                      key={muscle.name} 
                      className="p-4 bg-gradient-to-br from-training-primary/5 to-transparent border-training-primary/20 hover:border-training-primary/40 transition-colors"
                    >
                      <p className="text-foreground mb-1">{muscle.name}</p>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          muscle.frequency === 'High' 
                            ? 'bg-training-primary/20 text-white border-training-primary/40' 
                            : muscle.frequency === 'Medium'
                            ? 'bg-training-secondary/20 text-white border-training-secondary/40'
                            : 'bg-muted text-white border-border'
                        }`}
                      >
                        {muscle.frequency} Focus
                      </Badge>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Expected Outcomes */}
            <div>
              <button
                onClick={() => toggleSection('transformation')}
                className="flex items-center gap-2 mb-4 w-full hover:opacity-80 transition-opacity"
              >
                <div className="h-1 w-1 rounded-full bg-training-primary"></div>
                <h4 className="text-foreground uppercase tracking-wide text-sm">Your Transformation Journey</h4>
                <div className="flex-1 h-px bg-border"></div>
                <ChevronDown className={`h-4 w-4 text-foreground transition-transform ${expandedSections.transformation ? '' : '-rotate-90'}`} />
              </button>
              {expandedSections.transformation && (
                <Card className="p-6 bg-gradient-to-br from-purple-500/15 via-purple-500/10 to-purple-500/5 border-purple-500/40">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white flex-shrink-0">
                      <Award className="h-6 w-6" />
                    </div>
                    <div>
                      <h5 className="text-foreground mb-2">Who You'll Become</h5>
                      <p className="text-sm text-foreground leading-relaxed">
                        After 12 weeks of dedication, you'll emerge stronger, leaner, and more confident. This isn't just about physical transformation—it's about 
                        building mental resilience, developing healthy habits, and discovering what you're truly capable of.
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h6 className="text-foreground flex items-center gap-2">
                        <Dumbbell className="h-4 w-4 text-purple-500" />
                        Physical Changes
                      </h6>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-purple-500 mt-1">✓</span>
                          <span className="text-foreground">Increased muscle mass & definition</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-500 mt-1">✓</span>
                          <span className="text-foreground">Reduced body fat percentage</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-500 mt-1">✓</span>
                          <span className="text-foreground">Improved posture & mobility</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-500 mt-1">✓</span>
                          <span className="text-foreground">Enhanced athletic performance</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-500 mt-1">✓</span>
                          <span className="text-foreground">Better sleep quality & energy levels</span>
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h6 className="text-foreground flex items-center gap-2">
                        <Heart className="h-4 w-4 text-purple-500" />
                        Mental & Lifestyle Benefits
                      </h6>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-purple-500 mt-1">✓</span>
                          <span className="text-foreground">Increased confidence & self-esteem</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-500 mt-1">✓</span>
                          <span className="text-foreground">Stronger mental discipline</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-500 mt-1">✓</span>
                          <span className="text-foreground">Improved stress management</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-500 mt-1">✓</span>
                          <span className="text-foreground">Sustainable healthy habits</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-500 mt-1">✓</span>
                          <span className="text-foreground">A proven system you can repeat</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <p className="text-sm text-foreground leading-relaxed italic">
                      💪 <strong>Remember:</strong> Transformation is a journey, not a destination. Stay consistent, trust the process, and celebrate every small win 
                      along the way. Your future self will thank you for the work you're putting in today.
                    </p>
                  </div>
                </Card>
              )}
            </div>

            {/* Coach's Note */}
            <Card className="p-6 bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/30">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-white flex-shrink-0">
                  <span className="text-2xl">👋</span>
                </div>
                <div>
                  <h5 className="text-foreground mb-2">A Note from Coach Majen</h5>
                  <p className="text-sm text-foreground leading-relaxed">
                    "I've designed this program based on proven training principles and real-world results. Every workout, every exercise, and every rep range 
                    has a specific purpose in your transformation. Trust me, stay consistent, and don't be afraid to push yourself. I'll be here to guide you 
                    every step of the way. You've got this! 💪"
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-8 py-5 border-t bg-muted/30">
          <Button 
            onClick={() => onOpenChange(false)} 
            className="w-full bg-gradient-to-r from-training-primary to-training-secondary hover:from-training-primary/90 hover:to-training-secondary/90 text-white shadow-lg"
          >
            Let's Do This!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}