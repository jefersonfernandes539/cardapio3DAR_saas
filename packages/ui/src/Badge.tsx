import { HTMLAttributes } from "react";
import { cx } from "./utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-700",
        className,
      )}
      {...props}
    />
  );
}
