"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAudio } from "@/hooks/useAudio";

interface HomeScreenProps {
  onPlay: () => void;
  onContinue: () => void;
  onSettings: () => void;
  hasProgress?: boolean;
}

export function HomeScreen({
  onPlay,
  onContinue,
  onSettings,
  hasProgress = false,
}: HomeScreenProps) {
  const [showSplash, setShowSplash] = useState(true);
  const { isMuted, toggleMute, audio } = useAudio();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handlePlay = () => {
    audio.playClick();
    onPlay();
  };

  const handleContinue = () => {
    audio.playClick();
    onContinue();
  };

  if (showSplash) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-leaf/20 to-cream">
        <div className="relative w-32 h-32 animate-bounce">
          <Image
            src="/assets/characters/chameleon_idle.png"
            alt="Hide & Hue"
            fill
            sizes="128px"
            style={{
              objectFit: "contain",
            }}
            priority
          />
        </div>
        <h1 className="text-4xl font-bold text-forest mt-6">Hide & Hue</h1>
        <p className="text-lg text-leaf mt-2">Match the world. Hide from the wild.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-b from-leaf/10 to-cream">
      <Card className="w-full max-w-sm text-center">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <Image
            src="/assets/characters/chameleon_curious.png"
            alt="Hide & Hue"
            fill
            sizes="96px"
            style={{
              objectFit: "contain",
            }}
            priority
          />
        </div>

        <h1 className="text-3xl font-bold text-forest mb-2">Hide & Hue</h1>
        <p className="text-leaf mb-8">Match the world. Hide from the wild.</p>

        <div className="flex flex-col gap-4">
          <Button onClick={handlePlay} size="lg" className="w-full">
            Play
          </Button>

          {hasProgress && (
            <Button onClick={handleContinue} variant="secondary" size="lg" className="w-full">
              Continue
            </Button>
          )}
        </div>

        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={toggleMute}
            className="p-2 text-leaf hover:text-forest transition-colors"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            )}
          </button>

          <button
            onClick={onSettings}
            className="p-2 text-leaf hover:text-forest transition-colors"
            aria-label="Settings"
          >
            <div className="relative w-6 h-6">
              <Image
                src="/assets/ui/ui_settings.png"
                alt="Settings"
                fill
                sizes="24px"
                style={{
                  objectFit: "contain",
                }}
              />
            </div>
          </button>
        </div>
      </Card>
    </div>
  );
}
