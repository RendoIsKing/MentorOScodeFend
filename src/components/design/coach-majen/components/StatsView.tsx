import { useState } from 'react';
import { TrendingDown, Activity, Flame, Trophy } from 'lucide-react';
import { ActivityStatsWidget } from './widgets/ActivityStatsWidget';
import { PersonalInfoWidget } from './widgets/PersonalInfoWidget';
import { WeightProgressWidget } from './widgets/WeightProgressWidget';
import { EnergyLevelWidget } from './widgets/EnergyLevelWidget';
import { ExerciseProgressWidget } from './widgets/ExerciseProgressWidget';
import { DisciplineStatsWidget } from './widgets/DisciplineStatsWidget';
import { FavoriteMealsWidget } from './widgets/FavoriteMealsWidget';
import { ExerciseSet } from './widgets/ExerciseSetsHistoryDialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import type { WeightProgress } from '../types';

interface StatsViewProps {
  allExerciseSets?: Record<string, ExerciseSet[]>;
  weightProgress: WeightProgress;
  onWeighIn: (data: { weight: number; date: Date; condition: string; notes?: string }) => void;
}

export function StatsView({ allExerciseSets, weightProgress, onWeighIn }: StatsViewProps) {
  const [allExercises, setAllExercises] = useState([
    // Favorites
    { name: 'Bench Press', start: 60, current: 75, unit: 'kg', improvement: 25, isFavorite: true, category: 'Upper Body' },
    { name: 'Squats', start: 80, current: 105, unit: 'kg', improvement: 31, isFavorite: true, category: 'Lower Body' },
    { name: 'Deadlifts', start: 90, current: 120, unit: 'kg', improvement: 33, isFavorite: true, category: 'Full Body' },
    { name: '5K Run', start: 35, current: 27, unit: 'min', improvement: -23, reverse: true, isFavorite: true, category: 'Cardio' },
    
    // Upper Body
    { name: 'Overhead Press', start: 40, current: 52, unit: 'kg', improvement: 30, category: 'Upper Body' },
    { name: 'Incline Bench', start: 50, current: 65, unit: 'kg', improvement: 30, category: 'Upper Body' },
    { name: 'Barbell Row', start: 55, current: 72, unit: 'kg', improvement: 31, category: 'Upper Body' },
    { name: 'Pull-ups', start: 5, current: 12, unit: 'reps', improvement: 140, category: 'Upper Body' },
    { name: 'Dips', start: 8, current: 15, unit: 'reps', improvement: 88, category: 'Upper Body' },
    
    // Lower Body
    { name: 'Front Squat', start: 60, current: 80, unit: 'kg', improvement: 33, category: 'Lower Body' },
    { name: 'Leg Press', start: 120, current: 180, unit: 'kg', improvement: 50, category: 'Lower Body' },
    { name: 'Romanian Deadlift', start: 70, current: 95, unit: 'kg', improvement: 36, category: 'Lower Body' },
    { name: 'Lunges', start: 30, current: 45, unit: 'kg', improvement: 50, category: 'Lower Body' },
    
    // Full Body
    { name: 'Clean & Jerk', start: 50, current: 68, unit: 'kg', improvement: 36, category: 'Full Body' },
    { name: 'Snatch', start: 40, current: 55, unit: 'kg', improvement: 38, category: 'Full Body' },
    
    // Cardio
    { name: '10K Run', start: 75, current: 58, unit: 'min', improvement: -23, reverse: true, category: 'Cardio' },
    { name: 'Rowing 2K', start: 9.5, current: 8.2, unit: 'min', improvement: -14, reverse: true, category: 'Cardio' },
    { name: 'Cycling 20K', start: 42, current: 35, unit: 'min', improvement: -17, reverse: true, category: 'Cardio' },
    
    // Core
    { name: 'Plank Hold', start: 60, current: 120, unit: 'sec', improvement: 100, category: 'Core' },
    { name: 'Hanging Leg Raises', start: 8, current: 15, unit: 'reps', improvement: 88, category: 'Core' },
  ]);

  // Filter to get only favorite exercises
  const exerciseProgress = allExercises.filter(ex => ex.isFavorite);

  // Handler to toggle favorite status
  const handleToggleFavorite = (exerciseName: string) => {
    setAllExercises(prevExercises => 
      prevExercises.map(exercise => 
        exercise.name === exerciseName 
          ? { ...exercise, isFavorite: !exercise.isFavorite }
          : exercise
      )
    );
  };

  const [allMeals, setAllMeals] = useState([
    // Favorites
    { 
      name: 'Power Breakfast Bowl', 
      calories: 420, 
      protein: 25, 
      carbs: 65, 
      fats: 12, 
      isFavorite: true, 
      category: 'Breakfast', 
      targetProtein: 30,
      recipe: {
        prepTime: '15 min',
        difficulty: 'Easy',
        ingredients: [
          '1 cup rolled oats',
          '2 eggs',
          '1/2 cup Greek yogurt',
          '1 banana, sliced',
          '1/4 cup blueberries',
          '1 tbsp honey',
          '1 tbsp almond butter',
          '1/4 cup granola',
          'Pinch of cinnamon'
        ],
        instructions: [
          'Cook oats according to package instructions with water or milk.',
          'While oats are cooking, scramble the eggs in a non-stick pan over medium heat.',
          'Transfer cooked oats to a bowl and let cool slightly.',
          'Top oats with Greek yogurt, scrambled eggs, sliced banana, and blueberries.',
          'Drizzle with honey and almond butter.',
          'Sprinkle with granola and cinnamon.',
          'Serve immediately and enjoy your protein-packed breakfast!'
        ]
      }
    },
    { 
      name: 'Grilled Chicken Salad', 
      calories: 580, 
      protein: 45, 
      carbs: 72, 
      fats: 15, 
      isFavorite: true, 
      category: 'Lunch', 
      targetProtein: 40,
      recipe: {
        prepTime: '20 min',
        difficulty: 'Easy',
        ingredients: [
          '200g chicken breast',
          '4 cups mixed greens (spinach, romaine, arugula)',
          '1 cup cherry tomatoes, halved',
          '1 cucumber, sliced',
          '1/2 red onion, thinly sliced',
          '1/4 cup feta cheese, crumbled',
          '2 tbsp olive oil',
          '1 tbsp balsamic vinegar',
          'Salt and pepper to taste',
          '1/2 avocado, sliced'
        ],
        instructions: [
          'Season chicken breast with salt, pepper, and a drizzle of olive oil.',
          'Heat a grill pan over medium-high heat and cook chicken for 6-7 minutes per side until fully cooked.',
          'While chicken is cooking, prepare the salad by combining mixed greens, cherry tomatoes, cucumber, and red onion in a large bowl.',
          'Whisk together olive oil, balsamic vinegar, salt, and pepper to make the dressing.',
          'Let the chicken rest for 5 minutes, then slice into strips.',
          'Add sliced chicken and avocado to the salad.',
          'Drizzle with dressing, sprinkle with feta cheese, and toss gently to combine.',
          'Serve immediately for a fresh, protein-rich meal.'
        ]
      }
    },
    { 
      name: 'Salmon & Quinoa Dinner', 
      calories: 620, 
      protein: 48, 
      carbs: 65, 
      fats: 20, 
      isFavorite: true, 
      category: 'Dinner', 
      targetProtein: 50,
      recipe: {
        prepTime: '30 min',
        difficulty: 'Medium',
        ingredients: [
          '180g salmon fillet',
          '1 cup quinoa',
          '2 cups vegetable broth',
          '2 cups broccoli florets',
          '1 cup asparagus, trimmed',
          '2 cloves garlic, minced',
          '2 tbsp lemon juice',
          '1 tbsp olive oil',
          'Fresh dill',
          'Salt and pepper to taste'
        ],
        instructions: [
          'Rinse quinoa thoroughly and cook in vegetable broth according to package directions (about 15 minutes).',
          'Preheat oven to 400°F (200°C) and line a baking sheet with parchment paper.',
          'Season salmon with salt, pepper, minced garlic, and drizzle with olive oil and lemon juice.',
          'Place salmon on the baking sheet and bake for 12-15 minutes until cooked through.',
          'Meanwhile, steam broccoli and asparagus for 5-7 minutes until tender-crisp.',
          'Fluff cooked quinoa with a fork and season with salt and pepper.',
          'Plate quinoa as a base, add steamed vegetables on the side.',
          'Top with baked salmon, garnish with fresh dill and extra lemon juice if desired.',
          'Serve hot and enjoy this omega-3 rich, balanced meal!'
        ]
      }
    },
    { 
      name: 'Protein Power Shake', 
      calories: 380, 
      protein: 35, 
      carbs: 48, 
      fats: 10, 
      isFavorite: true, 
      category: 'Snacks', 
      targetProtein: 35,
      recipe: {
        prepTime: '5 min',
        difficulty: 'Easy',
        ingredients: [
          '1 scoop vanilla protein powder',
          '1 cup unsweetened almond milk',
          '1 banana',
          '1 cup frozen berries',
          '1 tbsp almond butter',
          '1 tbsp chia seeds',
          '1/2 cup spinach (optional)',
          '1/2 cup ice cubes',
          '1 tsp honey (optional)'
        ],
        instructions: [
          'Add almond milk to your blender first.',
          'Add protein powder, banana, and frozen berries.',
          'Add almond butter and chia seeds for healthy fats and omega-3s.',
          'Optionally add spinach for extra nutrients (you won\'t taste it!).',
          'Add ice cubes for a thicker, colder shake.',
          'Blend on high speed for 30-45 seconds until smooth and creamy.',
          'Taste and add honey if you prefer it sweeter.',
          'Pour into a glass and enjoy immediately post-workout or as a meal replacement!'
        ]
      }
    },
    
    // Breakfast
    { 
      name: 'Protein Pancakes', 
      calories: 450, 
      protein: 30, 
      carbs: 68, 
      fats: 12, 
      category: 'Breakfast', 
      targetProtein: 30,
      recipe: {
        prepTime: '20 min',
        difficulty: 'Easy',
        ingredients: [
          '1 cup oat flour',
          '1 scoop vanilla protein powder',
          '2 eggs',
          '1/2 cup Greek yogurt',
          '1/2 cup milk',
          '1 tsp baking powder',
          '1 tsp vanilla extract',
          '1 banana, mashed',
          'Cooking spray',
          'Maple syrup for serving'
        ],
        instructions: [
          'In a large bowl, mix oat flour, protein powder, and baking powder.',
          'In another bowl, whisk together eggs, Greek yogurt, milk, mashed banana, and vanilla extract.',
          'Pour wet ingredients into dry ingredients and mix until just combined.',
          'Heat a non-stick pan over medium heat and spray with cooking spray.',
          'Pour 1/4 cup of batter for each pancake onto the pan.',
          'Cook for 2-3 minutes until bubbles form on the surface, then flip.',
          'Cook for another 2 minutes until golden brown.',
          'Serve hot with maple syrup and fresh berries.'
        ]
      }
    },
    { 
      name: 'Scrambled Eggs & Toast', 
      calories: 480, 
      protein: 28, 
      carbs: 42, 
      fats: 22, 
      category: 'Breakfast', 
      targetProtein: 30,
      recipe: {
        prepTime: '10 min',
        difficulty: 'Easy',
        ingredients: [
          '3 large eggs',
          '2 slices whole grain bread',
          '2 tbsp milk',
          '1 tbsp butter',
          '1/4 cup shredded cheese',
          '2 slices tomato',
          'Fresh spinach leaves',
          'Salt and pepper to taste',
          'Chives for garnish'
        ],
        instructions: [
          'Crack eggs into a bowl and whisk with milk, salt, and pepper.',
          'Heat butter in a non-stick pan over medium-low heat.',
          'Pour in the egg mixture and let it sit for 20 seconds.',
          'Gently stir with a spatula, creating soft curds.',
          'When eggs are almost set, add shredded cheese and fold in.',
          'Meanwhile, toast the bread until golden brown.',
          'Remove eggs from heat while still slightly creamy.',
          'Serve eggs on toast, topped with spinach, tomato slices, and chives.'
        ]
      }
    },
    { 
      name: 'Oatmeal Bowl', 
      calories: 410, 
      protein: 28, 
      carbs: 62, 
      fats: 10, 
      category: 'Breakfast', 
      targetProtein: 30,
      recipe: {
        prepTime: '12 min',
        difficulty: 'Easy',
        ingredients: [
          '1 cup rolled oats',
          '2 cups milk',
          '1 scoop vanilla protein powder',
          '1 tbsp chia seeds',
          '1 apple, diced',
          '1 tbsp almond butter',
          '1 tsp cinnamon',
          '1 tbsp honey',
          'Handful of walnuts'
        ],
        instructions: [
          'In a pot, bring milk to a gentle simmer over medium heat.',
          'Add oats and cook, stirring occasionally, for 5 minutes.',
          'Stir in chia seeds and cinnamon.',
          'Remove from heat and let cool for 2 minutes.',
          'Stir in protein powder until well combined.',
          'Transfer to a bowl and top with diced apple.',
          'Drizzle with almond butter and honey.',
          'Sprinkle with walnuts and extra cinnamon. Enjoy warm!'
        ]
      }
    },
    { 
      name: 'Breakfast Burrito', 
      calories: 520, 
      protein: 32, 
      carbs: 58, 
      fats: 18, 
      category: 'Breakfast', 
      targetProtein: 30,
      recipe: {
        prepTime: '18 min',
        difficulty: 'Medium',
        ingredients: [
          '1 large whole wheat tortilla',
          '3 eggs',
          '1/4 cup black beans, drained',
          '1/4 cup shredded cheese',
          '1/4 cup salsa',
          '1/4 avocado, sliced',
          '2 tbsp Greek yogurt',
          '1/4 cup bell peppers, diced',
          '1/4 cup onions, diced',
          'Hot sauce (optional)'
        ],
        instructions: [
          'Heat a pan over medium heat and sauté bell peppers and onions until soft.',
          'Scramble eggs in the same pan with the vegetables.',
          'Warm black beans in a small pot.',
          'Heat the tortilla in a dry pan for 30 seconds on each side.',
          'Place tortilla on a flat surface and layer ingredients in the center.',
          'Start with scrambled eggs and vegetables, then add beans and cheese.',
          'Top with salsa, avocado, and Greek yogurt.',
          'Fold in the sides and roll tightly. Cut in half and serve with hot sauce!'
        ]
      }
    },
    
    // Lunch
    { 
      name: 'Turkey Wrap', 
      calories: 520, 
      protein: 42, 
      carbs: 65, 
      fats: 14, 
      category: 'Lunch', 
      targetProtein: 40,
      recipe: {
        prepTime: '12 min',
        difficulty: 'Easy',
        ingredients: [
          '1 large whole wheat tortilla',
          '150g sliced turkey breast',
          '2 tbsp hummus',
          '1/2 cup mixed greens',
          '1/4 cup shredded carrots',
          '1/4 cucumber, sliced',
          '3 slices tomato',
          '1/4 red onion, sliced',
          '1 tbsp mustard',
          'Salt and pepper to taste'
        ],
        instructions: [
          'Lay the tortilla flat on a clean surface.',
          'Spread hummus evenly over the entire tortilla.',
          'Layer turkey slices in the center of the tortilla.',
          'Add mixed greens, carrots, cucumber, tomato, and onion.',
          'Drizzle with mustard and season with salt and pepper.',
          'Fold in the sides of the tortilla.',
          'Roll tightly from bottom to top.',
          'Cut diagonally in half and serve immediately or wrap for later!'
        ]
      }
    },
    { 
      name: 'Chicken Caesar Salad', 
      calories: 540, 
      protein: 44, 
      carbs: 38, 
      fats: 24, 
      category: 'Lunch', 
      targetProtein: 40,
      recipe: {
        prepTime: '20 min',
        difficulty: 'Easy',
        ingredients: [
          '180g chicken breast',
          '4 cups romaine lettuce, chopped',
          '1/4 cup Caesar dressing',
          '1/4 cup parmesan cheese, shaved',
          '1 cup whole grain croutons',
          '1 lemon wedge',
          '1 tsp olive oil',
          'Black pepper to taste',
          'Garlic powder'
        ],
        instructions: [
          'Season chicken breast with garlic powder, salt, and pepper.',
          'Heat olive oil in a pan over medium-high heat.',
          'Cook chicken for 6-7 minutes per side until fully cooked and golden.',
          'Let chicken rest for 5 minutes, then slice into strips.',
          'In a large bowl, toss romaine lettuce with Caesar dressing.',
          'Add croutons and toss gently.',
          'Top with sliced chicken and shaved parmesan.',
          'Finish with a squeeze of lemon and fresh black pepper. Serve immediately!'
        ]
      }
    },
    { 
      name: 'Tuna Salad Bowl', 
      calories: 420, 
      protein: 38, 
      carbs: 22, 
      fats: 20, 
      category: 'Lunch', 
      targetProtein: 40,
      recipe: {
        prepTime: '10 min',
        difficulty: 'Easy',
        ingredients: [
          '1 can (150g) tuna in water, drained',
          '2 tbsp Greek yogurt',
          '1 tbsp mayonnaise',
          '3 cups mixed greens',
          '1/2 cup cherry tomatoes, halved',
          '1/4 cucumber, diced',
          '1/4 red onion, finely chopped',
          '1 celery stalk, chopped',
          '1 hard-boiled egg, sliced',
          'Lemon juice, salt, and pepper'
        ],
        instructions: [
          'In a bowl, mix drained tuna with Greek yogurt and mayonnaise.',
          'Add chopped celery and red onion to the tuna mixture.',
          'Season with lemon juice, salt, and pepper, and mix well.',
          'Arrange mixed greens in a serving bowl.',
          'Add cherry tomatoes and cucumber around the greens.',
          'Place tuna mixture in the center of the bowl.',
          'Top with sliced hard-boiled egg.',
          'Drizzle with extra lemon juice if desired and serve fresh!'
        ]
      }
    },
    { 
      name: 'Sushi Bowl', 
      calories: 620, 
      protein: 38, 
      carbs: 78, 
      fats: 18, 
      category: 'Lunch', 
      targetProtein: 40,
      recipe: {
        prepTime: '25 min',
        difficulty: 'Medium',
        ingredients: [
          '1 cup sushi rice',
          '200g fresh salmon or tuna, cubed',
          '1/4 avocado, sliced',
          '1/4 cucumber, julienned',
          '2 tbsp edamame',
          '1 tbsp sesame seeds',
          '2 tbsp soy sauce',
          '1 tsp rice vinegar',
          '1 tsp sriracha mayo',
          'Pickled ginger and nori strips'
        ],
        instructions: [
          'Cook sushi rice according to package instructions.',
          'Season cooked rice with rice vinegar and let cool slightly.',
          'Cube fresh salmon or tuna into bite-sized pieces.',
          'Place rice in a bowl as the base.',
          'Arrange fish, avocado, cucumber, and edamame on top of rice.',
          'Drizzle with soy sauce and sriracha mayo.',
          'Sprinkle with sesame seeds.',
          'Garnish with pickled ginger and nori strips. Mix and enjoy!'
        ]
      }
    },
    
    // Dinner
    { 
      name: 'Beef Stir Fry', 
      calories: 680, 
      protein: 52, 
      carbs: 78, 
      fats: 18, 
      category: 'Dinner', 
      targetProtein: 50,
      recipe: {
        prepTime: '25 min',
        difficulty: 'Medium',
        ingredients: [
          '200g beef sirloin, thinly sliced',
          '1.5 cups cooked jasmine rice',
          '1 cup broccoli florets',
          '1 bell pepper, sliced',
          '1/2 onion, sliced',
          '2 cloves garlic, minced',
          '3 tbsp soy sauce',
          '1 tbsp oyster sauce',
          '2 tsp sesame oil',
          '1 tsp cornstarch'
        ],
        instructions: [
          'Marinate beef slices in soy sauce and cornstarch for 10 minutes.',
          'Cook jasmine rice according to package instructions.',
          'Heat sesame oil in a wok or large pan over high heat.',
          'Add beef and stir-fry for 2-3 minutes until browned. Remove and set aside.',
          'In the same pan, add garlic, onion, and bell pepper. Stir-fry for 2 minutes.',
          'Add broccoli and cook for another 3 minutes.',
          'Return beef to the pan and add oyster sauce.',
          'Toss everything together for 1-2 minutes. Serve hot over rice!'
        ]
      }
    },
    { 
      name: 'Steak & Potatoes', 
      calories: 710, 
      protein: 56, 
      carbs: 68, 
      fats: 22, 
      category: 'Dinner', 
      targetProtein: 50,
      recipe: {
        prepTime: '35 min',
        difficulty: 'Medium',
        ingredients: [
          '200g ribeye or sirloin steak',
          '300g baby potatoes, halved',
          '2 cups green beans',
          '2 tbsp olive oil',
          '3 cloves garlic, minced',
          '2 tbsp butter',
          'Fresh rosemary',
          'Salt and pepper to taste',
          'Steak seasoning'
        ],
        instructions: [
          'Preheat oven to 425°F (220°C).',
          'Toss halved potatoes with olive oil, garlic, rosemary, salt, and pepper.',
          'Roast potatoes for 25-30 minutes until golden and crispy.',
          'Season steak generously with steak seasoning, salt, and pepper.',
          'Heat a cast-iron skillet over high heat until smoking.',
          'Sear steak for 3-4 minutes per side for medium-rare.',
          'Add butter and let it melt over the steak. Remove and rest for 5 minutes.',
          'Steam green beans for 5 minutes. Slice steak and serve with potatoes and beans!'
        ]
      }
    },
    { 
      name: 'Chicken Pasta', 
      calories: 620, 
      protein: 45, 
      carbs: 82, 
      fats: 15, 
      category: 'Dinner', 
      targetProtein: 50,
      recipe: {
        prepTime: '25 min',
        difficulty: 'Medium',
        ingredients: [
          '150g chicken breast, cubed',
          '200g whole wheat pasta',
          '1 cup cherry tomatoes, halved',
          '2 cups fresh spinach',
          '3 cloves garlic, minced',
          '1/4 cup parmesan cheese',
          '2 tbsp olive oil',
          '1/4 cup pasta water',
          'Fresh basil',
          'Salt, pepper, and red pepper flakes'
        ],
        instructions: [
          'Cook pasta according to package directions. Reserve 1/4 cup pasta water before draining.',
          'Season chicken cubes with salt, pepper, and red pepper flakes.',
          'Heat olive oil in a large pan and cook chicken until golden, about 6-7 minutes.',
          'Add minced garlic and cook for 30 seconds until fragrant.',
          'Add cherry tomatoes and cook until they start to burst, about 3 minutes.',
          'Add cooked pasta, spinach, and reserved pasta water to the pan.',
          'Toss everything together until spinach wilts.',
          'Top with parmesan cheese and fresh basil. Serve hot!'
        ]
      }
    },
    { 
      name: 'Turkey Meatballs', 
      calories: 560, 
      protein: 48, 
      carbs: 42, 
      fats: 20, 
      category: 'Dinner', 
      targetProtein: 50,
      recipe: {
        prepTime: '30 min',
        difficulty: 'Medium',
        ingredients: [
          '400g ground turkey',
          '1/4 cup breadcrumbs',
          '1 egg',
          '2 cloves garlic, minced',
          '1/4 cup parmesan cheese',
          '2 cups marinara sauce',
          '200g whole wheat spaghetti',
          'Fresh parsley',
          'Italian seasoning',
          'Salt and pepper to taste'
        ],
        instructions: [
          'Preheat oven to 400°F (200°C) and line a baking sheet with parchment.',
          'In a bowl, mix ground turkey, breadcrumbs, egg, garlic, parmesan, Italian seasoning, salt, and pepper.',
          'Form mixture into 12-15 meatballs and place on the baking sheet.',
          'Bake for 20-22 minutes until cooked through and golden.',
          'Meanwhile, cook spaghetti according to package directions.',
          'Heat marinara sauce in a large pan.',
          'Add cooked meatballs to the sauce and simmer for 5 minutes.',
          'Serve meatballs and sauce over spaghetti, garnished with parsley and parmesan!'
        ]
      }
    },
    
    // Snacks
    { 
      name: 'Greek Yogurt & Granola', 
      calories: 320, 
      protein: 24, 
      carbs: 48, 
      fats: 8, 
      category: 'Snacks', 
      targetProtein: 20,
      recipe: {
        prepTime: '5 min',
        difficulty: 'Easy',
        ingredients: [
          '1 cup Greek yogurt',
          '1/2 cup granola',
          '1/2 cup mixed berries',
          '1 tbsp honey',
          '1 tbsp sliced almonds',
          '1 tsp chia seeds',
          'Fresh mint leaves'
        ],
        instructions: [
          'Spoon Greek yogurt into a serving bowl.',
          'Top with granola and mixed berries.',
          'Drizzle honey over the top.',
          'Sprinkle with sliced almonds and chia seeds.',
          'Garnish with fresh mint leaves.',
          'Mix together and enjoy as a protein-rich snack!'
        ]
      }
    },
    { 
      name: 'Protein Bar & Apple', 
      calories: 280, 
      protein: 20, 
      carbs: 35, 
      fats: 8, 
      category: 'Snacks', 
      targetProtein: 20,
      recipe: {
        prepTime: '2 min',
        difficulty: 'Easy',
        ingredients: [
          '1 protein bar (20g protein)',
          '1 medium apple',
          '1 tbsp almond butter (optional)',
          'Pinch of cinnamon (optional)'
        ],
        instructions: [
          'Choose your favorite protein bar with at least 20g of protein.',
          'Wash and slice the apple into wedges.',
          'Optional: spread almond butter on apple slices for extra healthy fats.',
          'Optional: sprinkle cinnamon on apple slices for added flavor.',
          'Pair the protein bar with apple slices for a balanced snack.',
          'Perfect for post-workout or afternoon energy boost!'
        ]
      }
    },
    { 
      name: 'Rice Cakes & Peanut Butter', 
      calories: 240, 
      protein: 12, 
      carbs: 32, 
      fats: 10, 
      category: 'Snacks', 
      targetProtein: 15,
      recipe: {
        prepTime: '5 min',
        difficulty: 'Easy',
        ingredients: [
          '2 rice cakes',
          '2 tbsp natural peanut butter',
          '1 banana, sliced',
          '1 tsp honey',
          '1 tsp chia seeds',
          'Pinch of sea salt'
        ],
        instructions: [
          'Place rice cakes on a plate.',
          'Spread 1 tablespoon of peanut butter on each rice cake.',
          'Arrange banana slices on top of the peanut butter.',
          'Drizzle with honey.',
          'Sprinkle with chia seeds and a tiny pinch of sea salt.',
          'Enjoy immediately as a quick, energizing snack!'
        ]
      }
    },
  ]);

  // Filter to get only favorite meals
  const favoriteMeals = allMeals.filter(meal => meal.isFavorite);

  // Handler to toggle favorite meal status
  const handleToggleFavoriteMeal = (mealName: string) => {
    setAllMeals(prevMeals => 
      prevMeals.map(meal => 
        meal.name === mealName 
          ? { ...meal, isFavorite: !meal.isFavorite }
          : meal
      )
    );
  };

  const stats = [
    { 
      label: 'Weight Loss', 
      value: `${(weightProgress.start - weightProgress.current).toFixed(1)} kg`, 
      icon: TrendingDown, 
      color: 'text-goals-primary', 
      bg: 'from-goals-primary/20 via-goals-primary/10 to-goals-secondary/20',
      borderColor: 'goals-primary/30'
    },
    { 
      label: 'Total Workouts', 
      value: '47', 
      icon: Activity, 
      color: 'text-training-primary', 
      bg: 'from-training-primary/20 via-training-primary/10 to-training-secondary/20',
      borderColor: 'training-primary/30'
    },
    { 
      label: 'Calories Burned', 
      value: '18,420', 
      icon: Flame, 
      color: 'text-training-secondary', 
      bg: 'from-training-secondary/20 via-training-secondary/10 to-training-primary/20',
      borderColor: 'training-secondary/30'
    },
    { 
      label: 'Current Streak', 
      value: '28 days', 
      icon: Trophy, 
      color: 'text-stats-primary', 
      bg: 'from-stats-primary/20 via-stats-primary/10 to-stats-secondary/20',
      borderColor: 'stats-primary/30'
    },
  ];

  const personalInfo = {
    name: 'Alex Thompson',
    age: 28,
    height: 178,
    startDate: 'September 1, 2025',
    background: 'Former college athlete looking to get back in shape after years of desk work. Started this journey to improve overall health and regain lost fitness.',
    achievements: [
      'Completed first half marathon in 2019',
      'College basketball team captain',
      'Lost 15kg in previous fitness journey',
    ],
  };

  const energyLevel = {
    current: 8,
    average: 6.5,
    history: [
      { date: 'Mon', level: 6 },
      { date: 'Tue', level: 7 },
      { date: 'Wed', level: 6 },
      { date: 'Thu', level: 7 },
      { date: 'Fri', level: 8 },
      { date: 'Sat', level: 8 },
      { date: 'Sun', level: 9 },
    ],
  };

  const disciplineStats = {
    currentWeek: {
      trainingAdherence: 85,
      nutritionAdherence: 78,
      overallAdherence: 82,
    },
    weeklyHistory: [
      { week: 'Week 1', trainingAdherence: 65, nutritionAdherence: 60, overallAdherence: 63 },
      { week: 'Week 2', trainingAdherence: 72, nutritionAdherence: 68, overallAdherence: 70 },
      { week: 'Week 3', trainingAdherence: 78, nutritionAdherence: 72, overallAdherence: 75 },
      { week: 'Week 4', trainingAdherence: 85, nutritionAdherence: 78, overallAdherence: 82 },
    ],
    improvement: {
      training: 7,    // +7% from last week
      nutrition: 6,   // +6% from last week
      overall: 7,     // +7% from last week
    },
  };

  return (
    <div className="space-y-6 max-w-6xl p-4 md:p-6 min-h-full" style={{ background: 'oklch(0.14 0.012 240)' }}>
      {/* Hero Stats - Always Visible */}
      <div>
        <div className="mb-4">
          <h2 className="text-foreground mb-1">Your Progress Journey</h2>
          <p className="text-muted-foreground">See how far you've come! 🎉</p>
        </div>
        
        <ActivityStatsWidget stats={stats} />
      </div>

      {/* Collapsible Sections */}
      <Accordion type="multiple" defaultValue={["personal-info"]} className="space-y-4">
        {/* Weight Progress */}
        <AccordionItem value="weight-progress" className="border-none">
          <AccordionTrigger className="bg-stats-primary/5 hover:bg-stats-primary/10 px-4 md:px-6 py-4 rounded-xl border-0 hover:no-underline">
            <span className="text-foreground">Weight Progress</span>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <WeightProgressWidget weightProgress={weightProgress} onWeighIn={onWeighIn} />
          </AccordionContent>
        </AccordionItem>

        {/* Exercise Progress */}
        <AccordionItem value="exercise-progress" className="border-none">
          <AccordionTrigger className="bg-training-primary/5 hover:bg-training-primary/10 px-4 md:px-6 py-4 rounded-xl border-0 hover:no-underline">
            <span className="text-foreground">Exercise Progress</span>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <ExerciseProgressWidget 
              exercises={exerciseProgress} 
              allExercises={allExercises} 
              handleToggleFavorite={handleToggleFavorite} 
              allExerciseSets={allExerciseSets}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Favorite Meals */}
        <AccordionItem value="favorite-meals" className="border-none">
          <AccordionTrigger className="bg-nutrition/5 hover:bg-nutrition/10 px-4 md:px-6 py-4 rounded-xl border-0 hover:no-underline">
            <span className="text-foreground">Favorite Meals</span>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <FavoriteMealsWidget meals={favoriteMeals} allMeals={allMeals} handleToggleFavorite={handleToggleFavoriteMeal} />
          </AccordionContent>
        </AccordionItem>

        {/* Energy Level */}
        <AccordionItem value="energy-level" className="border-none">
          <AccordionTrigger className="bg-training-secondary/5 hover:bg-training-secondary/10 px-4 md:px-6 py-4 rounded-xl border-0 hover:no-underline">
            <span className="text-foreground">Energy Level</span>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <EnergyLevelWidget energy={energyLevel} />
          </AccordionContent>
        </AccordionItem>

        {/* Discipline & Consistency */}
        <AccordionItem value="discipline-stats" className="border-none">
          <AccordionTrigger className="bg-stats-primary/5 hover:bg-stats-primary/10 px-4 md:px-6 py-4 rounded-xl border-0 hover:no-underline">
            <span className="text-foreground">Discipline & Consistency</span>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <DisciplineStatsWidget 
              currentWeek={disciplineStats.currentWeek}
              weeklyHistory={disciplineStats.weeklyHistory}
              improvement={disciplineStats.improvement}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Personal Information */}
        <AccordionItem value="personal-info" className="border-none">
          <AccordionTrigger className="bg-stats-primary/5 hover:bg-stats-primary/10 px-4 md:px-6 py-4 rounded-xl border-0 hover:no-underline">
            <span className="text-foreground">Personal Information</span>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <PersonalInfoWidget info={personalInfo} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}