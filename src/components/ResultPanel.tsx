"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CamouflageScore, ColorValue } from "@/game/engine/camouflage";
import { useAudio } from "@/hooks/useAudio";

interface ResultPanelProps {
  score: CamouflageScore;
  playerColor: ColorValue;
  targetColor: ColorValue;
  isFound: boolean;
  onRetry: () => void;
  onNext: () => void;
  isLastLevel?: boolean;
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

function getColorDifference(player: ColorValue, target: ColorValue): string {
  const hueDiff = Math.abs(player.hue - target.hue);
  const satDiff = Math.abs(player.saturation - target.saturation);
  const brightDiff = Math.abs(player.brightness - target.brightness);

  if (hueDiff > 30) return "Hue is too far off. Try adjusting the color wheel.";
  if (satDiff > 25) return "Saturation needs adjustment. Match the intensity.";
  if (brightDiff > 20) return "Brightness is off. Make it lighter or darker.";
  return "Very close! Just a tiny tweak needed.";
}

export function ResultPanel({
  score,
  playerColor,
  targetColor,
  isFound,
  onRetry,
  onNext,
  isLastLevel = false,
}: ResultPanelProps) {
  const { audio } = useAudio();

  const getStars = () => {
    if (isFound) return 0;
    return score.rating === "perfect"
      ? 3
      : score.rating === "excellent"
      ? 2
      : 1;
  };

  const stars = getStars();
  const playerRgb = hslToRgb(playerColor.hue, playerColor.saturation, playerColor.brightness);
  const targetRgb = hslToRgb(targetColor.hue, targetColor.saturation, targetColor.brightness);
  const colorHint = getColorDifference(playerColor, targetColor);

  useEffect(() => {
    if (!isFound && stars > 0) {
      const playStarSounds = async () => {
        for (let i = 0; i < stars; i++) {
          await new Promise((resolve) => setTimeout(resolve, 300));
          audio.playStarEarned();
        }
        if (stars === 3) {
          await new Promise((resolve) => setTimeout(resolve, 200));
          audio.playPerfectSuccess();
        }
      };
      playStarSounds();
    }
  }, [isFound, stars, audio]);

  const handleRetry = () => {
    audio.playClick();
    onRetry();
  };

  const handleNext = () => {
    audio.playLevelComplete();
    onNext();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <Card className="w-full max-w-sm mx-4 text-center">
        {/* VFX Image */}
        <div className="relative w-24 h-24 mx-auto mb-4">
          <Image
            src={isFound ? "/assets/vfx/vfx_failure.png" : "/assets/vfx/vfx_success.png"}
            alt={isFound ? "Found" : "Success"}
            fill
            sizes="96px"
            style={{
              objectFit: "contain",
            }}
            priority
          />
        </div>

        {/* Stars */}
        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="relative w-10 h-10">
              <Image
                src="/assets/ui/ui_star.png"
                alt="Star"
                fill
                sizes="40px"
                style={{
                  objectFit: "contain",
                  opacity: i <= stars ? 1 : 0.3,
                  animation: i <= stars ? "bounce 0.5s ease-in-out" : "none",
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            </div>
          ))}
        </div>

        {/* Result Message */}
        <h2
          className={`text-2xl font-bold mb-2 ${
            isFound ? "text-coral" : "text-leaf"
          }`}
        >
          {isFound ? "Found!" : "Safe!"}
        </h2>

        <p className="text-forest mb-4">
          {isFound
            ? "The predator spotted you! Try adjusting your colors."
            : score.rating === "perfect"
            ? "Perfect camouflage! The predator couldn't see you!"
            : score.rating === "excellent"
            ? "Excellent hide! You blended in almost perfectly!"
            : "Good job! You were hidden from the predator."}
        </p>

        {/* Color Comparison */}
        <div className="flex items-center justify-center gap-4 mb-4 p-3 bg-cream/50 rounded-xl">
          <div className="text-center">
            <div
              className="w-12 h-12 rounded-full border-2 border-forest shadow-md mx-auto"
              style={{ backgroundColor: playerRgb }}
            />
            <span className="text-xs text-leaf mt-1 block">Yours</span>
          </div>
          <div className="text-lg text-forest">→</div>
          <div className="text-center">
            <div
              className="w-12 h-12 rounded-full border-2 border-forest shadow-md mx-auto"
              style={{ backgroundColor: targetRgb }}
            />
            <span className="text-xs text-leaf mt-1 block">Target</span>
          </div>
        </div>

        {/* Color Hint */}
        {isFound && (
          <p className="text-sm text-coral mb-4 italic">{colorHint}</p>
        )}

        {/* Camouflage Score */}
        <div className="mb-4">
          <div className="text-4xl font-bold text-forest mb-1">
            {score.total}%
          </div>
          <p className="text-sm text-leaf">Camouflage Match</p>
        </div>

        {/* Score Breakdown */}
        <div className="bg-cream/50 rounded-2xl p-4 mb-6">
          <h3 className="text-sm font-semibold text-forest mb-3">
            Score Breakdown
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-forest">Hue</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-forest/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-leaf rounded-full"
                    style={{ width: `${score.breakdown.hue}%` }}
                  />
                </div>
                <span className="text-sm text-leaf w-8 text-right">
                  {score.breakdown.hue}%
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-forest">Saturation</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-forest/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-leaf rounded-full"
                    style={{ width: `${score.breakdown.saturation}%` }}
                  />
                </div>
                <span className="text-sm text-leaf w-8 text-right">
                  {score.breakdown.saturation}%
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-forest">Brightness</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-forest/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-leaf rounded-full"
                    style={{ width: `${score.breakdown.brightness}%` }}
                  />
                </div>
                <span className="text-sm text-leaf w-8 text-right">
                  {score.breakdown.brightness}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Button onClick={handleRetry} variant="secondary" className="w-full">
            Try Again
          </Button>
          {!isLastLevel && (
            <Button onClick={handleNext} className="w-full">
              Next Level
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
