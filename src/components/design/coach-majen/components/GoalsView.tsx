import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle2, Circle, Target, Star, Plus } from 'lucide-react';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { AddGoalDialog } from './widgets/AddGoalDialog';
import { GoalDetailsDialog } from './widgets/GoalDetailsDialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';

interface Goal {
  id: number;
  title: string;
  description?: string;
  progress: number;
  completed: boolean;
  deadline: string;
  category: string;
  priority: string;
  milestones: Array<{ label: string; achieved: boolean }>;
  keys?: string[];
  actionSteps?: string[];
  whyItMatters?: string;
  rewards?: string;
}

export function GoalsView() {
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: 1,
      title: 'Reach 75kg body weight',
      description: 'Achieve and maintain a healthy body weight of 75kg through consistent nutrition and training.',
      progress: 65,
      completed: false,
      deadline: 'Dec 31, 2025',
      category: 'Weight Loss',
      priority: 'high',
      milestones: [
        { label: '80kg', achieved: true },
        { label: '78kg', achieved: true },
        { label: '75kg', achieved: false },
      ],
      whyItMatters: 'Reaching this weight will put me in the healthy BMI range and help me feel more energetic and confident in my daily life.',
      keys: [
        'Maintain a consistent calorie deficit of 300-500 calories per day',
        'Track all meals and snacks accurately in your nutrition log',
        'Prioritize protein intake (1.6-2g per kg of body weight)',
        'Stay hydrated with at least 2-3 liters of water daily',
        'Get 7-8 hours of quality sleep each night for optimal recovery',
      ],
      actionSteps: [
        'Weigh yourself every morning at the same time and track the trend',
        'Meal prep on Sundays for the upcoming week',
        'Plan treats and cheat meals in advance to stay on track',
        'Adjust calories every 2 weeks based on progress',
        'Celebrate each milestone with a non-food reward',
      ],
      rewards: 'New wardrobe shopping spree and a weekend getaway!',
    },
    {
      id: 2,
      title: 'Run 5km under 27 minutes',
      description: 'Improve cardiovascular endurance and running speed to complete a 5km run in under 27 minutes.',
      progress: 78,
      completed: false,
      deadline: 'Nov 15, 2025',
      category: 'Cardio',
      priority: 'high',
      milestones: [
        { label: '35 min', achieved: true },
        { label: '30 min', achieved: true },
        { label: '27 min', achieved: false },
      ],
      whyItMatters: 'This goal represents a significant improvement in my cardiovascular fitness and will prove to myself that I can achieve athletic goals I once thought impossible.',
      keys: [
        'Run 3-4 times per week with at least one rest day between runs',
        'Include interval training once per week (e.g., 400m repeats)',
        'Do one long slow run per week to build endurance',
        'Incorporate tempo runs at race pace',
        'Warm up properly before each run and cool down after',
      ],
      actionSteps: [
        'Follow a structured 5K training plan',
        'Track pace and heart rate during runs',
        'Work on running form and breathing technique',
        'Strengthen legs with squats, lunges, and calf raises',
        'Schedule a practice time trial every 2 weeks',
      ],
      rewards: 'Sign up for an official 5K race and treat myself to new running shoes!',
    },
    {
      id: 3,
      title: 'Bench press 80kg',
      description: 'Build upper body strength to successfully bench press 80kg for at least one rep with proper form.',
      progress: 75,
      completed: false,
      deadline: 'Dec 15, 2025',
      category: 'Strength',
      priority: 'medium',
      milestones: [
        { label: '60kg', achieved: true },
        { label: '70kg', achieved: true },
        { label: '80kg', achieved: false },
      ],
      whyItMatters: 'This strength milestone will show significant progress in my upper body development and overall strength gains.',
      keys: [
        'Train chest 2x per week with adequate recovery',
        'Focus on progressive overload - add 2.5kg every 2 weeks',
        'Include variation: flat, incline, and decline bench',
        'Strengthen supporting muscles (triceps, shoulders, back)',
        'Practice proper form with controlled eccentric and explosive concentric',
      ],
      actionSteps: [
        'Start each session with proper warm-up sets',
        'Record all working sets to track progress',
        'Use a spotter for safety on heavy attempts',
        'Include accessory work like dumbbell press and push-ups',
        'Eat sufficient protein and calories to support muscle growth',
      ],
      rewards: 'Post a celebratory video and buy a new workout tank!',
    },
    {
      id: 4,
      title: 'Maintain consistent meal prep',
      description: 'Successfully maintain a meal prep routine for 8 consecutive weeks.',
      progress: 100,
      completed: true,
      deadline: 'Completed Oct 20',
      category: 'Nutrition',
      priority: 'high',
      milestones: [
        { label: '2 weeks', achieved: true },
        { label: '4 weeks', achieved: true },
        { label: '8 weeks', achieved: true },
      ],
      whyItMatters: 'Consistent meal prep has been the foundation of my nutrition success and helps me avoid impulsive food choices.',
      keys: [
        'Dedicate 2-3 hours every Sunday for meal preparation',
        'Plan meals for the entire week in advance',
        'Prep proteins, carbs, and vegetables in bulk',
        'Use proper storage containers to keep food fresh',
        'Prepare healthy snacks to avoid temptation',
      ],
      actionSteps: [
        'Create a shopping list based on weekly meal plan',
        'Batch cook proteins (chicken, fish, lean beef)',
        'Prepare complex carbs (rice, sweet potatoes, quinoa)',
        'Chop and portion vegetables',
        'Store meals in refrigerator and freezer as needed',
      ],
      rewards: 'Upgraded to premium meal prep containers - mission accomplished!',
    },
    {
      id: 5,
      title: 'Master proper form on all exercises',
      description: 'Develop perfect form on all compound and accessory exercises to maximize results and prevent injury.',
      progress: 85,
      completed: false,
      deadline: 'Nov 30, 2025',
      category: 'Technique',
      priority: 'medium',
      milestones: [
        { label: 'Basic lifts', achieved: true },
        { label: 'Compound lifts', achieved: true },
        { label: 'Advanced movements', achieved: false },
      ],
      whyItMatters: 'Proper form is essential for long-term progress, injury prevention, and getting maximum benefit from every workout.',
      keys: [
        'Record yourself performing exercises to check form',
        'Study technique videos from reputable coaches',
        'Start with lighter weights to perfect movement patterns',
        'Focus on mind-muscle connection',
        'Get feedback from experienced lifters or trainers',
      ],
      actionSteps: [
        'Practice each movement pattern 2-3 times per week',
        'Film working sets to review technique',
        'Address mobility limitations with targeted stretching',
        'Master breathing technique for each lift',
        'Progress to advanced movements only when basics are solid',
      ],
      rewards: 'Book a session with a professional strength coach for advanced technique tips!',
    },
    {
      id: 6,
      title: 'Build visible abs',
      description: 'Develop defined abdominal muscles that are visible without flexing.',
      progress: 45,
      completed: false,
      deadline: 'Feb 28, 2026',
      category: 'Physique',
      priority: 'medium',
      milestones: [
        { label: 'Reduce body fat', achieved: true },
        { label: 'Build core strength', achieved: false },
        { label: 'Definition visible', achieved: false },
      ],
      whyItMatters: 'This represents the culmination of all my efforts in nutrition, training, and consistency - a visible transformation.',
      keys: [
        'Get body fat down to 10-12% through consistent calorie deficit',
        'Train abs 3-4 times per week with progressive overload',
        'Include a variety of ab exercises (planks, crunches, leg raises)',
        'Maintain high protein intake to preserve muscle while cutting',
        'Be patient - abs are built in the kitchen and revealed through training',
      ],
      actionSteps: [
        'Track body fat percentage monthly',
        'Perform dedicated core workouts 3x per week',
        'Include compound movements that engage core',
        'Reduce sodium intake to minimize water retention',
        'Take progress photos every 2 weeks in same lighting',
      ],
      rewards: 'Professional photoshoot to capture the transformation!',
    },
  ]);

  const mainGoal = {
    title: 'Transform Your Body & Mind',
    description: 'Achieve your dream physique while building lasting healthy habits',
    deadline: 'March 2026',
    progress: 42,
  };

  const priorityColors = {
    high: 'bg-goals-accent/10 text-goals-accent border-0',
    medium: 'bg-goals-secondary/10 text-goals-secondary border-0',
    low: 'bg-goals-primary/10 text-goals-primary border-0',
  };

  const handleAddGoal = (newGoalData: any) => {
    const newGoal: Goal = {
      id: Date.now(),
      title: newGoalData.title,
      progress: 0,
      completed: false,
      deadline: new Date(newGoalData.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      category: newGoalData.category,
      priority: newGoalData.priority,
      milestones: [],
    };
    setGoals([...goals, newGoal]);
  };

  return (
    <div className="space-y-6 max-w-6xl p-4 md:p-6 min-h-full" style={{ background: 'oklch(0.14 0.012 240)' }}>
      {/* Main Goal Hero */}
      <Card className="p-4 md:p-8 bg-gradient-to-br from-goals-primary via-goals-primary to-goals-secondary text-white border-0 shadow-lg overflow-hidden relative">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
            <div className="p-3 md:p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
              <Target className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </div>
            <div className="flex-1 w-full">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 md:h-5 md:w-5 text-goals-secondary fill-goals-secondary" />
                <span className="text-xs md:text-sm text-white">Your Main Goal</span>
              </div>
              <h2 className="text-white mb-2">{mainGoal.title}</h2>
              <p className="text-xs md:text-sm text-white mb-4 md:mb-6">{mainGoal.description}</p>
              
              {/* Progress section */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 mb-3 md:mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs md:text-sm text-white">Overall Progress</span>
                  <span className="text-white">{mainGoal.progress}%</span>
                </div>
                <div className="h-2.5 md:h-3 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-goals-secondary via-goals-secondary to-goals-accent transition-all shadow-lg"
                    style={{ width: `${mainGoal.progress}%` }}
                  />
                </div>
              </div>

              {/* Footer info */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-goals-secondary animate-pulse" />
                  <p className="text-xs md:text-sm text-white">Target: {mainGoal.deadline}</p>
                </div>
                <div className="text-xs md:text-sm text-white/90 bg-white/10 px-3 py-1 rounded-full w-fit">
                  {goals.filter(g => !g.completed).length} active goals
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Individual Goals */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-foreground mb-1">Your Goals</h3>
            <p className="text-muted-foreground">Breaking down your journey into achievable milestones</p>
          </div>
          <Button onClick={() => setIsAddGoalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Goal
          </Button>
        </div>

        <Accordion type="multiple" defaultValue={["active-goals"]} className="space-y-4">
          {/* Active Goals */}
          <AccordionItem value="active-goals" className="border-none">
            <AccordionTrigger className="bg-goals-primary/5 hover:bg-goals-primary/10 px-4 md:px-6 py-4 rounded-xl border-0 hover:no-underline">
              <div className="flex items-center gap-3">
                <Circle className="h-5 w-5 text-goals-primary" />
                <div className="text-left">
                  <span className="text-foreground">Active Goals</span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {goals.filter(g => !g.completed).length} goals in progress
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {goals.filter(g => !g.completed).map((goal) => (
                  <Card 
                    key={goal.id} 
                    className="p-4 md:p-5 transition-all hover:shadow-md bg-gradient-to-br from-goals-primary/20 via-goals-primary/10 to-goals-secondary/20 backdrop-blur-sm border border-goals-primary/30"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Circle className="h-6 w-6 text-white flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-foreground mb-2">
                            {goal.title}
                          </h4>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {goal.category}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`text-xs border ${priorityColors[goal.priority as keyof typeof priorityColors]}`}
                            >
                              {goal.priority} priority
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Milestones */}
                      {goal.milestones.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs text-white">Milestones</p>
                          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
                            {goal.milestones.map((milestone, idx) => (
                              <div key={idx} className="flex-1">
                                <div className={`text-center p-2 rounded-lg text-xs ${
                                  milestone.achieved 
                                    ? 'bg-goals-secondary/10 text-goals-secondary border-0' 
                                    : 'bg-muted text-white border-0'
                                }`}>
                                  {milestone.achieved && <CheckCircle2 className="h-3 w-3 inline mr-1" />}
                                  {milestone.label}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <div className="flex justify-between text-xs text-white mb-2">
                          <span>Progress</span>
                          <span>{goal.progress}%</span>
                        </div>
                        <Progress value={goal.progress} className="h-2" />
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2">
                        <span className="text-white">Target date</span>
                        <span className="text-foreground">
                          {goal.deadline}
                        </span>
                      </div>

                      {/* See Info Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedGoal(goal)}
                        className="w-full mt-2"
                      >
                        See Info
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Completed Goals */}
          {goals.filter(g => g.completed).length > 0 && (
            <AccordionItem value="completed-goals" className="border-none">
              <AccordionTrigger className="bg-goals-secondary/5 hover:bg-goals-secondary/10 px-4 md:px-6 py-4 rounded-xl border-0 hover:no-underline">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-goals-secondary" />
                  <div className="text-left">
                    <span className="text-foreground">Completed Goals</span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {goals.filter(g => g.completed).length} goals achieved 🎉
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {goals.filter(g => g.completed).map((goal) => (
                    <Card 
                      key={goal.id} 
                      className="p-4 md:p-5 transition-all hover:shadow-md bg-goals-primary/5 border-0"
                    >
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-6 w-6 text-goals-primary flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-foreground mb-2 line-through opacity-75">
                              {goal.title}
                            </h4>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                {goal.category}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className={`text-xs border ${priorityColors[goal.priority as keyof typeof priorityColors]}`}
                              >
                                {goal.priority} priority
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Milestones */}
                        {goal.milestones.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs text-white">Milestones</p>
                            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
                              {goal.milestones.map((milestone, idx) => (
                                <div key={idx} className="flex-1">
                                  <div className="text-center p-2 rounded-lg text-xs bg-goals-secondary/10 text-goals-secondary border-0">
                                    <CheckCircle2 className="h-3 w-3 inline mr-1" />
                                    {milestone.label}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs pt-2">
                          <span className="text-white">Completed</span>
                          <span className="text-goals-primary">
                            {goal.deadline}
                          </span>
                        </div>

                        {/* See Info Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedGoal(goal)}
                          className="w-full mt-2"
                        >
                          See Info
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </div>

      <AddGoalDialog 
        open={isAddGoalOpen}
        onOpenChange={setIsAddGoalOpen}
        onAddGoal={handleAddGoal}
      />

      <GoalDetailsDialog 
        open={selectedGoal !== null}
        onOpenChange={(open) => !open && setSelectedGoal(null)}
        goal={selectedGoal}
      />
    </div>
  );
}