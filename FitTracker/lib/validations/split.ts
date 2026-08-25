import * as z from "zod";

export const SplitDaySchema = z.object({
  name: z.string().min(1).max(60),
  exerciseIds: z.array(z.uuid()),
});

export const SplitSchema = z.object({
  name: z.string().min(1, "Name your split.").max(60),
  daysPerWeek: z.coerce.number().int().min(1).max(7),
  days: z.array(SplitDaySchema).min(1, "Add at least one day."),
});
