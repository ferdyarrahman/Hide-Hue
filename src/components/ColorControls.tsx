"use client";

import { ColorSlider } from "@/components/ui/ColorSlider";

interface ColorControlsProps {
  hue: number;
  saturation: number;
  brightness: number;
  onHueChange: (value: number) => void;
  onSaturationChange: (value: number) => void;
  onBrightnessChange: (value: number) => void;
}

export function ColorControls({
  hue,
  saturation,
  brightness,
  onHueChange,
  onSaturationChange,
  onBrightnessChange,
}: ColorControlsProps) {
  return (
    <div className="space-y-2">
      <ColorSlider
        label="HUE"
        value={hue}
        min={0}
        max={360}
        unit="°"
        gradient="from-red-500 via-green-500 to-blue-500"
        onChange={(e) => onHueChange(Number(e.target.value))}
      />

      <ColorSlider
        label="SATURATION"
        value={saturation}
        min={0}
        max={100}
        unit="%"
        gradient="from-gray-300 to-green-500"
        onChange={(e) => onSaturationChange(Number(e.target.value))}
      />

      <ColorSlider
        label="BRIGHTNESS"
        value={brightness}
        min={0}
        max={100}
        unit="%"
        gradient="from-black to-white"
        onChange={(e) => onBrightnessChange(Number(e.target.value))}
      />
    </div>
  );
}
