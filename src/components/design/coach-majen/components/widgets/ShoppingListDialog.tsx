import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { ShoppingCart, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';

interface Recipe {
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  difficulty: string;
}

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
  recipe?: Recipe;
}

interface ParsedIngredient {
  original: string;
  name: string;
  amount: number;
  unit: string;
}

interface WeeklyIngredient {
  name: string;
  unit: string;
  totalNeeded: number;
  purchased: number;
  dailyNeeds: { day: number; amount: number; mealName: string }[];
}

interface ShoppingListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meals: Meal[];
  checkedIngredients: Set<string>;
  onToggleIngredient: (ingredientKey: string) => void;
  onClearShoppingList: () => void;
}

// Parse ingredient string to extract quantity
function parseIngredient(ingredient: string): ParsedIngredient {
  // Regex patterns to match quantities
  const patterns = [
    // Matches: "150g chicken breast" or "1.5kg chicken"
    /^(\d+(?:\.\d+)?)\s*(g|kg|ml|l|lb|oz|tbsp|tsp|cup|cups|slice|slices|medium|large|small|whole)\s+(.+)$/i,
    // Matches: "1/2 cup flour"
    /^(\d+\/\d+)\s+(cup|cups|tbsp|tsp)\s+(.+)$/i,
    // Matches: "1 cup flour" or "2 cups flour"
    /^(\d+)\s+(cup|cups|tbsp|tsp|slice|slices|medium|large|small|whole)\s+(.+)$/i,
  ];

  for (const pattern of patterns) {
    const match = ingredient.match(pattern);
    if (match) {
      let amount = 0;
      const rawAmount = match[1];
      
      // Handle fractions
      if (rawAmount.includes('/')) {
        const [num, denom] = rawAmount.split('/').map(Number);
        amount = num / denom;
      } else {
        amount = parseFloat(rawAmount);
      }

      const unit = match[2].toLowerCase();
      const name = match[3].trim();

      return { original: ingredient, name, amount, unit };
    }
  }

  // If no match, return as-is with amount 1 and unit "item"
  return {
    original: ingredient,
    name: ingredient,
    amount: 1,
    unit: 'item',
  };
}

// Normalize units for aggregation
function normalizeUnit(unit: string): string {
  const unitMap: Record<string, string> = {
    'g': 'g',
    'gram': 'g',
    'grams': 'g',
    'kg': 'kg',
    'kilogram': 'kg',
    'kilograms': 'kg',
    'ml': 'ml',
    'milliliter': 'ml',
    'milliliters': 'ml',
    'l': 'l',
    'liter': 'l',
    'liters': 'l',
    'lb': 'lb',
    'pound': 'lb',
    'pounds': 'lb',
    'oz': 'oz',
    'ounce': 'oz',
    'ounces': 'oz',
    'tbsp': 'tbsp',
    'tablespoon': 'tbsp',
    'tablespoons': 'tbsp',
    'tsp': 'tsp',
    'teaspoon': 'tsp',
    'teaspoons': 'tsp',
    'cup': 'cup',
    'cups': 'cup',
    'slice': 'slice',
    'slices': 'slice',
    'medium': 'medium',
    'large': 'large',
    'small': 'small',
    'whole': 'whole',
    'item': 'item',
  };
  return unitMap[unit.toLowerCase()] || unit;
}

// Normalize ingredient name for aggregation
function normalizeIngredientName(name: string): string {
  // Remove descriptors like "chopped", "sliced", "halved", etc.
  let normalized = name.toLowerCase();
  const descriptors = [
    'chopped', 'sliced', 'halved', 'diced', 'minced', 'grated', 'shredded',
    'cooked', 'raw', 'fresh', 'dried', 'frozen', 'canned',
    '\\(.*?\\)', // Remove anything in parentheses
  ];
  
  descriptors.forEach(desc => {
    normalized = normalized.replace(new RegExp(desc, 'gi'), '').trim();
  });
  
  // Remove extra spaces
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized;
}

