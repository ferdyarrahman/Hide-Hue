"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAudio } from "@/hooks/useAudio";
import { PREDATOR_CONFIG, PredatorType } from "@/game/predators/predators";

interface PredatorPhaseProps {
  predator: PredatorType;
  isFound: boolean;
  onComplete: () => void;
}

const predatorAssets: Record<PredatorType, string> = {
  eagle: "/assets/predators/predator_eagle.webp",
  snake: "/assets/predators/predator_snake.webp",
  leopard: "/assets/predators/predator_leopard.webp",
  owl: "/assets/predators/predator_owl.webp",
};

export function PredatorPhase({
  predator,
  isFound,
  onComplete,
}: PredatorPhaseProps) {
  const [countdown, setCountdown] = useState(3);
  const [phase, setPhase] = useState<"countdown" | "searching" | "result">(
    "countdown"
  );
  const { audio } = useAudio();

  useEffect(() => {
    if (phase === "countdown") {
      audio.playCountdown(countdown);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setPhase("searching");
            return 0;
          }
          audio.playCountdown(prev - 1);
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
    // `countdown` intentionally excluded: this effect must only run once
    // when entering the countdown phase (it owns its own interval and reads
    // the latest countdown via the setCountdown updater's `prev`); adding it
    // would restart the interval every second.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, audio]);

  useEffect(() => {
    if (phase === "searching") {
      audio.playPredatorAlert();
      const timer = setTimeout(() => {
        setPhase("result");
      }, PREDATOR_CONFIG[predator].searchDurationMs);

      return () => clearTimeout(timer);
    }
  }, [phase, predator, audio]);

  useEffect(() => {
    if (phase === "result") {
      if (isFound) {
        audio.playFailure();
      } else {
        audio.playSuccess();
      }
      const timer = setTimeout(() => {
        onComplete();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [phase, isFound, audio, onComplete]);

  const predatorSrc = predatorAssets[predator];
  const searchAnimation =
    PREDATOR_CONFIG[predator].movementStyle === "aerial"
      ? "hover-bob 1.4s ease-in-out infinite"
      : "prowl-sway 1.2s ease-in-out infinite";

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-8 text-center max-w-sm mx-4">
        {phase === "countdown" && (
          <>
            <div className="relative w-32 h-32 mx-auto mb-4">
              <Image
                src={predatorSrc}
                alt={predator}
                fill
                sizes="128px"
                style={{
                  objectFit: "contain",
                  animation: "pulse 1s ease-in-out infinite",
                }}
                priority
              />
            </div>
            <h2 className="text-2xl font-bold text-forest mb-2">
              Get Ready!
            </h2>
            <p className="text-leaf">Stay still...</p>
            <div className="mt-4 text-5xl font-bold text-coral animate-bounce">
              {countdown}
            </div>
          </>
        )}

        {phase === "searching" && (
          <>
            <div className="relative w-32 h-32 mx-auto mb-4">
              <Image
                src={predatorSrc}
                alt={predator}
                fill
                sizes="128px"
                style={{
                  objectFit: "contain",
                  animation: searchAnimation,
                }}
                priority
              />
            </div>
            <h2 className="text-2xl font-bold text-forest mb-2">
              Predator Alert!
            </h2>
            <p className="text-leaf">{PREDATOR_CONFIG[predator].searchMessage}</p>
            <div className="mt-4 flex justify-center gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-3 h-3 bg-leaf rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
              ))}
            </div>
          </>
        )}

        {phase === "result" && (
          <>
            <div className="relative w-32 h-32 mx-auto mb-4">
              <Image
                src={isFound ? predatorSrc : "/assets/characters/chameleon_happy.webp"}
                alt={isFound ? predator : "chameleon safe"}
                fill
                sizes="128px"
                style={{
                  objectFit: "contain",
                }}
                priority
              />
            </div>
            <h2
              className={`text-2xl font-bold mb-2 ${
                isFound ? "text-coral" : "text-leaf"
              }`}
            >
              {isFound ? "Found!" : "Safe!"}
            </h2>
            <p className="text-forest">
              {isFound
                ? "The predator spotted you!"
                : "The predator passed by!"}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
