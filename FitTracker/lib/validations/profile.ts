import * as z from "zod";

export const ProfileSchema = z.object({
  name: z.string().min(1).max(80),
  goal: z.enum(["bulk", "cut", "maintain"]),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]),
  daysPerWeekPref: z.coerce.number().int().min(1).max(7),
});
