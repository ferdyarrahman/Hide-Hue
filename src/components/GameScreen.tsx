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

  const targetColor = hslToRgb(target.hue, target.saturation, target.brightness);

  return (
    <div className="relative h-[100dvh] h-screen overflow-hidden bg-cream">
      {/* Background Image - full screen */}
      <Image
        src={background}
        alt={levelName}
        fill
        sizes="100vw"
        style={{ objectFit: "cover" }}
        priority
      />

      {/* Header - overlay top */}
      <header className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 py-2 bg-black/30 backdrop-blur-sm z-20">
        <button
          onClick={handleBack}
          className="p-1.5 text-white hover:text-leaf transition-colors"
          aria-label="Back to home"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="text-center">
          <p className="text-[10px] text-white/80 leading-tight">Level {levelNumber}</p>
          <h2 className="text-sm font-bold text-white leading-tight">{levelName}</h2>
        </div>

        <div className="flex gap-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="relative w-4 h-4">
              <Image src="/assets/ui/ui_star.png" alt="Star" fill sizes="16px" style={{ objectFit: "contain", opacity: i <= stars ? 1 : 0.3 }} />
            </div>
          ))}
        </div>
      </header>

      {/* Target Hint - overlay top below header */}
      {showHint && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 animate-pulse z-20">
          <div className="w-3 h-3 rounded-full border border-white" style={{ backgroundColor: targetColor }} />
          <span className="text-[9px] text-white font-medium">Match this!</span>
        </div>
      )}

      {/* Chameleon - positioned above controls panel */}
      <div className="absolute left-1/2 -translate-x-1/2 z-10" style={{ bottom: 'calc(28% + 16px)' }}>
        <Chameleon
          expression={expression}
          hue={hue}
          saturation={saturation}
          brightness={brightness}
          size={100}
          useMain={true}
        />
      </div>

      {/* Controls Panel - fixed at bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm px-3 pt-2 pb-[max(12px,env(safe-area-inset-bottom))] rounded-t-2xl z-20">
        <div className="flex items-center justify-center gap-2 mb-1.5">
          <span className="text-[10px] text-forest font-semibold">TARGET:</span>
          <div className="w-4 h-4 rounded-full border border-forest shadow-sm" style={{ backgroundColor: targetColor }} />
          <span className="text-[10px] text-leaf">Match this color to hide!</span>
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
          <Button onClick={handleHide} size="sm" className="w-full">
            HIDE NOW
          </Button>
        </div>
      </div>
    </div>
  );
}
