"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginSchema, SignupSchema } from "@/lib/validations/auth";

export type AuthState = { error?: string; info?: string } | undefined;

// Supabase's raw error strings are written for developers, not the person
// filling out the form — "email rate limit exceeded" reads like an accusation
// ("you've used this email too many times") when it actually means Supabase's
// own outgoing-email quota (very low on the free tier) is temporarily
// exhausted for the whole project, not anything the user did wrong.
function friendlyAuthError(message: string): string {
  if (message.toLowerCase().includes("rate limit")) {
    return "We're sending too many emails right now — please wait a few minutes and try again.";
  }
  if (message.toLowerCase().includes("email not confirmed")) {
    return "Please confirm your email first — check your inbox for the confirmation link we sent.";
  }
  return message;
}

export async function login(_state: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: friendlyAuthError(error.message) };
  }

  redirect("/dashboard");
}

export async function signup(_state: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = SignupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { name, email, password } = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });

  if (error) {
    return { error: friendlyAuthError(error.message) };
  }

  // With email confirmation enabled (the current project setting), signUp
  // succeeds and creates the account but returns no session until the user
  // clicks the confirmation link — redirecting to /onboarding here would
  // just bounce them straight back to /login with nothing to show for it,
  // since proxy.ts has nothing to authenticate. Tell them what actually
  // happened instead.
  if (!data.session) {
    return { info: `Almost there — we sent a confirmation link to ${email}. Click it, then log in.` };
  }

  redirect("/onboarding");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
