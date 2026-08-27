"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signup } from "@/app/actions/auth";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <div>
      <h1 className="font-display text-2xl font-medium">Create your account</h1>
      <p className="mt-1 text-sm text-muted">Start logging today&apos;s session in under a minute.</p>
      <form action={action} className="mt-8 flex flex-col gap-5">
        <Field label="Name" name="name" required autoComplete="name" />
        <Field label="Email" name="email" type="email" required autoComplete="email" />
        <div className="flex flex-col gap-1.5">
          <Field
            label="Password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
          />
          <span className="text-xs text-muted">At least 8 characters.</span>
        </div>
        {state?.error && <p className="text-sm text-danger">{state.error}</p>}
        {state?.info && <p className="text-sm text-accent">{state.info}</p>}
        <Button type="submit" disabled={pending} className="mt-2">
          {pending ? "Creating account..." : "Sign up"}
        </Button>
      </form>
      <p className="mt-6 text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-foreground underline underline-offset-4">
          Log in
        </Link>
      </p>
    </div>
  );
}
