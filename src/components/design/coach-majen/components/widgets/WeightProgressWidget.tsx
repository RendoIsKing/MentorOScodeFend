import { useState } from 'react';
import { Card } from '../ui/card';
import { TrendingDown, Weight, History, Scale } from 'lucide-react';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { WeightHistoryDialog } from './WeightHistoryDialog';
import { WeighInDialog } from './WeighInDialog';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface WeightProgressWidgetProps {
  weightProgress: {
    start: number;
    current: number;
    target: number;
    history: Array<{ date: string; weight: number }>;
  };
  onWeighIn?: (data: { weight: number; date: Date; condition: string; notes?: string }) => void;
}

export function WeightProgressWidget({ weightProgress, onWeighIn }: WeightProgressWidgetProps) {
  const totalWeightProgress = ((weightProgress.start - weightProgress.current) / (weightProgress.start - weightProgress.target)) * 100;

  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isWeighInDialogOpen, setIsWeighInDialogOpen] = useState(false);

  const handleWeighIn = (data: { weight: number; date: Date; condition: string; notes?: string }) => {
    if (onWeighIn) {
      onWeighIn(data);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-stats-primary/20 via-stats-primary/10 to-stats-secondary/20 backdrop-blur-sm border border-stats-primary/30">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-stats-primary via-stats-primary to-stats-secondary">
          <Weight className="h-6 w-6 text-stats-primary-foreground" />
        </div>
        <div>
          <h3 className="text-foreground">Weight Progress</h3>
          <p className="text-sm text-white">You're {totalWeightProgress.toFixed(0)}% of the way to your goal!</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 mb-6">
        <div className="text-center p-3 md:p-4 bg-muted rounded-xl">
          <p className="text-xs md:text-sm text-white mb-1">Starting Weight</p>
          <p className="text-xl md:text-2xl text-foreground">{weightProgress.start} kg</p>
        </div>
        <div className="text-center p-3 md:p-4 bg-stats-primary/10 rounded-xl border-2 border-stats-primary/30">
          <p className="text-xs md:text-sm text-stats-primary mb-1">Current Weight</p>
          <p className="text-xl md:text-2xl text-foreground">{weightProgress.current} kg</p>
          <div className="flex items-center justify-center gap-1 text-stats-primary mt-1">
            <TrendingDown className="h-4 w-4" />
            <span className="text-xs md:text-sm">-{(weightProgress.start - weightProgress.current).toFixed(1)} kg</span>
          </div>
        </div>
        <div className="text-center p-3 md:p-4 bg-muted rounded-xl">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">Target Weight</p>
          <p className="text-xl md:text-2xl text-foreground">{weightProgress.target} kg</p>
        </div>
      </div>

      <div className="mb-4">
        <Progress value={totalWeightProgress} className="h-3" />
      </div>

      {/* Weight History Chart */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-foreground">Recent Weigh-Ins</h4>
          <Button
            variant="ghost"
            size="sm"
            className="text-stats-primary hover:text-stats-primary/80"
            onClick={() => setIsHistoryDialogOpen(true)}
          >
            <History className="h-4 w-4 mr-1" />
            View All
          </Button>
        </div>
        
        {/* Graph view for desktop */}
        <div className="hidden md:block">
          <div className="bg-gradient-to-br from-stats-primary/20 via-stats-primary/10 to-stats-secondary/20 p-4 rounded-xl border border-stats-primary/20">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weightProgress.history}>
                <defs>
                  <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--stats-primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--stats-primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--stats-primary))" opacity={0.15} />
                <XAxis 
                  dataKey="date" 
                  stroke="#ffffff"
                  style={{ fontSize: '12px', fontWeight: '600' }}
                  tick={{ fill: '#ffffff' }}
                />
                <YAxis 
                  stroke="#ffffff"
                  style={{ fontSize: '12px', fontWeight: '600' }}
                  tick={{ fill: '#ffffff' }}
                  domain={[
                    Math.floor(Math.min(...weightProgress.history.map(h => h.weight)) - 2),
                    Math.ceil(Math.max(...weightProgress.history.map(h => h.weight)) + 2)
                  ]}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--stats-primary))',
                    border: '2px solid hsl(var(--stats-secondary))',
                    borderRadius: '12px',
                    color: '#ffffff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    fontWeight: '600'
                  }}
                  labelStyle={{
                    color: '#ffffff',
                    fontWeight: '600'
                  }}
                  itemStyle={{
                    color: '#ffffff'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="hsl(var(--stats-primary))" 
                  strokeWidth={4}
                  fill="url(#weightGradient)"
                  dot={{ fill: '#ff9500', stroke: 'hsl(var(--stats-primary))', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, fill: '#ff9500', stroke: 'hsl(var(--stats-primary))', strokeWidth: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* List view for mobile */}
        <div className="space-y-3 md:hidden">
          {weightProgress.history.slice(-4).reverse().map((entry, index, arr) => {
            const prevWeight = index < arr.length - 1 ? arr[index + 1].weight : weightProgress.start;
            const diff = prevWeight - entry.weight;
            const isLoss = diff > 0;
            
            return (
              <div 
                key={entry.date} 
                className="flex items-center justify-between p-3 bg-muted/50 rounded-xl border border-muted hover:bg-muted/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isLoss ? 'bg-stats-primary/10' : 'bg-muted'}`}>
                    <Scale className={`h-4 w-4 ${isLoss ? 'text-stats-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <p className="text-foreground">{entry.weight} kg</p>
                    <p className="text-xs text-white">{entry.date}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-1 ${isLoss ? 'text-stats-primary' : 'text-muted-foreground'}`}>
                  {diff !== 0 && (
                    <>
                      <TrendingDown className={`h-4 w-4 ${isLoss ? '' : 'rotate-180'}`} />
                      <span className="text-sm">{isLoss ? '-' : '+'}{Math.abs(diff).toFixed(1)} kg</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setIsWeighInDialogOpen(true)}
        >
          <Scale className="h-4 w-4 mr-2" />
          Weigh In
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setIsHistoryDialogOpen(true)}
        >
          <History className="h-4 w-4 mr-2" />
          View History
        </Button>
      </div>

      {/* Weight History Dialog */}
      <WeightHistoryDialog
        open={isHistoryDialogOpen}
        onOpenChange={setIsHistoryDialogOpen}
        entries={weightProgress.history}
        startWeight={weightProgress.start}
        targetWeight={weightProgress.target}
      />

      {/* Weigh In Dialog */}
      <WeighInDialog
        open={isWeighInDialogOpen}
        onOpenChange={setIsWeighInDialogOpen}
        onSubmit={handleWeighIn}
      />
    </Card>
  );
}