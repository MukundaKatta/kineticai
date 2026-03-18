"use client";

import { cn } from "@/utils/cn";

interface ToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export function Toggle({ label, description, checked, onChange, className }: ToggleProps) {
  return (
    <label className={cn("flex items-center justify-between cursor-pointer group", className)}>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-surface-700 group-hover:text-surface-900 transition-colors">
          {label}
        </span>
        {description && (
          <p className="text-xs text-surface-500 mt-0.5">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200 ease-in-out",
          "focus:outline-none focus:ring-2 focus:ring-kinetic-500 focus:ring-offset-2",
          checked ? "bg-kinetic-600" : "bg-surface-300"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
            checked ? "translate-x-5" : "translate-x-0.5"
          )}
          style={{ marginTop: "2px" }}
        />
      </button>
    </label>
  );
}
