import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { Utensils, ChevronLeft, ChevronRight, CheckCircle2, Info, ChevronDown, Calendar, Flame, TrendingUp, TrendingDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Progress } from '../ui/progress';

interface Meal {
  name: string;
  time: string;
  items: string[];
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  completed?: boolean;
  notes?: string;
  preparationTime?: string;
  cookingTips?: string[];
  nutritionalBenefits?: string[];
}

interface DayMeals {
  day: string;
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  isCompleted?: boolean;
  meals: Meal[];
}

interface NutritionPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planName: string;
  currentWeek: number;
  totalWeeks: number;
  currentDayMeals?: Meal[];
  currentNutritionDay?: Date;
  nutritionHistory?: Array<{
    date: string;
    meals: Meal[];
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFats: number;
  }>;
  dailyGoals?: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

export function NutritionPlanDialog({ 
  open, 
  onOpenChange, 
  planName, 
  currentWeek, 
  totalWeeks,
  currentDayMeals = [],
  currentNutritionDay,
  nutritionHistory = [],
  dailyGoals = { calories: 2000, protein: 120, carbs: 250, fats: 65 }
}: NutritionPlanDialogProps) {
  const [selectedDay, setSelectedDay] = useState<DayMeals | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  
  // State for tracking which day's meal plan is expanded
  const [expandedMealPlan, setExpandedMealPlan] = useState<Record<string, boolean>>({});
  // State for tracking which meals within the plan are showing details
  const [expandedMealDetails, setExpandedMealDetails] = useState<Record<string, boolean>>({});

  const handleWeekChange = (newOffset: number) => {
    setWeekOffset(newOffset);
  };

  // Generate week meals based on actual app state
  const generateWeekMeals = (): DayMeals[] => {
    const today = currentNutritionDay || new Date();
    const weekMeals: DayMeals[] = [];
    
    // Generate 14 days: 7 days before today and 7 days including and after today
    for (let i = -6; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const fullDateStr = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
      
      // Check if this day is in history (completed)
      const historyEntry = nutritionHistory.find(h => h.date === fullDateStr);
      
      const defaultMeals: Meal[] = [
        { 
          name: 'Power Breakfast Bowl', 
          time: '8:00 AM', 
          items: ['Oatmeal (1 cup)', 'Mixed berries (1/2 cup)', 'Greek yogurt (1/2 cup)', 'Honey (1 tbsp)', 'Almonds (10)'], 
          calories: 420, 
          protein: 25, 
          carbs: 65, 
          fats: 12,
          notes: 'Start your day with complex carbs and protein',
          preparationTime: '10 minutes',
          cookingTips: [
            'Cook oats with milk instead of water for extra protein',
            'Top with berries after cooking to preserve their nutrients',
            'Add a pinch of cinnamon for blood sugar regulation'
          ],
          nutritionalBenefits: [
            'Oats provide sustained energy through complex carbohydrates',
            'Greek yogurt delivers probiotics for gut health',
            'Berries are rich in antioxidants and fiber',
            'Almonds provide healthy fats and vitamin E'
          ]
        },
        { 
          name: 'Grilled Chicken Salad', 
          time: '1:00 PM', 
          items: ['Grilled chicken breast (200g)', 'Mixed greens (2 cups)', 'Cherry tomatoes (1 cup)', 'Cucumber (1/2)', 'Olive oil dressing (2 tbsp)'], 
          calories: 580, 
          protein: 45, 
          carbs: 72, 
          fats: 15,
          notes: 'High protein lunch to fuel your afternoon',
          preparationTime: '15 minutes',
          cookingTips: [
            'Marinate chicken in lemon and herbs for extra flavor',
            'Grill chicken to 165°F internal temperature',
            'Let chicken rest 5 minutes before slicing'
          ],
          nutritionalBenefits: [
            'Lean protein supports muscle recovery and growth',
            'Mixed greens provide vitamins A, C, and K',
            'Tomatoes contain lycopene for heart health',
            'Olive oil provides heart-healthy monounsaturated fats'
          ]
        },
        { 
          name: 'Protein Shake', 
          time: '4:00 PM', 
          items: ['Whey protein (1 scoop)', 'Banana (1 medium)', 'Almond butter (1 tbsp)', 'Almond milk (1 cup)', 'Ice cubes'], 
          calories: 380, 
          protein: 35, 
          carbs: 48, 
          fats: 10,
          notes: 'Quick nutrition boost for afternoon energy',
          preparationTime: '5 minutes',
          cookingTips: [
            'Blend frozen banana for a thicker, creamier shake',
            'Add protein powder last to prevent clumping',
            'Use cold milk for better taste and texture'
          ],
          nutritionalBenefits: [
            'Whey protein rapidly absorbed for muscle recovery',
            'Banana provides quick-digesting carbs and potassium',
            'Almond butter adds healthy fats and vitamin E',
            'Perfect pre-workout or post-workout nutrition'
          ]
        },
        { 
          name: 'Salmon & Quinoa', 
          time: '7:00 PM', 
          items: ['Grilled salmon (180g)', 'Quinoa (1 cup cooked)', 'Steamed broccoli (1.5 cups)', 'Lemon wedge', 'Garlic herb seasoning'], 
          calories: 620, 
          protein: 48, 
          carbs: 65, 
          fats: 20,
          notes: 'Omega-3 rich dinner for recovery',
          preparationTime: '25 minutes',
          cookingTips: [
            'Season salmon with salt, pepper, and herbs',
            'Grill skin-side down first for crispy skin',
            'Cook to 145°F internal temperature',
            'Rinse quinoa before cooking to remove bitterness'
          ],
          nutritionalBenefits: [
            'Salmon provides omega-3 fatty acids for inflammation',
            'Quinoa is a complete protein with all essential amino acids',
            'Broccoli is packed with vitamins C and K',
            'This meal supports muscle recovery and heart health'
          ]
        },
      ];
      
      if (i === 0) {
        // Today (currentNutritionDay) - use current meals
        const totalCalories = currentDayMeals.reduce((sum, m) => sum + m.calories, 0);
        const totalProtein = currentDayMeals.reduce((sum, m) => sum + m.protein, 0);
        const totalCarbs = currentDayMeals.reduce((sum, m) => sum + m.carbs, 0);
        const totalFats = currentDayMeals.reduce((sum, m) => sum + m.fats, 0);
        const isCompleted = currentDayMeals.length > 0 && currentDayMeals.every(m => m.completed);
        
        weekMeals.push({
          day: dayName,
          date: dateStr,
          totalCalories: totalCalories || dailyGoals.calories,
          totalProtein: totalProtein || dailyGoals.protein,
          totalCarbs: totalCarbs || dailyGoals.carbs,
          totalFats: totalFats || dailyGoals.fats,
          isCompleted,
          meals: currentDayMeals.length > 0 ? currentDayMeals : defaultMeals,
        });
      } else if (historyEntry) {
        // Past day from history (completed)
        weekMeals.push({
          day: dayName,
          date: dateStr,
          totalCalories: historyEntry.totalCalories,
          totalProtein: historyEntry.totalProtein,
          totalCarbs: historyEntry.totalCarbs,
          totalFats: historyEntry.totalFats,
          isCompleted: true,
          meals: historyEntry.meals,
        });
      } else {
        // Future day or past day without data - use default/planned meals
        weekMeals.push({
          day: dayName,
          date: dateStr,
          totalCalories: dailyGoals.calories,
          totalProtein: dailyGoals.protein,
          totalCarbs: dailyGoals.carbs,
          totalFats: dailyGoals.fats,
          isCompleted: false,
          meals: defaultMeals,
        });
      }
    }
    
    return weekMeals;
  };

  const weekMeals = generateWeekMeals();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col overflow-hidden p-0">
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4">
          <DialogTitle>{planName}</DialogTitle>
        </DialogHeader>

        {selectedMeal ? (
          // Meal Detail View
          <div className="flex-1 min-h-0 flex flex-col px-6 pb-6 overflow-hidden">
            <div className="flex items-center justify-between flex-shrink-0 mb-4">
              <div>
                <h3 className="text-foreground">{selectedMeal.name}</h3>
                <p className="text-sm text-white">
                  {selectedMeal.time} · {selectedMeal.calories} calories
                </p>
              </div>
              <Button variant="outline" onClick={() => setSelectedMeal(null)}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Day
              </Button>
            </div>

            <ScrollArea className="flex-1 min-h-0">
              <div className="space-y-6 pr-4">
                {/* Nutritional Information Card */}
                <Card className="p-6 bg-gradient-to-br from-nutrition-primary/5 to-nutrition-secondary/10 border-nutrition-primary/20">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-nutrition-primary to-nutrition-secondary">
                      <Utensils className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-foreground mb-1">Nutritional Breakdown</h4>
                      <p className="text-xs text-white">Understanding your meal's macros</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Calories */}
                    <div className="border-l-2 border-nutrition-primary pl-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-white/70">Calories</span>
                        <span className="text-foreground"><strong>{selectedMeal.calories} kcal</strong></span>
                      </div>
                      <p className="text-xs text-white">
                        {selectedMeal.calories < 400 
                          ? 'A lighter meal providing essential nutrients without excess calories. Perfect for snacks or when you need a quick energy boost.'
                          : selectedMeal.calories < 600
                          ? 'A balanced meal that provides sustained energy. This calorie level supports your daily activities and training demands.'
                          : 'A substantial meal designed to fuel intense training or recovery. Higher calories support muscle growth and performance.'}
                      </p>
                    </div>

                    {/* Protein */}
                    <div className="border-l-2 border-nutrition-primary pl-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-white/70">Protein</span>
                        <span className="text-foreground"><strong>{selectedMeal.protein}g</strong></span>
                      </div>
                      <p className="text-xs text-white">
                        Protein is essential for muscle repair and growth. This meal provides {selectedMeal.protein}g, contributing to your daily target of {dailyGoals.protein}g. Aim to distribute protein evenly across meals for optimal muscle protein synthesis throughout the day.
                      </p>
                    </div>

                    {/* Carbohydrates */}
                    <div className="border-l-2 border-nutrition-primary pl-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-white/70">Carbohydrates</span>
                        <span className="text-foreground"><strong>{selectedMeal.carbs}g</strong></span>
                      </div>
                      <p className="text-xs text-white">
                        Carbs are your body's primary energy source. {selectedMeal.carbs}g of carbs will fuel your workouts and daily activities. Complex carbohydrates provide sustained energy, while simple carbs offer quick fuel around training.
                      </p>
                    </div>

                    {/* Fats */}
                    <div className="border-l-2 border-nutrition-primary pl-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-white/70">Fats</span>
                        <span className="text-foreground"><strong>{selectedMeal.fats}g</strong></span>
                      </div>
                      <p className="text-xs text-white">
                        Healthy fats support hormone production, nutrient absorption, and satiety. This meal provides {selectedMeal.fats}g of fats, including heart-healthy unsaturated fats that support overall health and performance.
                      </p>
                    </div>

                    {/* Preparation Time */}
                    {selectedMeal.preparationTime && (
                      <div className="border-l-2 border-nutrition-primary pl-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-white/70">Preparation Time</span>
                          <span className="text-foreground"><strong>{selectedMeal.preparationTime}</strong></span>
                        </div>
                        <p className="text-xs text-white">
                          Quick and efficient meal preparation helps you stay consistent with your nutrition plan. This meal can be prepared in {selectedMeal.preparationTime}, making it practical for your busy schedule.
                        </p>
                      </div>
                    )}

                    {/* Coach Notes */}
                    {selectedMeal.notes && (
                      <div className="bg-primary/5 border border-primary/20 rounded-md p-3">
                        <p className="text-xs text-white/70 mb-1">💭 Coach's Note</p>
                        <p className="text-sm text-white italic">
                          {selectedMeal.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Ingredients */}
                <div>
                  <h4 className="text-foreground mb-3">Ingredients</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedMeal.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                        <span className="text-nutrition-primary">✓</span>
                        <p className="text-sm text-white">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cooking Tips */}
                {selectedMeal.cookingTips && selectedMeal.cookingTips.length > 0 && (
                  <Card className="p-4 bg-success/5 border-success/20">
                    <h4 className="text-foreground mb-2">👨‍🍳 Cooking Tips</h4>
                    <ul className="space-y-2">
                      {selectedMeal.cookingTips.map((tip, index) => (
                        <li key={index} className="flex gap-2 text-sm text-white">
                          <span className="text-success">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {/* Nutritional Benefits */}
                {selectedMeal.nutritionalBenefits && selectedMeal.nutritionalBenefits.length > 0 && (
                  <Card className="p-4 bg-nutrition-primary/5 border-nutrition-primary/20">
                    <h4 className="text-foreground mb-2">🌟 Nutritional Benefits</h4>
                    <ul className="space-y-2">
                      {selectedMeal.nutritionalBenefits.map((benefit, index) => (
                        <li key={index} className="flex gap-2 text-sm text-white">
                          <span className="text-nutrition-primary">•</span>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {/* Daily Goals Progress */}
                <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                  <h4 className="text-foreground mb-3">📊 Contribution to Daily Goals</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="text-center">
                      <p className="text-xs text-white/70 mb-1">Calories</p>
                      <p className="text-foreground">
                        <strong>{Math.round((selectedMeal.calories / dailyGoals.calories) * 100)}%</strong>
                      </p>
                      <p className="text-xs text-white/50">{selectedMeal.calories}/{dailyGoals.calories}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-white/70 mb-1">Protein</p>
                      <p className="text-foreground">
                        <strong>{Math.round((selectedMeal.protein / dailyGoals.protein) * 100)}%</strong>
                      </p>
                      <p className="text-xs text-white/50">{selectedMeal.protein}g/{dailyGoals.protein}g</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-white/70 mb-1">Carbs</p>
                      <p className="text-foreground">
                        <strong>{Math.round((selectedMeal.carbs / dailyGoals.carbs) * 100)}%</strong>
                      </p>
                      <p className="text-xs text-white/50">{selectedMeal.carbs}g/{dailyGoals.carbs}g</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-white/70 mb-1">Fats</p>
                      <p className="text-foreground">
                        <strong>{Math.round((selectedMeal.fats / dailyGoals.fats) * 100)}%</strong>
                      </p>
                      <p className="text-xs text-white/50">{selectedMeal.fats}g/{dailyGoals.fats}g</p>
                    </div>
                  </div>
                </Card>
              </div>
            </ScrollArea>
          </div>
        ) : selectedDay ? (
          selectedDay.isCompleted ? (
            // Completed Day Detail View
            <div className="flex-1 min-h-0 flex flex-col px-6 pb-6 overflow-hidden">
              <div className="flex items-center justify-between flex-shrink-0 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-secondary via-secondary to-secondary/80 rounded-lg">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-foreground">{selectedDay.day}, {selectedDay.date}</h3>
                    <p className="text-sm text-white mt-1">
                      {selectedDay.meals.filter(m => m.completed).length} of {selectedDay.meals.length} meals completed
                    </p>
                  </div>
                </div>
                <Button variant="outline" onClick={() => setSelectedDay(null)}>
                  Back to Calendar
                </Button>
              </div>

              <ScrollArea className="flex-1 min-h-0">
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
                            {selectedDay.totalCalories} / {dailyGoals.calories} kcal
                          </span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              selectedDay.totalCalories > dailyGoals.calories
                                ? 'bg-amber-50 text-amber-700 border-amber-300' 
                                : 'bg-success/10 text-success border-success/30'
                            }`}
                          >
                            {selectedDay.totalCalories > dailyGoals.calories ? (
                              <>
                                <TrendingUp className="h-3 w-3 mr-1" />
                                +{selectedDay.totalCalories - dailyGoals.calories}
                              </>
                            ) : (
                              <>
                                <TrendingDown className="h-3 w-3 mr-1" />
                                {selectedDay.totalCalories - dailyGoals.calories}
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>
                      <Progress
                        value={(selectedDay.totalCalories / dailyGoals.calories) * 100}
                        className="h-3"
                      />
                    </div>

                    {/* Macros Grid */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-white">Protein</span>
                          <span className="text-foreground">{selectedDay.totalProtein}g</span>
                        </div>
                        <Progress
                          value={(selectedDay.totalProtein / dailyGoals.protein) * 100}
                          className="h-2"
                        />
                        <p className="text-xs text-white mt-1">Goal: {dailyGoals.protein}g</p>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-white">Carbs</span>
                          <span className="text-foreground">{selectedDay.totalCarbs}g</span>
                        </div>
                        <Progress
                          value={(selectedDay.totalCarbs / dailyGoals.carbs) * 100}
                          className="h-2"
                        />
                        <p className="text-xs text-white mt-1">Goal: {dailyGoals.carbs}g</p>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-white">Fats</span>
                          <span className="text-foreground">{selectedDay.totalFats}g</span>
                        </div>
                        <Progress
                          value={(selectedDay.totalFats / dailyGoals.fats) * 100}
                          className="h-2"
                        />
                        <p className="text-xs text-white mt-1">Goal: {dailyGoals.fats}g</p>
                      </div>
                    </div>
                  </Card>

                  {/* Meals */}
                  <div>
                    <h4 className="text-foreground mb-3">Meals</h4>
                    <div className="space-y-3">
                      {selectedDay.meals.map((meal, index) => (
                        <Card 
                          key={index} 
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
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Eaten
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

                              {/* Nutrition info */}
                              <div className="grid grid-cols-4 gap-2 text-center">
                                <div className="bg-muted/50 rounded p-2">
                                  <p className="text-xs text-white mb-0.5">{meal.calories}</p>
                                  <p className="text-xs text-white/70">kcal</p>
                                </div>
                                <div className="bg-muted/50 rounded p-2">
                                  <p className="text-xs text-white mb-0.5">{meal.protein}g</p>
                                  <p className="text-xs text-white/70">Protein</p>
                                </div>
                                <div className="bg-muted/50 rounded p-2">
                                  <p className="text-xs text-white mb-0.5">{meal.carbs}g</p>
                                  <p className="text-xs text-white/70">Carbs</p>
                                </div>
                                <div className="bg-muted/50 rounded p-2">
                                  <p className="text-xs text-white mb-0.5">{meal.fats}g</p>
                                  <p className="text-xs text-white/70">Fats</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>
          ) : (
            // Planned Day Detail View (not completed yet)
            <div className="flex-1 min-h-0 flex flex-col px-6 pb-6 overflow-hidden">
              <div className="flex items-center justify-between flex-shrink-0 mb-4">
                <div>
                  <h3 className="text-foreground">{selectedDay.day}, {selectedDay.date}</h3>
                  <p className="text-sm text-white">
                    {selectedDay.totalCalories} cal · {selectedDay.totalProtein}g protein
                  </p>
                </div>
                <Button variant="outline" onClick={() => setSelectedDay(null)}>
                  Back to Calendar
                </Button>
              </div>

              {/* Daily Macros Summary */}
              <Card className="p-4 bg-gradient-to-br from-nutrition-primary/5 to-nutrition-secondary/10 border-nutrition-primary/20 flex-shrink-0 mb-4">
                <h4 className="text-foreground mb-3">Daily Nutrition Goals</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="text-center">
                    <p className="text-sm text-foreground"><strong>{selectedDay.totalCalories}</strong></p>
                    <p className="text-xs text-white">Calories</p>
                    <p className="text-xs text-white">Goal: {dailyGoals.calories}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-foreground"><strong>{selectedDay.totalProtein}g</strong></p>
                    <p className="text-xs text-white">Protein</p>
                    <p className="text-xs text-white">Goal: {dailyGoals.protein}g</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-foreground"><strong>{selectedDay.totalCarbs}g</strong></p>
                    <p className="text-xs text-white">Carbs</p>
                    <p className="text-xs text-white">Goal: {dailyGoals.carbs}g</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-foreground"><strong>{selectedDay.totalFats}g</strong></p>
                    <p className="text-xs text-white">Fats</p>
                    <p className="text-xs text-white">Goal: {dailyGoals.fats}g</p>
                  </div>
                </div>
              </Card>

              <ScrollArea className="flex-1 min-h-0">
                <div className="space-y-3 pr-4">
                  {selectedDay.meals.map((meal, index) => (
                    <Card 
                      key={index} 
                      className="p-4 cursor-pointer hover:shadow-md hover:border-nutrition-primary/40 transition-all bg-gradient-to-br from-nutrition-primary/20 to-nutrition-primary/30 border-nutrition-primary/40"
                      onClick={() => setSelectedMeal(meal)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-nutrition-primary/20 text-white flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-foreground">{meal.name}</h4>
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-colors">
                              <Info className="h-3.5 w-3.5 text-primary" />
                              <span className="text-xs text-primary">More Info</span>
                            </div>
                          </div>
                          <p className="text-sm text-white mb-2">{meal.time}</p>
                          {meal.notes && (
                            <p className="text-sm text-white italic mb-2">{meal.notes}</p>
                          )}
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm mb-2">
                            <div className="flex items-center justify-between">
                              <span className="text-white">Calories:</span>
                              <span className="text-white"><strong>{meal.calories}</strong></span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-white">Protein:</span>
                              <span className="text-white"><strong>{meal.protein}g</strong></span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-white">Carbs:</span>
                              <span className="text-white"><strong>{meal.carbs}g</strong></span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-white">Fats:</span>
                              <span className="text-white"><strong>{meal.fats}g</strong></span>
                            </div>
                          </div>
                          {meal.preparationTime && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-white">Prep time:</span>
                              <Badge variant="outline" className="bg-nutrition-primary/10 text-white border-nutrition-primary/30 text-xs">
                                {meal.preparationTime}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )
        ) : (
          // Week Calendar View
          <div className="flex-1 min-h-0 flex flex-col px-3 md:px-6 pb-4 md:pb-6 overflow-hidden">
            <div className="flex items-center justify-between flex-shrink-0 mb-3 md:mb-4 gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleWeekChange(weekOffset - 1)}
                disabled={currentWeek + weekOffset <= 1}
                className="px-2 md:px-3"
              >
                <ChevronLeft className="h-4 w-4 md:mr-1" />
                <span className="hidden md:inline">Previous Week</span>
              </Button>
              <div className="text-center flex-1">
                <p className="text-sm text-white">Week {currentWeek + weekOffset} of {totalWeeks}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleWeekChange(weekOffset + 1)}
                disabled={currentWeek + weekOffset >= totalWeeks}
                className="px-2 md:px-3"
              >
                <span className="hidden md:inline">Next Week</span>
                <ChevronRight className="h-4 w-4 md:ml-1" />
              </Button>
            </div>

            <ScrollArea className="flex-1 min-h-0">
              <div className="grid grid-cols-1 gap-3 pr-2 md:pr-4">
                {weekMeals.map((dayMeals, index) => (
                  <Card
                    key={`${dayMeals.day}-${dayMeals.date}-${index}`}
                    className={`p-3 md:p-4 cursor-pointer hover:shadow-md transition-all ${
                      dayMeals.isCompleted
                        ? 'bg-gradient-to-br from-nutrition-primary/20 to-nutrition-primary/30 border-nutrition-primary/40'
                        : 'bg-gradient-to-br from-nutrition-primary/20 to-nutrition-primary/30 border-nutrition-primary/40'
                    }`}
                    onClick={() => setSelectedDay(dayMeals)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="text-foreground">{dayMeals.day}</h4>
                        <span className="text-sm text-white">{dayMeals.date}</span>
                        {dayMeals.isCompleted && (
                          <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                            Completed
                          </Badge>
                        )}
                      </div>
                      
                      <div className={`text-sm mb-2 ${dayMeals.isCompleted ? 'text-black' : 'text-white'}`}>
                        {dayMeals.totalCalories} cal · {dayMeals.totalProtein}g protein · {dayMeals.meals.length} meals
                      </div>
                      
                      {/* Coach's Meal Plan Collapsible Dropdown */}
                      {dayMeals.meals.length > 0 && (
                        <Collapsible
                          open={expandedMealPlan[dayMeals.day] || false}
                          onOpenChange={(isOpen) => {
                            setExpandedMealPlan(prev => ({
                              ...prev,
                              [dayMeals.day]: isOpen
                            }));
                          }}
                        >
                          <div 
                            className="bg-primary/5 border border-primary/20 rounded-lg mb-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <CollapsibleTrigger asChild>
                              <div className="p-2 cursor-pointer hover:bg-primary/10 rounded-lg transition-colors">
                                <div className={`text-xs mb-1.5 flex items-center justify-between gap-1 ${dayMeals.isCompleted ? 'text-black' : 'text-white'}`}>
                                  <div className="flex items-center gap-1">
                                    <span>🥗</span>
                                    <span>Coach's Meal Plan</span>
                                    <span className={dayMeals.isCompleted ? 'text-black/70' : 'text-white'}>({dayMeals.meals.length} meals)</span>
                                  </div>
                                  <ChevronDown 
                                    className={`h-4 w-4 transition-transform ${
                                      expandedMealPlan[dayMeals.day] ? 'rotate-180' : ''
                                    }`}
                                  />
                                </div>
                              </div>
                            </CollapsibleTrigger>
                            
                            <CollapsibleContent className="px-2 pb-2">
                              <div className="space-y-1.5 mt-1">
                                {dayMeals.meals.map((meal, idx) => {
                                  const mealKey = `${dayMeals.day}-${idx}`;
                                  const isMealExpanded = expandedMealDetails[mealKey] || false;
                                  
                                  return (
                                    <Collapsible
                                      key={idx}
                                      open={isMealExpanded}
                                      onOpenChange={(isOpen) => {
                                        setExpandedMealDetails(prev => ({
                                          ...prev,
                                          [mealKey]: isOpen
                                        }));
                                      }}
                                    >
                                      <div className="bg-background/50 rounded-md border border-primary/10">
                                        <CollapsibleTrigger asChild>
                                          <div className="p-2 cursor-pointer hover:bg-primary/5 rounded-md transition-colors">
                                            <div className={`text-xs flex items-center justify-between ${dayMeals.isCompleted ? 'text-black' : 'text-white'}`}>
                                              <div className="flex items-center gap-2 flex-1">
                                                <span className="font-medium">{meal.name}</span>
                                                <span className={dayMeals.isCompleted ? 'text-black/70' : 'text-white/70'}>
                                                  {meal.time}
                                                </span>
                                              </div>
                                              <ChevronDown 
                                                className={`h-3.5 w-3.5 transition-transform flex-shrink-0 ml-2 ${
                                                  isMealExpanded ? 'rotate-180' : ''
                                                }`}
                                              />
                                            </div>
                                          </div>
                                        </CollapsibleTrigger>
                                        
                                        <CollapsibleContent className="px-2 pb-2">
                                          <div className="space-y-1.5 mt-1.5 pt-1.5 border-t border-primary/10">
                                            <div className="flex items-center justify-between text-xs">
                                              <span className={dayMeals.isCompleted ? 'text-black' : 'text-white'}>
                                                Calories:
                                              </span>
                                              <span className={dayMeals.isCompleted ? 'text-black' : 'text-white'}>
                                                {meal.calories} kcal
                                              </span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                              <span className={dayMeals.isCompleted ? 'text-black' : 'text-white'}>
                                                Protein:
                                              </span>
                                              <span className={dayMeals.isCompleted ? 'text-black' : 'text-white'}>
                                                {meal.protein}g
                                              </span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                              <span className={dayMeals.isCompleted ? 'text-black' : 'text-white'}>
                                                Carbs:
                                              </span>
                                              <span className={dayMeals.isCompleted ? 'text-black' : 'text-white'}>
                                                {meal.carbs}g
                                              </span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                              <span className={dayMeals.isCompleted ? 'text-black' : 'text-white'}>
                                                Fats:
                                              </span>
                                              <span className={dayMeals.isCompleted ? 'text-black' : 'text-white'}>
                                                {meal.fats}g
                                              </span>
                                            </div>
                                            {meal.preparationTime && (
                                              <div className="flex items-center justify-between text-xs">
                                                <span className={dayMeals.isCompleted ? 'text-black' : 'text-white'}>
                                                  Prep Time:
                                                </span>
                                                <span className={dayMeals.isCompleted ? 'text-black' : 'text-white'}>
                                                  {meal.preparationTime}
                                                </span>
                                              </div>
                                            )}
                                            {meal.notes && (
                                              <div className="text-xs pt-1">
                                                <span className={dayMeals.isCompleted ? 'text-black italic' : 'text-white italic'}>
                                                  💭 {meal.notes}
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        </CollapsibleContent>
                                      </div>
                                    </Collapsible>
                                  );
                                })}
                              </div>
                            </CollapsibleContent>
                          </div>
                        </Collapsible>
                      )}
                      
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="flex-1 md:flex-initial bg-black text-white hover:bg-black/90">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}