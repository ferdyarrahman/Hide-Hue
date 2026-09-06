"use client";

import { useState, useEffect, useCallback } from "react";
import { HomeScreen } from "@/components/HomeScreen";
import { GameScreen } from "@/components/GameScreen";
import { PredatorPhase } from "@/components/PredatorPhase";
import { ResultPanel } from "@/components/ResultPanel";
import { Tutorial } from "@/components/Tutorial";
import { levels, Level, getRandomTarget, getRandomPlayerStart } from "@/data/levels";
import { calculateCamouflageScore, getStarsFromRating, ColorValue } from "@/game/engine/camouflage";
import { loadProgress, updateProgress, hasProgress } from "@/lib/progress";

type GamePhase = "home" | "tutorial" | "playing" | "predator" | "result";

export default function Home() {
  const [phase, setPhase] = useState<GamePhase>("home");
  const [currentLevel, setCurrentLevel] = useState<Level>(levels[0]);
  const [currentTarget, setCurrentTarget] = useState<ColorValue>(levels[0].targetColors[0]);
  const [playerStart, setPlayerStart] = useState<ColorValue>({ hue: 0, saturation: 50, brightness: 50 });
  const [playerColors, setPlayerColors] = useState<ColorValue>({ hue: 0, saturation: 50, brightness: 50 });
  const [isFound, setIsFound] = useState(false);
  const [currentScore, setCurrentScore] = useState<{total: number; rating: "perfect" | "excellent" | "safe" | "risky" | "found"; breakdown: {hue: number; saturation: number; brightness: number; contrast: number}}>({ total: 0, rating: "found", breakdown: { hue: 0, saturation: 0, brightness: 0, contrast: 0 } });
  const [showTutorial, setShowTutorial] = useState(false);
  const [hasExistingProgress, setHasExistingProgress] = useState(false);

  useEffect(() => {
    setHasExistingProgress(hasProgress());
  }, []);

  const initLevel = useCallback((level: Level) => {
    const target = getRandomTarget(level);
    const start = getRandomPlayerStart(level);
    setCurrentLevel(level);
    setCurrentTarget(target);
    setPlayerStart(start);
  }, []);

  const handlePlay = () => {
    if (!hasExistingProgress) {
      setShowTutorial(true);
    } else {
      initLevel(levels[0]);
      setPhase("playing");
    }
  };

  const handleContinue = () => {
    const progress = loadProgress();
    const levelIndex = Math.min(progress.unlockedLevel, levels.length - 1);
    initLevel(levels[levelIndex]);
    setPhase("playing");
  };

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    initLevel(levels[0]);
    setPhase("playing");
  };

  const handleHide = useCallback(
    (colors: ColorValue) => {
      setPlayerColors(colors);
      const score = calculateCamouflageScore(colors, currentTarget);
      const found = score.rating === "found";
      setIsFound(found);
      setCurrentScore(score);
      setPhase("predator");
    },
    [currentTarget]
  );

  const handlePredatorComplete = useCallback(() => {
    const stars = isFound ? 0 : getStarsFromRating(currentScore.rating);
    const levelIndex = levels.findIndex((l) => l.id === currentLevel.id);
    updateProgress(currentLevel.id, levelIndex, currentScore.total, stars);
    setPhase("result");
  }, [isFound, currentScore, currentLevel]);

  const handleRetry = () => {
    initLevel(currentLevel);
    setPhase("playing");
  };

  const handleNext = () => {
    const currentIndex = levels.findIndex((l) => l.id === currentLevel.id);
    if (currentIndex < levels.length - 1) {
      initLevel(levels[currentIndex + 1]);
      setPhase("playing");
    } else {
      setPhase("home");
    }
  };

  const handleBack = () => {
    setPhase("home");
  };

  const levelIndex = levels.findIndex((l) => l.id === currentLevel.id);
  const isLastLevel = levelIndex === levels.length - 1;

  if (showTutorial) {
    return <Tutorial onComplete={handleTutorialComplete} />;
  }

  if (phase === "home") {
    return (
      <HomeScreen
        onPlay={handlePlay}
        onContinue={handleContinue}
        onSettings={() => {}}
        hasProgress={hasExistingProgress}
      />
    );
  }

  if (phase === "playing") {
    return (
      <GameScreen
        levelNumber={levelIndex + 1}
        levelName={currentLevel.name}
        background={currentLevel.background}
        target={currentTarget}
        playerStart={playerStart}
        stars={0}
        onHide={(colors) => handleHide(colors)}
        onBack={handleBack}
      />
    );
  }

  if (phase === "predator") {
    return (
      <PredatorPhase
        predator={currentLevel.predator}
        isFound={isFound}
        onComplete={handlePredatorComplete}
      />
    );
  }

  if (phase === "result") {
    return (
      <ResultPanel
        score={currentScore}
        playerColor={playerColors}
        targetColor={currentTarget}
        isFound={isFound}
        onRetry={handleRetry}
        onNext={handleNext}
        isLastLevel={isLastLevel}
      />
    );
  }

  return null;
}
