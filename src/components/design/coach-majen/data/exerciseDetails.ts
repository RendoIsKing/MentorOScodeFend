export interface ExerciseDetails {
  name: string;
  description: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string;
  difficulty: string;
  instructions: string[];
  tips: string[];
  benefits: string[];
  category?: string;
}

export const exerciseDetailsData: Record<string, ExerciseDetails> = {
  "Bench Press": {
    name: "Bench Press",
    category: "Compound Exercise",
    description: "The bench press is a compound upper body exercise that primarily targets the chest, shoulders, and triceps. It's one of the fundamental strength training movements and a key indicator of upper body strength.",
    primaryMuscles: ["Pectorals (Chest)", "Anterior Deltoids (Front Shoulders)"],
    secondaryMuscles: ["Triceps", "Serratus Anterior", "Core Stabilizers"],
    equipment: "Barbell & Bench",
    difficulty: "Intermediate",
    instructions: [
      "Lie flat on the bench with your feet firmly planted on the floor. Your eyes should be aligned under the bar.",
      "Grip the bar slightly wider than shoulder-width apart with your palms facing forward.",
      "Unrack the bar and position it over your chest with arms fully extended.",
      "Lower the bar in a controlled manner to your mid-chest, keeping your elbows at about 45 degrees from your body.",
      "Press the bar back up to the starting position, fully extending your arms while maintaining control.",
      "Breathe in as you lower the bar and exhale as you push it back up."
    ],
    tips: [
      "Keep your shoulder blades retracted (squeezed together) throughout the movement to protect your shoulders.",
      "Maintain a slight arch in your lower back and keep your glutes on the bench.",
      "Don't bounce the bar off your chest - control the weight through the entire range of motion.",
      "Use a spotter when lifting heavy weights for safety."
    ],
    benefits: [
      "Builds overall upper body strength and muscle mass",
      "Improves pushing power for sports and daily activities",
      "Enhances shoulder stability and core strength",
      "Increases bone density in the upper body"
    ]
  },
  "Squats": {
    name: "Squats",
    category: "Compound Exercise",
    description: "The squat is often called the 'king of exercises' as it's a fundamental compound movement that works the entire lower body. It's essential for building leg strength, improving athletic performance, and developing functional fitness.",
    primaryMuscles: ["Quadriceps", "Gluteus Maximus (Glutes)", "Hamstrings"],
    secondaryMuscles: ["Calves", "Core", "Lower Back", "Hip Adductors"],
    equipment: "Barbell & Squat Rack",
    difficulty: "Intermediate",
    instructions: [
      "Position the barbell on your upper traps and shoulders. Stand with feet shoulder-width apart, toes slightly pointed out.",
      "Engage your core and keep your chest up. Look straight ahead or slightly up.",
      "Initiate the movement by pushing your hips back as if sitting in a chair.",
      "Descend until your thighs are at least parallel to the ground, or as low as your mobility allows while maintaining form.",
      "Drive through your heels and midfoot to return to the starting position, squeezing your glutes at the top.",
      "Keep your knees tracking over your toes throughout the movement."
    ],
    tips: [
      "Keep your weight distributed evenly across your entire foot - avoid letting your heels come up.",
      "Don't let your knees cave inward; push them out in line with your toes.",
      "Maintain a neutral spine - avoid excessive rounding or arching of the back.",
      "Start with bodyweight or light weights to perfect your form before adding heavy loads."
    ],
    benefits: [
      "Builds functional lower body strength for daily activities",
      "Increases muscle mass in legs and glutes",
      "Improves core stability and balance",
      "Boosts metabolism and burns calories effectively",
      "Enhances athletic performance and jumping ability"
    ]
  },
  "Deadlifts": {
    name: "Deadlifts",
    category: "Compound Exercise",
    description: "The deadlift is a full-body compound exercise that primarily targets the posterior chain. It's one of the most effective exercises for building overall strength and muscle mass, engaging muscles from your feet to your neck.",
    primaryMuscles: ["Erector Spinae (Lower Back)", "Gluteus Maximus", "Hamstrings"],
    secondaryMuscles: ["Quadriceps", "Forearms & Grip", "Trapezius", "Core", "Lats"],
    equipment: "Barbell & Weights",
    difficulty: "Advanced",
    instructions: [
      "Stand with your feet hip-width apart, with the bar over the middle of your feet.",
      "Bend at the hips and knees to grip the bar just outside your legs with an overhand or mixed grip.",
      "Lower your hips, lift your chest, and straighten your back. Your shoulders should be slightly in front of the bar.",
      "Take a deep breath, brace your core, and drive through your heels to lift the bar.",
      "Keep the bar close to your body as you stand up, extending your hips and knees simultaneously.",
      "Lock out at the top by standing tall with shoulders back, then lower the bar under control."
    ],
    tips: [
      "Never round your back - maintain a neutral spine throughout the entire movement.",
      "Keep the bar as close to your body as possible to reduce stress on your lower back.",
      "Think about pushing the floor away rather than pulling the weight up.",
      "Use lifting straps for heavy sets to prevent grip from being the limiting factor."
    ],
    benefits: [
      "Builds total body strength and muscle mass",
      "Improves posture and back health when performed correctly",
      "Enhances grip strength significantly",
      "Increases bone density throughout the body",
      "Develops mental toughness and discipline"
    ]
  },
  "Pull-ups": {
    name: "Pull-ups",
    category: "Bodyweight Exercise",
    description: "Pull-ups are a challenging bodyweight exercise that primarily targets the back and biceps. They're an excellent indicator of relative strength and are fundamental for developing upper body pulling power.",
    primaryMuscles: ["Latissimus Dorsi (Lats)", "Biceps"],
    secondaryMuscles: ["Rhomboids", "Trapezius", "Rear Deltoids", "Core", "Forearms"],
    equipment: "Pull-up Bar",
    difficulty: "Intermediate",
    instructions: [
      "Hang from a pull-up bar with hands slightly wider than shoulder-width apart, palms facing away from you.",
      "Start from a dead hang with arms fully extended and shoulders engaged (don't let shoulders shrug up to ears).",
      "Pull yourself up by driving your elbows down and back, engaging your lats.",
      "Continue pulling until your chin is above the bar.",
      "Lower yourself back down with control to the starting position.",
      "Avoid swinging or using momentum - keep the movement controlled."
    ],
    tips: [
      "If you can't do a full pull-up yet, use resistance bands or an assisted pull-up machine.",
      "Focus on pulling with your back muscles rather than just your arms.",
      "Keep your core engaged to prevent excessive swinging.",
      "Avoid kipping or using momentum unless you're specifically training CrossFit-style pull-ups."
    ],
    benefits: [
      "Develops a strong, wide back and improves V-taper physique",
      "Improves grip strength and forearm development",
      "Enhances core stability and control",
      "Requires no equipment beyond a bar, making it highly accessible",
      "Translates well to rock climbing and other pulling activities"
    ]
  },
  "Overhead Press": {
    name: "Overhead Press",
    category: "Compound Exercise",
    description: "The overhead press (also known as the military press or shoulder press) is a fundamental upper body exercise that builds shoulder strength and stability. It's one of the best exercises for developing powerful, well-rounded shoulders.",
    primaryMuscles: ["Anterior Deltoids (Front Shoulders)", "Lateral Deltoids (Side Shoulders)"],
    secondaryMuscles: ["Triceps", "Upper Chest", "Core Stabilizers", "Trapezius"],
    equipment: "Barbell",
    difficulty: "Intermediate",
    instructions: [
      "Start with the barbell at shoulder height, hands slightly wider than shoulder-width apart.",
      "Stand with feet shoulder-width apart, core braced, and glutes engaged for stability.",
      "Press the bar straight up overhead, moving your head slightly back to allow the bar to pass.",
      "Lock out your elbows at the top with the bar directly over your midfoot.",
      "Lower the bar back down to shoulder level with control.",
      "Breathe out as you press up and inhale as you lower the weight."
    ],
    tips: [
      "Don't lean back excessively - keep your core tight to protect your lower back.",
      "Press in a straight vertical line rather than pushing the bar forward.",
      "Squeeze your glutes throughout the movement to maintain stability.",
      "Start with lighter weights to master the form before progressing to heavier loads."
    ],
    benefits: [
      "Builds strong, well-developed shoulders",
      "Improves core strength and stability",
      "Enhances overhead stability for sports and daily activities",
      "Develops pressing power that transfers to other exercises"
    ]
  },
  "Plank": {
    name: "Plank",
    category: "Core Exercise",
    description: "The plank is an isometric core exercise that builds endurance and stability throughout the entire core musculature. It's one of the most effective exercises for developing functional core strength and improving posture.",
    primaryMuscles: ["Rectus Abdominis", "Transverse Abdominis"],
    secondaryMuscles: ["Obliques", "Lower Back", "Shoulders", "Glutes", "Quadriceps"],
    equipment: "None (Bodyweight)",
    difficulty: "Beginner",
    instructions: [
      "Start in a push-up position, then lower down onto your forearms.",
      "Position your elbows directly under your shoulders with forearms parallel to each other.",
      "Engage your core, squeeze your glutes, and keep your body in a straight line from head to heels.",
      "Look at the floor slightly ahead of you to maintain a neutral neck position.",
      "Hold this position, breathing normally, for the desired duration.",
      "Don't let your hips sag down or pike up - maintain a perfectly straight line."
    ],
    tips: [
      "Focus on quality over duration - perfect form for 30 seconds is better than poor form for 2 minutes.",
      "Actively push the floor away with your forearms to engage your shoulders.",
      "Squeeze your glutes hard - this helps protect your lower back and maintain proper alignment.",
      "If you feel strain in your lower back, you're likely letting your hips sag."
    ],
    benefits: [
      "Builds core endurance and stability for all activities",
      "Improves posture and reduces lower back pain",
      "Enhances balance and coordination",
      "Strengthens shoulders and glutes as secondary benefit",
      "Can be done anywhere with no equipment needed"
    ]
  },
  "Barbell Row": {
    name: "Barbell Row",
    category: "Compound Exercise",
    description: "The barbell row is a fundamental pulling exercise that targets the entire back musculature. It's essential for building a thick, strong back and balancing out pressing movements in your training program.",
    primaryMuscles: ["Latissimus Dorsi (Lats)", "Rhomboids", "Trapezius"],
    secondaryMuscles: ["Biceps", "Rear Deltoids", "Lower Back", "Core", "Forearms"],
    equipment: "Barbell & Weights",
    difficulty: "Intermediate",
    instructions: [
      "Stand with feet hip-width apart, bend at the hips to grip the barbell with hands slightly wider than shoulder-width.",
      "Hinge forward at the hips until your torso is roughly 45 degrees to the floor, keeping your back straight.",
      "Let the bar hang at arm's length, maintaining a neutral spine and engaged core.",
      "Pull the bar toward your lower chest/upper abdomen by driving your elbows back and squeezing your shoulder blades together.",
      "Hold the contraction briefly at the top, then lower the bar back down with control.",
      "Keep your torso angle consistent throughout - don't stand up as you row."
    ],
    tips: [
      "Focus on pulling with your back muscles, not just your arms.",
      "Keep your elbows close to your body rather than flaring them out.",
      "Avoid excessive body momentum - use a controlled rowing motion.",
      "Maintain a flat back throughout the movement to protect your spine."
    ],
    benefits: [
      "Builds thickness in the back muscles",
      "Improves posture by strengthening upper back",
      "Balances out pressing exercises to prevent muscle imbalances",
      "Enhances grip strength and forearm development",
      "Develops pulling power for sports and functional activities"
    ]
  },
  "Lunges": {
    name: "Lunges",
    category: "Unilateral Exercise",
    description: "Lunges are a unilateral leg exercise that targets the quadriceps, glutes, and hamstrings while also improving balance and coordination. They're excellent for addressing muscle imbalances and building functional lower body strength.",
    primaryMuscles: ["Quadriceps", "Gluteus Maximus"],
    secondaryMuscles: ["Hamstrings", "Calves", "Core Stabilizers", "Hip Flexors"],
    equipment: "Dumbbells (Optional)",
    difficulty: "Beginner to Intermediate",
    instructions: [
      "Stand tall with feet hip-width apart, holding dumbbells at your sides (if using weight).",
      "Take a large step forward with one leg, maintaining an upright torso.",
      "Lower your body until both knees are bent at approximately 90 degrees. Your front knee should be directly over your ankle.",
      "Your rear knee should hover just above the ground without touching.",
      "Push through your front heel to return to the starting position.",
      "Alternate legs or complete all reps on one side before switching."
    ],
    tips: [
      "Keep your torso upright throughout the movement - avoid leaning forward.",
      "Don't let your front knee extend past your toes.",
      "Take a large enough step that your front shin stays vertical.",
      "Engage your core to maintain balance and stability."
    ],
    benefits: [
      "Addresses muscle imbalances between left and right legs",
      "Improves balance and coordination",
      "Builds functional strength for walking and running",
      "Enhances hip flexibility and mobility",
      "Can be done with minimal equipment"
    ]
  },
  "Dumbbell Curl": {
    name: "Dumbbell Curl",
    category: "Isolation Exercise",
    description: "The dumbbell curl is a classic isolation exercise that specifically targets the biceps. It's one of the most popular exercises for building arm size and strength, allowing for independent arm work to address imbalances.",
    primaryMuscles: ["Biceps Brachii"],
    secondaryMuscles: ["Brachialis", "Brachioradialis (Forearm)", "Anterior Deltoid"],
    equipment: "Dumbbells",
    difficulty: "Beginner",
    instructions: [
      "Stand with feet shoulder-width apart, holding a dumbbell in each hand with arms fully extended.",
      "Keep your elbows close to your torso and palms facing forward.",
      "Keeping your upper arms stationary, curl the weights up by contracting your biceps.",
      "Continue curling until the dumbbells are at shoulder level and biceps are fully contracted.",
      "Pause briefly at the top, squeezing your biceps.",
      "Slowly lower the dumbbells back to the starting position with control."
    ],
    tips: [
      "Don't swing the weights or use momentum - keep the movement controlled.",
      "Keep your elbows in a fixed position throughout the exercise.",
      "Avoid moving your shoulders forward as you curl - isolate the biceps.",
      "Control the eccentric (lowering) phase - this is where much of the growth happens."
    ],
    benefits: [
      "Isolates and builds the biceps effectively",
      "Allows independent arm training to fix imbalances",
      "Improves grip strength and forearm development",
      "Simple movement that's easy to learn for beginners",
      "Can be performed anywhere with minimal equipment"
    ]
  },
  "Leg Press": {
    name: "Leg Press",
    category: "Compound Exercise",
    description: "The leg press is a machine-based compound exercise that targets the entire lower body with reduced stress on the lower back compared to squats. It's excellent for building leg mass and strength, especially when recovering from injury or learning to load the legs heavily.",
    primaryMuscles: ["Quadriceps", "Gluteus Maximus"],
    secondaryMuscles: ["Hamstrings", "Calves", "Hip Adductors"],
    equipment: "Leg Press Machine",
    difficulty: "Beginner to Intermediate",
    instructions: [
      "Sit in the leg press machine with your back and head resting against the padded support.",
      "Place your feet on the platform about shoulder-width apart, toes pointing slightly outward.",
      "Release the safety bars and extend your legs, but don't lock out your knees completely.",
      "Lower the platform by bending your knees, bringing them toward your chest.",
      "Descend until your knees are at about 90 degrees or slightly deeper if mobility allows.",
      "Push through your heels and midfoot to extend your legs back to the starting position."
    ],
    tips: [
      "Keep your lower back pressed against the pad throughout the movement.",
      "Don't lock out your knees at the top - maintain a slight bend.",
      "Avoid letting your knees cave inward - push them out in line with your toes.",
      "Control the descent - don't let the weight drop quickly."
    ],
    benefits: [
      "Builds leg strength and mass with reduced spinal loading",
      "Allows for heavy loading safely with machine support",
      "Good option for those with lower back issues",
      "Easier to learn than free weight squats",
      "Can target different areas by adjusting foot placement"
    ]
  },
  "Lat Pulldown": {
    name: "Lat Pulldown",
    category: "Compound Exercise",
    description: "The lat pulldown is a machine-based pulling exercise that primarily targets the latissimus dorsi muscles. It's an excellent alternative to pull-ups and is great for building back width and developing pulling strength.",
    primaryMuscles: ["Latissimus Dorsi (Lats)"],
    secondaryMuscles: ["Biceps", "Rhomboids", "Trapezius", "Rear Deltoids", "Forearms"],
    equipment: "Lat Pulldown Machine",
    difficulty: "Beginner to Intermediate",
    instructions: [
      "Sit at the lat pulldown machine and secure your thighs under the pads.",
      "Grip the bar with hands wider than shoulder-width apart, palms facing forward.",
      "Start with arms fully extended and a slight lean back (about 10-15 degrees).",
      "Pull the bar down toward your upper chest by driving your elbows down and back.",
      "Squeeze your shoulder blades together at the bottom of the movement.",
      "Slowly return the bar to the starting position with control, feeling a stretch in your lats."
    ],
    tips: [
      "Focus on pulling with your back muscles, not just your arms.",
      "Don't lean back excessively - use a slight lean for leverage.",
      "Keep your chest up and maintain good posture throughout.",
      "Avoid using momentum by jerking your body - keep the movement smooth."
    ],
    benefits: [
      "Builds width in the back for a V-taper physique",
      "Easier to progress than pull-ups for beginners",
      "Allows precise weight control for progressive overload",
      "Develops pulling strength that transfers to pull-ups",
      "Can be modified with different grips to target muscles differently"
    ]
  },
  "Tricep Dips": {
    name: "Tricep Dips",
    category: "Bodyweight Exercise",
    description: "Tricep dips are a powerful bodyweight exercise that primarily targets the triceps but also engages the chest and shoulders. They're excellent for building pushing strength and arm mass.",
    primaryMuscles: ["Triceps"],
    secondaryMuscles: ["Lower Chest", "Anterior Deltoids", "Core Stabilizers"],
    equipment: "Dip Bars or Parallel Bars",
    difficulty: "Intermediate",
    instructions: [
      "Grip the parallel bars and support your body weight with arms fully extended.",
      "Keep your body upright with a slight forward lean if targeting chest, or more upright for triceps emphasis.",
      "Lower your body by bending your elbows until your upper arms are roughly parallel to the ground.",
      "Keep your elbows close to your body rather than flaring them out.",
      "Push through your palms to extend your arms and return to the starting position.",
      "Maintain core tension throughout the movement."
    ],
    tips: [
      "Don't go too deep if you feel shoulder discomfort - stop at parallel.",
      "Keep your shoulders down and back, not shrugged up toward your ears.",
      "If bodyweight dips are too easy, add weight with a dip belt.",
      "If too difficult, use an assisted dip machine or resistance bands."
    ],
    benefits: [
      "Highly effective for building tricep mass and strength",
      "Also develops chest and shoulder strength",
      "Improves lockout strength for pressing movements",
      "Can be done with minimal equipment",
      "Easily scalable by adding or removing weight"
    ]
  },
  "5K Run": {
    name: "5K Run",
    category: "Cardio Exercise",
    description: "The 5K run is a popular cardiovascular endurance exercise that covers 5 kilometers (3.1 miles). It's an excellent distance for improving aerobic capacity, burning calories, and building mental toughness while being accessible to runners of all levels.",
    primaryMuscles: ["Quadriceps", "Hamstrings", "Calves"],
    secondaryMuscles: ["Glutes", "Hip Flexors", "Core", "Cardiovascular System"],
    equipment: "Running Shoes",
    difficulty: "Beginner to Intermediate",
    instructions: [
      "Start with a 5-10 minute warm-up walk or light jog to prepare your muscles and cardiovascular system.",
      "Begin your run at a comfortable, conversational pace - you should be able to speak in short sentences.",
      "Focus on maintaining good running form: upright posture, relaxed shoulders, and arms swinging naturally.",
      "Keep your breathing rhythmic - try a 3:3 pattern (inhale for 3 steps, exhale for 3 steps).",
      "Maintain a consistent pace throughout, resisting the urge to start too fast.",
      "For the final kilometer, you can gradually increase your pace if you have energy left.",
      "Finish with a 5-10 minute cool-down walk to gradually lower your heart rate."
    ],
    tips: [
      "Invest in proper running shoes that suit your gait and foot type.",
      "Don't skip the warm-up - it helps prevent injuries and improves performance.",
      "Focus on time improvement rather than always pushing for speed - consistency builds endurance.",
      "Stay hydrated before and after your run, especially in warm weather.",
      "Listen to your body - if you feel sharp pain, stop and rest.",
      "Mix in walk breaks if needed when starting out - it's perfectly normal!"
    ],
    benefits: [
      "Improves cardiovascular fitness and heart health",
      "Burns significant calories for weight management (approximately 300-400 calories per 5K)",
      "Builds lower body muscular endurance",
      "Enhances mental toughness and discipline",
      "Low cost and can be done almost anywhere",
      "Great for setting measurable goals and tracking progress",
      "Improves mood through endorphin release"
    ]
  }
};