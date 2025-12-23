import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Weight, TrendingDown, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import type { WeightEntry } from '../../types';

interface WeightEntryWithChange extends WeightEntry {
  change?: number;
  note?: string;
}

interface WeightHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entries: WeightEntry[];
  startWeight: number;
  targetWeight: number;
}

export function WeightHistoryDialog({ open, onOpenChange, entries, startWeight, targetWeight }: WeightHistoryDialogProps) {
  // Calculate changes between entries
  const entriesWithChanges: WeightEntryWithChange[] = entries.map((entry, index) => {
    if (index === 0) {
      return { ...entry, change: 0 };
    }
    const previousWeight = entries[index - 1].weight;
    return { ...entry, change: entry.weight - previousWeight };
  });

  const totalChange = startWeight - entries[entries.length - 1].weight;
  const remainingToGoal = entries[entries.length - 1].weight - targetWeight;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        {/* Fixed Header */}
        <div className="sticky top-0 bg-background z-10 p-4 md:p-6 border-b">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-stats-primary via-stats-primary to-stats-secondary rounded-lg">
                <Weight className="h-5 w-5 text-stats-primary-foreground" />
              </div>
              <div>
                <DialogTitle>Complete Weight History</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  All your weight check-ins and progress
                </p>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 md:p-6 space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 bg-stats-primary/5 border-stats-primary/20">
              <p className="text-xs text-white mb-1">Total Lost</p>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-stats-primary" />
                <p className="text-xl text-stats-primary">{totalChange.toFixed(1)} kg</p>
              </div>
            </Card>
            <Card className="p-4 bg-muted">
              <p className="text-xs text-white mb-1">Current Weight</p>
              <div className="flex items-center gap-2">
                <Weight className="h-5 w-5 text-foreground" />
                <p className="text-xl text-foreground">{entries[entries.length - 1].weight} kg</p>
              </div>
            </Card>
            <Card className="p-4 bg-muted">
              <p className="text-xs text-white mb-1">To Goal</p>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-muted-foreground" />
                <p className="text-xl text-foreground">{remainingToGoal.toFixed(1)} kg</p>
              </div>
            </Card>
          </div>

          {/* Weight Entries */}
          <div>
            <h4 className="text-foreground mb-3">All Check-ins</h4>
            <div className="space-y-2">
              {entriesWithChanges.reverse().map((entry, index) => {
                const isLatest = index === 0;
                const isStart = index === entriesWithChanges.length - 1;
                
                return (
                  <Card 
                    key={index} 
                    className={`p-4 ${isLatest ? 'bg-stats-primary/5 border-stats-primary/30' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          isLatest 
                            ? 'bg-gradient-to-br from-stats-primary via-stats-primary to-stats-secondary' 
                            : 'bg-muted'
                        }`}>
                          <Calendar className={`h-4 w-4 ${
                            isLatest ? 'text-stats-primary-foreground' : 'text-muted-foreground'
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className="text-foreground">{entry.date}</p>
                            {isLatest && (
                              <Badge className="bg-stats-primary/10 text-stats-primary border-stats-primary/30 text-xs">
                                Latest
                              </Badge>
                            )}
                            {isStart && (
                              <Badge variant="outline" className="text-xs">
                                Starting
                              </Badge>
                            )}
                          </div>
                          {entry.note && (
                            <p className="text-sm text-muted-foreground">{entry.note}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {entry.change !== 0 && (
                          <div className={`flex items-center gap-1 ${
                            entry.change! < 0 ? 'text-success' : 'text-amber-600'
                          }`}>
                            {entry.change! < 0 ? (
                              <TrendingDown className="h-4 w-4" />
                            ) : (
                              <TrendingUp className="h-4 w-4" />
                            )}
                            <span className="text-sm font-medium">
                              {entry.change! > 0 ? '+' : ''}{entry.change!.toFixed(1)} kg
                            </span>
                          </div>
                        )}
                        <div className="text-right">
                          <p className="text-xl text-foreground font-medium">{entry.weight} kg</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
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
