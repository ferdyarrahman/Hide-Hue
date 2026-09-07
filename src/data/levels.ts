import { PredatorType } from "@/game/predators/predators";

export interface Level {
  id: string;
  name: string;
  environment: string;
  background: string;
  predator: PredatorType;
  targetColors: {
    hue: number;
    saturation: number;
    brightness: number;
    contrast?: number;
  }[];
  difficulty: number;
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: Math.round(l * 100) };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hexToHslVariations(hex: string): { hue: number; saturation: number; brightness: number }[] {
  const base = hexToHsl(hex);
  return [
    { hue: base.h, saturation: base.s, brightness: base.l },
    { hue: base.h + 5, saturation: base.s - 5, brightness: base.l - 3 },
    { hue: base.h - 5, saturation: base.s + 5, brightness: base.l + 3 },
    { hue: base.h + 10, saturation: base.s - 10, brightness: base.l - 5 },
  ];
}

// Adds a target contrast value to a set of variations, with a little jitter
// so the 4 target picks per level aren't identical on this dimension either.
// Contrast is only introduced from level 4 onward (PRD.md §8) so earlier
// levels simply never call this.
function withContrast<T extends { hue: number; saturation: number; brightness: number }>(
  variations: T[],
  baseContrast: number
): (T & { contrast: number })[] {
  const jitter = [0, -6, 6, -10];
  return variations.map((v, i) => ({
    ...v,
    contrast: Math.max(0, Math.min(100, baseContrast + jitter[i % jitter.length])),
  }));
}

const backgroundColors: Record<string, string> = {
  "env_forest_moss_01.webp": "#457B25",
  "env_forest_floor_01.webp": "#9C5624",
  "env_leaf_dry_01.webp": "#67912D",
  "env_tree_bark_01.webp": "#4D4021",
  "env_garden_flower_01.webp": "#FBF5E1",
  "env_forest_autumn_01.webp": "#E38B36",
  "env_desert_rock_01.webp": "#D5B89A",
  "env_forest_night_01.webp": "#BCDAAF",
  "env_leaf_pattern_01.webp": "#D2A452",
};

export const levels: Level[] = [
  {
    id: "forest_01",
    name: "Green Leaf",
    environment: "mossy_forest",
    background: "/assets/backgrounds/env_forest_moss_01.webp",
    predator: "eagle",
    targetColors: hexToHslVariations(backgroundColors["env_forest_moss_01.webp"]),
    difficulty: 1,
  },
  {
    id: "forest_02",
    name: "Mossy Rock",
    environment: "mossy_rock",
    background: "/assets/backgrounds/env_forest_floor_01.webp",
    predator: "snake",
    targetColors: hexToHslVariations(backgroundColors["env_forest_floor_01.webp"]),
    difficulty: 2,
  },
  {
    id: "forest_03",
    name: "Dry Leaf",
    environment: "dry_leaves",
    background: "/assets/backgrounds/env_leaf_dry_01.webp",
    predator: "eagle",
    targetColors: hexToHslVariations(backgroundColors["env_leaf_dry_01.webp"]),
    difficulty: 3,
  },
  {
    id: "forest_04",
    name: "Tree Bark",
    environment: "tree_bark",
    background: "/assets/backgrounds/env_tree_bark_01.webp",
    predator: "leopard",
    targetColors: withContrast(
      hexToHslVariations(backgroundColors["env_tree_bark_01.webp"]).map(c => ({ ...c, brightness: Math.max(20, c.brightness - 10) })),
      72
    ),
    difficulty: 4,
  },
  {
    id: "garden_01",
    name: "Flower Garden",
    environment: "flower_garden",
    background: "/assets/backgrounds/env_garden_flower_01.webp",
    predator: "eagle",
    targetColors: withContrast(hexToHslVariations(backgroundColors["env_garden_flower_01.webp"]), 55),
    difficulty: 5,
  },
  {
    id: "forest_05",
    name: "Autumn Leaves",
    environment: "autumn_leaves",
    background: "/assets/backgrounds/env_forest_autumn_01.webp",
    predator: "owl",
    targetColors: withContrast(hexToHslVariations(backgroundColors["env_forest_autumn_01.webp"]), 60),
    difficulty: 6,
  },
  {
    id: "desert_01",
    name: "Desert Rock",
    environment: "desert_rock",
    background: "/assets/backgrounds/env_desert_rock_01.webp",
    predator: "eagle",
    targetColors: withContrast(hexToHslVariations(backgroundColors["env_desert_rock_01.webp"]), 30),
    difficulty: 7,
  },
  {
    id: "forest_06",
    name: "Night Forest",
    environment: "night_forest",
    background: "/assets/backgrounds/env_forest_night_01.webp",
    predator: "owl",
    targetColors: withContrast(hexToHslVariations(backgroundColors["env_forest_night_01.webp"]), 22),
    difficulty: 8,
  },
  {
    id: "forest_07",
    name: "Patterned Leaf",
    environment: "patterned_leaf",
    background: "/assets/backgrounds/env_leaf_pattern_01.webp",
    predator: "leopard",
    targetColors: withContrast(hexToHslVariations(backgroundColors["env_leaf_pattern_01.webp"]), 68),
    difficulty: 9,
  },
  {
    id: "forest_08",
    name: "Predator Finale",
    environment: "final_forest",
    background: "/assets/backgrounds/env_forest_moss_01.webp",
    predator: "eagle",
    targetColors: withContrast(hexToHslVariations(backgroundColors["env_forest_moss_01.webp"]), 75),
    difficulty: 10,
  },
];

export function getRandomTarget(level: Level) {
  const index = Math.floor(Math.random() * level.targetColors.length);
  return level.targetColors[index];
}

export function getRandomPlayerStart() {
  return {
    hue: 120,
    saturation: 60,
    brightness: 50,
    contrast: 50,
  };
}

export function getLevelById(id: string): Level | undefined {
  return levels.find((level) => level.id === id);
}

export function getLevelByIndex(index: number): Level | undefined {
  return levels[index];
}

export function getNextLevel(currentId: string): Level | undefined {
  const currentIndex = levels.findIndex((level) => level.id === currentId);
  if (currentIndex === -1 || currentIndex >= levels.length - 1) {
    return undefined;
  }
  return levels[currentIndex + 1];
}
