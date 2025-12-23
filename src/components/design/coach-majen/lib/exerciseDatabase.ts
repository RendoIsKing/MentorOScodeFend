export interface ExerciseDetail {
  name: string;
  description: string;
  execution: string[];
  primaryMuscles: string[];
  secondaryMuscles: string[];
  tips?: string[];
  commonMistakes?: string[];
}

// Comprehensive exercise database with detailed instructions and muscle information
export const exerciseDatabase: Record<string, ExerciseDetail> = {
  'Mountain Climbers': {
    name: 'Mountain Climbers',
    description: 'A dynamic full-body exercise that combines core strength with cardiovascular endurance.',
    primaryMuscles: ['Core', 'Hip Flexors'],
    secondaryMuscles: ['Shoulders', 'Quadriceps', 'Hamstrings'],
    execution: [
      'Start in a high plank position with hands directly under shoulders',
      'Engage your core and keep your body in a straight line',
      'Drive your right knee toward your chest',
      'Quickly switch legs, extending the right leg back while bringing the left knee forward',
      'Continue alternating legs at a rapid pace while maintaining form',
      'Keep your hips level and avoid bouncing'
    ],
    tips: [
      'Keep your core tight throughout the movement',
      'Breathe steadily - don\'t hold your breath',
      'Start slow to master the form, then increase speed'
    ],
    commonMistakes: [
      'Letting hips rise too high',
      'Not engaging the core',
      'Moving too fast and losing form'
    ]
  },
  'Burpees': {
    name: 'Burpees',
    description: 'A full-body exercise that builds strength and cardiovascular endurance.',
    primaryMuscles: ['Legs', 'Chest', 'Core'],
    secondaryMuscles: ['Shoulders', 'Triceps', 'Glutes'],
    execution: [
      'Start standing with feet shoulder-width apart',
      'Drop into a squat position and place hands on the floor',
      'Jump feet back into a plank position',
      'Perform a push-up (optional for beginners)',
      'Jump feet back to squat position',
      'Explosively jump up with arms reaching overhead',
      'Land softly and immediately begin the next rep'
    ],
    tips: [
      'Land softly to protect your joints',
      'Maintain a strong plank position',
      'Focus on quality over speed when starting out'
    ],
    commonMistakes: [
      'Sagging hips in plank position',
      'Not fully extending during the jump',
      'Landing too hard on feet'
    ]
  },
  'Bench Press': {
    name: 'Bench Press',
    description: 'A fundamental upper body strength exercise targeting chest, shoulders, and triceps.',
    primaryMuscles: ['Chest (Pectorals)'],
    secondaryMuscles: ['Triceps', 'Anterior Deltoids'],
    execution: [
      'Lie flat on bench with feet planted firmly on the ground',
      'Grip the bar slightly wider than shoulder-width',
      'Unrack the bar and position it above your chest',
      'Lower the bar with control to mid-chest',
      'Press the bar back up to starting position',
      'Keep shoulder blades retracted throughout'
    ],
    tips: [
      'Keep your shoulder blades squeezed together',
      'Drive through your feet for stability',
      'Breathe in on the descent, out on the press'
    ],
    commonMistakes: [
      'Bouncing the bar off the chest',
      'Flaring elbows too wide',
      'Lifting hips off the bench'
    ]
  },
  'Pull-ups': {
    name: 'Pull-ups',
    description: 'A compound upper body exercise primarily targeting the back and biceps.',
    primaryMuscles: ['Latissimus Dorsi (Lats)', 'Upper Back'],
    secondaryMuscles: ['Biceps', 'Forearms', 'Rear Deltoids'],
    execution: [
      'Grip the bar with hands slightly wider than shoulder-width, palms facing away',
      'Hang with arms fully extended and core engaged',
      'Pull yourself up by driving elbows down and back',
      'Continue until chin is above the bar',
      'Lower yourself with control to full extension',
      'Avoid swinging or using momentum'
    ],
    tips: [
      'Engage your lats before pulling',
      'Keep your core tight to prevent swinging',
      'Use assisted variations if needed'
    ],
    commonMistakes: [
      'Using momentum or kipping',
      'Not achieving full range of motion',
      'Shrugging shoulders up'
    ]
  },
  'Back Squat': {
    name: 'Back Squat',
    description: 'The king of lower body exercises, building strength in legs, glutes, and core.',
    primaryMuscles: ['Quadriceps', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Core', 'Lower Back'],
    execution: [
      'Position bar on upper back (traps), not neck',
      'Stand with feet shoulder-width apart, toes slightly out',
      'Brace core and initiate descent by breaking at hips and knees',
      'Lower until thighs are at least parallel to ground',
      'Drive through heels to stand back up',
      'Keep chest up and core tight throughout'
    ],
    tips: [
      'Keep knees tracking over toes',
      'Maintain neutral spine position',
      'Breathe and brace before each rep'
    ],
    commonMistakes: [
      'Knees caving inward',
      'Leaning too far forward',
      'Not reaching adequate depth'
    ]
  },
  'Deadlift': {
    name: 'Deadlift',
    description: 'A fundamental compound movement that develops total body strength.',
    primaryMuscles: ['Hamstrings', 'Glutes', 'Lower Back'],
    secondaryMuscles: ['Upper Back', 'Traps', 'Forearms', 'Core'],
    execution: [
      'Stand with feet hip-width apart, bar over mid-foot',
      'Bend down and grip bar just outside your legs',
      'Lower hips, lift chest, engage lats',
      'Drive through heels while keeping bar close to body',
      'Extend hips and knees simultaneously',
      'Stand tall at top, then reverse the movement with control'
    ],
    tips: [
      'Keep the bar as close to your body as possible',
      'Engage your lats by "bending the bar"',
      'Use your legs, not just your back'
    ],
    commonMistakes: [
      'Rounding the lower back',
      'Bar drifting away from body',
      'Hyperextending at the top'
    ]
  },
  'Plank Hold': {
    name: 'Plank Hold',
    description: 'An isometric core exercise that builds stability and endurance.',
    primaryMuscles: ['Core (Abs)', 'Transverse Abdominis'],
    secondaryMuscles: ['Shoulders', 'Glutes', 'Lower Back'],
    execution: [
      'Start in forearm plank with elbows under shoulders',
      'Engage your core and glutes',
      'Keep body in a straight line from head to heels',
      'Hold position without letting hips sag or rise',
      'Breathe steadily throughout the hold',
      'Maintain tension in abs and glutes'
    ],
    tips: [
      'Squeeze your glutes to prevent lower back strain',
      'Look at the floor to keep neck neutral',
      'Focus on quality over duration'
    ],
    commonMistakes: [
      'Letting hips sag',
      'Raising hips too high',
      'Holding breath'
    ]
  },
  'Dumbbell Shoulder Press': {
    name: 'Dumbbell Shoulder Press',
    description: 'An effective shoulder exercise that builds strength and stability.',
    primaryMuscles: ['Deltoids (Shoulders)'],
    secondaryMuscles: ['Triceps', 'Upper Chest', 'Core'],
    execution: [
      'Sit on a bench with back support or stand with feet shoulder-width apart',
      'Hold dumbbells at shoulder height with palms facing forward',
      'Press dumbbells overhead until arms are fully extended',
      'Lower dumbbells with control back to shoulder height',
      'Keep core engaged throughout the movement'
    ],
    tips: [
      'Don\'t arch your back excessively',
      'Control the weight on the way down',
      'Keep wrists straight and strong'
    ],
    commonMistakes: [
      'Using too much momentum',
      'Excessive back arching',
      'Not achieving full range of motion'
    ]
  },
  'Barbell Rows': {
    name: 'Barbell Rows',
    description: 'A compound pulling exercise for building back thickness and strength.',
    primaryMuscles: ['Latissimus Dorsi', 'Middle Back'],
    secondaryMuscles: ['Biceps', 'Rear Deltoids', 'Lower Back'],
    execution: [
      'Stand with feet hip-width apart, knees slightly bent',
      'Hinge at hips to lean forward, keeping back straight',
      'Grip bar slightly wider than shoulder-width',
      'Pull bar toward lower chest/upper abdomen',
      'Squeeze shoulder blades together at the top',
      'Lower bar with control to starting position'
    ],
    tips: [
      'Keep your core tight and back flat',
      'Pull with your elbows, not your hands',
      'Avoid using momentum to swing the weight'
    ],
    commonMistakes: [
      'Rounding the back',
      'Standing too upright',
      'Using too much momentum'
    ]
  },
  'Romanian Deadlift': {
    name: 'Romanian Deadlift',
    description: 'A hip-hinge movement that targets the posterior chain.',
    primaryMuscles: ['Hamstrings', 'Glutes'],
    secondaryMuscles: ['Lower Back', 'Upper Back', 'Forearms'],
    execution: [
      'Stand with feet hip-width apart, holding bar at hip level',
      'Keep knees slightly bent throughout the movement',
      'Hinge at hips, pushing them back while lowering the bar',
      'Lower until you feel a stretch in hamstrings',
      'Drive hips forward to return to starting position',
      'Keep bar close to legs throughout'
    ],
    tips: [
      'Focus on the hip hinge, not squatting down',
      'Feel the stretch in your hamstrings',
      'Keep shoulders back and chest up'
    ],
    commonMistakes: [
      'Bending knees too much (turning it into a squat)',
      'Rounding the back',
      'Not pushing hips back far enough'
    ]
  },
  'Bulgarian Split Squats': {
    name: 'Bulgarian Split Squats',
    description: 'A single-leg exercise that builds leg strength and balance.',
    primaryMuscles: ['Quadriceps', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Core', 'Calves'],
    execution: [
      'Stand facing away from a bench with one foot elevated behind you',
      'Lower your body by bending the front knee',
      'Descend until front thigh is parallel to ground',
      'Push through front heel to return to starting position',
      'Complete all reps on one leg before switching'
    ],
    tips: [
      'Keep torso upright throughout',
      'Don\'t let front knee cave inward',
      'Focus on the working leg doing the work'
    ],
    commonMistakes: [
      'Front foot positioned too close to bench',
      'Leaning too far forward',
      'Pushing through back leg instead of front'
    ]
  },
  'Leg Press': {
    name: 'Leg Press',
    description: 'A machine-based exercise for building lower body strength.',
    primaryMuscles: ['Quadriceps', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Calves'],
    execution: [
      'Sit in leg press machine with back against pad',
      'Place feet on platform shoulder-width apart',
      'Release safety bars and lower platform with control',
      'Lower until knees are at 90 degrees',
      'Press through heels to extend legs',
      'Don\'t lock knees at the top'
    ],
    tips: [
      'Keep lower back pressed against the pad',
      'Don\'t let knees cave inward',
      'Control the descent - don\'t let weight drop'
    ],
    commonMistakes: [
      'Letting lower back come off the pad',
      'Locking knees at the top',
      'Using too much weight and sacrificing form'
    ]
  },
  'Tricep Dips': {
    name: 'Tricep Dips',
    description: 'A bodyweight exercise targeting the triceps and chest.',
    primaryMuscles: ['Triceps'],
    secondaryMuscles: ['Chest', 'Shoulders'],
    execution: [
      'Grip parallel bars or bench with arms extended',
      'Lower body by bending elbows until upper arms are parallel to ground',
      'Keep elbows close to body',
      'Press through hands to return to starting position',
      'Avoid swinging or using momentum'
    ],
    tips: [
      'Lean slightly forward for more chest activation',
      'Stay upright for more tricep focus',
      'Control the descent'
    ],
    commonMistakes: [
      'Flaring elbows out too wide',
      'Not going deep enough',
      'Using momentum to swing up'
    ]
  },
  'Bicep Curls': {
    name: 'Bicep Curls',
    description: 'An isolation exercise for building bicep strength and size.',
    primaryMuscles: ['Biceps'],
    secondaryMuscles: ['Forearms'],
    execution: [
      'Stand with feet shoulder-width apart holding dumbbells',
      'Keep elbows close to torso',
      'Curl weights up toward shoulders',
      'Squeeze biceps at the top',
      'Lower weights with control to starting position',
      'Keep upper arms stationary throughout'
    ],
    tips: [
      'Don\'t swing the weights',
      'Focus on the muscle contraction',
      'Control both the lifting and lowering phases'
    ],
    commonMistakes: [
      'Using momentum to swing weights up',
      'Moving elbows forward during the curl',
      'Not fully extending arms at the bottom'
    ]
  },
  'Overhead Press': {
    name: 'Overhead Press',
    description: 'A fundamental shoulder exercise for building pressing strength.',
    primaryMuscles: ['Deltoids (Shoulders)'],
    secondaryMuscles: ['Triceps', 'Upper Chest', 'Core'],
    execution: [
      'Stand with feet shoulder-width apart',
      'Hold barbell at shoulder height with hands just outside shoulders',
      'Press bar overhead until arms are fully extended',
      'Lower bar with control back to shoulders',
      'Keep core tight throughout'
    ],
    tips: [
      'Keep the bar path vertical',
      'Engage your glutes and core for stability',
      'Don\'t lean back excessively'
    ],
    commonMistakes: [
      'Excessive back arching',
      'Pressing the bar forward instead of straight up',
      'Not achieving full lockout at the top'
    ]
  },
  'Lunges': {
    name: 'Lunges',
    description: 'A functional lower body exercise that builds strength and balance.',
    primaryMuscles: ['Quadriceps', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Calves', 'Core'],
    execution: [
      'Stand with feet hip-width apart',
      'Step forward with one leg',
      'Lower hips until both knees are bent at 90 degrees',
      'Back knee should hover just above ground',
      'Push through front heel to return to starting position',
      'Alternate legs or complete all reps on one side'
    ],
    tips: [
      'Keep torso upright throughout',
      'Don\'t let front knee go past toes',
      'Step far enough forward for proper form'
    ],
    commonMistakes: [
      'Taking too short of a step',
      'Letting front knee cave inward',
      'Leaning forward excessively'
    ]
  },
  'Sprint Intervals': {
    name: 'Sprint Intervals',
    description: 'High-intensity cardiovascular exercise for building speed and endurance.',
    primaryMuscles: ['Legs', 'Cardiovascular System'],
    secondaryMuscles: ['Core', 'Glutes'],
    execution: [
      'Warm up with light jogging for 5-10 minutes',
      'Sprint at maximum effort for the prescribed duration',
      'Slow down to a walk or light jog during rest period',
      'Repeat for the prescribed number of intervals',
      'Cool down with light walking'
    ],
    tips: [
      'Focus on proper running form',
      'Drive knees up and pump arms',
      'Give maximum effort during sprint intervals'
    ],
    commonMistakes: [
      'Not warming up properly',
      'Starting too fast and burning out',
      'Poor running form when fatigued'
    ]
  },
  'Warm-up Jog': {
    name: 'Warm-up Jog',
    description: 'Light cardiovascular activity to prepare the body for exercise.',
    primaryMuscles: ['Cardiovascular System', 'Legs'],
    secondaryMuscles: ['Core'],
    execution: [
      'Start at a comfortable, easy pace',
      'Maintain steady breathing',
      'Keep movements smooth and relaxed',
      'Gradually increase pace if desired',
      'Focus on warming up muscles and elevating heart rate'
    ],
    tips: [
      'Don\'t push too hard - this is a warm-up',
      'Focus on getting your body ready for the main workout',
      'Pay attention to how your body feels'
    ]
  },
  'Yoga Flow': {
    name: 'Yoga Flow',
    description: 'A sequence of yoga poses that promotes flexibility and mindfulness.',
    primaryMuscles: ['Full Body', 'Core'],
    secondaryMuscles: ['Flexibility', 'Balance'],
    execution: [
      'Begin in a comfortable standing or seated position',
      'Flow through various yoga poses with controlled breathing',
      'Hold each pose for several breaths',
      'Transition smoothly between poses',
      'Focus on alignment and breath control'
    ],
    tips: [
      'Don\'t force stretches - respect your body\'s limits',
      'Focus on your breath',
      'Move with intention and mindfulness'
    ]
  },
  'Foam Rolling': {
    name: 'Foam Rolling',
    description: 'Self-myofascial release technique for recovery and flexibility.',
    primaryMuscles: ['Full Body (Recovery)'],
    secondaryMuscles: ['Fascia', 'Soft Tissue'],
    execution: [
      'Position foam roller under target muscle group',
      'Use body weight to apply pressure',
      'Slowly roll back and forth over the muscle',
      'Pause on tender spots for 20-30 seconds',
      'Breathe deeply and try to relax the muscle'
    ],
    tips: [
      'Avoid rolling directly on joints or bones',
      'Don\'t rush - take your time on each area',
      'Some discomfort is normal, but stop if you feel sharp pain'
    ]
  }
};

// Default exercise info for exercises not in database
export const getExerciseDetail = (exerciseName: string): ExerciseDetail => {
  if (exerciseDatabase[exerciseName]) {
    return exerciseDatabase[exerciseName];
  }
  
  return {
    name: exerciseName,
    description: `${exerciseName} is an effective exercise for building strength and improving fitness.`,
    primaryMuscles: ['Multiple Muscle Groups'],
    secondaryMuscles: [],
    execution: [
      'Follow proper form and technique',
      'Warm up adequately before performing this exercise',
      'Focus on controlled movements',
      'Breathe consistently throughout the movement'
    ],
    tips: [
      'Start with lighter weight to master the form',
      'Progressively increase difficulty as you improve'
    ]
  };
};
