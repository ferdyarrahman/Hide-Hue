"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface ColorSliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  gradient?: string;
}

export const ColorSlider = forwardRef<HTMLInputElement, ColorSliderProps>(
  ({ label, value, min, max, unit = "", gradient, className = "", ...props }, ref) => {
    const defaultGradient = "from-gray-300 to-gray-500";
    const sliderGradient = gradient || defaultGradient;

    return (
      <div className={className}>
        <div className="flex items-center justify-between mb-0.5">
          <label className="text-xs font-semibold text-forest">
            {label}
          </label>
          <span className="text-xs text-leaf">
            {value}{unit}
          </span>
        </div>
        <div className="relative">
          <input
            ref={ref}
            type="range"
            min={min}
            max={max}
            value={value}
            className={`w-full h-2 bg-gradient-to-r ${sliderGradient} rounded-lg appearance-none cursor-pointer`}
            {...props}
          />
        </div>
      </div>
    );
  }
);

ColorSlider.displayName = "ColorSlider";
