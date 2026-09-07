export interface ColorValue {
  hue: number;
  saturation: number;
  brightness: number;
  contrast?: number;
}

export interface CamouflageScore {
  total: number;
  breakdown: {
    hue: number;
    saturation: number;
    brightness: number;
    contrast: number;
  };
  rating: "perfect" | "excellent" | "safe" | "risky" | "found";
}

function calculateHueSimilarity(hue1: number, hue2: number): number {
  const diff = Math.abs(hue1 - hue2);
  const circularDiff = Math.min(diff, 360 - diff);
  
  if (circularDiff <= 10) return 1;
  if (circularDiff <= 20) return 0.85;
  if (circularDiff <= 30) return 0.7;
  if (circularDiff <= 45) return 0.5;
  if (circularDiff <= 60) return 0.35;
  if (circularDiff <= 90) return 0.2;
  if (circularDiff <= 120) return 0.1;
  return 0;
}

function calculateSimilarity(value1: number, value2: number): number {
  const diff = Math.abs(value1 - value2);
  
  if (diff <= 5) return 1;
  if (diff <= 10) return 0.9;
  if (diff <= 20) return 0.75;
  if (diff <= 30) return 0.6;
  if (diff <= 40) return 0.4;
  if (diff <= 50) return 0.2;
  return 0;
}

// Thresholds per PRD.md §6.4 — the single source of truth for score -> rating.
export function getRating(score: number): CamouflageScore["rating"] {
  if (score >= 90) return "perfect";
  if (score >= 80) return "excellent";
  if (score >= 70) return "safe";
  if (score >= 55) return "risky";
  return "found";
}

export function calculateCamouflageScore(
  player: ColorValue,
  target: ColorValue
): CamouflageScore {
  const hueScore = calculateHueSimilarity(player.hue, target.hue);
  const saturationScore = calculateSimilarity(player.saturation, target.saturation);
  const brightnessScore = calculateSimilarity(player.brightness, target.brightness);

  let contrastScore = 1;
  if (target.contrast !== undefined && player.contrast !== undefined) {
    contrastScore = calculateSimilarity(player.contrast, target.contrast);
  }

  const detailsScore = target.contrast !== undefined
    ? (saturationScore + brightnessScore + contrastScore) / 3
    : (saturationScore + brightnessScore) / 2;

  const total = Math.round(hueScore * detailsScore * 100);
  const rating = getRating(total);

  return {
    total,
    breakdown: {
      hue: Math.round(hueScore * 100),
      saturation: Math.round(saturationScore * 100),
      brightness: Math.round(brightnessScore * 100),
      contrast: Math.round(contrastScore * 100),
    },
    rating,
  };
}

export function getStarsFromRating(rating: CamouflageScore["rating"]): number {
  switch (rating) {
    case "perfect":
      return 3;
    case "excellent":
      return 2;
    case "safe":
      return 1;
    case "risky":
      return 1;
    case "found":
      return 0;
  }
}

// Single source of truth for "best score so far" -> stars (used by progress.ts
// and anywhere else that only has a stored score, not a live rating).
export function getStarsFromScore(score: number): number {
  return getStarsFromRating(getRating(score));
}

// Points formula per PRD.md §9. This is a separate, purely cosmetic
// point total for the result screen — it does not feed thresholds,
// stars or progress unlocking (those stay driven by CamouflageScore.total).
export interface FinalScore {
  base: number;
  camouflageBonus: number;
  timeBonus: number;
  perfectBonus: number;
  total: number;
}

const BASE_SCORE = 500;
const MAX_CAMOUFLAGE_BONUS = 500;
const MAX_TIME_BONUS = 300;
const PERFECT_BONUS = 200;

// Full time bonus if locked within 10s, tapering linearly to 0 by 60s
// (PRD §2 targets a round finishing well under the 2-minute success bar).
const TIME_BONUS_FULL_MS = 10_000;
const TIME_BONUS_ZERO_MS = 60_000;

function calculateTimeBonus(elapsedMs: number): number {
  if (elapsedMs <= TIME_BONUS_FULL_MS) return MAX_TIME_BONUS;
  if (elapsedMs >= TIME_BONUS_ZERO_MS) return 0;

  const progress =
    (elapsedMs - TIME_BONUS_FULL_MS) / (TIME_BONUS_ZERO_MS - TIME_BONUS_FULL_MS);
  return Math.round(MAX_TIME_BONUS * (1 - progress));
}

export function calculateFinalScore(
  camouflageScore: CamouflageScore,
  elapsedMs: number
): FinalScore {
  const camouflageBonus = Math.round(
    (camouflageScore.total / 100) * MAX_CAMOUFLAGE_BONUS
  );
  const timeBonus = calculateTimeBonus(elapsedMs);
  const perfectBonus = camouflageScore.rating === "perfect" ? PERFECT_BONUS : 0;

  return {
    base: BASE_SCORE,
    camouflageBonus,
    timeBonus,
    perfectBonus,
    total: BASE_SCORE + camouflageBonus + timeBonus + perfectBonus,
  };
}

export function getResultMessage(
  rating: CamouflageScore["rating"],
  isFound: boolean
): string {
  if (isFound) {
    return "The predator found you! Try adjusting your colors to blend in better.";
  }

  switch (rating) {
    case "perfect":
      return "Perfect camouflage! The predator couldn't see you at all!";
    case "excellent":
      return "Excellent hide! You blended in almost perfectly!";
    case "safe":
      return "Good job! You were hidden from the predator.";
    case "risky":
      return "That was close! The predator almost spotted you.";
    default:
      return "Keep trying! Adjust your colors to match the environment.";
  }
}
