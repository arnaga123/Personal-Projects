import * as z from "zod";
import { MUSCLE_GROUPS } from "@/lib/muscle-groups";

export const ExerciseSchema = z.object({
  name: z.string().min(2, "Name is too short.").max(80),
  muscleGroup: z.enum(MUSCLE_GROUPS),
  equipment: z.string().max(60).optional(),
  description: z.string().max(200).optional(),
  instructions: z.string().max(1000).optional(),
  restSeconds: z.coerce.number().int().min(15).max(600).optional(),
  secondaryMuscleGroups: z.array(z.enum(MUSCLE_GROUPS)).max(5).default([]),
});
