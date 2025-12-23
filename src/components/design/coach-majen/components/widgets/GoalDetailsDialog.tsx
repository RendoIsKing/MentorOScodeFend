import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { 
  Target, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  TrendingUp, 
  Lightbulb,
  ListChecks,
  Flag,
  Star
} from 'lucide-react';

interface Milestone {
  label: string;
  achieved: boolean;
}

interface Goal {
  id: number;
  title: string;
  description?: string;
  category: string;
  priority: string;
  deadline: string;
  progress: number;
  completed: boolean;
  milestones: Milestone[];
  keys?: string[];
  actionSteps?: string[];
  whyItMatters?: string;
  rewards?: string;
}

interface GoalDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal | null;
}

export function GoalDetailsDialog({ open, onOpenChange, goal }: GoalDetailsDialogProps) {
  if (!goal) return null;

  const priorityColors = {
    high: 'border-red-500/50 text-red-600 bg-red-50/50',
    medium: 'border-amber-500/50 text-amber-600 bg-amber-50/50',
    low: 'border-blue-500/50 text-blue-600 bg-blue-50/50',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        {/* Fixed Header */}
        <div className="sticky top-0 bg-background z-10 p-4 md:p-6 border-b">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${
                goal.completed 
                  ? 'bg-goals-primary/20 border border-goals-primary/10' 
                  : 'bg-gradient-to-br from-goals-primary via-goals-secondary to-goals-accent'
              }`}>
                {goal.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-goals-primary" />
                ) : (
                  <Target className="h-5 w-5 text-goals-primary-foreground" />
                )}
              </div>
              <div className="flex-1">
                <DialogTitle className={goal.completed ? 'line-through opacity-75' : ''}>
                  {goal.title}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {goal.category}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={`text-xs border ${priorityColors[goal.priority as keyof typeof priorityColors]}`}
                  >
                    {goal.priority} priority
                  </Badge>
                  {goal.completed && (
                    <Badge className="bg-goals-primary/10 text-goals-primary border-goals-primary/10 text-xs">
                      Completed
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 md:p-6 space-y-6">
          {/* Description */}
          {goal.description && (
            <div>
              <h4 className="text-foreground mb-2 flex items-center gap-2">
                <Flag className="h-4 w-4 text-goals-primary" />
                About This Goal
              </h4>
              <p className="text-muted-foreground">{goal.description}</p>
            </div>
          )}

          {/* Why It Matters */}
          {goal.whyItMatters && (
            <Card className="p-4 bg-goals-primary/5 border-goals-primary/10">
              <h4 className="text-foreground mb-2 flex items-center gap-2">
                <Star className="h-4 w-4 text-goals-primary" />
                Why This Matters
              </h4>
              <p className="text-muted-foreground">{goal.whyItMatters}</p>
            </Card>
          )}

          {/* Progress Section */}
          {!goal.completed && (
            <div>
              <h4 className="text-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-goals-primary" />
                Current Progress
              </h4>
              <Card className="p-4 bg-muted">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Overall Progress</span>
                  <span className="text-foreground font-medium">{goal.progress}%</span>
                </div>
                <Progress value={goal.progress} className="h-3 mb-3" />
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Target date: {goal.deadline}</span>
                </div>
              </Card>
            </div>
          )}

          {/* Milestones */}
          {goal.milestones.length > 0 && (
            <div>
              <h4 className="text-foreground mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-goals-primary" />
                Milestones
              </h4>
              <div className="space-y-2">
                {goal.milestones.map((milestone, idx) => (
                  <Card 
                    key={idx} 
                    className={`p-3 ${
                      milestone.achieved 
                        ? 'bg-goals-secondary/10 border-goals-secondary/10' 
                        : 'bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {milestone.achieved ? (
                        <CheckCircle2 className="h-5 w-5 text-goals-secondary flex-shrink-0" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className={`${
                        milestone.achieved 
                          ? 'text-goals-secondary line-through' 
                          : 'text-foreground'
                      }`}>
                        {milestone.label}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Keys to Success */}
          {goal.keys && goal.keys.length > 0 && (
            <div>
              <h4 className="text-foreground mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-goals-accent" />
                Keys to Success
              </h4>
              <Card className="p-4 bg-goals-accent/5 border-goals-accent/10">
                <ul className="space-y-2">
                  {goal.keys.map((key, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-goals-accent mt-1">•</span>
                      <span>{key}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          )}

          {/* Action Steps */}
          {goal.actionSteps && goal.actionSteps.length > 0 && (
            <div>
              <h4 className="text-foreground mb-3 flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-goals-primary" />
                Action Steps
              </h4>
              <div className="space-y-2">
                {goal.actionSteps.map((step, idx) => (
                  <Card key={idx} className="p-3 bg-muted">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-goals-primary/10 text-goals-primary text-xs font-medium flex-shrink-0">
                        {idx + 1}
                      </div>
                      <span className="text-foreground">{step}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Rewards */}
          {goal.rewards && (
            <Card className="p-4 bg-gradient-to-br from-goals-primary/5 via-goals-secondary/5 to-goals-accent/5 border-goals-primary/10">
              <h4 className="text-foreground mb-2 flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500" />
                Reward When Completed
              </h4>
              <p className="text-muted-foreground">{goal.rewards}</p>
            </Card>
          )}
        </div>

        {/* Fixed Footer */}
        <div className="sticky bottom-0 bg-background border-t p-4 md:p-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
