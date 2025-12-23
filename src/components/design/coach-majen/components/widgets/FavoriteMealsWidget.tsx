import { useState } from 'react';
import { Card } from '../ui/card';
import { TrendingUp, TrendingDown, UtensilsCrossed, List, Info } from 'lucide-react';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { AllMealsDialog } from './AllMealsDialog';
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
  targetCarbs?: number;
  targetFats?: number;
  recipe?: {
    ingredients: string[];
    instructions: string[];
    prepTime: string;
    difficulty: string;
  };
}

interface FavoriteMealsWidgetProps {
  meals: Meal[];
  allMeals?: Meal[];
  handleToggleFavorite?: (mealName: string) => void;
}

export function FavoriteMealsWidget({ meals, allMeals, handleToggleFavorite }: FavoriteMealsWidgetProps) {
  const [isAllMealsDialogOpen, setIsAllMealsDialogOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

  // Use meals if allMeals not provided
  const mealsToShow = allMeals || meals;

  return (
    <Card className="p-6 bg-gradient-to-br from-nutrition-primary/20 via-nutrition-primary/10 to-nutrition-secondary/20 backdrop-blur-sm border border-nutrition-primary/30">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-nutrition via-nutrition to-success">
            <UtensilsCrossed className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-foreground">Favorite Meals</h3>
            <p className="text-sm text-white">Your go-to healthy meals</p>
          </div>
        </div>
        {allMeals && allMeals.length > meals.length && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsAllMealsDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <List className="h-4 w-4" />
            See All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {meals.map((meal) => {
          return (
            <Card key={meal.name} className="p-5 bg-gradient-to-br from-nutrition/5 via-nutrition/3 to-success/5 border-nutrition/10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-foreground mb-1">{meal.name}</p>
                  <p className="text-xs text-white">Nutritional Profile</p>
                </div>
                {/* Recipe Button in upper right */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMeal(meal)}
                  className="h-8 px-2 flex-shrink-0"
                >
                  <Info className="h-4 w-4 mr-1" />
                  <span className="text-xs">See Info</span>
                </Button>
              </div>
              
              {/* Nutrition Info - Horizontal Layout */}
              <div className="grid grid-cols-4 gap-3">
                {/* Calories */}
                <div className="text-center">
                  <span className="px-2 py-1 bg-gradient-to-br from-nutrition/20 via-nutrition/15 to-success/20 text-foreground text-xs rounded-md block mb-1">Calories</span>
                  <span className="text-foreground text-sm block">{meal.calories}</span>
                </div>
                
                {/* Protein */}
                <div className="text-center">
                  <span className="px-2 py-1 bg-gradient-to-br from-nutrition/20 via-nutrition/15 to-success/20 text-foreground text-xs rounded-md block mb-1">Protein</span>
                  <span className="text-foreground text-sm block">{meal.protein}g</span>
                </div>
                
                {/* Carbs */}
                <div className="text-center">
                  <span className="px-2 py-1 bg-gradient-to-br from-nutrition/20 via-nutrition/15 to-success/20 text-foreground text-xs rounded-md block mb-1">Carbs</span>
                  <span className="text-foreground text-sm block">{meal.carbs}g</span>
                </div>
                
                {/* Fats */}
                <div className="text-center">
                  <span className="px-2 py-1 bg-gradient-to-br from-nutrition/20 via-nutrition/15 to-success/20 text-foreground text-xs rounded-md block mb-1">Fats</span>
                  <span className="text-foreground text-sm block">{meal.fats}g</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* All Meals Dialog */}
      <AllMealsDialog
        open={isAllMealsDialogOpen}
        onOpenChange={setIsAllMealsDialogOpen}
        meals={mealsToShow}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Meal Details Dialog */}
      <MealDetailsDialog
        open={selectedMeal !== null}
        onOpenChange={(open) => !open && setSelectedMeal(null)}
        meal={selectedMeal}
      />
    </Card>
  );
}