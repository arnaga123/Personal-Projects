import { type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

export function buttonVariants(variant: ButtonVariant = "primary", className?: string) {
  return cn(
    // Nike button-primary/secondary: full pill, no radius scale — every CTA
    // in the system is rounded-full. Press feedback is a scaled-down,
    // dimmed "tap collapse" (toned down from the doc's literal scale(0.5)/
    // opacity 0.5, which reads as broken rather than snappy on a wide
    // desktop button).
    "inline-flex items-center justify-center gap-2 rounded-full px-8 py-3 text-sm font-medium transition duration-150 active:scale-95 active:opacity-70 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/10 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    variant === "primary" && "bg-accent text-accent-foreground hover:opacity-90",
    variant === "secondary" &&
      "bg-surface text-foreground hover:bg-surface-hover",
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
