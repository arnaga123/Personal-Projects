export const MUSCLE_GROUPS = ["legs", "chest", "back", "shoulders", "arms", "core"] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];
