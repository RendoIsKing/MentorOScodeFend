import { useState } from 'react';
import { getDefaultDayMeals, type Meal as ImportedMeal, type Recipe } from '../data/nutritionPlanMeals';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Flame, TrendingUp, ShoppingCart, Camera, Plus, ChevronRight, ChevronDown } from 'lucide-react';
import { MealCard } from './widgets/MealCard';
import { NutritionPlanDialog } from './widgets/NutritionPlanDialog';
import { NutritionPlanOverviewDialog } from './widgets/NutritionPlanOverviewDialog';
import { MealEditorDialog } from './widgets/MealEditorDialog';
import { NutritionDayDialog } from './widgets/NutritionDayDialog';
import { ScanMealDialog } from './widgets/ScanMealDialog';
import { ShoppingListDialog } from './widgets/ShoppingListDialog';

interface HistoryDay {
  date: string;
  meals: ImportedMeal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  goalCalories: number;
  goalProtein: number;
  goalCarbs: number;
  goalFats: number;
}

interface NutritionViewProps {
  meals?: ImportedMeal[];
  onMealComplete?: (mealId: number, completed: boolean) => void;
}

export function NutritionView({ meals: propsMeals, onMealComplete: propsOnMealComplete }: NutritionViewProps = {}) {
  const [isNutritionPlanOpen, setIsNutritionPlanOpen] = useState(false);
  const [isOverviewDialogOpen, setIsOverviewDialogOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<ImportedMeal | null>(null);
  const [selectedHistoryDay, setSelectedHistoryDay] = useState<HistoryDay | null>(null);
  const [isScanDialogOpen, setIsScanDialogOpen] = useState(false);
  const [isDayCompleteDialogOpen, setIsDayCompleteDialogOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<ImportedMeal | null>(null);
  const [isAddingMeal, setIsAddingMeal] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [isShoppingListOpen, setIsShoppingListOpen] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());
  
  // Track the current working day (starts as today, advances when day is completed)
  const [currentNutritionDay, setCurrentNutritionDay] = useState<Date>(new Date());
  
  // Use props if provided, otherwise use local state
  const [localMeals, setLocalMeals] = useState<ImportedMeal[]>(getDefaultDayMeals());
  const meals = propsMeals || localMeals;
  const setMeals = propsOnMealComplete ? 
    (updater: React.SetStateAction<ImportedMeal[]>) => {
      const newMeals = typeof updater === 'function' ? updater(meals) : updater;
      setLocalMeals(newMeals);
    } : setLocalMeals;

  // Nutrition history state
  const [nutritionHistory, setNutritionHistory] = useState<HistoryDay[]>([
    {
      date: 'Monday, Nov 11, 2025',
      meals: [
        { id: 101, name: 'Protein Pancakes', time: '8:00 AM', items: ['Pancakes', 'Banana', 'Maple syrup'], calories: 450, protein: 30, carbs: 68, fats: 12, completed: true },
        { id: 102, name: 'Turkey Wrap', time: '12:30 PM', items: ['Whole wheat wrap', 'Turkey breast', 'Lettuce', 'Tomato'], calories: 520, protein: 42, carbs: 65, fats: 14, completed: true },
        { id: 103, name: 'Protein Bar', time: '3:30 PM', items: ['Protein bar', 'Apple'], calories: 280, protein: 20, carbs: 35, fats: 8, completed: true },
        { id: 104, name: 'Beef Stir Fry', time: '7:00 PM', items: ['Lean beef', 'Mixed vegetables', 'Brown rice'], calories: 680, protein: 52, carbs: 78, fats: 18, completed: true },
      ],
      totalCalories: 1930,
      totalProtein: 144,
      totalCarbs: 246,
      totalFats: 52,
      goalCalories: 2000,
      goalProtein: 120,
      goalCarbs: 250,
      goalFats: 65,
    },
    {
      date: 'Sunday, Nov 10, 2025',
      meals: [
        { id: 201, name: 'Scrambled Eggs', time: '9:00 AM', items: ['Eggs', 'Toast', 'Avocado'], calories: 480, protein: 28, carbs: 42, fats: 22, completed: true },
        { id: 202, name: 'Grilled Chicken Bowl', time: '1:00 PM', items: ['Chicken', 'Quinoa', 'Roasted vegetables'], calories: 590, protein: 48, carbs: 72, fats: 16, completed: true },
        { id: 203, name: 'Smoothie', time: '4:00 PM', items: ['Protein powder', 'Berries', 'Spinach'], calories: 320, protein: 30, carbs: 38, fats: 8, completed: true, isModified: true },
        { id: 204, name: 'Pizza Night', time: '7:30 PM', items: ['Homemade pizza', 'Side salad'], calories: 750, protein: 35, carbs: 95, fats: 28, completed: true, isModified: true },
      ],
      totalCalories: 2140,
      totalProtein: 141,
      totalCarbs: 247,
      totalFats: 74,
      goalCalories: 2000,
      goalProtein: 120,
      goalCarbs: 250,
      goalFats: 65,
    },
    {
      date: 'Saturday, Nov 9, 2025',
      meals: [
        { id: 301, name: 'Breakfast Burrito', time: '8:30 AM', items: ['Eggs', 'Beans', 'Tortilla', 'Salsa'], calories: 520, protein: 32, carbs: 58, fats: 18, completed: true },
        { id: 302, name: 'Tuna Salad', time: '12:00 PM', items: ['Tuna', 'Mixed greens', 'Olive oil'], calories: 420, protein: 38, carbs: 22, fats: 20, completed: true },
        { id: 303, name: 'Pre-Workout Snack', time: '3:00 PM', items: ['Rice cakes', 'Peanut butter'], calories: 240, protein: 12, carbs: 32, fats: 10, completed: true },
        { id: 304, name: 'Chicken Pasta', time: '6:30 PM', items: ['Whole wheat pasta', 'Chicken', 'Marinara'], calories: 620, protein: 45, carbs: 82, fats: 15, completed: true },
      ],
      totalCalories: 1800,
      totalProtein: 127,
      totalCarbs: 194,
      totalFats: 63,
      goalCalories: 2000,
      goalProtein: 120,
      goalCarbs: 250,
      goalFats: 65,
    },
  ]);

  const mealPlan = {
    name: 'Lean Muscle Building Plan',
    duration: '4 weeks',
    startDate: 'Oct 1, 2025',
    endDate: 'Oct 28, 2025',
    dailyCalories: 2000,
    dailyProtein: 120,
    dailyCarbs: 250,
    dailyFats: 65,
    currentWeek: 4,
  };

  // Calculate daily nutrition from completed meals
  const dailyGoals = {
    calories: { 
      current: meals.filter(m => m.completed).reduce((sum, m) => sum + m.calories, 0), 
      target: 2000 
    },
    protein: { 
      current: meals.filter(m => m.completed).reduce((sum, m) => sum + m.protein, 0), 
      target: 120 
    },
    carbs: { 
      current: meals.filter(m => m.completed).reduce((sum, m) => sum + m.carbs, 0), 
      target: 250 
    },
    fats: { 
      current: meals.filter(m => m.completed).reduce((sum, m) => sum + m.fats, 0), 
      target: 65 
    },
  };

  const macroPercentage = (current: number, target: number) => {
    if (target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const handleMealComplete = (mealId: number, completed: boolean) => {
    // If props callback is provided, use it (for syncing with App.tsx)
    if (propsOnMealComplete) {
      propsOnMealComplete(mealId, completed);
    } else {
      // Otherwise, update local state
      const updatedMeals = meals.map(meal => 
        meal.id === mealId ? { ...meal, completed } : meal
      );
      setMeals(updatedMeals);
      
      // Check if all meals are now completed
      if (completed && updatedMeals.every(meal => meal.completed)) {
        setIsDayCompleteDialogOpen(true);
      }
    }
  };

  const handleDoneForToday = () => {
    // Open completion dialog even if not all meals are completed
    setIsDayCompleteDialogOpen(true);
  };

  const handleAcknowledgeDay = () => {
    // Use the current nutrition day for the completed day
    const dayName = currentNutritionDay.toLocaleDateString('en-US', { weekday: 'long' });
    const monthName = currentNutritionDay.toLocaleDateString('en-US', { month: 'short' });
    const day = currentNutritionDay.getDate();
    const year = currentNutritionDay.getFullYear();
    const dateString = `${dayName}, ${monthName} ${day}, ${year}`;

    // Calculate totals ONLY from COMPLETED meals
    const totalCalories = meals.filter(m => m.completed).reduce((sum, m) => sum + m.calories, 0);
    const totalProtein = meals.filter(m => m.completed).reduce((sum, m) => sum + m.protein, 0);
    const totalCarbs = meals.filter(m => m.completed).reduce((sum, m) => sum + m.carbs, 0);
    const totalFats = meals.filter(m => m.completed).reduce((sum, m) => sum + m.fats, 0);

    // Create new history entry
    const newHistoryEntry: HistoryDay = {
      date: dateString,
      meals: meals.map(m => ({ ...m })), // Deep copy meals
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFats,
      goalCalories: mealPlan.dailyCalories,
      goalProtein: mealPlan.dailyProtein,
      goalCarbs: mealPlan.dailyCarbs,
      goalFats: mealPlan.dailyFats,
    };

    // Add to history (at the beginning) and keep only the 3 most recent days
    const updatedHistory = [newHistoryEntry, ...nutritionHistory].slice(0, 3);
    setNutritionHistory(updatedHistory);

    // Advance to next day
    const nextDay = new Date(currentNutritionDay);
    nextDay.setDate(nextDay.getDate() + 1);
    setCurrentNutritionDay(nextDay);

    // Reset meals for new day
    setMeals(getDefaultDayMeals());
    
    // Close dialog
    setIsDayCompleteDialogOpen(false);
  };

  const handleUndoComplete = () => {
    // Just close the dialog, keeping meals as completed
    setIsDayCompleteDialogOpen(false);
  };

  const handleEditMeal = (meal: ImportedMeal) => {
    setEditingMeal(meal);
    setIsAddingMeal(false);
    setIsEditorOpen(true);
  };

  const handleDeleteMeal = (mealId: number) => {
    if (confirm('Are you sure you want to remove this meal from today?')) {
      setMeals(meals.filter(meal => meal.id !== mealId));
    }
  };

  const handleSaveMeal = (updatedMeal: ImportedMeal) => {
    if (isAddingMeal) {
      // Adding new meal
      setMeals([...meals, updatedMeal]);
    } else {
      // Updating existing meal
      setMeals(meals.map(meal => meal.id === updatedMeal.id ? updatedMeal : meal));
    }
    setIsEditorOpen(false);
    setEditingMeal(null);
    setIsAddingMeal(false);
  };

  const handleAddMeal = () => {
    setEditingMeal(null);
    setIsAddingMeal(true);
    setIsEditorOpen(true);
  };

  const handleScanInsteadClick = () => {
    setIsEditorOpen(false);
    setIsScanDialogOpen(true);
  };

  const handleMealScanned = (scannedMeal: any) => {
    const newMeal: ImportedMeal = {
      id: editingMeal?.id || Date.now(),
      name: scannedMeal.name,
      time: editingMeal?.time || new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      items: scannedMeal.items,
      calories: scannedMeal.calories,
      protein: scannedMeal.protein,
      carbs: scannedMeal.carbs,
      fats: scannedMeal.fats,
      completed: false,
      isModified: true,
    };

    if (isAddingMeal || !editingMeal) {
      // Adding new scanned meal
      setMeals([...meals, newMeal]);
    } else {
      // Replacing existing meal with scanned meal
      setMeals(meals.map(meal => meal.id === editingMeal.id ? newMeal : meal));
    }

    setIsScanDialogOpen(false);
    setEditingMeal(null);
    setIsAddingMeal(false);
  };

  const handleToggleIngredient = (ingredientKey: string) => {
    setCheckedIngredients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ingredientKey)) {
        newSet.delete(ingredientKey);
      } else {
        newSet.add(ingredientKey);
      }
      return newSet;
    });
  };

  const handleClearShoppingList = () => {
    setCheckedIngredients(new Set());
  };

  return (
    <div className="space-y-6 max-w-6xl p-4 md:p-6 min-h-full w-full" style={{ background: 'oklch(0.14 0.012 240)' }}>
      {/* Current Meal Plan */}
      <Card 
        className="p-4 bg-gradient-to-br from-nutrition-primary/90 to-nutrition-secondary/90 border-0 cursor-pointer hover:shadow-md transition-all"
        onClick={() => setIsNutritionPlanOpen(true)}
      >
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-white">{mealPlan.name}</h3>
          <Badge variant="outline" className="bg-card">Active</Badge>
        </div>
        <p className="text-sm text-white mb-3">
          {mealPlan.dailyCalories} cal · {mealPlan.dailyProtein}g protein · {mealPlan.dailyCarbs}g carbs · {mealPlan.dailyFats}g fats
        </p>
        <div className="flex gap-2 mb-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 bg-white/10 border-0 text-white hover:bg-white/20"
            onClick={(e) => { e.stopPropagation(); setIsNutritionPlanOpen(true); }}
          >
            View Full Plan
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 md:flex-initial bg-white/10 border-0 text-white hover:bg-white/20"
            onClick={(e) => { e.stopPropagation(); setIsOverviewDialogOpen(true); }}
          >
            About Plan
          </Button>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm text-white">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {(() => {
                const totalWeeks = (mealPlan as any)?.totalWeeks || 12;
                return <span>Week {mealPlan.currentWeek} of {totalWeeks}</span>;
              })()}
            </div>
            {(() => {
              const totalWeeks = (mealPlan as any)?.totalWeeks || 12;
              return <span>{Math.round((mealPlan.currentWeek / totalWeeks) * 100)}%</span>;
            })()}
          </div>
          <div className="h-2 bg-black/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-white/80 to-white/60"
              style={{
                width: `${(mealPlan.currentWeek / (((mealPlan as any)?.totalWeeks || 12) as number)) * 100}%`,
              }}
            />
          </div>
        </div>
      </Card>

      {/* Daily Nutrition Overview */}
      <Card className="p-6 bg-gradient-to-br from-nutrition-primary/20 via-nutrition-primary/10 to-nutrition-secondary/20 backdrop-blur-sm border border-nutrition-primary/30">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-nutrition-primary to-nutrition-secondary rounded-xl">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-foreground">Today's Nutrition</h3>
              <p className="text-sm text-white">Track your daily intake</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsShoppingListOpen(true)}
            className="gap-2 border-0 hover:bg-nutrition/10"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden md:inline">Shopping List</span>
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Calories Box */}
          <div className="relative overflow-hidden rounded-lg border-0 bg-gradient-to-br from-nutrition-primary/5 to-nutrition-secondary/10 p-4">
            <div className="relative z-10">
              <p className="text-xs text-white mb-2">Calories</p>
              <p className="text-lg text-foreground mb-3">
                {dailyGoals.calories.current} <span className="text-white">of</span> {dailyGoals.calories.target}
              </p>
              <div className="inline-block">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    macroPercentage(dailyGoals.calories.current, dailyGoals.calories.target) >= 100
                      ? 'bg-success/10 text-success border-0'
                      : macroPercentage(dailyGoals.calories.current, dailyGoals.calories.target) >= 80
                      ? 'bg-amber-500/10 text-amber-600 border-0'
                      : 'bg-primary/10 text-primary border-0'
                  }`}
                >
                  {macroPercentage(dailyGoals.calories.current, dailyGoals.calories.target).toFixed(0)}%
                </Badge>
              </div>
            </div>
            {/* Background fill indicator */}
            <div 
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-nutrition-primary/20 to-nutrition-primary/5 transition-all duration-500"
              style={{ height: `${macroPercentage(dailyGoals.calories.current, dailyGoals.calories.target)}%` }}
            />
          </div>

          {/* Protein Box */}
          <div className="relative overflow-hidden rounded-lg border-0 bg-gradient-to-br from-nutrition-primary/5 to-nutrition-secondary/10 p-4">
            <div className="relative z-10">
              <p className="text-xs text-white mb-2">Protein</p>
              <p className="text-lg text-foreground mb-3">
                {dailyGoals.protein.current}g <span className="text-white">of</span> {dailyGoals.protein.target}g
              </p>
              <div className="inline-block">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    macroPercentage(dailyGoals.protein.current, dailyGoals.protein.target) >= 100
                      ? 'bg-success/10 text-success border-0'
                      : macroPercentage(dailyGoals.protein.current, dailyGoals.protein.target) >= 80
                      ? 'bg-amber-500/10 text-amber-600 border-0'
                      : 'bg-primary/10 text-primary border-0'
                  }`}
                >
                  {macroPercentage(dailyGoals.protein.current, dailyGoals.protein.target).toFixed(0)}%
                </Badge>
              </div>
            </div>
            {/* Background fill indicator */}
            <div 
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-nutrition-secondary/20 to-nutrition-secondary/5 transition-all duration-500"
              style={{ height: `${macroPercentage(dailyGoals.protein.current, dailyGoals.protein.target)}%` }}
            />
          </div>

          {/* Carbs Box */}
          <div className="relative overflow-hidden rounded-lg border-0 bg-gradient-to-br from-nutrition-primary/5 to-nutrition-secondary/10 p-4">
            <div className="relative z-10">
              <p className="text-xs text-white mb-2">Carbs</p>
              <p className="text-lg text-foreground mb-3">
                {dailyGoals.carbs.current}g <span className="text-white">of</span> {dailyGoals.carbs.target}g
              </p>
              <div className="inline-block">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    macroPercentage(dailyGoals.carbs.current, dailyGoals.carbs.target) >= 100
                      ? 'bg-success/10 text-success border-0'
                      : macroPercentage(dailyGoals.carbs.current, dailyGoals.carbs.target) >= 80
                      ? 'bg-amber-500/10 text-amber-600 border-0'
                      : 'bg-primary/10 text-primary border-0'
                  }`}
                >
                  {macroPercentage(dailyGoals.carbs.current, dailyGoals.carbs.target).toFixed(0)}%
                </Badge>
              </div>
            </div>
            {/* Background fill indicator */}
            <div 
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-success/20 to-success/5 transition-all duration-500"
              style={{ height: `${macroPercentage(dailyGoals.carbs.current, dailyGoals.carbs.target)}%` }}
            />
          </div>

          {/* Fats Box */}
          <div className="relative overflow-hidden rounded-lg border-0 bg-gradient-to-br from-nutrition-primary/5 to-nutrition-secondary/10 p-4">
            <div className="relative z-10">
              <p className="text-xs text-white mb-2">Fats</p>
              <p className="text-lg text-foreground mb-3">
                {dailyGoals.fats.current}g <span className="text-white">of</span> {dailyGoals.fats.target}g
              </p>
              <div className="inline-block">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    macroPercentage(dailyGoals.fats.current, dailyGoals.fats.target) >= 100
                      ? 'bg-success/10 text-success border-0'
                      : macroPercentage(dailyGoals.fats.current, dailyGoals.fats.target) >= 80
                      ? 'bg-amber-500/10 text-amber-600 border-0'
                      : 'bg-primary/10 text-primary border-0'
                  }`}
                >
                  {macroPercentage(dailyGoals.fats.current, dailyGoals.fats.target).toFixed(0)}%
                </Badge>
              </div>
            </div>
            {/* Background fill indicator */}
            <div 
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-500/20 to-amber-500/5 transition-all duration-500"
              style={{ height: `${macroPercentage(dailyGoals.fats.current, dailyGoals.fats.target)}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Today's Meals */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h3 className="text-foreground text-2xl font-semibold">Today's Meals</h3>
              <Badge variant="outline" className="bg-primary/10 text-primary border-0 text-xs">
                {currentNutritionDay.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </Badge>
            </div>
            <p className="text-white text-sm">Check off meals as you eat them and click to view recipes</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => setIsScanDialogOpen(true)} variant="outline" size="sm" className="border-0 hover:bg-nutrition/10">
              <Camera className="h-4 w-4 mr-2" />
              Scan Meal
            </Button>
            <Button onClick={handleAddMeal} size="sm" className="bg-gradient-to-r from-secondary to-secondary/80">
              <Plus className="h-4 w-4 mr-2" />
              Add Meal
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {meals.map((meal, index) => (
            <MealCard
              key={meal.id}
              meal={meal}
              onMealComplete={handleMealComplete}
              onEdit={handleEditMeal}
              onDelete={handleDeleteMeal}
              mealNumber={index + 1}
            />
          ))}
        </div>
      </div>

      {/* Done for Today Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleDoneForToday}
          size="lg"
          className="bg-gradient-to-r from-nutrition-primary to-nutrition-secondary hover:from-nutrition-primary/90 hover:to-nutrition-secondary/90 shadow-lg px-8"
        >
          <ChevronRight className="h-5 w-5 mr-2" />
          Done Eating for Today
        </Button>
      </div>

      {/* Nutrition Plan Dialog */}
      <NutritionPlanDialog
        open={isNutritionPlanOpen}
        onOpenChange={setIsNutritionPlanOpen}
        planName={mealPlan.name}
        currentWeek={mealPlan.currentWeek}
        totalWeeks={4}
        currentDayMeals={meals}
        currentNutritionDay={currentNutritionDay}
        nutritionHistory={nutritionHistory}
        dailyGoals={{
          calories: mealPlan.dailyCalories,
          protein: mealPlan.dailyProtein,
          carbs: mealPlan.dailyCarbs,
          fats: mealPlan.dailyFats,
        }}
      />

      {/* Nutrition Plan Overview Dialog */}
      <NutritionPlanOverviewDialog
        open={isOverviewDialogOpen}
        onOpenChange={setIsOverviewDialogOpen}
      />

      {/* Meal Editor Dialog */}
      <MealEditorDialog
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        meal={editingMeal}
        onSave={handleSaveMeal}
        isNewMeal={isAddingMeal}
        onScanInstead={handleScanInsteadClick}
      />

      {/* Nutrition History */}
      <Collapsible open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <div className="mb-6">
          <CollapsibleTrigger className="w-full group">
            <div className="flex items-center justify-between gap-4">
              <div className="text-left">
                <h3 className="text-foreground mb-1">Nutrition History</h3>
                <p className="text-white">View your previous days nutrition and meals</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="gap-2 hover:bg-nutrition/10 border-0 flex-shrink-0"
                type="button"
              >
                <span className="text-sm">{isHistoryOpen ? 'Hide' : 'Show'}</span>
                <ChevronDown 
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isHistoryOpen ? 'rotate-180' : ''
                  }`} 
                />
              </Button>
            </div>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <ScrollArea className="max-h-[600px]">
            <div className="space-y-4 pr-4">
              {nutritionHistory.map((day, index) => {
                const caloriesDiff = day.totalCalories - day.goalCalories;
                const isOverGoal = caloriesDiff > 0;
                const completedMeals = day.meals.filter(m => m.completed).length;

                return (
                  <Card
                    key={index}
                    className="p-6 hover:shadow-lg transition-all cursor-pointer border-0 bg-card/50"
                    onClick={() => setSelectedHistoryDay(day)}
                  >
                    <div className="space-y-6">
                      {/* Header Row */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="mb-4">
                            <h4 className="text-foreground leading-relaxed mb-3">
                              {day.date.split(', ')[0]},<br />
                              {day.date.split(', ')[1]},<br />
                              {day.date.split(', ')[2]}
                            </h4>
                            <p className="text-sm text-white leading-relaxed">
                              Nutritional<br />
                              Profile
                            </p>
                          </div>
                          <Badge 
                            variant="outline" 
                            className="text-xs bg-nutrition/5 border-0 text-nutrition"
                          >
                            {completedMeals}/{day.meals.length} meals completed
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2 hover:bg-nutrition/10 -mt-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedHistoryDay(day);
                          }}
                        >
                          <div className="h-5 w-5 rounded-full border border-current flex items-center justify-center">
                            <ChevronRight className="h-3 w-3" />
                          </div>
                          <span className="text-sm">See Info</span>
                        </Button>
                      </div>

                      {/* Macros Grid - 2x2 for better spacing */}
                      <div className="space-y-4">
                        {/* Calories */}
                        <div className="space-y-2">
                          <div className="flex items-baseline justify-between">
                            <p className="text-xs text-white uppercase tracking-wider">Calories</p>
                            <p className="text-xs text-white">{day.totalCalories} / {day.goalCalories}</p>
                          </div>
                          <div className="h-2 bg-nutrition/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-nutrition to-success rounded-full transition-all"
                              style={{ width: `${Math.min((day.totalCalories / day.goalCalories) * 100, 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-nutrition">
                            {Math.round((day.totalCalories / day.goalCalories) * 100)}% complete
                          </p>
                        </div>

                        {/* Protein */}
                        <div className="space-y-2">
                          <div className="flex items-baseline justify-between">
                            <p className="text-xs text-white uppercase tracking-wider">Protein</p>
                            <p className="text-xs text-white">{day.totalProtein}g / {day.goalProtein}g</p>
                          </div>
                          <div className="h-2 bg-blue-500/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
                              style={{ width: `${Math.min((day.totalProtein / day.goalProtein) * 100, 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-blue-500">
                            {Math.round((day.totalProtein / day.goalProtein) * 100)}% complete
                          </p>
                        </div>

                        {/* Carbs */}
                        <div className="space-y-2">
                          <div className="flex items-baseline justify-between">
                            <p className="text-xs text-white uppercase tracking-wider">Carbs</p>
                            <p className="text-xs text-white">{day.totalCarbs}g / {day.goalCarbs}g</p>
                          </div>
                          <div className="h-2 bg-amber-500/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all"
                              style={{ width: `${Math.min((day.totalCarbs / day.goalCarbs) * 100, 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-amber-500">
                            {Math.round((day.totalCarbs / day.goalCarbs) * 100)}% complete
                          </p>
                        </div>

                        {/* Fats */}
                        <div className="space-y-2">
                          <div className="flex items-baseline justify-between">
                            <p className="text-xs text-white uppercase tracking-wider">Fats</p>
                            <p className="text-xs text-white">{day.totalFats}g / {day.goalFats}g</p>
                          </div>
                          <div className="h-2 bg-rose-500/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-rose-500 to-rose-600 rounded-full transition-all"
                              style={{ width: `${Math.min((day.totalFats / day.goalFats) * 100, 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-rose-500">
                            {Math.round((day.totalFats / day.goalFats) * 100)}% complete
                          </p>
                        </div>
                      </div>

                      {/* Summary Footer */}
                      <div className="pt-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white">Daily Goal Progress</span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              isOverGoal 
                                ? 'bg-amber-50 text-amber-700 border-0 dark:bg-amber-950/20 dark:text-amber-400' 
                                : 'bg-success/10 text-success border-0'
                            }`}
                          >
                            {isOverGoal ? `+${caloriesDiff}` : caloriesDiff} kcal
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>

      {/* Nutrition History Day Dialog */}
      <NutritionDayDialog
        open={!!selectedHistoryDay}
        onOpenChange={(open) => !open && setSelectedHistoryDay(null)}
        day={selectedHistoryDay}
      />

      {/* Scan Meal Dialog */}
      <ScanMealDialog
        open={isScanDialogOpen}
        onOpenChange={setIsScanDialogOpen}
        onMealScanned={handleMealScanned}
      />

      {/* Shopping List Dialog */}
      <ShoppingListDialog
        open={isShoppingListOpen}
        onOpenChange={setIsShoppingListOpen}
        meals={meals}
        checkedIngredients={checkedIngredients}
        onToggleIngredient={handleToggleIngredient}
        onClearShoppingList={handleClearShoppingList}
      />

      {/* Day Complete Confirmation Dialog */}
      <Dialog open={isDayCompleteDialogOpen} onOpenChange={setIsDayCompleteDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-center">
              {meals.every(m => m.completed) ? 'All Meals Completed! 🎉' : 'Finish Day Summary'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Congratulations Message */}
            <div className="text-center space-y-2">
              <p className="text-foreground">
                {meals.every(m => m.completed) 
                  ? 'Great job completing all your meals for today!' 
                  : 'You\'re finishing your nutrition tracking for today.'}
              </p>
              <p className="text-sm text-white">
                Here's your nutrition summary for today:
              </p>
            </div>

            {/* Today's Stats Summary */}
            <Card className="p-6 bg-gradient-to-br from-nutrition/10 via-nutrition/5 to-success/10 border-0">
              <div className="space-y-4">
                {/* Total Stats */}
                <div className="grid grid-cols-4 gap-4 pb-4">
                  <div className="text-center">
                    <p className="text-2xl text-foreground">{dailyGoals.calories.current}</p>
                    <p className="text-xs text-muted-foreground">Calories</p>
                    <p className="text-xs text-nutrition mt-1">{macroPercentage(dailyGoals.calories.current, dailyGoals.calories.target).toFixed(0)}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl text-foreground">{dailyGoals.protein.current}g</p>
                    <p className="text-xs text-muted-foreground">Protein</p>
                    <p className="text-xs text-nutrition mt-1">{macroPercentage(dailyGoals.protein.current, dailyGoals.protein.target).toFixed(0)}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl text-foreground">{dailyGoals.carbs.current}g</p>
                    <p className="text-xs text-muted-foreground">Carbs</p>
                    <p className="text-xs text-nutrition mt-1">{macroPercentage(dailyGoals.carbs.current, dailyGoals.carbs.target).toFixed(0)}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl text-foreground">{dailyGoals.fats.current}g</p>
                    <p className="text-xs text-muted-foreground">Fats</p>
                    <p className="text-xs text-nutrition mt-1">{macroPercentage(dailyGoals.fats.current, dailyGoals.fats.target).toFixed(0)}%</p>
                  </div>
                </div>

                {/* Meals List - Show all meals with completion status */}
                <div>
                  <h4 className="text-sm text-foreground mb-3">Meals:</h4>
                  <div className="space-y-2">
                    {meals.map((meal) => (
                      <div 
                        key={meal.id} 
                        className={`flex items-center justify-between text-sm p-2 rounded-lg ${
                          meal.completed 
                            ? 'bg-card' 
                            : 'bg-muted/50 opacity-70'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {meal.completed ? (
                            <div className="h-5 w-5 rounded-full bg-success/20 flex items-center justify-center">
                              <div className="h-2 w-2 rounded-full bg-success"></div>
                            </div>
                          ) : (
                            <div className="h-5 w-5 rounded-full border-0 flex items-center justify-center">
                              <div className="h-2 w-2 rounded-full bg-muted-foreground/30"></div>
                            </div>
                          )}
                          <span className={meal.completed ? 'text-foreground' : 'text-muted-foreground'}>
                            {meal.name}
                          </span>
                          {!meal.completed && (
                            <Badge variant="outline" className="text-xs bg-muted/50 border-0 text-muted-foreground">
                              Not Eaten
                            </Badge>
                          )}
                        </div>
                        <span className={meal.completed ? 'text-muted-foreground' : 'text-muted-foreground/50'}>
                          {meal.completed ? `${meal.calories} kcal` : `0 kcal`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Confirmation Message */}
            <Card className="p-4 bg-amber-50 dark:bg-amber-950/20 border-0">
              <p className="text-sm text-center text-black dark:text-white">
                Please confirm this day is complete. This will save {meals.filter(m => m.completed).length} of {meals.length} meals to your history.
              </p>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleUndoComplete}
              className="flex-1"
            >
              Go Back
            </Button>
            <Button
              onClick={handleAcknowledgeDay}
              className="flex-1 bg-gradient-to-r from-nutrition via-nutrition to-success"
            >
              Confirm & Complete Day
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}