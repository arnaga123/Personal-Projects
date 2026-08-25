import { type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

export function buttonVariants(variant: ButtonVariant = "primary", className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold uppercase tracking-wide transition-colors disabled:pointer-events-none disabled:opacity-40",
    variant === "primary" && "bg-accent text-accent-foreground hover:bg-accent/90",
    variant === "secondary" &&
      "border border-border text-foreground hover:border-accent hover:text-accent",
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
