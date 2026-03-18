"use client";

import { cn } from "@/utils/cn";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  className?: string;
  size?: "sm" | "md";
}

export function Select({
  label,
  value,
  options,
  onChange,
  className,
  size = "md",
}: SelectProps) {
  const sizes = {
    sm: "h-8 text-xs px-2",
    md: "h-10 text-sm px-3",
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label className="text-xs font-medium text-surface-600">{label}</label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full rounded-lg border border-surface-300 bg-white text-surface-800",
          "focus:outline-none focus:ring-2 focus:ring-kinetic-500 focus:border-transparent",
          "cursor-pointer transition-colors hover:border-surface-400",
          sizes[size]
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
