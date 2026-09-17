import { HTMLAttributes } from "react";
import { cx } from "./utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds a lift-on-hover affordance for cards that act as buttons/links. */
  interactive?: boolean;
}

export function Card({ className, interactive, ...props }: CardProps) {
  return (
    <div
      className={cx(
        "rounded-2xl border border-gray-100 bg-white shadow-card",
        interactive &&
          "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated hover:border-gray-200",
        className,
      )}
      {...props}
    />
  );
}
