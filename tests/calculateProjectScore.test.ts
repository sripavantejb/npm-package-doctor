import { describe, expect, it } from "vitest";
import { calculateProjectScore } from "../src/scoring/calculateProjectScore.js";
import type { DependencyAnalysis } from "../src/types/index.js";

describe("calculateProjectScore", () => {
  it("calculates summary counts and average score", () => {
    const result = calculateProjectScore([
      dependency({ name: "low", score: 90, riskLevel: "low" }),
      dependency({ name: "medium", score: 70, riskLevel: "medium", hasInstallScripts: true }),
      dependency({ name: "high", score: 45, riskLevel: "high", deprecated: true, license: undefined })
    ]);

    expect(result.totalPackages).toBe(3);
    expect(result.lowRiskCount).toBe(1);
    expect(result.mediumRiskCount).toBe(1);
    expect(result.highRiskCount).toBe(1);
    expect(result.deprecatedCount).toBe(1);
    expect(result.installScriptRiskCount).toBe(1);
    expect(result.missingLicenseCount).toBe(1);
    expect(result.overallScore).toBe(68);
    expect(result.overallRiskLevel).toBe("medium");
  });

  it("applies an additional penalty for critical packages", () => {
    const result = calculateProjectScore([
      dependency({ name: "ok", score: 90, riskLevel: "low" }),
      dependency({ name: "critical", score: 20, riskLevel: "critical" })
    ]);

    expect(result.criticalRiskCount).toBe(1);
    expect(result.overallScore).toBe(50);
    expect(result.overallRiskLevel).toBe("critical");
  });
});

function dependency(overrides: Partial<DependencyAnalysis>): DependencyAnalysis {
  return {
    name: "package",
    dependencyType: "production",
    requestedVersion: "^1.0.0",
    latestVersion: "1.0.0",
    description: "Package",
    license: "MIT",
    repository: "https://github.com/example/package",
    maintainersCount: 2,
    dependencyCount: 1,
    deprecated: false,
    latestPublishDate: "2026-01-01T00:00:00.000Z",
    hasInstallScripts: false,
    score: 100,
    riskLevel: "low",
    reasons: [],
    recommendations: [],
    metadataStatus: "success",
    ...overrides
  };
}
