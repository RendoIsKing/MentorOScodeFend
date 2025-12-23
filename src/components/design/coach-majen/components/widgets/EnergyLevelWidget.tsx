import { Card } from '../ui/card';
import { Zap, TrendingUp } from 'lucide-react';
import { Progress } from '../ui/progress';

interface EnergyLevel {
  current: number;
  average: number;
  history: Array<{ date: string; level: number }>;
}

interface EnergyLevelWidgetProps {
  energy: EnergyLevel;
}

export function EnergyLevelWidget({ energy }: EnergyLevelWidgetProps) {
  const improvement = ((energy.current - energy.average) / energy.average) * 100;

  return (
    <Card className="p-6 bg-gradient-to-br from-training-secondary/20 via-training-secondary/10 to-energy/20 backdrop-blur-sm border border-training-secondary/30">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-energy via-energy to-energy/80">
          <Zap className="h-6 w-6 text-energy-foreground" />
        </div>
        <div>
          <h3 className="text-foreground">Energy Level</h3>
          <p className="text-sm text-white">How you're feeling over time</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
        <div className="text-center p-4 md:p-5 bg-energy/10 rounded-xl border border-energy/10">
          <p className="text-xs md:text-sm text-energy mb-1">Current Energy</p>
          <p className="text-3xl md:text-4xl text-foreground mb-2">{energy.current}/10</p>
          {improvement > 0 && (
            <div className="flex items-center justify-center gap-1 text-stats-primary">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs md:text-sm">+{improvement.toFixed(0)}% from average</span>
            </div>
          )}
        </div>
        <div className="text-center p-4 md:p-5 bg-muted rounded-xl">
          <p className="text-xs md:text-sm text-white mb-1">Average Energy</p>
          <p className="text-3xl md:text-4xl text-foreground">{energy.average}/10</p>
        </div>
      </div>

      <div>
        <p className="text-foreground mb-4">Energy Trend (Last 7 Days)</p>
        <div className="flex items-end justify-between h-32 md:h-24 gap-1.5 md:gap-2 mb-3">
          {energy.history.map((entry, index) => {
            const height = (entry.level / 10) * 100;
            
            return (
              <div key={entry.date} className="flex-1 flex flex-col items-center gap-1.5 md:gap-2">
                <div className="relative w-full flex items-end justify-center h-20 md:h-16">
                  <div 
                    className="w-full bg-gradient-to-t from-energy via-energy to-energy/80 rounded-t transition-all hover:opacity-90"
                    style={{ height: `${height}%` }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-xs text-foreground">{entry.level}</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground whitespace-nowrap">{entry.date}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Card className="mt-6 p-3 md:p-4 bg-stats-primary/10 border-stats-primary/10">
        <p className="text-xs md:text-sm text-foreground">
          <strong>Great progress!</strong> Your energy levels have been consistently improving. Keep up with your training and nutrition plan.
        </p>
      </Card>
    </Card>
  );
}