import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { UtensilsCrossed, Clock, ChefHat, Flame, X } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

interface Recipe {
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  difficulty: string;
}

interface Meal {
  id?: number;
  name: string;
  time?: string;
  items?: string[];
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  completed?: boolean;
  isModified?: boolean;
  recipe?: Recipe;
  category?: string;
  isFavorite?: boolean;
}

interface MealDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meal: Meal | null;
}

export function MealDetailsDialog({ open, onOpenChange, meal }: MealDetailsDialogProps) {
  if (!meal) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] p-0 gap-0 bg-background border-border">
        {/* Hero Header with Gradient */}
        <div className="relative bg-gradient-to-br from-nutrition via-nutrition/90 to-success p-8 rounded-t-lg">
          <div className="absolute inset-0 bg-grid-white/[0.05] rounded-t-lg"></div>
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <UtensilsCrossed className="h-6 w-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-white text-2xl">{meal.name}</DialogTitle>
                  <p className="text-white/80 text-sm">{meal.category}</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {meal.recipe?.difficulty && (
                <div className="flex items-center gap-1.5 text-white/90 text-sm">
                  <ChefHat className="h-4 w-4" />
                  <span>{meal.recipe.difficulty}</span>
                </div>
              )}
              {meal.recipe?.prepTime && (
                <div className="flex items-center gap-1.5 text-white/90 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>{meal.recipe.prepTime}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-white/90 text-sm">
                <Flame className="h-4 w-4" />
                <span>{meal.calories} kcal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="max-h-[calc(85vh-280px)] px-8 py-6">
          <div className="space-y-6">
            {/* Macros Grid - 2x2 Layout */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 text-center bg-gradient-to-br from-nutrition/10 to-nutrition/5 border-nutrition/10 hover:border-nutrition/20 transition-colors">
                <div className="text-4xl text-nutrition mb-2">{meal.calories}</div>
                <div className="text-xs text-white uppercase tracking-wide">Calories</div>
              </Card>
              <Card className="p-6 text-center bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/10 hover:border-blue-500/20 transition-colors">
                <div className="text-4xl text-blue-600 mb-2">{meal.protein}g</div>
                <div className="text-xs text-white uppercase tracking-wide">Protein</div>
              </Card>
              <Card className="p-6 text-center bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/10 hover:border-amber-500/20 transition-colors">
                <div className="text-4xl text-amber-600 mb-2">{meal.carbs}g</div>
                <div className="text-xs text-white uppercase tracking-wide">Carbs</div>
              </Card>
              <Card className="p-6 text-center bg-gradient-to-br from-rose-500/10 to-rose-500/5 border-rose-500/10 hover:border-rose-500/20 transition-colors">
                <div className="text-4xl text-rose-600 mb-2">{meal.fats}g</div>
                <div className="text-xs text-white uppercase tracking-wide">Fats</div>
              </Card>
            </div>

            {/* Ingredients Section */}
            {meal.recipe?.ingredients && meal.recipe.ingredients.length > 0 ? (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-1 w-1 rounded-full bg-nutrition"></div>
                  <h4 className="text-foreground uppercase tracking-wide text-sm">Ingredients</h4>
                  <div className="flex-1 h-px bg-border"></div>
                </div>
                <Card className="p-5 bg-gradient-to-br from-nutrition/5 to-transparent border-nutrition/20">
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {meal.recipe.ingredients.map((ingredient, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-nutrition flex-shrink-0"></div>
                        <span className="text-foreground">{ingredient}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            ) : meal.items && meal.items.length > 0 ? (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-1 w-1 rounded-full bg-nutrition"></div>
                  <h4 className="text-foreground uppercase tracking-wide text-sm">Items</h4>
                  <div className="flex-1 h-px bg-border"></div>
                </div>
                <Card className="p-5 bg-gradient-to-br from-nutrition/5 to-transparent border-nutrition/20">
                  <ul className="space-y-2">
                    {meal.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-nutrition flex-shrink-0"></div>
                        <span className="text-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            ) : null}

            {/* Instructions Section */}
            {meal.recipe?.instructions && meal.recipe.instructions.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-1 w-1 rounded-full bg-nutrition"></div>
                  <h4 className="text-foreground uppercase tracking-wide text-sm">Preparation Steps</h4>
                  <div className="flex-1 h-px bg-border"></div>
                </div>
                <div className="space-y-4">
                  {meal.recipe.instructions.map((instruction, idx) => (
                    <Card key={idx} className="p-5 bg-gradient-to-br from-nutrition/5 to-transparent border-nutrition/20 hover:border-nutrition/40 transition-all hover:shadow-md">
                      <div className="flex gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-nutrition to-success text-white flex-shrink-0 text-sm shadow-lg">
                          {idx + 1}
                        </div>
                        <p className="text-sm text-foreground leading-relaxed pt-1">{instruction}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-8 py-5 border-t bg-muted/30">
          <Button 
            onClick={() => onOpenChange(false)} 
            className="w-full bg-gradient-to-r from-nutrition to-success hover:from-nutrition/90 hover:to-success/90 text-white shadow-lg"
          >
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}