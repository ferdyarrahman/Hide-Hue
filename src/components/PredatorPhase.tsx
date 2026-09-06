"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useAudio } from "@/hooks/useAudio";

export type PredatorType = "eagle" | "snake" | "leopard" | "owl";

interface PredatorPhaseProps {
  predator: PredatorType;
  isFound: boolean;
  onComplete: () => void;
}

const predatorAssets: Record<PredatorType, string> = {
  eagle: "/assets/predators/predator_eagle.png",
  snake: "/assets/predators/predator_snake.png",
  leopard: "/assets/predators/predator_leopard.png",
  owl: "/assets/predators/predator_owl.png",
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
  }, [phase, audio]);

  useEffect(() => {
    if (phase === "searching") {
      audio.playPredatorAlert();
      const searchDuration = predator === "snake" ? 4000 : 3000;
      const timer = setTimeout(() => {
        setPhase("result");
      }, searchDuration);

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

  const getSearchMessage = () => {
    switch (predator) {
      case "eagle":
        return "The eagle is scanning the area...";
      case "snake":
        return "The snake is slithering closer...";
      case "leopard":
        return "The leopard is prowling nearby...";
      case "owl":
        return "The owl is watching from above...";
    }
  };

  const predatorSrc = predatorAssets[predator];

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
                  animation: "spin 2s linear infinite",
                }}
                priority
              />
            </div>
            <h2 className="text-2xl font-bold text-forest mb-2">
              Predator Alert!
            </h2>
            <p className="text-leaf">{getSearchMessage()}</p>
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
                src={isFound ? predatorSrc : "/assets/characters/chameleon_happy.png"}
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
