import type { InputHTMLAttributes } from "react";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function Checkbox({ label, className = "", ...props }: CheckboxProps) {
  return (
    <input
      {...props}
      aria-label={props["aria-label"] ?? label}
      className={`size-5 shrink-0 cursor-pointer accent-sage focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage ${className}`}
      type="checkbox"
    />
  );
}
