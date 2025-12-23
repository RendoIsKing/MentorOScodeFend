import { useState, useEffect, useMemo } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { StatsView } from './components/StatsView';
import { GoalsView } from './components/GoalsView';
import { TrainingView } from './components/TrainingView';
import { NutritionView } from './components/NutritionView';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, TrendingUp, Target, Dumbbell, Apple, ArrowLeft, BarChart3 } from 'lucide-react';
import { Button } from './components/ui/button';
import { ExerciseSet } from './components/widgets/ExerciseSetsHistoryDialog';
import { getTodaysWorkout } from './data/workoutSchedule';
import type { 
  WeightProgress, 
  Meal, 
  Message, 
  CompletedWorkoutData,
  MobileTab,
  DesktopTab 
} from './types';

// Initial meals template
const getInitialMeals = (): Meal[] => [
  {
    id: Date.now() + 1,
    name: 'Power Breakfast Bowl',
    time: '8:00 AM',
    items: ['Oatmeal with berries', 'Greek yogurt', 'Honey drizzle', 'Almonds'],
    calories: 420,
    protein: 25,
    carbs: 65,
    fats: 12,
    completed: false,
    recipe: {
      ingredients: [
        '1 cup rolled oats',
        '1 cup mixed berries',
        '150g Greek yogurt (0% fat)',
        '1 tbsp honey',
        '15g almonds, chopped',
        '1 cup almond milk',
        'Pinch of cinnamon',
      ],
      instructions: [
        'Cook oats in almond milk according to package directions',
        'While oats are cooking, wash and prepare berries',
        'Transfer cooked oats to a bowl',
        'Top with Greek yogurt in the center',
        'Arrange berries around the yogurt',
        'Drizzle honey over everything',
        'Sprinkle with chopped almonds and cinnamon',
        'Serve immediately while warm',
      ],
      prepTime: '10 minutes',
      difficulty: 'Easy',
    },
  },
  {
    id: Date.now() + 2,
    name: 'Grilled Chicken Salad',
    time: '1:00 PM',
    items: ['Grilled chicken breast', 'Mixed greens', 'Cherry tomatoes', 'Whole grain bread', 'Apple'],
    calories: 580,
    protein: 45,
    carbs: 72,
    fats: 15,
    completed: false,
    recipe: {
      ingredients: [
        '150g chicken breast',
        '2 cups mixed greens',
        '1 cup cherry tomatoes, halved',
        '1/2 cucumber, sliced',
        '1/4 red onion, sliced',
        '2 slices whole grain bread',
        '1 medium apple',
        '2 tbsp balsamic vinegar',
        '1 tsp olive oil',
        'Salt, pepper, and herbs to taste',
      ],
      instructions: [
        'Season chicken breast with salt, pepper, and herbs',
        'Grill chicken for 6-7 minutes per side until cooked through',
        'Let chicken rest for 5 minutes, then slice',
        'Wash and prepare all vegetables',
        'Combine greens, tomatoes, cucumber, and onion in a large bowl',
        'Top with sliced chicken',
        'Drizzle with balsamic vinegar and olive oil',
        'Serve with whole grain bread and apple on the side',
      ],
      prepTime: '20 minutes',
      difficulty: 'Medium',
    },
  },
  {
    id: Date.now() + 3,
    name: 'Protein Power Shake',
    time: '4:00 PM',
    items: ['Whey protein', 'Banana', 'Almond butter', 'Oats', 'Almond milk'],
    calories: 380,
    protein: 35,
    carbs: 48,
    fats: 10,
    completed: false,
    recipe: {
      ingredients: [
        '1 scoop whey protein powder',
        '1 medium banana',
        '1 tbsp almond butter',
        '1/4 cup rolled oats',
        '1 cup almond milk',
        '1/2 cup ice',
        'Optional: 1 tsp honey',
      ],
      instructions: [
        'Add almond milk to blender first',
        'Add protein powder and blend until smooth',
        'Add banana, almond butter, and oats',
        'Add ice and blend on high until creamy',
        'Add honey if desired for extra sweetness',
        'Pour into a glass and enjoy immediately',
      ],
      prepTime: '5 minutes',
      difficulty: 'Easy',
    },
  },
  {
    id: Date.now() + 4,
    name: 'Salmon & Quinoa Dinner',
    time: '7:00 PM',
    items: ['Grilled salmon', 'Quinoa', 'Steamed broccoli', 'Roasted sweet potato'],
    calories: 620,
    protein: 48,
    carbs: 65,
    fats: 20,
    completed: false,
    recipe: {
      ingredients: [
        '150g salmon fillet',
        '3/4 cup cooked quinoa',
        '1 cup broccoli florets',
        '1 medium sweet potato',
        '1 tsp olive oil',
        'Lemon juice',
        'Garlic powder',
        'Salt and pepper',
        'Fresh dill (optional)',
      ],
      instructions: [
        'Preheat oven to 200°C (400°F)',
        'Cut sweet potato into cubes and toss with olive oil, salt, and pepper',
        'Roast sweet potato for 25-30 minutes',
        'Season salmon with salt, pepper, garlic powder, and lemon juice',
        'Grill or bake salmon for 12-15 minutes until cooked through',
        'Steam broccoli for 5-7 minutes until tender',
        'Cook quinoa according to package directions',
        'Plate quinoa, top with vegetables and salmon',
        'Garnish with fresh dill and extra lemon if desired',
      ],
      prepTime: '35 minutes',
      difficulty: 'Medium',
    },
  },
];

