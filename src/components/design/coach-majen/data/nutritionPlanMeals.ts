// Shared nutrition plan default meals
export interface Recipe {
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  difficulty: string;
}

export interface Meal {
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
  notes?: string;
  preparationTime?: string;
  cookingTips?: string[];
  nutritionalBenefits?: string[];
}

// Default meals from the nutrition plan - these rotate for each day
export const getDefaultDayMeals = (): Meal[] => [
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
    notes: 'Start your day with complex carbs and protein',
    preparationTime: '10 minutes',
    cookingTips: [
      'Cook oats with milk instead of water for extra protein',
      'Top with berries after cooking to preserve their nutrients',
      'Add a pinch of cinnamon for blood sugar regulation'
    ],
    nutritionalBenefits: [
      'Oats provide sustained energy through complex carbohydrates',
      'Greek yogurt delivers probiotics for gut health',
      'Berries are rich in antioxidants and fiber',
      'Almonds provide healthy fats and vitamin E'
    ],
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
    notes: 'High protein lunch to fuel your afternoon',
    preparationTime: '15 minutes',
    cookingTips: [
      'Marinate chicken in lemon and herbs for extra flavor',
      'Grill chicken to 165°F internal temperature',
      'Let chicken rest 5 minutes before slicing'
    ],
    nutritionalBenefits: [
      'Lean protein supports muscle recovery and growth',
      'Mixed greens provide vitamins A, C, and K',
      'Tomatoes contain lycopene for heart health',
      'Olive oil provides heart-healthy monounsaturated fats'
    ],
    recipe: {
      ingredients: [
        '200g chicken breast',
        '2 cups mixed greens',
        '1 cup cherry tomatoes',
        '2 slices whole grain bread',
        '1 medium apple',
        '2 tbsp olive oil',
        '1 tbsp balsamic vinegar',
        'Lemon juice',
        'Salt and pepper to taste',
      ],
      instructions: [
        'Season chicken breast with salt, pepper, and lemon juice',
        'Grill chicken over medium-high heat for 6-7 minutes per side',
        'Let chicken rest for 5 minutes, then slice',
        'Toss mixed greens with olive oil and balsamic vinegar',
        'Halve cherry tomatoes and add to salad',
        'Top with sliced chicken',
        'Toast whole grain bread and serve on the side',
        'Enjoy apple as dessert',
      ],
      prepTime: '15 minutes',
      difficulty: 'Easy',
    },
  },
  {
    id: Date.now() + 3,
    name: 'Protein Shake',
    time: '4:00 PM',
    items: ['Whey protein', 'Banana', 'Almond butter', 'Almond milk'],
    calories: 380,
    protein: 35,
    carbs: 48,
    fats: 10,
    completed: false,
    notes: 'Quick nutrition boost for afternoon energy',
    preparationTime: '5 minutes',
    cookingTips: [
      'Blend frozen banana for a thicker, creamier shake',
      'Add protein powder last to prevent clumping',
      'Use cold milk for better taste and texture'
    ],
    nutritionalBenefits: [
      'Whey protein rapidly absorbed for muscle recovery',
      'Banana provides quick-digesting carbs and potassium',
      'Almond butter adds healthy fats and vitamin E',
      'Perfect pre-workout or post-workout nutrition'
    ],
    recipe: {
      ingredients: [
        '1 scoop whey protein powder',
        '1 medium banana',
        '1 tbsp almond butter',
        '1 cup unsweetened almond milk',
        '1/2 cup ice cubes',
      ],
      instructions: [
        'Add almond milk to blender',
        'Add banana (can use frozen for thicker texture)',
        'Add almond butter',
        'Add ice cubes',
        'Add protein powder last',
        'Blend on high for 30-45 seconds until smooth',
        'Pour into glass and enjoy immediately',
      ],
      prepTime: '5 minutes',
      difficulty: 'Easy',
    },
  },
  {
    id: Date.now() + 4,
    name: 'Salmon & Quinoa',
    time: '7:00 PM',
    items: ['Grilled salmon', 'Quinoa', 'Steamed broccoli', 'Olive oil'],
    calories: 620,
    protein: 48,
    carbs: 65,
    fats: 20,
    completed: false,
    notes: 'Omega-3 rich dinner for recovery',
    preparationTime: '25 minutes',
    cookingTips: [
      'Season salmon with salt, pepper, and herbs',
      'Grill skin-side down first for crispy skin',
      'Cook to 145°F internal temperature',
      'Rinse quinoa before cooking to remove bitterness'
    ],
    nutritionalBenefits: [
      'Salmon provides omega-3 fatty acids for inflammation',
      'Quinoa is a complete protein with all essential amino acids',
      'Broccoli is packed with vitamins C and K',
      'This meal supports muscle recovery and heart health'
    ],
    recipe: {
      ingredients: [
        '180g salmon fillet',
        '1 cup quinoa (uncooked)',
        '1.5 cups broccoli florets',
        '2 cups water or broth',
        '1 tbsp olive oil',
        '1 lemon',
        'Garlic, herbs, salt, pepper',
      ],
      instructions: [
        'Rinse quinoa thoroughly under cold water',
        'Cook quinoa in water/broth according to package directions (about 15 minutes)',
        'While quinoa cooks, season salmon with salt, pepper, and herbs',
        'Heat grill or pan over medium-high heat',
        'Cook salmon skin-side down for 4-5 minutes',
        'Flip and cook another 3-4 minutes until done (145°F)',
        'Steam broccoli for 5-7 minutes until tender-crisp',
        'Plate quinoa, top with salmon and broccoli',
        'Drizzle with olive oil and fresh lemon juice',
      ],
      prepTime: '25 minutes',
      difficulty: 'Medium',
    },
  },
];
