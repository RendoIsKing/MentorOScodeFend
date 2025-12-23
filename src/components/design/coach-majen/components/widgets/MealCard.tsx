import { useState } from 'react';
import { Card } from '../ui/card';
import { Utensils, CheckCircle, Edit2, Trash2, AlertCircle, Info, ChevronRight } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { MealDetailsDialog } from './MealDetailsDialog';

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

interface MealCardProps {
  meal: Meal;
  onClick?: () => void;
  onMealComplete?: (mealId: number, completed: boolean) => void;
  onEdit?: (meal: Meal) => void;
  onDelete?: (mealId: number) => void;
  mealNumber?: number;
}

export function MealCard({ meal, onClick, onMealComplete, onEdit, onDelete, mealNumber }: MealCardProps) {
  const [isCompleted, setIsCompleted] = useState(meal.completed || false);
  const [isHoveringCheckButton, setIsHoveringCheckButton] = useState(false);
  const [isRecipeDialogOpen, setIsRecipeDialogOpen] = useState(false);

  const handleToggle = () => {
    setIsCompleted(!isCompleted);
    onMealComplete?.(meal.id, !isCompleted);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(meal);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(meal.id);
  };

  const hasRecipe = meal.recipe && (meal.recipe.ingredients.length > 0 || meal.recipe.instructions.length > 0);

  // Compact view when completed
  if (isCompleted) {
    return (
      <Card 
        className="p-4 bg-gradient-to-br from-nutrition-primary/20 via-nutrition-primary/10 to-nutrition-secondary/20 backdrop-blur-sm border border-nutrition-primary/30 hover:shadow-md transition-all"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 flex items-center gap-3">
            <h4 className="text-foreground">{meal.name}</h4>
            <Badge className="bg-success/10 text-success border-success/10 text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              Eaten
            </Badge>
          </div>

          {/* Check Button */}
          <div
            className="flex items-center justify-center w-10 h-10 rounded-lg cursor-pointer transition-all border bg-success/10 border-success hover:bg-success/20"
            onClick={(e) => {
              e.stopPropagation();
              handleToggle();
            }}
          >
            <CheckCircle className="h-6 w-6 text-success" strokeWidth={2.5} />
          </div>
        </div>
      </Card>
    );
  }

  // Full view when not completed
  return (
    <Card 
      className={`p-5 hover:shadow-md transition-all bg-gradient-to-br from-nutrition-primary/20 via-nutrition-primary/10 to-nutrition-secondary/20 backdrop-blur-sm border border-nutrition-primary/30 ${
        isCompleted ? 'bg-success/5' : ''
      } ${meal.isModified ? 'border-amber-300/50' : ''}`}
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-1">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h4 className={`text-foreground ${isCompleted ? 'line-through' : ''}`}>{meal.name}</h4>
                {isCompleted && (
                  <Badge className="bg-success/10 text-success border-success/10 text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Eaten
                  </Badge>
                )}
                {meal.isModified && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 text-xs">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Modified
                  </Badge>
                )}
              </div>
              <p className="text-sm text-white">{meal.time}</p>
            </div>
          </div>

          <ul className="space-y-1.5 mb-4">
            {meal.items.slice(0, 3).map((item, idx) => (
              <li key={idx} className="text-sm text-white">
                • {item}
              </li>
            ))}
            {meal.items.length > 3 && (
              <li className="text-sm text-white italic">
                +{meal.items.length - 3} more items
              </li>
            )}
          </ul>

          <div className="grid grid-cols-4 gap-2 pt-3 border-t">
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

          {/* Expand/Collapse Recipe Details */}
          {hasRecipe && (
            <div className="pt-3 border-t border-border mt-3">
              <Button
                onClick={() => setIsRecipeDialogOpen(true)}
                variant="outline"
                size="sm"
                className="w-full bg-nutrition/5 border-nutrition/10 hover:bg-nutrition/10 hover:border-nutrition/20 text-foreground"
              >
                <Info className="h-3.5 w-3.5 mr-1.5" />
                View Recipe Details
                <ChevronRight className="h-3.5 w-3.5 ml-auto" />
              </Button>

              {/* Recipe Details Dialog */}
              <MealDetailsDialog
                open={isRecipeDialogOpen}
                onOpenChange={setIsRecipeDialogOpen}
                meal={meal}
              />
            </div>
          )}
        </div>

        {/* Combined Check Button - Now on the right side */}
        <div
          className="flex items-center justify-center cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            handleToggle();
          }}
          onMouseEnter={() => setIsHoveringCheckButton(true)}
          onMouseLeave={() => setIsHoveringCheckButton(false)}
        >
          {isCompleted ? (
            // Show green checkmark when completed
            <div className="w-10 h-10 rounded-full bg-nutrition-primary flex items-center justify-center transition-all">
              <CheckCircle className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
          ) : isHoveringCheckButton ? (
            // Show checkmark on hover
            <div className="w-10 h-10 rounded-full bg-nutrition-primary/80 flex items-center justify-center transition-all">
              <CheckCircle className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
          ) : (
            // Show meal number in circle for uneaten meal
            <div className="w-10 h-10 rounded-full border-2 border-nutrition-primary hover:border-nutrition-primary/80 flex items-center justify-center transition-all cursor-pointer">
              <span className="text-base text-nutrition-primary">{mealNumber || 1}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-3 border-t">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={handleEdit}
        >
          <Edit2 className="h-3.5 w-3.5 mr-1.5" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={handleDelete}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </Card>
  );
}