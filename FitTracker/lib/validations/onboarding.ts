import * as z from "zod";

export const OnboardingSchema = z.object({
  goal: z.enum(["bulk", "cut", "maintain"]),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]),
  daysPerWeekPref: z.coerce.number().int().min(1).max(7),
});
