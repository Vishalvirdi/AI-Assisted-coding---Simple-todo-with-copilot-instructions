import type { HTMLAttributes } from "react";

export default function Card(props: HTMLAttributes<HTMLElement>) {
  return (
    <section
      {...props}
      className={`rounded-3xl border border-line bg-white shadow-card ${props.className ?? ""}`}
    />
  );
}
