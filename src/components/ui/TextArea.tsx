"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, hint, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="text-xs font-medium text-surface-600">{label}</label>
        )}
        <textarea
          ref={ref}
          className={cn(
            "w-full rounded-lg border border-surface-300 bg-white px-3 py-2.5 text-sm text-surface-800",
            "placeholder:text-surface-400 resize-none",
            "focus:outline-none focus:ring-2 focus:ring-kinetic-500 focus:border-transparent",
            "transition-colors hover:border-surface-400",
            error && "border-accent-red focus:ring-accent-red",
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs text-surface-500">{hint}</p>
        )}
        {error && <p className="text-xs text-accent-red">{error}</p>}
      </div>
    );
  }
);

TextArea.displayName = "TextArea";

export { TextArea };
