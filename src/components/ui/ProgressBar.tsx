"use client";

import { cn } from "@/utils/cn";

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning" | "danger";
  animated?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = true,
  size = "md",
  variant = "default",
  animated = true,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);

  const sizes = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  const variants = {
    default: "bg-kinetic-500",
    success: "bg-accent-green",
    warning: "bg-accent-orange",
    danger: "bg-accent-red",
  };

  return (
    <div className={cn("space-y-1", className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-xs font-medium text-surface-600">{label}</span>}
          {showPercentage && (
            <span className="text-xs font-mono text-surface-500">{percentage}%</span>
          )}
        </div>
      )}
      <div className={cn("w-full bg-surface-200 rounded-full overflow-hidden", sizes[size])}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            variants[variant],
            animated && percentage < 100 && "animate-pulse-slow"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
