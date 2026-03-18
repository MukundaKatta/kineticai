"use client";

import { cn } from "@/utils/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, padding = "md", hover = false, onClick }: CardProps) {
  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-surface-200 shadow-sm",
        paddings[padding],
        hover && "hover:shadow-md hover:border-surface-300 transition-all duration-200 cursor-pointer",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
