"use client";

import Image from "next/image";
import { Level } from "@/data/levels";
import { getLevelStars } from "@/lib/progress";
import { useAudio } from "@/hooks/useAudio";

interface LevelSelectProps {
  levels: Level[];
  unlockedIndex: number;
  onSelectLevel: (index: number) => void;
  onBack: () => void;
}

export function LevelSelect({
  levels,
  unlockedIndex,
  onSelectLevel,
  onBack,
}: LevelSelectProps) {
  const { audio } = useAudio();

  const handleBack = () => {
    audio.playClick();
    onBack();
  };

  const handleSelect = (index: number) => {
    audio.playClick();
    onSelectLevel(index);
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-b from-leaf/10 to-cream">
      <header className="flex items-center gap-2 mb-4 max-w-sm mx-auto">
        <button
          onClick={handleBack}
          className="p-1.5 text-forest hover:text-leaf transition-colors"
          aria-label="Back to home"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-forest">Select Level</h1>
      </header>

      <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
        {levels.map((level, index) => {
          const locked = index > unlockedIndex;
          const stars = locked ? 0 : getLevelStars(level.id);

          return (
            <button
              key={level.id}
              onClick={() => handleSelect(index)}
              disabled={locked}
              aria-label={
                locked
                  ? `Level ${index + 1} locked`
                  : `Play level ${index + 1}: ${level.name}, ${stars} of 3 stars`
              }
              className={`rounded-2xl p-3 text-center shadow-sm border transition-transform ${
                locked
                  ? "bg-forest/5 border-forest/10 opacity-60 cursor-not-allowed"
                  : "bg-white border-forest/10 active:scale-95"
              }`}
            >
              {locked ? (
                <div className="flex flex-col items-center justify-center py-3">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-forest/40" aria-hidden="true">
                    <rect x="5" y="11" width="14" height="9" rx="2" />
                    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                  </svg>
                  <p className="text-[10px] text-forest/50 mt-1">Level {index + 1}</p>
                </div>
              ) : (
                <>
                  <p className="text-[10px] text-leaf">Level {index + 1}</p>
                  <p className="text-sm font-semibold text-forest mb-1.5">{level.name}</p>
                  <div className="flex justify-center gap-0.5">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="relative w-3.5 h-3.5">
                        <Image
                          src="/assets/ui/ui_star.webp"
                          alt=""
                          fill
                          sizes="14px"
                          style={{ objectFit: "contain", opacity: i <= stars ? 1 : 0.25 }}
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
