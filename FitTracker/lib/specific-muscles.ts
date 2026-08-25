import type { MuscleGroup } from "@/lib/muscle-groups";

export const SPECIFIC_MUSCLES = [
  "anterior_deltoid",
  "lateral_deltoid",
  "posterior_deltoid",
  "upper_pectoralis",
  "lower_pectoralis",
  "biceps_brachii",
  "brachialis",
  "brachioradialis",
  "triceps_brachii",
  "trapezius",
  "latissimus_dorsi",
  "rectus_abdominis",
  "obliques",
  "quadriceps",
  "hamstrings",
  "gluteus_maximus",
  "gastrocnemius",
] as const;

export type SpecificMuscle = (typeof SPECIFIC_MUSCLES)[number];

export const SPECIFIC_MUSCLE_LABELS: Record<SpecificMuscle, string> = {
  anterior_deltoid: "Front Delts",
  lateral_deltoid: "Side Delts",
  posterior_deltoid: "Rear Delts",
  upper_pectoralis: "Upper Chest",
  lower_pectoralis: "Chest",
  biceps_brachii: "Biceps",
  brachialis: "Brachialis",
  brachioradialis: "Brachioradialis",
  triceps_brachii: "Triceps",
  trapezius: "Traps",
  latissimus_dorsi: "Lats",
  rectus_abdominis: "Abs",
  obliques: "Obliques",
  quadriceps: "Quads",
  hamstrings: "Hamstrings",
  gluteus_maximus: "Glutes",
  gastrocnemius: "Calves",
};

// Fallback mapping so any specific muscle can still be matched against the
// broad muscle_group filter used elsewhere in the app (exercise list,
// dashboard stats) without needing every exercise re-tagged.
export const SPECIFIC_MUSCLE_BROAD_GROUP: Record<SpecificMuscle, MuscleGroup> = {
  anterior_deltoid: "shoulders",
  lateral_deltoid: "shoulders",
  posterior_deltoid: "shoulders",
  upper_pectoralis: "chest",
  lower_pectoralis: "chest",
  biceps_brachii: "arms",
  brachialis: "arms",
  brachioradialis: "arms",
  triceps_brachii: "arms",
  trapezius: "back",
  latissimus_dorsi: "back",
  rectus_abdominis: "core",
  obliques: "core",
  quadriceps: "legs",
  hamstrings: "legs",
  gluteus_maximus: "legs",
  gastrocnemius: "legs",
};

export function isSpecificMuscle(value: string | null | undefined): value is SpecificMuscle {
  return !!value && (SPECIFIC_MUSCLES as readonly string[]).includes(value);
}