export function ShoppingListDialog({
  open,
  onOpenChange,
  meals,
  checkedIngredients,
  onToggleIngredient,
  onClearShoppingList,
}: ShoppingListDialogProps) {
  const [weekPurchases, setWeekPurchases] = useState<Record<string, number>>({});
  const [expandedIngredients, setExpandedIngredients] = useState<Set<string>>(new Set());

  // Generate a week's worth of meals (7 days, same meals repeated)
  const weeklyMeals = useMemo(() => {
    const week: { day: number; meals: Meal[] }[] = [];
    for (let day = 1; day <= 7; day++) {
      week.push({
        day,
        meals: meals.map(m => ({ ...m, id: m.id * 1000 + day })), // Unique IDs per day
      });
    }
    return week;
  }, [meals]);

  // Aggregate ingredients for the entire week
  const weeklyIngredients = useMemo(() => {
    const aggregated: Record<string, WeeklyIngredient> = {};

    weeklyMeals.forEach(({ day, meals: dayMeals }) => {
      dayMeals.forEach((meal) => {
        if (!meal.recipe) return;

        meal.recipe.ingredients.forEach((ingredient) => {
          const parsed = parseIngredient(ingredient);
          const normalizedName = normalizeIngredientName(parsed.name);
          const normalizedUnit = normalizeUnit(parsed.unit);
          const key = `${normalizedName}_${normalizedUnit}`;

          if (!aggregated[key]) {
            aggregated[key] = {
              name: normalizedName,
              unit: normalizedUnit,
              totalNeeded: 0,
              purchased: 0,
              dailyNeeds: [],
            };
          }

          aggregated[key].totalNeeded += parsed.amount;
          aggregated[key].dailyNeeds.push({
            day,
            amount: parsed.amount,
            mealName: meal.name,
          });
        });
      });
    });

    // Add purchased amounts from state
    Object.keys(aggregated).forEach(key => {
      if (weekPurchases[key]) {
        aggregated[key].purchased = weekPurchases[key];
      }
    });

    return aggregated;
  }, [weeklyMeals, weekPurchases]);

  const handleWeekPurchase = (key: string, totalNeeded: number) => {
    const isPurchased = weekPurchases[key] === totalNeeded;
    
    setWeekPurchases(prev => ({
      ...prev,
      [key]: isPurchased ? 0 : totalNeeded,
    }));

    // Sync with day view - check/uncheck matching ingredients for today (day 1)
    if (!isPurchased) {
      // We're purchasing this ingredient - check off all matching items for today
      const ingredient = weeklyIngredients[key];
      if (ingredient) {
        meals.forEach((meal) => {
          if (!meal.recipe) return;
          
          meal.recipe.ingredients.forEach((ingredientStr, idx) => {
            const parsed = parseIngredient(ingredientStr);
            const normalizedName = normalizeIngredientName(parsed.name);
            const normalizedUnit = normalizeUnit(parsed.unit);
            
            // If this ingredient matches the weekly ingredient, check it off
            if (normalizedName === ingredient.name && normalizedUnit === ingredient.unit) {
              const ingredientKey = `${meal.id}-${idx}`;
              if (!checkedIngredients.has(ingredientKey)) {
                onToggleIngredient(ingredientKey);
              }
            }
          });
        });
      }
    } else {
      // We're un-purchasing this ingredient - uncheck all matching items for today
      const ingredient = weeklyIngredients[key];
      if (ingredient) {
        meals.forEach((meal) => {
          if (!meal.recipe) return;
          
          meal.recipe.ingredients.forEach((ingredientStr, idx) => {
            const parsed = parseIngredient(ingredientStr);
            const normalizedName = normalizeIngredientName(parsed.name);
            const normalizedUnit = normalizeUnit(parsed.unit);
            
            // If this ingredient matches the weekly ingredient, uncheck it
            if (normalizedName === ingredient.name && normalizedUnit === ingredient.unit) {
              const ingredientKey = `${meal.id}-${idx}`;
              if (checkedIngredients.has(ingredientKey)) {
                onToggleIngredient(ingredientKey);
              }
            }
          });
        });
      }
    }
  };

  const toggleExpandIngredient = (key: string) => {
    setExpandedIngredients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  // Check if we have enough for a specific day
  const hasEnoughForDay = (ingredient: WeeklyIngredient, day: number): boolean => {
    const dailyNeedsUpToDay = ingredient.dailyNeeds
      .filter(need => need.day <= day)
      .reduce((sum, need) => sum + need.amount, 0);
    
    return ingredient.purchased >= dailyNeedsUpToDay;
  };

  const getRemainingForDay = (ingredient: WeeklyIngredient, day: number): number => {
    const consumed = ingredient.dailyNeeds
      .filter(need => need.day < day)
      .reduce((sum, need) => sum + need.amount, 0);
    
    return Math.max(0, ingredient.purchased - consumed);
  };

  const formatAmount = (amount: number, unit: string): string => {
    // Format decimal amounts nicely
    if (amount % 1 === 0) {
      return `${amount}${unit}`;
    } else {
      return `${amount.toFixed(1)}${unit}`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-nutrition-primary to-nutrition-secondary rounded-lg">
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <DialogTitle>Shopping List</DialogTitle>
              <p className="text-sm text-white mt-1">
                Plan your shopping for today or the entire week
              </p>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="day" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="day" className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              Today
            </TabsTrigger>
            <TabsTrigger value="week" className="gap-2">
              <Package className="h-4 w-4" />
              This Week
            </TabsTrigger>
          </TabsList>

          {/* Day View */}
          <TabsContent value="day" className="flex-1 overflow-y-auto mt-0 min-h-0">
            <div className="space-y-6 pr-4 py-4">
              {checkedIngredients.size > 0 && (
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearShoppingList}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear All
                  </Button>
                </div>
              )}
              
              {meals.map((meal) => {
                const totalIngredients = meal.recipe?.ingredients.length || 0;
                const checkedCount = meal.recipe?.ingredients.filter((_, idx) =>
                  checkedIngredients.has(`${meal.id}-${idx}`)
                ).length || 0;

                return (
                  <div key={meal.id}>
                    <div className="flex items-center gap-2 mb-3">
                      <h4 className="text-foreground">{meal.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {meal.time}
                      </Badge>
                      {totalIngredients > 0 && checkedCount > 0 && (
                        <Badge variant="outline" className="text-xs bg-nutrition/10 border-nutrition/30 text-nutrition">
                          {checkedCount}/{totalIngredients}
                        </Badge>
                      )}
                    </div>

                    {meal.recipe ? (
                      <Card className="p-4 bg-nutrition/5 border-nutrition/20">
                        <ul className="space-y-2">
                          {meal.recipe.ingredients.map((ingredient, idx) => {
                            const ingredientKey = `${meal.id}-${idx}`;
                            const isChecked = checkedIngredients.has(ingredientKey);

                            return (
                              <li
                                key={idx}
                                className="flex items-start gap-3 text-sm cursor-pointer hover:bg-nutrition/10 -mx-2 px-2 py-1 rounded-md transition-colors"
                                onClick={() => onToggleIngredient(ingredientKey)}
                              >
                                <div
                                  className={`h-5 w-5 rounded-sm border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                                    isChecked
                                      ? 'bg-nutrition border-nutrition'
                                      : 'border-nutrition/30 bg-card'
                                  }`}
                                >
                                  {isChecked && (
                                    <svg
                                      className="h-3 w-3 text-white"
                                      fill="none"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path d="M5 13l4 4L19 7"></path>
                                    </svg>
                                  )}
                                </div>
                                <span
                                  className={`text-foreground transition-all ${
                                    isChecked ? 'line-through opacity-60' : ''
                                  }`}
                                >
                                  {ingredient}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </Card>
                    ) : (
                      <Card className="p-4 bg-muted/20">
                        <p className="text-sm text-muted-foreground italic">
                          No detailed recipe available. Basic items: {meal.items.join(', ')}
                        </p>
                      </Card>
                    )}
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Week View */}
          <TabsContent value="week" className="flex-1 overflow-y-auto mt-0 min-h-0">
            <div className="space-y-4 pr-4 py-4">
              <div className="mb-4">
                <p className="text-sm text-white">
                  This is your complete shopping list for the week. Check off items when purchased, and we'll track what you have for each day.
                </p>
              </div>

              {Object.entries(weeklyIngredients)
                .sort(([, a], [, b]) => a.name.localeCompare(b.name))
                .map(([key, ingredient]) => {
                  const isPurchased = weekPurchases[key] === ingredient.totalNeeded;
                  const isExpanded = expandedIngredients.has(key);
                  const allDaysCovered = [1, 2, 3, 4, 5, 6, 7].every(day => 
                    hasEnoughForDay(ingredient, day)
                  );

                  return (
                    <Card
                      key={key}
                      className={`p-4 transition-all ${
                        isPurchased
                          ? 'bg-nutrition/10 border-nutrition/30'
                          : 'bg-card border-border hover:border-nutrition/20'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <div
                          className={`h-6 w-6 rounded-sm border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all cursor-pointer ${
                            isPurchased
                              ? 'bg-nutrition border-nutrition'
                              : 'border-nutrition/30 bg-card hover:border-nutrition/50'
                          }`}
                          onClick={() => handleWeekPurchase(key, ingredient.totalNeeded)}
                        >
                          {isPurchased && (
                            <svg
                              className="h-4 w-4 text-white"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path d="M5 13l4 4L19 7"></path>
                            </svg>
                          )}
                        </div>

                        {/* Ingredient Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`text-foreground capitalize ${
                                    isPurchased ? 'line-through opacity-70' : ''
                                  }`}
                                >
                                  {ingredient.name}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {formatAmount(ingredient.totalNeeded, ingredient.unit)}
                                </Badge>
                                {isPurchased && allDaysCovered && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-success/10 border-success/30 text-success"
                                  >
                                    ✓ All Week Covered
                                  </Badge>
                                )}
                              </div>
                              
                              {/* Quick status for days */}
                              {isPurchased && (
                                <div className="mt-2 flex items-center gap-1">
                                  {[1, 2, 3, 4, 5, 6, 7].map(day => {
                                    const hasEnough = hasEnoughForDay(ingredient, day);
                                    return (
                                      <div
                                        key={day}
                                        className={`h-2 w-2 rounded-full ${
                                          hasEnough ? 'bg-success' : 'bg-destructive'
                                        }`}
                                        title={`Day ${day}: ${hasEnough ? 'Covered' : 'Not enough'}`}
                                      />
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            {/* Expand/Details Button */}
                            {isPurchased && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleExpandIngredient(key)}
                                className="gap-1 h-7 px-2 text-xs"
                              >
                                {isExpanded ? (
                                  <>
                                    <ChevronUp className="h-3 w-3" />
                                    Hide
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="h-3 w-3" />
                                    Details
                                  </>
                                )}
                              </Button>
                            )}
                          </div>

                          {/* Expanded Details */}
                          <Collapsible open={isExpanded}>
                            <CollapsibleContent>
                              {isPurchased && (
                                <div className="mt-3 space-y-2 pl-2 border-l-2 border-nutrition/30">
                                  {[1, 2, 3, 4, 5, 6, 7].map(day => {
                                    const dayNeeds = ingredient.dailyNeeds.filter(
                                      need => need.day === day
                                    );
                                    const dayAmount = dayNeeds.reduce(
                                      (sum, need) => sum + need.amount,
                                      0
                                    );
                                    const remaining = getRemainingForDay(ingredient, day);
                                    const hasEnough = remaining >= dayAmount;

                                    if (dayAmount === 0) return null;

                                    return (
                                      <div
                                        key={day}
                                        className="text-xs space-y-1"
                                      >
                                        <div className="flex items-center justify-between">
                                          <span className="text-white">
                                            Day {day}
                                          </span>
                                          <Badge
                                            variant="outline"
                                            className={`text-xs ${
                                              hasEnough
                                                ? 'bg-success/10 border-success/30 text-success'
                                                : 'bg-destructive/10 border-destructive/30 text-destructive'
                                            }`}
                                          >
                                            {hasEnough ? '✓' : '✗'} {formatAmount(remaining, ingredient.unit)} left
                                          </Badge>
                                        </div>
                                        <div className="text-muted-foreground pl-3">
                                          Needs {formatAmount(dayAmount, ingredient.unit)}
                                          {dayNeeds.length > 0 && (
                                            <span className="ml-1">
                                              ({dayNeeds.map(n => n.mealName).join(', ')})
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </CollapsibleContent>
                          </Collapsible>
                        </div>
                      </div>
                    </Card>
                  );
                })}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex-shrink-0 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}