export default function App() {
  const [isStudentCenterOpen, setIsStudentCenterOpen] = useState(false);
  const [mobileActiveTab, setMobileActiveTab] = useState<MobileTab>('chat');
  const [desktopActiveTab, setDesktopActiveTab] = useState<DesktopTab>('stats');
  const coachName = "Coach Majen";
  
  // Shared weight progress state
  const [weightProgress, setWeightProgress] = useState<WeightProgress>({
    start: 85.0,
    current: 78.5,
    target: 75.0,
    history: [
      { date: 'Oct 1', weight: 85.0 },
      { date: 'Oct 5', weight: 84.2 },
      { date: 'Oct 10', weight: 82.8 },
      { date: 'Oct 15', weight: 81.5 },
      { date: 'Oct 20', weight: 79.8 },
      { date: 'Oct 25', weight: 78.5 },
      { date: 'Oct 30', weight: 78.5 },
      { date: 'Nov 4', weight: 78.2 },
      { date: 'Nov 9', weight: 78.5 },
    ]
  });

  // Shared meals state
  const [meals, setMeals] = useState<Meal[]>(getInitialMeals());

  // Shared chat messages state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hey! Welcome to your fitness journey! I'm Coach Majen, and I'm here to help you achieve your goals. 💪",
      sender: 'coach',
      timestamp: new Date(Date.now() - 7200000),
    },
    {
      id: '2',
      text: "I've set up your Student Center where you can track your progress, view your personalized training and nutrition plans, and see how far you've come.",
      sender: 'coach',
      timestamp: new Date(Date.now() - 7100000),
    },
    {
      id: '3',
      text: "Click 'Student Center' to explore your dashboard. You can ask me questions anytime while viewing it!",
      sender: 'coach',
      timestamp: new Date(Date.now() - 7000000),
    },
    {
      id: '4',
      text: "Thanks Majen! I'm excited to get started!",
      sender: 'user',
      timestamp: new Date(Date.now() - 6900000),
    },
  ]);

  // Shared workout completion state
  const [completedWorkouts, setCompletedWorkouts] = useState<CompletedWorkoutData[]>([]);

  // Build a Set of completed workout IDs for efficient lookups
  const completedWorkoutIds = useMemo(() => {
    const ids = new Set<string>();
    // Add initial completed workouts from TrainingView
    const initialCompletedIds = [
      'workout-2025-11-09',
      'workout-2025-11-07',
      'workout-2025-11-05',
      'workout-2025-11-02',
      'workout-2025-10-31',
      'workout-2025-10-29',
      'workout-2025-10-27',
      'workout-2025-10-24',
      'workout-2025-10-22',
      'workout-2025-10-20',
    ];
    initialCompletedIds.forEach(id => ids.add(id));
    // Add workouts completed via chat
    completedWorkouts.forEach(({ workoutId }) => ids.add(workoutId));
    return ids;
  }, [completedWorkouts]);

  // Shared exercise sets state (for Stats view)
  const [allExerciseSets, setAllExerciseSets] = useState<Record<string, ExerciseSet[]>>({});

  // Handler to add exercise set
  const handleAddExerciseSet = (set: ExerciseSet) => {
    console.log('App.tsx handleAddExerciseSet called:', set);
    setAllExerciseSets(prev => ({
      ...prev,
      [set.exerciseName]: [set, ...(prev[set.exerciseName] || [])],
    }));
  };

  // Today's workout (dynamically calculated based on completed workouts)
  const todaysWorkout = useMemo(() => {
    console.log('App.tsx: Recalculating todaysWorkout with completedWorkoutIds:', Array.from(completedWorkoutIds));
    return getTodaysWorkout(completedWorkoutIds);
  }, [completedWorkoutIds]);

  // Handler to add new weight entry
  const handleWeighIn = (data: { weight: number; date: Date; condition: string; notes?: string }) => {
    // Format the date to match the existing format (e.g., "Nov 12")
    const formattedDate = data.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    // Add the new weight entry to history
    const newEntry = { date: formattedDate, weight: data.weight };
    
    // Update weight progress with new entry and current weight
    setWeightProgress(prev => ({
      ...prev,
      current: data.weight,
      history: [...prev.history, newEntry].sort((a, b) => {
        // Sort by date (simple month-day comparison)
        const dateA = new Date(a.date + ', 2024');
        const dateB = new Date(b.date + ', 2024');
        return dateA.getTime() - dateB.getTime();
      })
    }));
  };

  // Handler to complete a workout
  const handleWorkoutComplete = (workoutId: string, completedWorkout: any, progress: any) => {
    console.log('App.tsx handleWorkoutComplete called:', workoutId, completedWorkout, progress);
    setCompletedWorkouts(prev => {
      const updated = [...prev, { workoutId, completedWorkout, progress }];
      console.log('Updated completedWorkouts:', updated);
      return updated;
    });
  };

  // Handler to complete a meal
  const handleMealComplete = (mealId: number, completed: boolean) => {
    console.log('App.tsx handleMealComplete called:', mealId, completed);
    setMeals(prev => prev.map(meal => 
      meal.id === mealId ? { ...meal, completed } : meal
    ));
  };

  return (
    <>
      {/* Desktop Layout - Hidden on mobile */}
      <div className="hidden md:flex h-screen w-screen overflow-hidden bg-background">
        {/* Chat Interface - Always on the left */}
        <motion.div
          animate={{
            width: isStudentCenterOpen ? '20%' : '100%',
          }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="flex-shrink-0 border-r border-sidebar-border shadow-lg bg-sidebar"
        >
          <ChatInterface
            coachName={coachName}
            isStudentCenterOpen={isStudentCenterOpen}
            onToggleStudentCenter={() => setIsStudentCenterOpen(!isStudentCenterOpen)}
            onWeighIn={handleWeighIn}
            messages={messages}
            setMessages={setMessages}
            onWorkoutComplete={handleWorkoutComplete}
            todaysWorkout={todaysWorkout}
            todaysMeals={meals}
            onMealComplete={handleMealComplete}
          />
        </motion.div>

        {/* Student Center - Opens on the right */}
        <AnimatePresence>
          {isStudentCenterOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '80%', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="h-full flex flex-col bg-background">
                {/* Header */}
                <div className="px-8 pt-4 pb-3 bg-background flex items-center justify-between">
                  <div className="flex items-baseline gap-3">
                    <h1 className="text-foreground">Student Center</h1>
                    <p className="text-white">Track your journey to success</p>
                  </div>
                  {/* Back Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      // TODO: Navigate back when connected to full platform
                      console.log('Back button clicked - will navigate back');
                    }}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </div>

                {/* Navigation Tabs */}
                <div className="px-8 pt-4 bg-card border-b border-border">
                  <div className="flex gap-2">
                    {[
                      { id: 'stats' as DesktopTab, label: 'Stats', icon: BarChart3, description: 'Your progress journey' },
                      { id: 'goals' as DesktopTab, label: 'Goals', icon: Target, description: 'Your dreams & targets' },
                      { id: 'training' as DesktopTab, label: 'Training', icon: Dumbbell, description: 'Your workout plan' },
                      { id: 'nutrition' as DesktopTab, label: 'Nutrition', icon: Apple, description: 'Your meal plan' },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isActive = desktopActiveTab === item.id;
                      return (
                        <Button
                          key={item.id}
                          onClick={() => setDesktopActiveTab(item.id)}
                          variant={isActive ? 'default' : 'ghost'}
                          className={`flex-1 h-auto py-3 flex flex-col items-center gap-1.5 ${
                            isActive 
                              ? 'bg-gradient-to-r from-primary/90 to-primary text-primary-foreground shadow-md' 
                              : 'hover:bg-accent'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <div className="flex flex-col items-center">
                            <span className="text-sm">{item.label}</span>
                            {!isActive && (
                              <span className="text-xs opacity-60">{item.description}</span>
                            )}
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Main Content Area */}
                <div className={`flex-1 overflow-auto ${desktopActiveTab === 'training' || desktopActiveTab === 'nutrition' ? '' : 'px-8 py-6'}`} style={desktopActiveTab === 'training' || desktopActiveTab === 'nutrition' ? { background: 'oklch(0.14 0.012 240)' } : {}}>
                  {desktopActiveTab === 'stats' && (
                    <StatsView allExerciseSets={allExerciseSets} weightProgress={weightProgress} onWeighIn={handleWeighIn} />
                  )}
                  {desktopActiveTab === 'goals' && (
                    <GoalsView />
                  )}
                  {desktopActiveTab === 'training' && (
                    <TrainingView onAddExerciseSet={handleAddExerciseSet} completedWorkouts={completedWorkouts} />
                  )}
                  {desktopActiveTab === 'nutrition' && (
                    <NutritionView meals={meals} onMealComplete={handleMealComplete} />
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Layout - Only visible on mobile */}
      <div className="md:hidden flex flex-col h-screen w-screen bg-background">
        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {mobileActiveTab === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <ChatInterface
                  coachName={coachName}
                  isStudentCenterOpen={false}
                  onToggleStudentCenter={() => {}}
                  isMobile={true}
                  onWeighIn={handleWeighIn}
                  messages={messages}
                  setMessages={setMessages}
                  onWorkoutComplete={handleWorkoutComplete}
                  todaysWorkout={todaysWorkout}
                  todaysMeals={meals}
                  onMealComplete={handleMealComplete}
                />
              </motion.div>
            )}
            
            {mobileActiveTab === 'stats' && (
              <motion.div
                key="stats"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="h-full bg-gradient-to-b from-stats-primary/5 to-background"
              >
                <div className="h-full flex flex-col">
                  {/* Section Header */}
                  <div className="bg-stats-primary px-6 py-4 shadow-lg">
                    <div className="flex items-center gap-4">
                      {/* Back Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          // TODO: Navigate back when connected to full platform
                          console.log('Back button clicked - will navigate back');
                        }}
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </Button>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-stats-primary-foreground/20 flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-stats-primary-foreground" />
                        </div>
                        <h1 className="text-stats-primary-foreground">Stats</h1>
                      </div>
                    </div>
                  </div>
                  {/* Content */}
                  <div className="flex-1 overflow-auto">
                    <StatsView allExerciseSets={allExerciseSets} weightProgress={weightProgress} onWeighIn={handleWeighIn} />
                  </div>
                </div>
              </motion.div>
            )}
            
            {mobileActiveTab === 'goals' && (
              <motion.div
                key="goals"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="h-full bg-gradient-to-b from-goals-primary/5 to-background"
              >
                <div className="h-full flex flex-col">
                  {/* Section Header */}
                  <div className="bg-goals-primary px-6 py-4 shadow-lg">
                    <div className="flex items-center gap-4">
                      {/* Back Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          // TODO: Navigate back when connected to full platform
                          console.log('Back button clicked - will navigate back');
                        }}
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </Button>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-goals-primary-foreground/20 flex items-center justify-center">
                          <Target className="w-5 h-5 text-goals-primary-foreground" />
                        </div>
                        <h1 className="text-goals-primary-foreground">Goals</h1>
                      </div>
                    </div>
                  </div>
                  {/* Content */}
                  <div className="flex-1 overflow-auto">
                    <GoalsView />
                  </div>
                </div>
              </motion.div>
            )}
            
            {mobileActiveTab === 'training' && (
              <motion.div
                key="training"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="h-full bg-gradient-to-b from-training-primary/5 to-background"
              >
                <div className="h-full flex flex-col">
                  {/* Section Header */}
                  <div className="bg-training-primary px-6 py-4 shadow-lg">
                    <div className="flex items-center gap-4">
                      {/* Back Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          // TODO: Navigate back when connected to full platform
                          console.log('Back button clicked - will navigate back');
                        }}
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </Button>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-training-primary-foreground/20 flex items-center justify-center">
                          <Dumbbell className="w-5 h-5 text-training-primary-foreground" />
                        </div>
                        <h1 className="text-training-primary-foreground">Training</h1>
                      </div>
                    </div>
                  </div>
                  {/* Content */}
                  <div className="flex-1 overflow-auto" style={{ background: 'oklch(0.14 0.012 240)' }}>
                    <TrainingView onAddExerciseSet={handleAddExerciseSet} completedWorkouts={completedWorkouts} />
                  </div>
                </div>
              </motion.div>
            )}
            
            {mobileActiveTab === 'nutrition' && (
              <motion.div
                key="nutrition"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="h-full bg-gradient-to-b from-nutrition-primary/5 to-background"
              >
                <div className="h-full flex flex-col">
                  {/* Section Header */}
                  <div className="bg-nutrition-primary px-6 py-4 shadow-lg">
                    <div className="flex items-center gap-4">
                      {/* Back Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          // TODO: Navigate back when connected to full platform
                          console.log('Back button clicked - will navigate back');
                        }}
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </Button>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-nutrition-primary-foreground/20 flex items-center justify-center">
                          <Apple className="w-5 h-5 text-nutrition-primary-foreground" />
                        </div>
                        <h1 className="text-nutrition-primary-foreground">Nutrition</h1>
                      </div>
                    </div>
                  </div>
                  {/* Content */}
                  <div className="flex-1 overflow-auto" style={{ background: 'oklch(0.14 0.012 240)' }}>
                    <NutritionView meals={meals} onMealComplete={handleMealComplete} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="border-t border-border bg-card shadow-2xl">
          <div className="flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
            {/* Chat Tab */}
            <button
              onClick={() => setMobileActiveTab('chat')}
              className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-all min-w-[64px] ${
                mobileActiveTab === 'chat'
                  ? 'bg-primary/20 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <MessageCircle className={`w-5 h-5 ${mobileActiveTab === 'chat' ? 'fill-current' : ''}`} />
              <span className="text-[10px]">Chat</span>
            </button>

            {/* Stats Tab */}
            <button
              onClick={() => setMobileActiveTab('stats')}
              className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-all min-w-[64px] ${
                mobileActiveTab === 'stats'
                  ? 'bg-stats-primary/20 text-stats-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <TrendingUp className={`w-5 h-5 ${mobileActiveTab === 'stats' ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[10px]">Stats</span>
            </button>

            {/* Goals Tab */}
            <button
              onClick={() => setMobileActiveTab('goals')}
              className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-all min-w-[64px] ${
                mobileActiveTab === 'goals'
                  ? 'bg-goals-primary/20 text-goals-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <Target className={`w-5 h-5 ${mobileActiveTab === 'goals' ? 'fill-current' : ''}`} />
              <span className="text-[10px]">Goals</span>
            </button>

            {/* Training Tab */}
            <button
              onClick={() => setMobileActiveTab('training')}
              className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-all min-w-[64px] ${
                mobileActiveTab === 'training'
                  ? 'bg-training-primary/20 text-training-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <Dumbbell className={`w-5 h-5 ${mobileActiveTab === 'training' ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[10px]">Training</span>
            </button>

            {/* Nutrition Tab */}
            <button
              onClick={() => setMobileActiveTab('nutrition')}
              className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-all min-w-[64px] ${
                mobileActiveTab === 'nutrition'
                  ? 'bg-nutrition-primary/20 text-nutrition-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <Apple className={`w-5 h-5 ${mobileActiveTab === 'nutrition' ? 'fill-current' : ''}`} />
              <span className="text-[10px]">Nutrition</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}