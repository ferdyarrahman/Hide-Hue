import {
  calculateCamouflageScore,
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
});
