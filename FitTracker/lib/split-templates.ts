export type SplitTemplateDay = { name: string; exerciseNames: string[] };
export type SplitTemplate = { name: string; daysPerWeek: number; days: SplitTemplateDay[] };

export const SPLIT_TEMPLATES: SplitTemplate[] = [
  {
    name: "Full Body",
    daysPerWeek: 3,
    days: [
      { name: "Day 1", exerciseNames: ["Barbell Back Squat", "Barbell Bench Press", "Barbell Row", "Plank"] },
      {
        name: "Day 2",
        exerciseNames: ["Romanian Deadlift", "Overhead Press", "Lat Pulldown", "Hanging Leg Raise"],
      },
      {
        name: "Day 3",
        exerciseNames: ["Leg Press", "Incline Dumbbell Press", "Seated Cable Row", "Cable Crunch"],
      },
    ],
  },
  {
    name: "Upper / Lower",
    daysPerWeek: 4,
    days: [
      {
        name: "Upper A",
        exerciseNames: ["Barbell Bench Press", "Barbell Row", "Overhead Press", "Barbell Curl", "Tricep Pushdown"],
      },
      {
        name: "Lower A",
        exerciseNames: ["Barbell Back Squat", "Romanian Deadlift", "Leg Extension", "Standing Calf Raise"],
      },
      {
        name: "Upper B",
        exerciseNames: ["Incline Dumbbell Press", "Lat Pulldown", "Lateral Raise", "Hammer Curl", "Skull Crusher"],
      },
      {
        name: "Lower B",
        exerciseNames: ["Deadlift", "Bulgarian Split Squat", "Lying Leg Curl", "Seated Calf Raise"],
      },
    ],
  },
  {
    name: "Push Pull Legs",
    daysPerWeek: 6,
    days: [
      {
        name: "Push A",
        exerciseNames: [
          "Barbell Bench Press",
          "Overhead Press",
          "Incline Dumbbell Press",
          "Lateral Raise",
          "Tricep Pushdown",
        ],
      },
      {
        name: "Pull A",
        exerciseNames: ["Deadlift", "Pull-Up", "Barbell Row", "Barbell Curl", "Face Pull"],
      },
      {
        name: "Legs A",
        exerciseNames: ["Barbell Back Squat", "Romanian Deadlift", "Leg Press", "Standing Calf Raise"],
      },
      {
        name: "Push B",
        exerciseNames: ["Decline Barbell Press", "Arnold Press", "Dips", "Cable Lateral Raise", "Skull Crusher"],
      },
      {
        name: "Pull B",
        exerciseNames: ["Rack Pull", "Chin-Up", "T-Bar Row", "Hammer Curl", "Straight-Arm Pulldown"],
      },
      {
        name: "Legs B",
        exerciseNames: ["Front Squat", "Bulgarian Split Squat", "Lying Leg Curl", "Seated Calf Raise"],
      },
    ],
  },
  {
    name: "Bro Split",
    daysPerWeek: 5,
    days: [
      {
        name: "Chest",
        exerciseNames: ["Barbell Bench Press", "Incline Barbell Press", "Dumbbell Fly", "Dips", "Pec Deck"],
      },
      {
        name: "Back",
        exerciseNames: ["Deadlift", "Pull-Up", "Barbell Row", "Seated Cable Row", "Straight-Arm Pulldown"],
      },
      {
        name: "Shoulders",
        exerciseNames: ["Overhead Press", "Arnold Press", "Lateral Raise", "Rear Delt Fly", "Shrug"],
      },
      {
        name: "Arms",
        exerciseNames: ["Barbell Curl", "Preacher Curl", "Close-Grip Bench Press", "Tricep Pushdown", "Hammer Curl"],
      },
      {
        name: "Legs",
        exerciseNames: ["Barbell Back Squat", "Romanian Deadlift", "Leg Press", "Walking Lunge", "Standing Calf Raise"],
      },
    ],
  },
];

export type ResolvedSplitTemplate = {
  name: string;
  daysPerWeek: number;
  days: { name: string; exercises: { id: string; name: string }[] }[];
};

export function resolveSplitTemplates(
  exercises: { id: string; name: string }[]
): ResolvedSplitTemplate[] {
  const byName = new Map(exercises.map((e) => [e.name, e]));

  return SPLIT_TEMPLATES.map((template) => ({
    name: template.name,
    daysPerWeek: template.daysPerWeek,
    days: template.days.map((day) => ({
      name: day.name,
      exercises: day.exerciseNames
        .map((n) => byName.get(n))
        .filter((e): e is { id: string; name: string } => Boolean(e)),
    })),
  }));
}
