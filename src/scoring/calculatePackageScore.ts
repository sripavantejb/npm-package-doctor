import type { PackageScoreInput, PackageScoreResult, RiskLevel } from "../types/index.js";
import { isMajorVersionBehind } from "../utils/semverUtils.js";
import { yearsSince } from "../utils/formatDate.js";

export function riskLevelFromScore(score: number): RiskLevel {
  if (score >= 80) return "low";
  if (score >= 60) return "medium";
  if (score >= 40) return "high";
  return "critical";
}

export function calculatePackageScore(input: PackageScoreInput): PackageScoreResult {
  let score = 100;
  const reasons: string[] = [];
  const recommendations = new Set<string>();

  const subtract = (points: number, reason: string, recommendation: string): void => {
    score -= points;
    reasons.push(reason);
    recommendations.add(recommendation);
  };

  if (input.metadataStatus !== "success") {
    subtract(
      35,
      `Package metadata could not be fetched: ${input.metadataFailureReason ?? input.metadataStatus}`,
      "Retry the scan and review the package manually before production use."
    );
  }

  if (input.deprecated) {
    subtract(30, "Package is deprecated.", "Replace deprecated packages with maintained alternatives.");
  }

  if (input.metadataStatus === "success" && !input.license) {
    subtract(12, "Package license is missing.", "Verify license terms before production use.");
  }

  if (input.metadataStatus === "success" && !input.repository) {
    subtract(8, "Package repository is missing.", "Prefer packages with public source repositories.");
  }

  const age = yearsSince(input.latestPublishDate, input.referenceDate);
  if (typeof age === "number") {
    if (age > 3) {
      subtract(15, "Last published more than 3 years ago.", "Prefer actively maintained packages.");
    } else if (age > 2) {
      subtract(10, "Last published more than 2 years ago.", "Review maintenance activity before relying on this package.");
    } else if (age > 1) {
      subtract(5, "Last published more than 1 year ago.", "Check recent activity before adopting this package.");
    }
  }

  if (isMajorVersionBehind(input.requestedVersion, input.latestVersion)) {
    subtract(10, "Requested version is at least one major version behind latest.", "Plan an upgrade path and review breaking changes.");
  }

  if (input.metadataStatus === "success") {
    if (typeof input.maintainersCount !== "number" || input.maintainersCount === 0) {
      subtract(12, "Package has no listed maintainers.", "Review ownership and release history before production use.");
    } else if (input.maintainersCount === 1) {
      subtract(8, "Package has a single listed maintainer.", "Watch for single-maintainer supply-chain risk.");
    }
  }

  const dependencyCount = input.dependencyCount ?? 0;
  if (dependencyCount > 40) {
    subtract(10, "Package has more than 40 runtime dependencies.", "Review transitive dependency exposure.");
  } else if (dependencyCount > 20) {
    subtract(6, "Package has more than 20 runtime dependencies.", "Review whether the package adds unnecessary dependency surface.");
  }

  if (input.hasInstallScripts) {
    subtract(15, "Package declares install lifecycle scripts.", "Review install scripts before allowing this package in sensitive environments.");
  }

  const normalizedScore = Math.max(0, Math.min(100, Math.round(score)));

  if (recommendations.size === 0) {
    recommendations.add("No immediate action needed.");
  }

  return {
    score: normalizedScore,
    riskLevel: riskLevelFromScore(normalizedScore),
    reasons,
    recommendations: Array.from(recommendations)
  };
}
