import { Card } from '../ui/card';
import { TrendingDown, Flame, Activity, Trophy } from 'lucide-react';

interface Stat {
  label: string;
  value: string;
  icon: any;
  color: string;
  bg: string;
  borderColor: string;
}

interface ActivityStatsWidgetProps {
  stats: Stat[];
}

export function ActivityStatsWidget({ stats }: ActivityStatsWidgetProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className={`p-3 md:p-5 bg-gradient-to-br ${stat.bg} backdrop-blur-sm border border-${stat.borderColor}`}>
            <div className="flex flex-col gap-2 md:gap-3">
              <div className="flex items-center justify-between">
                <Icon className={`h-5 w-5 md:h-6 md:w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-lg md:text-2xl text-foreground mb-0.5 md:mb-1">{stat.value}</p>
                <p className="text-xs md:text-sm text-white leading-tight">{stat.label}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}