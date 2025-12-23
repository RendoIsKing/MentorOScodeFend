import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Target, TrendingUp, TrendingDown, Calendar, Utensils, Dumbbell, CheckCircle2 } from 'lucide-react';

interface WeeklyDiscipline {
  week: string;
  trainingAdherence: number;
  nutritionAdherence: number;
  overallAdherence: number;
}

interface DisciplineStatsProps {
  currentWeek: {
    trainingAdherence: number;
    nutritionAdherence: number;
    overallAdherence: number;
  };
  weeklyHistory: WeeklyDiscipline[];
  improvement: {
    training: number;
    nutrition: number;
    overall: number;
  };
}

export function DisciplineStatsWidget({ currentWeek, weeklyHistory, improvement }: DisciplineStatsProps) {
  const getAdherenceColor = (adherence: number) => {
    if (adherence >= 90) return 'text-success';
    if (adherence >= 75) return 'text-amber-600';
    return 'text-destructive';
  };

  const getAdherenceBg = (adherence: number) => {
    if (adherence >= 90) return 'bg-success/10 border-success/10';
    if (adherence >= 75) return 'bg-amber-50 border-amber-300/50';
    return 'bg-destructive/10 border-destructive/10';
  };

  const getAdherenceLabel = (adherence: number) => {
    if (adherence >= 90) return 'Excellent';
    if (adherence >= 75) return 'Good';
    if (adherence >= 60) return 'Fair';
    return 'Needs Work';
  };

  const renderTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-success" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <span className="h-4 w-4" />;
  };

  const formatTrend = (value: number) => {
    if (value > 0) return `+${value.toFixed(1)}%`;
    return `${value.toFixed(1)}%`;
  };

  return (
    <Card className="p-4 md:p-6 bg-gradient-to-br from-stats-primary/20 via-stats-primary/10 to-stats-secondary/20 backdrop-blur-sm border border-stats-primary/30">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-stats-primary via-stats-primary to-stats-secondary rounded-xl">
          <Target className="h-6 w-6 text-stats-primary-foreground" />
        </div>
        <div>
          <h3 className="text-foreground">Discipline & Consistency</h3>
          <p className="text-xs md:text-sm text-white">How well you're following your plans</p>
        </div>
      </div>

      {/* Current Week Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-6">
        <Card className="p-3 md:p-4 bg-training-primary/5 border-training-primary/10">
          <div className="flex items-center gap-2 mb-2">
            <Dumbbell className="h-4 w-4 text-training-primary" />
            <span className="text-sm text-foreground">Training</span>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className={`text-xl md:text-2xl ${getAdherenceColor(currentWeek.trainingAdherence)}`}>
              {currentWeek.trainingAdherence}%
            </span>
            <div className="flex items-center gap-1">
              {renderTrendIcon(improvement.training)}
              <span className={`text-xs ${improvement.training > 0 ? 'text-success' : 'text-destructive'}`}>
                {formatTrend(improvement.training)}
              </span>
            </div>
          </div>
          <Badge variant="outline" className={`text-xs ${
            currentWeek.trainingAdherence >= 90 ? 'text-success bg-success/10 border-success/10' :
            currentWeek.trainingAdherence >= 75 ? 'text-amber-600 bg-amber-500/10 border-amber-500/10' :
            'text-destructive bg-destructive/10 border-destructive/10'
          }`}>
            {getAdherenceLabel(currentWeek.trainingAdherence)}
          </Badge>
        </Card>

        <Card className="p-3 md:p-4 bg-nutrition-primary/5 border-nutrition-primary/10">
          <div className="flex items-center gap-2 mb-2">
            <Utensils className="h-4 w-4 text-nutrition-primary" />
            <span className="text-sm text-foreground">Nutrition</span>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className={`text-xl md:text-2xl ${getAdherenceColor(currentWeek.nutritionAdherence)}`}>
              {currentWeek.nutritionAdherence}%
            </span>
            <div className="flex items-center gap-1">
              {renderTrendIcon(improvement.nutrition)}
              <span className={`text-xs ${improvement.nutrition > 0 ? 'text-success' : 'text-destructive'}`}>
                {formatTrend(improvement.nutrition)}
              </span>
            </div>
          </div>
          <Badge variant="outline" className={`text-xs ${
            currentWeek.nutritionAdherence >= 90 ? 'text-success bg-success/10 border-success/10' :
            currentWeek.nutritionAdherence >= 75 ? 'text-amber-600 bg-amber-500/10 border-amber-500/10' :
            'text-destructive bg-destructive/10 border-destructive/10'
          }`}>
            {getAdherenceLabel(currentWeek.nutritionAdherence)}
          </Badge>
        </Card>

        <Card className="p-3 md:p-4 bg-stats-primary/5 border-stats-primary/10">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-stats-primary" />
            <span className="text-sm text-foreground">Overall</span>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className={`text-xl md:text-2xl ${getAdherenceColor(currentWeek.overallAdherence)}`}>
              {currentWeek.overallAdherence}%
            </span>
            <div className="flex items-center gap-1">
              {renderTrendIcon(improvement.overall)}
              <span className={`text-xs ${improvement.overall > 0 ? 'text-success' : 'text-destructive'}`}>
                {formatTrend(improvement.overall)}
              </span>
            </div>
          </div>
          <Badge variant="outline" className={`text-xs ${
            currentWeek.overallAdherence >= 90 ? 'text-success bg-success/10 border-success/10' :
            currentWeek.overallAdherence >= 75 ? 'text-amber-600 bg-amber-500/10 border-amber-500/10' :
            'text-destructive bg-destructive/10 border-destructive/10'
          }`}>
            {getAdherenceLabel(currentWeek.overallAdherence)}
          </Badge>
        </Card>
      </div>

      {/* Weekly Trend */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-4 w-4 text-white" />
          <h4 className="text-foreground">Weekly Trend</h4>
        </div>

        <div className="space-y-3">
          {weeklyHistory.map((week, index) => {
            const isCurrentWeek = index === weeklyHistory.length - 1;
            return (
              <div key={index} className={`${isCurrentWeek ? 'opacity-100' : 'opacity-70'}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${isCurrentWeek ? 'text-foreground' : 'text-white'}`}>
                      {week.week}
                    </span>
                    {isCurrentWeek && (
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/10 text-xs">
                        Current
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm">
                    <div className="flex items-center gap-1.5">
                      <Dumbbell className="h-3.5 w-3.5 text-training-primary" />
                      <span className="text-foreground">{week.trainingAdherence}%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Utensils className="h-3.5 w-3.5 text-secondary" />
                      <span className="text-foreground">{week.nutritionAdherence}%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-stats-primary" />
                      <span className={getAdherenceColor(week.overallAdherence)}>
                        {week.overallAdherence}%
                      </span>
                    </div>
                  </div>
                </div>
                <Progress 
                  value={week.overallAdherence} 
                  className={`h-2 ${isCurrentWeek ? '' : 'opacity-60'}`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Insight Message */}
      <Card className="mt-6 p-3 md:p-4 bg-primary/5 border-primary/10">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            {improvement.overall > 0 ? (
              <div className="p-2 bg-success/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
            ) : improvement.overall < 0 ? (
              <div className="p-2 bg-destructive/10 rounded-lg">
                <TrendingDown className="h-5 w-5 text-destructive" />
              </div>
            ) : (
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="h-5 w-5 text-primary" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h5 className="text-foreground mb-1">
              {improvement.overall > 5 ? 'Outstanding Progress! 🎉' :
               improvement.overall > 0 ? 'Great Improvement! 👏' :
               improvement.overall < -5 ? 'Let\'s Refocus 💪' :
               'Stay Consistent! 🎯'}
            </h5>
            <p className="text-xs md:text-sm text-white">
              {improvement.overall > 5 ? 
                `You've improved your plan adherence by ${improvement.overall.toFixed(1)}% compared to last week. You're crushing it!` :
               improvement.overall > 0 ?
                `Your consistency is trending upward by ${improvement.overall.toFixed(1)}%. Keep up the momentum!` :
               improvement.overall < -5 ?
                `Your adherence dropped by ${Math.abs(improvement.overall).toFixed(1)}%. Let's identify what's getting in the way and adjust.` :
                "You're maintaining steady discipline. Small consistent actions lead to big results!"}
            </p>
          </div>
        </div>
      </Card>
    </Card>
  );
}