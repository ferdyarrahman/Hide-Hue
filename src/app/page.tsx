"use client";

import { useState, useCallback } from "react";
import { HomeScreen } from "@/components/HomeScreen";
import { GameScreen } from "@/components/GameScreen";
import { PredatorPhase } from "@/components/PredatorPhase";
import { ResultPanel } from "@/components/ResultPanel";
import { Tutorial } from "@/components/Tutorial";
import { LevelSelect } from "@/components/LevelSelect";
import { SettingsScreen } from "@/components/SettingsScreen";
import { levels, Level, getRandomTarget, getRandomPlayerStart } from "@/data/levels";
import { calculateCamouflageScore, calculateFinalScore, ColorValue, FinalScore } from "@/game/engine/camouflage";
import { applyPredatorWeakness } from "@/game/predators/predators";
import { loadProgress, updateProgress, hasProgress, getLevelStars, resetProgress } from "@/lib/progress";

type GamePhase = "home" | "tutorial" | "playing" | "predator" | "result" | "levelSelect" | "settings";

export default function Home() {
  const [phase, setPhase] = useState<GamePhase>("home");
  const [currentLevel, setCurrentLevel] = useState<Level>(levels[0]);
  const [currentTarget, setCurrentTarget] = useState<ColorValue>(levels[0].targetColors[0]);
  const [playerStart, setPlayerStart] = useState<ColorValue>({ hue: 0, saturation: 50, brightness: 50 });
  const [playerColors, setPlayerColors] = useState<ColorValue>({ hue: 0, saturation: 50, brightness: 50 });
  const [isFound, setIsFound] = useState(false);
  const [currentScore, setCurrentScore] = useState<{total: number; rating: "perfect" | "excellent" | "safe" | "risky" | "found"; breakdown: {hue: number; saturation: number; brightness: number; contrast: number}}>({ total: 0, rating: "found", breakdown: { hue: 0, saturation: 0, brightness: 0, contrast: 0 } });
  const [finalScore, setFinalScore] = useState<FinalScore>({ base: 0, camouflageBonus: 0, timeBonus: 0, perfectBonus: 0, total: 0 });
  const [showTutorial, setShowTutorial] = useState(false);

  const initLevel = useCallback((level: Level) => {
    const target = getRandomTarget(level);
    const start = getRandomPlayerStart();
    setCurrentLevel(level);
    setCurrentTarget(target);
    setPlayerStart(start);
  }, []);

  const handlePlay = () => {
    if (!hasProgress()) {
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

  const handleOpenLevelSelect = () => {
    setPhase("levelSelect");
  };

  const handleSelectLevel = (index: number) => {
    initLevel(levels[index]);
    setPhase("playing");
  };

  const handleOpenSettings = () => {
    setPhase("settings");
  };

  const handleResetProgress = () => {
    resetProgress();
    setPhase("home");
  };

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    initLevel(levels[0]);
    setPhase("playing");
  };

  const handleHide = useCallback(
    (colors: ColorValue, elapsedMs: number) => {
      setPlayerColors(colors);
      const baseScore = calculateCamouflageScore(colors, currentTarget);
      const score = applyPredatorWeakness(baseScore, currentLevel.predator, {
        start: playerStart,
        locked: colors,
      });
      const found = score.rating === "found";
      setIsFound(found);
      setCurrentScore(score);
      setFinalScore(calculateFinalScore(score, elapsedMs));
      setPhase("predator");
    },
    [currentTarget, currentLevel, playerStart]
  );

  const handlePredatorComplete = useCallback(() => {
    const levelIndex = levels.findIndex((l) => l.id === currentLevel.id);
    updateProgress(currentLevel.id, levelIndex, currentScore.total);
    setPhase("result");
  }, [currentScore, currentLevel]);

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
    const progress = loadProgress();
    const hasExistingProgress = progress.completedLevels.length > 0;
    const totalStars = levels.reduce((sum, l) => sum + getLevelStars(l.id), 0);

    return (
      <HomeScreen
        onPlay={handlePlay}
        onContinue={handleContinue}
        onSettings={handleOpenSettings}
        onOpenLevelSelect={handleOpenLevelSelect}
        hasProgress={hasExistingProgress}
        levelsCompleted={progress.completedLevels.length}
        totalLevels={levels.length}
        totalStars={totalStars}
        maxStars={levels.length * 3}
      />
    );
  }

  if (phase === "levelSelect") {
    const unlockedIndex = hasProgress() ? loadProgress().unlockedLevel : 0;
    return (
      <LevelSelect
        levels={levels}
        unlockedIndex={unlockedIndex}
        onSelectLevel={handleSelectLevel}
        onBack={handleBack}
      />
    );
  }

  if (phase === "settings") {
    return (
      <SettingsScreen onBack={handleBack} onResetProgress={handleResetProgress} />
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
        stars={getLevelStars(currentLevel.id)}
        onHide={(colors, elapsedMs) => handleHide(colors, elapsedMs)}
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
        finalScore={finalScore}
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
