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
        <div className="flex items-center justify-between mb-0">
          <label className="text-[10px] font-semibold text-forest">
            {label}
          </label>
          <span className="text-[10px] text-leaf">
            {value}{unit}
          </span>
        </div>
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          value={value}
          className={`w-full h-1.5 bg-gradient-to-r ${sliderGradient} rounded-lg appearance-none cursor-pointer`}
          {...props}
        />
      </div>
    );
  }
);

ColorSlider.displayName = "ColorSlider";
