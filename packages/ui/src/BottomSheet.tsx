"use client";

import { ReactNode, useEffect } from "react";
import { cx } from "./utils";

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

/**
 * Mobile-first bottom sheet used by apps/menu to show dish details.
 * Controlled component: the parent owns `open` state (e.g. selected dish id).
 */
export function BottomSheet({ open, onClose, children, className }: BottomSheetProps) {
  // Lock body scroll while the sheet is open so the page behind it doesn't
  // scroll along with a swipe inside the sheet.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        aria-label="Fechar"
        className="absolute inset-0 bg-gray-900/50 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cx(
          "relative w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-t-sheet bg-white shadow-sheet animate-slide-up",
          className,
        )}
      >
        <div className="sticky top-0 z-10 flex justify-center bg-white/95 backdrop-blur pt-3">
          <span className="h-1.5 w-10 rounded-full bg-gray-200" />
        </div>
        {children}
      </div>
    </div>
  );
}
