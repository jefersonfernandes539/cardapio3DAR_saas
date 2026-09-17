import { HTMLAttributes } from "react";
import { cx } from "./utils";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "brand" | "dark" | "neutral" | "success";
}

const VARIANT_CLASSES: Record<NonNullable<BadgeProps["variant"]>, string> = {
  brand: "bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100",
  dark: "bg-gray-900/85 text-white backdrop-blur-sm",
  neutral: "bg-gray-100 text-gray-600",
  success: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100",
};

export function Badge({ className, variant = "brand", ...props }: BadgeProps) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    />
  );
}
