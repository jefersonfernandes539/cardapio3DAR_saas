import { HTMLAttributes } from "react";
import { cx } from "./utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx("rounded-2xl bg-white shadow-card border border-gray-100", className)}
      {...props}
    />
  );
}
