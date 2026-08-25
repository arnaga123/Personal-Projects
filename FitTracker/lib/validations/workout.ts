import * as z from "zod";

export const WorkoutSetSchema = z.object({
  exerciseId: z.uuid(),
  reps: z.coerce.number().int().positive(),
  weight: z.coerce.number().nonnegative(),
  unit: z.enum(["lb", "kg"]),
});

export const WorkoutSchema = z.object({
  date: z.string().min(1, "Pick a date."),
  notes: z.string().max(500).optional(),
  sets: z.array(WorkoutSetSchema),
});
