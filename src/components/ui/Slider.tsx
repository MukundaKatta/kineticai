"use client";

import { cn } from "@/utils/cn";

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  className?: string;
  showValue?: boolean;
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
  className,
  showValue = true,
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-surface-600">{label}</label>
        {showValue && (
          <span className="text-xs font-mono text-surface-500">
            {value}
            {unit}
          </span>
        )}
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-surface-200 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:bg-kinetic-600 [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-sm
            [&::-webkit-slider-thumb]:hover:bg-kinetic-700 [&::-webkit-slider-thumb]:transition-colors"
          style={{
            background: `linear-gradient(to right, #4c6ef5 0%, #4c6ef5 ${percentage}%, #e9ecef ${percentage}%, #e9ecef 100%)`,
          }}
        />
      </div>
    </div>
  );
}
