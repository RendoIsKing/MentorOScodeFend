import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { UtensilsCrossed, Star, Info } from 'lucide-react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { useState } from 'react';
import { MealDetailsDialog } from './MealDetailsDialog';

interface Meal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  category?: string;
  isFavorite?: boolean;
  targetCalories?: number;
  targetProtein?: number;
  recipe?: {
    ingredients: string[];
    instructions: string[];
    prepTime: string;
    difficulty: string;
  };
}

interface AllMealsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meals: Meal[];
  onToggleFavorite?: (mealName: string) => void;
}

export function AllMealsDialog({ open, onOpenChange, meals, onToggleFavorite }: AllMealsDialogProps) {
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  
  // Group meals by category
  const categories = Array.from(new Set(meals.map(m => m.category || 'Other')));
  
  const favoriteMeals = meals.filter(m => m.isFavorite);
  const avgCalories = meals.reduce((acc, m) => acc + m.calories, 0) / meals.length;

  const handleToggleFavorite = (mealName: string) => {
    if (onToggleFavorite) {
      onToggleFavorite(mealName);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        {/* Fixed Header */}
        <div className="sticky top-0 bg-background z-10 p-4 md:p-6 border-b">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-nutrition via-nutrition to-success rounded-lg">
                <UtensilsCrossed className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle>All Meals</DialogTitle>
                <p className="text-sm text-white mt-1">
                  Complete overview of your meal library
                </p>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 md:p-6 space-y-6">
          {/* Summary Stats */}
          <div className="flex justify-center gap-4 flex-wrap">
            <Card className="p-4 bg-nutrition-primary/5 border-nutrition-primary/10 min-w-[180px]">
              <p className="text-xs text-white mb-1">Total Meals</p>
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5 text-nutrition-primary" />
                <p className="text-xl text-nutrition-primary">{meals.length}</p>
              </div>
            </Card>
            <Card className="p-4 bg-muted min-w-[180px]">
              <p className="text-xs text-white mb-1">Favorites</p>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" />
                <p className="text-xl text-foreground">{favoriteMeals.length}</p>
              </div>
            </Card>
          </div>

          {/* Meals by Category - Accordion Style */}
          <Accordion type="multiple" className="space-y-4">
            {categories.map((category) => {
              const categoryMeals = meals.filter(m => (m.category || 'Other') === category);
              
              return (
                <AccordionItem key={category} value={category} className="border rounded-lg">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 rounded-t-lg">
                    <div className="flex items-center justify-between w-full pr-2">
                      <h4 className="text-foreground">{category}</h4>
                      <Badge variant="outline" className="text-xs">
                        {categoryMeals.length} meals
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-2">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {categoryMeals.map((meal) => {
                        return (
                          <Card 
                            key={meal.name} 
                            className={`p-4 ${meal.isFavorite ? 'bg-nutrition/5 border-nutrition/10' : ''}`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2 flex-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-transparent flex-shrink-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleFavorite(meal.name);
                                  }}
                                >
                                  <Star 
                                    className={`h-5 w-5 transition-colors ${
                                      meal.isFavorite 
                                        ? 'text-amber-500 fill-amber-500' 
                                        : 'text-muted-foreground hover:text-amber-500'
                                    }`}
                                  />
                                </Button>
                                <div className="flex-1">
                                  <p className="text-foreground">{meal.name}</p>
                                  <p className="text-xs text-white">Nutritional Profile</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-4 gap-3 mb-3">
                              <div>
                                <p className="text-xs text-white mb-1">Calories</p>
                                <p className="text-foreground">{meal.calories}</p>
                              </div>
                              <div>
                                <p className="text-xs text-white mb-1">Protein</p>
                                <p className="text-foreground">{meal.protein}g</p>
                              </div>
                              <div>
                                <p className="text-xs text-white mb-1">Carbs</p>
                                <p className="text-foreground">{meal.carbs}g</p>
                              </div>
                              <div>
                                <p className="text-xs text-white mb-1">Fats</p>
                                <p className="text-foreground">{meal.fats}g</p>
                              </div>
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedMeal(meal)}
                              className="w-full h-8 px-2"
                            >
                              <Info className="h-4 w-4 mr-1" />
                              <span className="text-xs">See Info</span>
                            </Button>
                          </Card>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>

        {/* Fixed Footer */}
        <div className="sticky bottom-0 bg-background border-t p-4 md:p-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>

      {/* Meal Details Dialog */}
      <MealDetailsDialog
        open={selectedMeal !== null}
        onOpenChange={(open) => !open && setSelectedMeal(null)}
        meal={selectedMeal}
      />
    </Dialog>
  );
}