export interface ScheduledWorkout {
  id: string;
  name: string;
  date: string;
  dateObj: Date;
  duration: string;
  difficulty: string;
  focus: string[];
  day: string;
  exercises: Array<{
    name: string;
    sets: number;
    reps: string;
    rest: string;
    notes?: string;
    recommendedWeight?: string;
    recommendedRPE?: string;
    completed?: boolean;
    setDetails?: any[];
    exerciseNotes?: string;
  }>;
  isRestDay?: boolean;
  completed?: boolean;
}

// Master schedule of all workouts (past and future)
export const allScheduledWorkouts: ScheduledWorkout[] = [
  // Past workouts (completed)
  {
    id: 'workout-2025-10-20',
    name: 'Pull Day',
    date: 'Oct 20',
    dateObj: new Date('2025-10-20'),
    duration: '55 min',
    difficulty: 'Advanced',
    focus: ['Back', 'Biceps'],
    day: 'Monday',
    exercises: [
      { name: 'Pull-ups', sets: 4, reps: '8-10', rest: '90s', recommendedWeight: 'Bodyweight', recommendedRPE: '8/10' },
      { name: 'Barbell Rows', sets: 4, reps: '8-10', rest: '90s', recommendedWeight: '70kg', recommendedRPE: '8/10' },
      { name: 'Face Pulls', sets: 3, reps: '15-20', rest: '60s', recommendedWeight: '30kg', recommendedRPE: '7/10' },
      { name: 'Bicep Curls', sets: 3, reps: '12-15', rest: '45s', recommendedWeight: '15kg', recommendedRPE: '7/10' },
      { name: 'Hammer Curls', sets: 3, reps: '12-15', rest: '45s', recommendedWeight: '15kg', recommendedRPE: '7/10' },
    ],
  },
  {
    id: 'workout-2025-10-22',
    name: 'Cardio & Core',
    date: 'Oct 22',
    dateObj: new Date('2025-10-22'),
    duration: '40 min',
    difficulty: 'Intermediate',
    focus: ['Cardio', 'Core'],
    day: 'Wednesday',
    exercises: [
      { name: 'Running', sets: 1, reps: '25 min', rest: '0s', notes: '3.1 miles', recommendedWeight: 'Bodyweight', recommendedRPE: '7/10' },
      { name: 'Plank Hold', sets: 4, reps: '60s', rest: '30s', recommendedWeight: 'Bodyweight', recommendedRPE: '7/10' },
      { name: 'Russian Twists', sets: 3, reps: '25', rest: '30s', recommendedWeight: 'Bodyweight', recommendedRPE: '7/10' },
      { name: 'Leg Raises', sets: 3, reps: '15', rest: '30s', recommendedWeight: 'Bodyweight', recommendedRPE: '7/10' },
    ],
  },
  {
    id: 'workout-2025-10-24',
    name: 'Full Body Strength',
    date: 'Oct 24',
    dateObj: new Date('2025-10-24'),
    duration: '65 min',
    difficulty: 'Advanced',
    focus: ['Full Body', 'Strength'],
    day: 'Friday',
    exercises: [
      { name: 'Back Squat', sets: 5, reps: '5', rest: '3min', notes: 'Heavy day - 120 kg', recommendedWeight: '125kg', recommendedRPE: '9/10' },
      { name: 'Bench Press', sets: 5, reps: '5', rest: '3min', notes: '93 kg', recommendedWeight: '95kg', recommendedRPE: '9/10' },
      { name: 'Deadlift', sets: 3, reps: '5', rest: '3min', notes: '143 kg', recommendedWeight: '145kg', recommendedRPE: '9/10' },
      { name: 'Overhead Press', sets: 3, reps: '8', rest: '90s', recommendedWeight: '50kg', recommendedRPE: '8/10' },
    ],
  },
  {
    id: 'workout-2025-10-27',
    name: 'Active Recovery Yoga',
    date: 'Oct 27',
    dateObj: new Date('2025-10-27'),
    duration: '35 min',
    difficulty: 'Beginner',
    focus: ['Mobility', 'Flexibility'],
    day: 'Sunday',
    exercises: [
      { name: 'Yoga Flow', sets: 1, reps: '25 min', rest: '0s', recommendedWeight: 'Bodyweight', recommendedRPE: '5/10' },
      { name: 'Foam Rolling', sets: 1, reps: '10 min', rest: '0s', recommendedWeight: 'Bodyweight', recommendedRPE: '4/10' },
    ],
  },
  {
    id: 'workout-2025-10-29',
    name: 'Upper Body Hypertrophy',
    date: 'Oct 29',
    dateObj: new Date('2025-10-29'),
    duration: '62 min',
    difficulty: 'Advanced',
    focus: ['Chest', 'Back', 'Shoulders'],
    day: 'Tuesday',
    exercises: [
      { name: 'Incline Bench Press', sets: 4, reps: '10-12', rest: '90s', recommendedWeight: '70kg', recommendedRPE: '8/10' },
      { name: 'Lat Pulldown', sets: 4, reps: '10-12', rest: '75s', recommendedWeight: '75kg', recommendedRPE: '8/10' },
      { name: 'Dumbbell Flyes', sets: 3, reps: '12-15', rest: '60s', recommendedWeight: '18kg', recommendedRPE: '7/10' },
      { name: 'Cable Rows', sets: 4, reps: '10-12', rest: '75s', recommendedWeight: '70kg', recommendedRPE: '8/10' },
      { name: 'Lateral Raises', sets: 3, reps: '15-20', rest: '45s', recommendedWeight: '10kg', recommendedRPE: '7/10' },
    ],
  },
  {
    id: 'workout-2025-10-31',
    name: 'Lower Body Power',
    date: 'Oct 31',
    dateObj: new Date('2025-10-31'),
    duration: '58 min',
    difficulty: 'Advanced',
    focus: ['Legs', 'Glutes'],
    day: 'Thursday',
    exercises: [
      { name: 'Back Squat', sets: 4, reps: '6-8', rest: '2min', recommendedWeight: '115kg', recommendedRPE: '8/10' },
      { name: 'Romanian Deadlift', sets: 4, reps: '8-10', rest: '90s', recommendedWeight: '90kg', recommendedRPE: '8/10' },
      { name: 'Bulgarian Split Squats', sets: 3, reps: '10-12', rest: '75s', recommendedWeight: '20kg', recommendedRPE: '7/10' },
      { name: 'Leg Press', sets: 3, reps: '12-15', rest: '90s', recommendedWeight: '180kg', recommendedRPE: '7/10' },
      { name: 'Calf Raises', sets: 4, reps: '15-20', rest: '45s', recommendedWeight: '80kg', recommendedRPE: '7/10' },
    ],
  },
  {
    id: 'workout-2025-11-02',
    name: 'Push Day',
    date: 'Nov 2',
    dateObj: new Date('2025-11-02'),
    duration: '52 min',
    difficulty: 'Advanced',
    focus: ['Chest', 'Shoulders', 'Triceps'],
    day: 'Saturday',
    exercises: [
      { name: 'Bench Press', sets: 4, reps: '8-10', rest: '90s', recommendedWeight: '80kg', recommendedRPE: '8/10' },
      { name: 'Overhead Press', sets: 4, reps: '8-10', rest: '90s', recommendedWeight: '52.5kg', recommendedRPE: '8/10' },
      { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', rest: '75s', recommendedWeight: '27.5kg', recommendedRPE: '7/10' },
      { name: 'Lateral Raises', sets: 3, reps: '12-15', rest: '60s', recommendedWeight: '12.5kg', recommendedRPE: '7/10' },
      { name: 'Tricep Pushdowns', sets: 3, reps: '12-15', rest: '60s', recommendedWeight: '40kg', recommendedRPE: '7/10' },
    ],
  },
  {
    id: 'rest-2025-11-03',
    name: 'Rest Day',
    date: 'Nov 3',
    dateObj: new Date('2025-11-03'),
    duration: '0 min',
    difficulty: 'Rest',
    focus: ['Recovery'],
    day: 'Sunday',
    exercises: [],
    isRestDay: true,
  },
  {
    id: 'workout-2025-11-05',
    name: 'Leg Day',
    date: 'Nov 5',
    dateObj: new Date('2025-11-05'),
    duration: '60 min',
    difficulty: 'Advanced',
    focus: ['Legs', 'Glutes'],
    day: 'Tuesday',
    exercises: [
      { name: 'Front Squat', sets: 4, reps: '8-10', rest: '2min', recommendedWeight: '85kg', recommendedRPE: '8/10' },
      { name: 'Leg Press', sets: 4, reps: '12-15', rest: '90s', recommendedWeight: '200kg', recommendedRPE: '8/10' },
      { name: 'Walking Lunges', sets: 3, reps: '12 each', rest: '75s', recommendedWeight: '20kg dumbbells', recommendedRPE: '7/10' },
      { name: 'Leg Curls', sets: 3, reps: '12-15', rest: '60s', recommendedWeight: '50kg', recommendedRPE: '7/10' },
      { name: 'Calf Raises', sets: 4, reps: '20', rest: '45s', recommendedWeight: '90kg', recommendedRPE: '7/10' },
    ],
  },
  {
    id: 'workout-2025-11-07',
    name: 'Full Body Circuit',
    date: 'Nov 7',
    dateObj: new Date('2025-11-07'),
    duration: '45 min',
    difficulty: 'Intermediate',
    focus: ['Full Body', 'Conditioning'],
    day: 'Thursday',
    exercises: [
      { name: 'Kettlebell Swings', sets: 4, reps: '20', rest: '60s', recommendedWeight: '24kg', recommendedRPE: '7/10' },
      { name: 'Push-ups', sets: 4, reps: '15-20', rest: '60s', recommendedWeight: 'Bodyweight', recommendedRPE: '7/10' },
      { name: 'Goblet Squats', sets: 4, reps: '15', rest: '60s', recommendedWeight: '24kg', recommendedRPE: '7/10' },
      { name: 'Renegade Rows', sets: 3, reps: '12 each', rest: '60s', recommendedWeight: '16kg', recommendedRPE: '7/10' },
      { name: 'Burpees', sets: 3, reps: '10', rest: '60s', recommendedWeight: 'Bodyweight', recommendedRPE: '7/10' },
    ],
  },
  {
    id: 'workout-2025-11-09',
    name: 'Core & Abs Blast',
    date: 'Nov 9',
    dateObj: new Date('2025-11-09'),
    duration: '35 min',
    difficulty: 'Intermediate',
    focus: ['Core', 'Abs'],
    day: 'Saturday',
    exercises: [
      { name: 'Plank', sets: 4, reps: '60s', rest: '30s', recommendedWeight: 'Bodyweight', recommendedRPE: '7/10' },
      { name: 'Russian Twists', sets: 4, reps: '30', rest: '30s', recommendedWeight: '10kg plate', recommendedRPE: '7/10' },
      { name: 'Hanging Leg Raises', sets: 3, reps: '12-15', rest: '45s', recommendedWeight: 'Bodyweight', recommendedRPE: '7/10' },
      { name: 'Bicycle Crunches', sets: 3, reps: '25 each', rest: '30s', recommendedWeight: 'Bodyweight', recommendedRPE: '6/10' },
      { name: 'Dead Bug', sets: 3, reps: '20', rest: '30s', recommendedWeight: 'Bodyweight', recommendedRPE: '6/10' },
    ],
  },
  // Future workouts (upcoming)
  {
    id: 'workout-2025-11-11',
    name: 'Upper Body Power',
    date: 'Nov 11',
    dateObj: new Date('2025-11-11'),
    duration: '50 min',
    difficulty: 'Advanced',
    focus: ['Chest', 'Back', 'Arms'],
    day: 'Monday',
    exercises: [
      { name: 'Bench Press', sets: 4, reps: '8-10', rest: '90s', notes: 'Focus on controlled descent', recommendedWeight: '82.5kg', recommendedRPE: '8/10' },
      { name: 'Pull-ups', sets: 4, reps: '6-8', rest: '90s', recommendedWeight: 'BW+10kg', recommendedRPE: '8/10' },
      { name: 'Dumbbell Shoulder Press', sets: 3, reps: '10-12', rest: '60s', recommendedWeight: '22kg', recommendedRPE: '8/10' },
      { name: 'Barbell Rows', sets: 4, reps: '8-10', rest: '90s', recommendedWeight: '75kg', recommendedRPE: '8/10' },
      { name: 'Tricep Dips', sets: 3, reps: '10-12', rest: '60s', recommendedWeight: 'BW+7.5kg', recommendedRPE: '7/10' },
      { name: 'Bicep Curls', sets: 3, reps: '12-15', rest: '45s', recommendedWeight: '17.5kg', recommendedRPE: '7/10' },
    ],
  },
  {
    id: 'workout-2025-11-12',
    name: 'Lower Body Strength',
    date: 'Nov 12',
    dateObj: new Date('2025-11-12'),
    duration: '55 min',
    difficulty: 'Advanced',
    focus: ['Legs', 'Glutes', 'Hamstrings'],
    day: 'Tuesday',
    exercises: [
      { name: 'Back Squat', sets: 4, reps: '6-8', rest: '2min', notes: 'Progressive overload', recommendedWeight: '120kg', recommendedRPE: '8/10' },
      { name: 'Romanian Deadlift', sets: 4, reps: '8-10', rest: '90s', recommendedWeight: '95kg', recommendedRPE: '8/10' },
      { name: 'Leg Press', sets: 3, reps: '12-15', rest: '90s', recommendedWeight: '210kg', recommendedRPE: '7/10' },
      { name: 'Bulgarian Split Squats', sets: 3, reps: '10-12 each', rest: '75s', recommendedWeight: '22kg dumbbells', recommendedRPE: '7/10' },
      { name: 'Leg Curls', sets: 3, reps: '12-15', rest: '60s', recommendedWeight: '55kg', recommendedRPE: '7/10' },
      { name: 'Calf Raises', sets: 4, reps: '20', rest: '45s', recommendedWeight: '95kg', recommendedRPE: '7/10' },
    ],
  },
  {
    id: 'workout-2025-11-13',
    name: 'Active Recovery & Mobility',
    date: 'Nov 13',
    dateObj: new Date('2025-11-13'),
    duration: '30 min',
    difficulty: 'Beginner',
    focus: ['Mobility', 'Flexibility', 'Recovery'],
    day: 'Wednesday',
    exercises: [
      { name: 'Dynamic Stretching', sets: 1, reps: '10 min', rest: '0s', recommendedWeight: 'Bodyweight', recommendedRPE: '4/10' },
      { name: 'Yoga Flow', sets: 1, reps: '15 min', rest: '0s', recommendedWeight: 'Bodyweight', recommendedRPE: '5/10' },
      { name: 'Foam Rolling', sets: 1, reps: '5 min', rest: '0s', recommendedWeight: 'Bodyweight', recommendedRPE: '4/10' },
    ],
  },
  {
    id: 'workout-2025-11-14',
    name: 'Push & Core',
    date: 'Nov 14',
    dateObj: new Date('2025-11-14'),
    duration: '48 min',
    difficulty: 'Advanced',
    focus: ['Chest', 'Shoulders', 'Triceps', 'Core'],
    day: 'Thursday',
    exercises: [
      { name: 'Incline Bench Press', sets: 4, reps: '8-10', rest: '90s', recommendedWeight: '72.5kg', recommendedRPE: '8/10' },
      { name: 'Overhead Press', sets: 4, reps: '8-10', rest: '90s', recommendedWeight: '55kg', recommendedRPE: '8/10' },
      { name: 'Dips', sets: 3, reps: '10-12', rest: '75s', recommendedWeight: 'BW+10kg', recommendedRPE: '7/10' },
      { name: 'Cable Flyes', sets: 3, reps: '12-15', rest: '60s', recommendedWeight: '25kg each', recommendedRPE: '7/10' },
      { name: 'Plank', sets: 3, reps: '60s', rest: '30s', recommendedWeight: 'Bodyweight', recommendedRPE: '7/10' },
    ],
  },
  {
    id: 'rest-2025-11-15',
    name: 'Rest Day',
    date: 'Nov 15',
    dateObj: new Date('2025-11-15'),
    duration: '0 min',
    difficulty: 'Rest',
    focus: ['Recovery'],
    day: 'Friday',
    exercises: [],
    isRestDay: true,
  },
  {
    id: 'workout-2025-11-16',
    name: 'Pull & Biceps',
    date: 'Nov 16',
    dateObj: new Date('2025-11-16'),
    duration: '52 min',
    difficulty: 'Advanced',
    focus: ['Back', 'Biceps'],
    day: 'Saturday',
    exercises: [
      { name: 'Deadlift', sets: 4, reps: '6-8', rest: '2min', recommendedWeight: '150kg', recommendedRPE: '8/10' },
      { name: 'Pull-ups', sets: 4, reps: '8-10', rest: '90s', recommendedWeight: 'BW+12.5kg', recommendedRPE: '8/10' },
      { name: 'Barbell Rows', sets: 4, reps: '8-10', rest: '90s', recommendedWeight: '77.5kg', recommendedRPE: '8/10' },
      { name: 'Face Pulls', sets: 3, reps: '15-20', rest: '60s', recommendedWeight: '35kg', recommendedRPE: '7/10' },
      { name: 'Hammer Curls', sets: 3, reps: '12-15', rest: '45s', recommendedWeight: '17.5kg', recommendedRPE: '7/10' },
    ],
  },
  {
    id: 'rest-2025-11-17',
    name: 'Rest Day',
    date: 'Nov 17',
    dateObj: new Date('2025-11-17'),
    duration: '0 min',
    difficulty: 'Rest',
    focus: ['Recovery'],
    day: 'Sunday',
    exercises: [],
    isRestDay: true,
  },
];

// Helper function to get today's workout based on completed workouts
export const getTodaysWorkout = (completedWorkoutIds: Set<string>) => {
  const upcomingWorkouts = allScheduledWorkouts
    .filter(w => !completedWorkoutIds.has(w.id) && !w.isRestDay)
    .slice(0, 1);
  
  if (upcomingWorkouts.length === 0) {
    return null;
  }

  const workout = upcomingWorkouts[0];
  const today = new Date('2025-11-11');
  const daysDiff = Math.floor((workout.dateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  let scheduled;
  if (daysDiff === 0) {
    scheduled = 'Today, 6:00 PM';
  } else if (daysDiff === 1) {
    scheduled = 'Tomorrow, 6:00 PM';
  } else {
    scheduled = `${workout.day}, 6:00 PM`;
  }

  return {
    ...workout,
    scheduled,
    completed: false,
  };
};
