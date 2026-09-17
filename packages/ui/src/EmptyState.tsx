import { ReactNode } from "react";
import { cx } from "./utils";

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: {
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 px-6 py-16 text-center",
        className,
      )}
    >
      {icon && (
        <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-white text-gray-400 shadow-card">
          {icon}
        </div>
      )}
      <p className="font-semibold text-gray-800">{title}</p>
      {description && <p className="max-w-xs text-sm text-gray-500">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
