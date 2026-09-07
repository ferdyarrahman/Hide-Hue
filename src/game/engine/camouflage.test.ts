import {
  calculateCamouflageScore,
  calculateFinalScore,
  getStarsFromRating,
  getResultMessage,
  ColorValue,
} from "./camouflage";

describe("Camouflage Engine", () => {
  const target: ColorValue = {
    hue: 120,
    saturation: 60,
    brightness: 50,
  };

  it("should calculate perfect score for exact match", () => {
    const player: ColorValue = { ...target };
    const result = calculateCamouflageScore(player, target);

    expect(result.total).toBe(100);
    expect(result.rating).toBe("perfect");
  });

  it("should calculate lower score for mismatched hue", () => {
    const player: ColorValue = {
      hue: 180,
      saturation: 60,
      brightness: 50,
    };
    const result = calculateCamouflageScore(player, target);

    expect(result.total).toBeLessThan(100);
    expect(result.rating).not.toBe("perfect");
  });

  it("should calculate lower score for mismatched saturation", () => {
    const player: ColorValue = {
      hue: 120,
      saturation: 20,
      brightness: 50,
    };
    const result = calculateCamouflageScore(player, target);

    expect(result.total).toBeLessThan(100);
  });

  it("should calculate lower score for mismatched brightness", () => {
    const player: ColorValue = {
      hue: 120,
      saturation: 60,
      brightness: 80,
    };
    const result = calculateCamouflageScore(player, target);

    expect(result.total).toBeLessThan(100);
  });

  it("should return correct stars for each rating", () => {
    expect(getStarsFromRating("perfect")).toBe(3);
    expect(getStarsFromRating("excellent")).toBe(2);
    expect(getStarsFromRating("safe")).toBe(1);
    expect(getStarsFromRating("risky")).toBe(1);
    expect(getStarsFromRating("found")).toBe(0);
  });

  it("should return appropriate messages", () => {
    expect(getResultMessage("perfect", false)).toContain("Perfect");
    expect(getResultMessage("excellent", false)).toContain("Excellent");
    expect(getResultMessage("safe", false)).toContain("Good job");
    expect(getResultMessage("risky", false)).toContain("close");
    expect(getResultMessage("found", true)).toContain("found you");
  });

  describe("calculateFinalScore", () => {
    const perfectMatch = calculateCamouflageScore(target, target);

    it("awards max bonuses for a fast, perfect hide", () => {
      const result = calculateFinalScore(perfectMatch, 5_000);
      expect(result).toEqual({
        base: 500,
        camouflageBonus: 500,
        timeBonus: 300,
        perfectBonus: 200,
        total: 1500,
      });
    });

    it("tapers the time bonus linearly between 10s and 60s", () => {
      const fast = calculateFinalScore(perfectMatch, 10_000);
      const mid = calculateFinalScore(perfectMatch, 35_000);
      const slow = calculateFinalScore(perfectMatch, 60_000);

      expect(fast.timeBonus).toBe(300);
      expect(mid.timeBonus).toBeGreaterThan(0);
      expect(mid.timeBonus).toBeLessThan(300);
      expect(slow.timeBonus).toBe(0);
    });

    it("never awards a perfect bonus for a non-perfect rating", () => {
      const found = calculateCamouflageScore(
        { hue: 0, saturation: 0, brightness: 0 },
        target
      );
      const result = calculateFinalScore(found, 5_000);
      expect(result.perfectBonus).toBe(0);
      expect(result.total).toBe(result.base + result.camouflageBonus + result.timeBonus);
    });
  });
});
