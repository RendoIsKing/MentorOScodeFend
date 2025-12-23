import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Utensils, CheckCircle, ChevronLeft, ChevronRight, Info, Share2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselApi,
} from '../ui/carousel';
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

interface MealsCarouselCardProps {
  meals: Meal[];
  onMealComplete?: (mealId: number, completed: boolean) => void;
  initialSlide?: number;
  onSlideChange?: (slideIndex: number) => void;
  onShare?: (data: { meals: Meal[]; currentSlide: number; isSummary?: boolean }) => void;
}

export function MealsCarouselCard({ meals, onMealComplete, initialSlide = 0, onSlideChange, onShare }: MealsCarouselCardProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = useState(initialSlide);
  const [showSummary, setShowSummary] = useState(false);
  const [mealStates, setMealStates] = useState<Record<number, boolean>>(
    meals.reduce((acc, meal) => ({ ...acc, [meal.id]: meal.completed || false }), {})
  );
  const [isHoveringCheckButton, setIsHoveringCheckButton] = useState(false);
  const [recipeDialogMealId, setRecipeDialogMealId] = useState<number | null>(null);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrentIndex(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrentIndex(api.selectedScrollSnap());
      onSlideChange?.(api.selectedScrollSnap());
    });
  }, [api, onSlideChange]);

  // Scroll to initialSlide when component mounts or api becomes available
  useEffect(() => {
    if (api && initialSlide !== undefined && initialSlide < meals.length) {
      api.scrollTo(initialSlide, true); // true = instant scroll without animation
    }
  }, [api, initialSlide]);

  const handleToggle = (mealId: number) => {
    const newCompletedState = !mealStates[mealId];
    setMealStates((prev) => ({ ...prev, [mealId]: newCompletedState }));
    onMealComplete?.(mealId, newCompletedState);

    // Auto-advance to next meal if meal was marked as completed
    if (newCompletedState && currentIndex < meals.length - 1) {
      setTimeout(() => {
        api?.scrollNext();
      }, 600); // Small delay for visual feedback
    }
  };

  const currentMeal = meals[currentIndex];
  const isCompleted = currentMeal ? mealStates[currentMeal.id] : false;
  const hasRecipe = currentMeal?.recipe && (currentMeal.recipe.ingredients.length > 0 || currentMeal.recipe.instructions.length > 0);
  
  // Count completed meals
  const completedCount = Object.values(mealStates).filter(Boolean).length;

  return (
    <>
      <Card className="w-full p-3 sm:p-4 bg-white border-gray-200 overflow-hidden relative max-h-[480px]">
        {/* Share Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 text-gray-700 hover:text-gray-900 hover:bg-gray-100 z-10"
          onClick={() => {
            // Share functionality with summary flag
            onShare?.({ meals, currentSlide: showSummary ? 0 : currentIndex, isSummary: showSummary });
          }}
        >
          <Share2 className="h-4 w-4" />
        </Button>

        {/* Header with meal counter and Summary button */}
        <div className="flex items-center justify-between mb-2.5 sm:mb-3 pr-10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-nutrition-primary to-nutrition-secondary rounded-lg">
              <Utensils className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-900">Today's Meals</h4>
              <p className="text-sm text-gray-600">
                {completedCount} of {meals.length} completed
              </p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            {!showSummary && (
              <Badge variant="outline" className="bg-nutrition-primary/10 text-nutrition-primary border-nutrition-primary/30 text-sm font-medium">
                Meal {currentIndex + 1}/{meals.length}
              </Badge>
            )}
            <button
              onClick={() => setShowSummary(!showSummary)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                showSummary 
                  ? 'bg-nutrition-primary text-white shadow-sm hover:bg-nutrition-primary/90' 
                  : 'bg-white text-nutrition-primary border-2 border-nutrition-primary/30 hover:border-nutrition-primary/50 hover:bg-nutrition-primary/5'
              }`}
            >
              Summary
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-2.5 sm:mb-3">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-nutrition-primary to-nutrition-secondary transition-all duration-500"
              style={{ width: `${(completedCount / meals.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Show either Summary or Carousel based on state */}
        {showSummary ? (
          // Summary View
          <div className="space-y-4 overflow-y-auto max-h-[320px]">
            {/* Celebration Header */}
            <div className="text-center space-y-2 pb-3 border-b border-nutrition-primary/20">
              <div className="flex justify-center mb-2">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-nutrition-primary to-nutrition-secondary flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <h4 className="text-lg sm:text-xl" style={{ color: '#1F2937' }}>
                {completedCount === meals.length ? "All Meals Complete! 🎉" : "Today's Summary"}
              </h4>
              <p className="text-sm sm:text-base" style={{ color: '#6B7280' }}>
                {completedCount === meals.length 
                  ? "Amazing work! You've completed all your meals today!" 
                  : `You've completed ${completedCount} of ${meals.length} meals`}
              </p>
            </div>

            {/* Total Nutrition Summary */}
            <div className="space-y-3">
              <h5 className="text-base sm:text-lg" style={{ color: '#1F2937' }}>Total Nutrition Today</h5>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-nutrition-primary/10 rounded-lg p-3 border border-nutrition-primary/20">
                  <p className="text-xl sm:text-2xl" style={{ color: '#1F2937' }}>
                    {meals.reduce((sum, meal) => sum + meal.calories, 0)}
                  </p>
                  <p className="text-xs sm:text-sm" style={{ color: '#6B7280' }}>Calories</p>
                </div>
                <div className="bg-nutrition-primary/10 rounded-lg p-3 border border-nutrition-primary/20">
                  <p className="text-xl sm:text-2xl" style={{ color: '#1F2937' }}>
                    {meals.reduce((sum, meal) => sum + meal.protein, 0)}g
                  </p>
                  <p className="text-xs sm:text-sm" style={{ color: '#6B7280' }}>Protein</p>
                </div>
                <div className="bg-nutrition-primary/10 rounded-lg p-3 border border-nutrition-primary/20">
                  <p className="text-xl sm:text-2xl" style={{ color: '#1F2937' }}>
                    {meals.reduce((sum, meal) => sum + meal.carbs, 0)}g
                  </p>
                  <p className="text-xs sm:text-sm" style={{ color: '#6B7280' }}>Carbs</p>
                </div>
                <div className="bg-nutrition-primary/10 rounded-lg p-3 border border-nutrition-primary/20">
                  <p className="text-xl sm:text-2xl" style={{ color: '#1F2937' }}>
                    {meals.reduce((sum, meal) => sum + meal.fats, 0)}g
                  </p>
                  <p className="text-xs sm:text-sm" style={{ color: '#6B7280' }}>Fats</p>
                </div>
              </div>
            </div>

            {/* Meals Overview */}
            <div className="space-y-2">
              <h5 className="text-base sm:text-lg" style={{ color: '#1F2937' }}>Meals Overview</h5>
              <div className="space-y-2">
                {meals.map((meal, index) => (
                  <button
                    key={meal.id}
                    onClick={() => {
                      setShowSummary(false);
                      api?.scrollTo(index);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg bg-nutrition-primary/5 hover:bg-nutrition-primary/10 border border-nutrition-primary/20 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {mealStates[meal.id] ? (
                        <CheckCircle className="h-5 w-5 text-nutrition-primary flex-shrink-0" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-nutrition-primary/50 flex-shrink-0" />
                      )}
                      <div className="text-left">
                        <p className="text-sm sm:text-base" style={{ color: '#1F2937' }}>{meal.name}</p>
                        <p className="text-xs sm:text-sm" style={{ color: '#6B7280' }}>{meal.time}</p>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm" style={{ color: '#6B7280' }}>{meal.calories} kcal</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Carousel View
          <Carousel setApi={setApi} opts={{ containScroll: "trimSnaps", align: "start" }} className="w-full">
            <CarouselContent className="-ml-0 items-start">
              {meals.map((meal, index) => {
                const mealCompleted = mealStates[meal.id];
                const mealNumber = index + 1;

                return (
                  <CarouselItem key={meal.id} className="pl-0">
                    <div className="space-y-2 sm:space-y-2.5">
                      {/* Meal header */}
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className={`text-base sm:text-lg ${mealCompleted ? 'line-through' : ''}`} style={{ color: '#1F2937' }}>
                              {meal.name}
                            </h4>
                            {mealCompleted && (
                              <Badge className="bg-success/10 text-success border-success/30 text-sm">
                                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                Eaten
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm sm:text-base" style={{ color: '#6B7280' }}>{meal.time}</p>
                        </div>

                        {/* Check Button */}
                        <div
                          className="flex items-center justify-center cursor-pointer flex-shrink-0"
                          onClick={() => handleToggle(meal.id)}
                          onMouseEnter={() => setIsHoveringCheckButton(true)}
                          onMouseLeave={() => setIsHoveringCheckButton(false)}
                        >
                          {mealCompleted ? (
                            // Show green checkmark when completed
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-nutrition-primary flex items-center justify-center transition-all">
                              <CheckCircle className="h-6 w-6 sm:h-7 sm:w-7 text-white" strokeWidth={2.5} />
                            </div>
                          ) : isHoveringCheckButton ? (
                            // Show checkmark on hover
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-nutrition-primary/80 flex items-center justify-center transition-all">
                              <CheckCircle className="h-6 w-6 sm:h-7 sm:w-7 text-white" strokeWidth={2.5} />
                            </div>
                          ) : (
                            // Show meal number in circle for uneaten meal
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-nutrition-primary hover:border-nutrition-primary/80 flex items-center justify-center transition-all">
                              <span className="text-lg sm:text-xl text-nutrition-primary">{mealNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Meal items */}
                      <ul className="space-y-1 sm:space-y-1.5">
                        {meal.items.slice(0, 3).map((item, idx) => (
                          <li key={idx} className="text-sm sm:text-base" style={{ color: '#4B5563' }}>
                            • {item}
                          </li>
                        ))}
                        {meal.items.length > 3 && (
                          <li className="text-sm sm:text-base italic" style={{ color: '#4B5563' }}>
                            +{meal.items.length - 3} more items
                          </li>
                        )}
                      </ul>

                      {/* Nutrition info */}
                      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 pt-2 sm:pt-2 border-t border-nutrition-primary/20">
                        <div className="text-center">
                          <p className="text-sm sm:text-base" style={{ color: '#1F2937' }}>{meal.calories}</p>
                          <p className="text-xs sm:text-sm" style={{ color: '#6B7280' }}>kcal</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm sm:text-base" style={{ color: '#1F2937' }}>{meal.protein}g</p>
                          <p className="text-xs sm:text-sm" style={{ color: '#6B7280' }}>Protein</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm sm:text-base" style={{ color: '#1F2937' }}>{meal.carbs}g</p>
                          <p className="text-xs sm:text-sm" style={{ color: '#6B7280' }}>Carbs</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm sm:text-base" style={{ color: '#1F2937' }}>{meal.fats}g</p>
                          <p className="text-xs sm:text-sm" style={{ color: '#6B7280' }}>Fats</p>
                        </div>
                      </div>

                      {/* View recipe button */}
                      {hasRecipe && index === currentIndex && (
                        <div className="pt-1.5">
                          <Button
                            onClick={() => setRecipeDialogMealId(meal.id)}
                            variant="outline"
                            size="sm"
                            className="w-full bg-nutrition-primary/5 border-nutrition-primary/30 hover:bg-nutrition-primary/10 hover:border-nutrition-primary/50 text-gray-900 text-sm sm:text-base"
                          >
                            <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                            View Recipe Details
                          </Button>
                        </div>
                      )}

                      {/* Navigation dots - inline for meal pages */}
                      <div className="flex items-center justify-center gap-2 mt-4">
                        <CarouselPrevious className="static translate-y-0 h-8 w-8 sm:h-9 sm:w-9 bg-gray-100 border-gray-300 hover:bg-gray-200 text-gray-700" />
                        <div className="flex gap-2">
                          {meals.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => api?.scrollTo(idx)}
                              className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full transition-all flex items-center justify-center text-xs sm:text-sm ${
                                idx === currentIndex
                                  ? 'bg-nutrition-primary text-white scale-110'
                                  : mealStates[meals[idx].id]
                                  ? 'bg-success/30 text-success border-2 border-success'
                                  : 'bg-gray-200 text-gray-700 border-2 border-gray-300'
                              }`}
                            >
                              {idx + 1}
                            </button>
                          ))}
                        </div>
                        <CarouselNext className="static translate-y-0 h-8 w-8 sm:h-9 sm:w-9 bg-gray-100 border-gray-300 hover:bg-gray-200 text-gray-700" />
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
          </Carousel>
        )}
      </Card>

      {/* Recipe Dialog */}
      {recipeDialogMealId && (
        <MealDetailsDialog
          open={recipeDialogMealId !== null}
          onOpenChange={(open) => !open && setRecipeDialogMealId(null)}
          meal={meals.find((m) => m.id === recipeDialogMealId)!}
        />
      )}
    </>
  );
}