import { PredatorType } from "@/components/PredatorPhase";

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

const backgroundColors: Record<string, string> = {
  "env_forest_moss_01.png": "#457B25",
  "env_forest_floor_01.png": "#9C5624",
  "env_leaf_dry_01.png": "#67912D",
  "env_tree_bark_01.png": "#4D4021",
  "env_garden_flower_01.png": "#FBF5E1",
  "env_forest_autumn_01.png": "#E38B36",
  "env_desert_rock_01.png": "#D5B89A",
  "env_forest_night_01.png": "#BCDAAF",
  "env_leaf_pattern_01.png": "#D2A452",
};

export const levels: Level[] = [
  {
    id: "forest_01",
    name: "Green Leaf",
    environment: "mossy_forest",
    background: "/assets/backgrounds/env_forest_moss_01.png",
    predator: "eagle",
    targetColors: hexToHslVariations(backgroundColors["env_forest_moss_01.png"]),
    difficulty: 1,
  },
  {
    id: "forest_02",
    name: "Mossy Rock",
    environment: "mossy_rock",
    background: "/assets/backgrounds/env_forest_floor_01.png",
    predator: "snake",
    targetColors: hexToHslVariations(backgroundColors["env_forest_floor_01.png"]),
    difficulty: 2,
  },
  {
    id: "forest_03",
    name: "Dry Leaf",
    environment: "dry_leaves",
    background: "/assets/backgrounds/env_leaf_dry_01.png",
    predator: "eagle",
    targetColors: hexToHslVariations(backgroundColors["env_leaf_dry_01.png"]),
    difficulty: 3,
  },
  {
    id: "forest_04",
    name: "Tree Bark",
    environment: "tree_bark",
    background: "/assets/backgrounds/env_tree_bark_01.png",
    predator: "leopard",
    targetColors: hexToHslVariations(backgroundColors["env_tree_bark_01.png"]).map(c => ({ ...c, brightness: Math.max(20, c.brightness - 10) })),
    difficulty: 4,
  },
  {
    id: "garden_01",
    name: "Flower Garden",
    environment: "flower_garden",
    background: "/assets/backgrounds/env_garden_flower_01.png",
    predator: "eagle",
    targetColors: hexToHslVariations(backgroundColors["env_garden_flower_01.png"]),
    difficulty: 5,
  },
  {
    id: "forest_05",
    name: "Autumn Leaves",
    environment: "autumn_leaves",
    background: "/assets/backgrounds/env_forest_autumn_01.png",
    predator: "owl",
    targetColors: hexToHslVariations(backgroundColors["env_forest_autumn_01.png"]),
    difficulty: 6,
  },
  {
    id: "desert_01",
    name: "Desert Rock",
    environment: "desert_rock",
    background: "/assets/backgrounds/env_desert_rock_01.png",
    predator: "eagle",
    targetColors: hexToHslVariations(backgroundColors["env_desert_rock_01.png"]),
    difficulty: 7,
  },
  {
    id: "forest_06",
    name: "Night Forest",
    environment: "night_forest",
    background: "/assets/backgrounds/env_forest_night_01.png",
    predator: "owl",
    targetColors: hexToHslVariations(backgroundColors["env_forest_night_01.png"]),
    difficulty: 8,
  },
  {
    id: "forest_07",
    name: "Patterned Leaf",
    environment: "patterned_leaf",
    background: "/assets/backgrounds/env_leaf_pattern_01.png",
    predator: "leopard",
    targetColors: hexToHslVariations(backgroundColors["env_leaf_pattern_01.png"]),
    difficulty: 9,
  },
  {
    id: "forest_08",
    name: "Predator Finale",
    environment: "final_forest",
    background: "/assets/backgrounds/env_forest_moss_01.png",
    predator: "eagle",
    targetColors: hexToHslVariations(backgroundColors["env_forest_moss_01.png"]),
    difficulty: 10,
  },
];

export function getRandomTarget(level: Level) {
  const index = Math.floor(Math.random() * level.targetColors.length);
  return level.targetColors[index];
}

export function getRandomPlayerStart(level: Level) {
  return {
    hue: 120,
    saturation: 60,
    brightness: 50,
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
