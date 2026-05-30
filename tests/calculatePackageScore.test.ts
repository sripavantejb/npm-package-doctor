import { describe, expect, it } from "vitest";
import { calculatePackageScore, riskLevelFromScore } from "../src/scoring/calculatePackageScore.js";

const referenceDate = new Date("2026-05-30T00:00:00.000Z");

describe("calculatePackageScore", () => {
  it("returns low risk for healthy package metadata", () => {
    const result = calculatePackageScore({
      name: "healthy-package",
      requestedVersion: "^2.0.0",
      latestVersion: "2.1.0",
      license: "MIT",
      repository: "https://github.com/example/healthy-package",
      maintainersCount: 3,
      dependencyCount: 2,
      latestPublishDate: "2026-01-10T00:00:00.000Z",
      hasInstallScripts: false,
      metadataStatus: "success",
      referenceDate
    });

    expect(result.score).toBe(100);
    expect(result.riskLevel).toBe("low");
  });

  it("penalizes deprecated and inactive packages", () => {
    const result = calculatePackageScore({
      name: "old-package",
      requestedVersion: "^1.0.0",
      latestVersion: "1.0.1",
      deprecated: true,
      license: "MIT",
      repository: "https://github.com/example/old-package",
      maintainersCount: 1,
      dependencyCount: 3,
      latestPublishDate: "2020-01-01T00:00:00.000Z",
      hasInstallScripts: false,
      metadataStatus: "success",
      referenceDate
    });

    expect(result.score).toBeLessThan(60);
    expect(result.riskLevel).toBe("high");
    expect(result.reasons).toContain("Package is deprecated.");
  });

  it("penalizes metadata failures without throwing", () => {
    const result = calculatePackageScore({
      name: "missing-package",
      requestedVersion: "^1.0.0",
      metadataStatus: "not_found",
      metadataFailureReason: "Package was not found."
    });

    expect(result.score).toBe(65);
    expect(result.riskLevel).toBe("medium");
    expect(result.reasons[0]).toMatch(/metadata could not be fetched/);
  });

  it("classifies risk levels by score", () => {
    expect(riskLevelFromScore(90)).toBe("low");
    expect(riskLevelFromScore(70)).toBe("medium");
    expect(riskLevelFromScore(50)).toBe("high");
    expect(riskLevelFromScore(20)).toBe("critical");
  });
});
