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
    <div className="flex flex-col h-[100dvh] h-screen bg-cream">
      {/* Game Header */}
      <header className="flex items-center justify-between px-3 py-2 bg-white/80 backdrop-blur-sm z-10 shrink-0">
        <button
          onClick={handleBack}
          className="p-1.5 text-forest hover:text-leaf transition-colors"
          aria-label="Back to home"
        >
          <svg
            width="22"
            height="22"
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
          <p className="text-xs text-leaf leading-tight">Level {levelNumber}</p>
          <h2 className="text-base font-bold text-forest leading-tight">{levelName}</h2>
        </div>

        <div className="flex gap-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="relative w-4 h-4">
              <Image
                src="/assets/ui/ui_star.png"
                alt="Star"
                fill
                sizes="16px"
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
      <div className="flex-1 min-h-0 relative overflow-hidden">
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

        {showHint && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 flex items-center gap-2 animate-pulse z-20">
            <span className="text-xs text-forest font-semibold">Target:</span>
            <div
              className="w-5 h-5 rounded-full border-2 border-white shadow-md"
              style={{ backgroundColor: targetColor }}
            />
            <span className="text-[10px] text-leaf">Match this color!</span>
          </div>
        )}

        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-28 h-28 border-2 border-dashed border-white/50 rounded-full" />

        <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
          <Chameleon
            expression={expression}
            hue={hue}
            saturation={saturation}
            brightness={brightness}
            size={100}
            useMain={true}
          />
        </div>
      </div>

      {/* Color Controls */}
      <div className="bg-white/95 backdrop-blur-sm px-3 pt-2 pb-3 rounded-t-2xl z-10 shrink-0">
        {/* Color Comparison */}
        <div className="flex items-center justify-center gap-3 mb-1.5">
          <div className="flex items-center gap-1.5">
            <div
              className="w-7 h-7 rounded-full border-2 border-forest shadow-sm"
              style={{ backgroundColor: playerColor }}
            />
            <span className="text-[10px] text-leaf">You</span>
          </div>
          <div className="text-lg text-forest">→</div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-7 h-7 rounded-full border-2 border-forest shadow-sm"
              style={{ backgroundColor: targetColor }}
            />
            <span className="text-[10px] text-leaf">Target</span>
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

        <div className="mt-2">
          <Button
            onClick={handleHide}
            size="sm"
            className="w-full"
          >
            HIDE NOW
          </Button>
        </div>
      </div>
    </div>
  );
}
