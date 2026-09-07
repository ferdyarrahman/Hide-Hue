import { CamouflageScore, ColorValue, getRating } from "@/game/engine/camouflage";

export type PredatorType = "eagle" | "snake" | "leopard" | "owl";

// Per PRD.md §7 — each predator's primary weakness/behavior.
export type PredatorWeakness = "contrast" | "movement" | "pattern" | "brightness";

// How a predator moves during its search, purely for the CSS animation
// applied in PredatorPhase — "aerial" predators hover, "ground" predators
// prowl side to side.
export type PredatorMovementStyle = "aerial" | "ground";

export interface PredatorConfig {
  weakness: PredatorWeakness;
  searchDurationMs: number;
  searchMessage: string;
  movementStyle: PredatorMovementStyle;
}

export const PREDATOR_CONFIG: Record<PredatorType, PredatorConfig> = {
  eagle: {
    weakness: "contrast",
    searchDurationMs: 3000,
    searchMessage: "The eagle is scanning the area...",
    movementStyle: "aerial",
  },
  snake: {
    weakness: "movement",
    searchDurationMs: 4000,
    searchMessage: "The snake is slithering closer...",
    movementStyle: "ground",
  },
  leopard: {
    weakness: "pattern",
    searchDurationMs: 3000,
    searchMessage: "The leopard is prowling nearby...",
    movementStyle: "ground",
  },
  owl: {
    weakness: "brightness",
    searchDurationMs: 3000,
    searchMessage: "The owl is watching from above...",
    movementStyle: "aerial",
  },
};

// How hard a predator punishes a mismatch on its own weakness, on top of the
// base camouflage score. Tunable during playtesting (PRD.md §6.4).
const WEAKNESS_PENALTY_FACTOR = 0.3;

function circularDistance(a: number, b: number, range: number): number {
  const diff = Math.abs(a - b);
  return Math.min(diff, range - diff);
}

// Snake's weakness is movement (PRD.md §7): how much the player changed the
// sliders from their starting position to the locked-in color, not the final
// color match itself.
function movementMagnitude(start: ColorValue, locked: ColorValue): number {
  const hueMove = (circularDistance(start.hue, locked.hue, 360) / 360) * 100;
  const saturationMove = Math.abs(start.saturation - locked.saturation);
  const brightnessMove = Math.abs(start.brightness - locked.brightness);
  return (hueMove + saturationMove + brightnessMove) / 3;
}

export interface PlayerMovement {
  start: ColorValue;
  locked: ColorValue;
}

// Re-weights a base CamouflageScore by the given predator's weakness. A color
// match that's "safe" against one predator can still fail against another —
// this is what gives each predator distinct gameplay per PRD.md §7, without
// needing real predator AI (allowed for MVP by the same section).
export function applyPredatorWeakness(
  score: CamouflageScore,
  predator: PredatorType,
  movement: PlayerMovement
): CamouflageScore {
  const { weakness } = PREDATOR_CONFIG[predator];
  let penalty = 0;

  switch (weakness) {
    case "contrast":
      penalty = (100 - score.breakdown.contrast) * WEAKNESS_PENALTY_FACTOR;
      break;
    case "brightness":
      penalty = (100 - score.breakdown.brightness) * WEAKNESS_PENALTY_FACTOR;
      break;
    case "movement":
      penalty = movementMagnitude(movement.start, movement.locked) * WEAKNESS_PENALTY_FACTOR;
      break;
    case "pattern":
      // MVP ships no pattern control yet (PRD.md §6.2 lists it as unlocked
      // later), so there's no data to penalize — leopard has no extra
      // weakness effect until pattern matching exists.
      penalty = 0;
      break;
  }

  const total = Math.max(0, Math.min(100, Math.round(score.total - penalty)));
  return { ...score, total, rating: getRating(total) };
}
