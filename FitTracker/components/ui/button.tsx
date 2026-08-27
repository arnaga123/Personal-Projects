import { type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

export function buttonVariants(variant: ButtonVariant = "primary", className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold uppercase tracking-wide transition duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    variant === "primary" &&
      "bg-accent text-accent-foreground shadow-[0_0_0_0_rgba(255,179,64,0)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-4px_rgba(255,179,64,0.45)]",
    variant === "secondary" &&
      "border border-border text-foreground hover:-translate-y-0.5 hover:border-accent hover:text-accent hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.5)]",
    variant === "ghost" && "text-muted hover:text-foreground",
    className
  );
}

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button className={buttonVariants(variant, className)} {...props} />;
}
