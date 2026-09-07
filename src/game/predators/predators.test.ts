import { calculateCamouflageScore, ColorValue } from "@/game/engine/camouflage";
import { applyPredatorWeakness } from "./predators";

describe("Predator weakness system", () => {
  const target: ColorValue = { hue: 120, saturation: 60, brightness: 50, contrast: 50 };
  const noMovement = (locked: ColorValue) => ({ start: locked, locked });

  it("eagle punishes a contrast mismatch beyond the base score", () => {
    const player: ColorValue = { ...target, contrast: 0 };
    const base = calculateCamouflageScore(player, target);
    const adjusted = applyPredatorWeakness(base, "eagle", noMovement(player));

    expect(adjusted.total).toBeLessThan(base.total);
  });

  it("owl punishes a brightness mismatch beyond the base score", () => {
    const player: ColorValue = { ...target, brightness: 20 };
    const base = calculateCamouflageScore(player, target);
    const adjusted = applyPredatorWeakness(base, "owl", noMovement(player));

    expect(adjusted.total).toBeLessThan(base.total);
  });

  it("snake punishes large slider movement even with a perfect final color", () => {
    const player: ColorValue = { ...target };
    const base = calculateCamouflageScore(player, target);
    const stillAdjusted = applyPredatorWeakness(base, "snake", {
      start: player,
      locked: player,
    });
    const movedAdjusted = applyPredatorWeakness(base, "snake", {
      start: { hue: 0, saturation: 0, brightness: 100 },
      locked: player,
    });

    expect(stillAdjusted.total).toBe(base.total);
    expect(movedAdjusted.total).toBeLessThan(stillAdjusted.total);
  });

  it("leopard has no weakness effect yet (no pattern control shipped)", () => {
    const player: ColorValue = { ...target, saturation: 10 };
    const base = calculateCamouflageScore(player, target);
    const adjusted = applyPredatorWeakness(base, "leopard", noMovement(player));

    expect(adjusted.total).toBe(base.total);
  });

  it("never pushes the score outside 0-100", () => {
    const player: ColorValue = { hue: 300, saturation: 0, brightness: 0, contrast: 0 };
    const base = calculateCamouflageScore(player, target);
    const adjusted = applyPredatorWeakness(base, "eagle", noMovement(player));

    expect(adjusted.total).toBeGreaterThanOrEqual(0);
    expect(adjusted.total).toBeLessThanOrEqual(100);
  });
});
