import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

const variantClasses = {
  primary:
    "bg-ink text-white hover:bg-ink/90 focus-visible:outline-ink disabled:bg-ink/40",
  secondary:
    "bg-sage text-ink hover:bg-sage/80 focus-visible:outline-sage disabled:bg-sage/50",
  ghost:
    "bg-transparent text-muted hover:bg-surface-strong focus-visible:outline-sage",
  danger:
    "bg-transparent text-danger hover:bg-danger/10 focus-visible:outline-danger",
};

export default function Button({
  variant = "secondary",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
