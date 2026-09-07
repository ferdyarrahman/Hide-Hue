import { getStarsFromScore } from "@/game/engine/camouflage";

export interface Progress {
  unlockedLevel: number;
  bestScores: Record<string, number>;
  completedLevels: string[];
}

const STORAGE_KEY = "hide-and-hue-progress";

const defaultProgress: Progress = {
  unlockedLevel: 1,
  bestScores: {},
  completedLevels: [],
};

export function loadProgress(): Progress {
  if (typeof window === "undefined") {
    return defaultProgress;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load progress:", error);
  }

  return defaultProgress;
}

export function saveProgress(progress: Progress): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error("Failed to save progress:", error);
  }
}

export function updateProgress(
  levelId: string,
  levelIndex: number,
  score: number
): Progress {
  const progress = loadProgress();

  if (!progress.completedLevels.includes(levelId)) {
    progress.completedLevels.push(levelId);
  }

  const currentBest = progress.bestScores[levelId] || 0;
  if (score > currentBest) {
    progress.bestScores[levelId] = score;
  }

  const nextLevelIndex = levelIndex + 1;
  if (nextLevelIndex > progress.unlockedLevel) {
    progress.unlockedLevel = nextLevelIndex;
  }

  saveProgress(progress);
  return progress;
}

export function hasProgress(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const progress = loadProgress();
  return progress.completedLevels.length > 0;
}

export function getLevelStars(levelId: string): number {
  const progress = loadProgress();
  if (!progress.completedLevels.includes(levelId)) {
    return 0;
  }

  return getStarsFromScore(progress.bestScores[levelId] || 0);
}

export function resetProgress(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
}
