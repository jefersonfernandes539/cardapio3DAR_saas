import { ButtonHTMLAttributes, forwardRef } from "react";
import { cx } from "./utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-brand-600 text-white shadow-glow hover:bg-brand-700 active:bg-brand-800",
  secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-200",
  ghost: "bg-transparent text-gray-600 hover:bg-gray-100 active:bg-gray-200",
  outline: "border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50",
};

const SIZE_CLASSES: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "text-sm px-3 py-1.5 gap-1.5",
  md: "text-sm px-4 py-2.5 gap-2",
  lg: "text-base px-5 py-3.5 gap-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cx(
        "inline-flex items-center justify-center rounded-full font-semibold tracking-tight transition-all duration-150",
        "active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
