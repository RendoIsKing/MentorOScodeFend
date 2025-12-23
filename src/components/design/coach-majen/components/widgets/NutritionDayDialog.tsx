import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Progress } from '../ui/progress';
import { Calendar, Utensils, Flame, TrendingUp, TrendingDown, Check } from 'lucide-react';
import { Button } from '../ui/button';

interface Meal {
  id: number;
  name: string;
  time: string;
  items: string[];
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  completed?: boolean;
  isModified?: boolean;
}

interface NutritionDay {
  date: string;
  meals: Meal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  goalCalories: number;
  goalProtein: number;
  goalCarbs: number;
  goalFats: number;
}

interface NutritionDayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  day: NutritionDay | null;
}

export function NutritionDayDialog({ open, onOpenChange, day }: NutritionDayDialogProps) {
  if (!day) return null;

  const macroPercentage = (current: number, target: number) => (current / target) * 100;
  const caloriesDiff = day.totalCalories - day.goalCalories;
  const isOverGoal = caloriesDiff > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-secondary via-secondary to-secondary/80 rounded-lg">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle>{day.date}</DialogTitle>
              <p className="text-sm text-white mt-1">
                {day.meals.filter(m => m.completed).length} of {day.meals.length} meals completed
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="space-y-6 pr-4">
            {/* Daily Summary */}
            <Card className="p-5 bg-gradient-to-br from-energy/5 to-energy/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-energy/90 to-energy rounded-lg">
                  <Flame className="h-5 w-5 text-energy-foreground" />
                </div>
                <div>
                  <h4 className="text-foreground">Daily Summary</h4>
                  <p className="text-sm text-white">Nutritional intake vs goals</p>
                </div>
              </div>

              {/* Calories */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground">Calories</span>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground">
                      {day.totalCalories} / {day.goalCalories} kcal
                    </span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        isOverGoal 
                          ? 'bg-amber-50 text-amber-700 border-amber-300' 
                          : 'bg-success/10 text-success border-success/30'
                      }`}
                    >
                      {isOverGoal ? (
                        <>
                          <TrendingUp className="h-3 w-3 mr-1" />
                          +{caloriesDiff}
                        </>
                      ) : (
                        <>
                          <TrendingDown className="h-3 w-3 mr-1" />
                          {caloriesDiff}
                        </>
                      )}
                    </Badge>
                  </div>
                </div>
                <Progress
                  value={macroPercentage(day.totalCalories, day.goalCalories)}
                  className="h-3"
                />
              </div>

              {/* Macros Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white">Protein</span>
                    <span className="text-foreground">{day.totalProtein}g</span>
                  </div>
                  <Progress
                    value={macroPercentage(day.totalProtein, day.goalProtein)}
                    className="h-2"
                  />
                  <p className="text-xs text-white mt-1">Goal: {day.goalProtein}g</p>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white">Carbs</span>
                    <span className="text-foreground">{day.totalCarbs}g</span>
                  </div>
                  <Progress
                    value={macroPercentage(day.totalCarbs, day.goalCarbs)}
                    className="h-2"
                  />
                  <p className="text-xs text-white mt-1">Goal: {day.goalCarbs}g</p>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white">Fats</span>
                    <span className="text-foreground">{day.totalFats}g</span>
                  </div>
                  <Progress
                    value={macroPercentage(day.totalFats, day.goalFats)}
                    className="h-2"
                  />
                  <p className="text-xs text-white mt-1">Goal: {day.goalFats}g</p>
                </div>
              </div>
            </Card>

            {/* Meals */}
            <div className="pb-4">
              <h4 className="text-foreground mb-3">Meals</h4>
              <div className="space-y-3">
                {day.meals.map((meal) => (
                  <Card 
                    key={meal.id} 
                    className={`p-4 ${meal.completed ? 'bg-success/5 border-success/30' : 'opacity-60'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gradient-to-br from-secondary via-secondary to-secondary/80 rounded-lg flex-shrink-0">
                        <Utensils className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h5 className="text-foreground">{meal.name}</h5>
                          {meal.completed && (
                            <Badge className="bg-success/10 text-success border-success/30 text-xs">
                              <Check className="h-3 w-3 mr-1" />
                              Eaten
                            </Badge>
                          )}
                          {meal.isModified && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 text-xs">
                              Modified
                            </Badge>
                          )}
                          {!meal.completed && (
                            <Badge variant="outline" className="text-xs opacity-60">
                              Skipped
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-white mb-2">{meal.time}</p>
                        
                        {/* Items */}
                        <ul className="space-y-1 mb-3">
                          {meal.items.slice(0, 2).map((item, idx) => (
                            <li key={idx} className="text-sm text-white">
                              • {item}
                            </li>
                          ))}
                          {meal.items.length > 2 && (
                            <li className="text-sm text-white italic">
                              +{meal.items.length - 2} more
                            </li>
                          )}
                        </ul>

                        {/* Macros */}
                        <div className="grid grid-cols-4 gap-3 pt-3 border-t">
                          <div className="text-center">
                            <p className="text-sm text-foreground">{meal.calories}</p>
                            <p className="text-xs text-white">kcal</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-foreground">{meal.protein}g</p>
                            <p className="text-xs text-white">Protein</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-foreground">{meal.carbs}g</p>
                            <p className="text-xs text-white">Carbs</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-foreground">{meal.fats}g</p>
                            <p className="text-xs text-white">Fats</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}