"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Chameleon, ChameleonExpression } from "@/components/Chameleon";
import { ColorControls } from "@/components/ColorControls";
import { ColorValue } from "@/game/engine/camouflage";
import { useAudio } from "@/hooks/useAudio";

interface GameScreenProps {
  levelNumber: number;
  levelName: string;
  background: string;
  target: ColorValue;
  playerStart: ColorValue;
  stars?: number;
  onHide: (colors: ColorValue) => void;
  onBack: () => void;
}

function hslToRgb(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color);
  };
  return `rgb(${f(0)}, ${f(8)}, ${f(4)})`;
}

export function GameScreen({
  levelNumber,
  levelName,
  background,
  target,
  playerStart,
  stars = 0,
  onHide,
  onBack,
}: GameScreenProps) {
  const [hue, setHue] = useState(playerStart.hue);
  const [saturation, setSaturation] = useState(playerStart.saturation);
  const [brightness, setBrightness] = useState(playerStart.brightness);
  const [expression, setExpression] = useState<ChameleonExpression>("idle");
  const [showHint, setShowHint] = useState(true);
  const { audio } = useAudio();

  useEffect(() => {
    setHue(playerStart.hue);
    setSaturation(playerStart.saturation);
    setBrightness(playerStart.brightness);
    setExpression("idle");
  }, [playerStart, target]);

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleHueChange = useCallback((value: number) => {
    setHue(value);
    audio.playSliderChange();
  }, [audio]);

  const handleSaturationChange = useCallback((value: number) => {
    setSaturation(value);
    audio.playSliderChange();
  }, [audio]);

  const handleBrightnessChange = useCallback((value: number) => {
    setBrightness(value);
    audio.playSliderChange();
  }, [audio]);

  const handleHide = useCallback(() => {
    audio.playHideButton();
    setExpression("hiding");
    onHide({ hue, saturation, brightness });
  }, [audio, hue, saturation, brightness, onHide]);

  const handleBack = useCallback(() => {
    audio.playClick();
    onBack();
  }, [audio, onBack]);

  const playerColor = hslToRgb(hue, saturation, brightness);
  const targetColor = hslToRgb(target.hue, target.saturation, target.brightness);

  return (
    <div className="flex flex-col h-screen bg-cream">
      {/* Game Header */}
      <header className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm z-10">
        <button
          onClick={handleBack}
          className="p-2 text-forest hover:text-leaf transition-colors"
          aria-label="Back to home"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="text-center">
          <p className="text-sm text-leaf">Level {levelNumber}</p>
          <h2 className="text-lg font-bold text-forest">{levelName}</h2>
        </div>

        <div className="flex gap-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="relative w-5 h-5">
              <Image
                src="/assets/ui/ui_star.png"
                alt="Star"
                fill
                sizes="20px"
                style={{
                  objectFit: "contain",
                  opacity: i <= stars ? 1 : 0.3,
                }}
              />
            </div>
          ))}
        </div>
      </header>

      {/* Environment Stage */}
      <div className="flex-1 relative overflow-hidden">
        {/* Background Image */}
        <Image
          src={background}
          alt={levelName}
          fill
          sizes="100vw"
          style={{
            objectFit: "cover",
          }}
          priority
        />

        {/* Target Color Hint */}
        {showHint && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-2xl p-3 flex items-center gap-3 animate-pulse z-20">
            <div className="flex items-center gap-2">
              <span className="text-sm text-forest font-semibold">Target:</span>
              <div
                className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                style={{ backgroundColor: targetColor }}
              />
            </div>
            <span className="text-xs text-leaf">Match this color!</span>
          </div>
        )}

        {/* Hiding zone indicator */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-32 h-32 border-2 border-dashed border-white/50 rounded-full" />

        {/* Chameleon */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2">
          <Chameleon
            expression={expression}
            hue={hue}
            saturation={saturation}
            brightness={brightness}
            size={120}
            useMain={true}
          />
        </div>
      </div>

      {/* Color Controls */}
      <div className="bg-white/90 backdrop-blur-sm px-3 pt-2 pb-3 rounded-t-3xl z-10">
        {/* Color Comparison */}
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="text-center">
            <div
              className="w-10 h-10 rounded-full border-2 border-forest shadow-md mx-auto"
              style={{ backgroundColor: playerColor }}
            />
            <span className="text-[10px] text-leaf mt-0.5 block">Your Color</span>
          </div>
          <div className="text-xl text-forest">→</div>
          <div className="text-center">
            <div
              className="w-10 h-10 rounded-full border-2 border-forest shadow-md mx-auto"
              style={{ backgroundColor: targetColor }}
            />
            <span className="text-[10px] text-leaf mt-0.5 block">Target</span>
          </div>
        </div>

        <ColorControls
          hue={hue}
          saturation={saturation}
          brightness={brightness}
          onHueChange={handleHueChange}
          onSaturationChange={handleSaturationChange}
          onBrightnessChange={handleBrightnessChange}
        />

        {/* Hide Button */}
        <div className="mt-3">
          <Button
            onClick={handleHide}
            size="md"
            className="w-full"
          >
            HIDE NOW
          </Button>
        </div>
      </div>
    </div>
  );
}
