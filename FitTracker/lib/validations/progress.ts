import * as z from "zod";

export const BodyMetricSchema = z.object({
  date: z.string().min(1, "Pick a date."),
  weight: z.coerce.number().positive().optional(),
  chest: z.coerce.number().positive().optional(),
  waist: z.coerce.number().positive().optional(),
  arms: z.coerce.number().positive().optional(),
});
