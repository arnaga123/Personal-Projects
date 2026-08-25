import * as z from "zod";

export const SignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").trim(),
  email: z.email("Enter a valid email.").trim(),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const LoginSchema = z.object({
  email: z.email("Enter a valid email.").trim(),
  password: z.string().min(1, "Password is required."),
});
