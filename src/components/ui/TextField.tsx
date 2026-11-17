import type { InputHTMLAttributes } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function TextField({
  label,
  id,
  className = "",
  ...props
}: TextFieldProps) {
  return (
    <div className="flex-1">
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={`w-full rounded-full border border-line bg-surface px-5 py-3.5 text-ink outline-none transition placeholder:text-muted focus:border-sage focus:ring-4 focus:ring-sage/20 ${className}`}
        {...props}
      />
    </div>
  );
}
