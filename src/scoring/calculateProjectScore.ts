import type { DependencyAnalysis, ProjectScoreResult, RiskLevel } from "../types/index.js";
import { riskLevelFromScore } from "./calculatePackageScore.js";
import { yearsSince } from "../utils/formatDate.js";

export function calculateProjectScore(dependencies: DependencyAnalysis[]): ProjectScoreResult {
  const totalPackages = dependencies.length;

  const summary = dependencies.reduce(
    (acc, dependency) => {
      acc.lowRiskCount += dependency.riskLevel === "low" ? 1 : 0;
      acc.mediumRiskCount += dependency.riskLevel === "medium" ? 1 : 0;
      acc.highRiskCount += dependency.riskLevel === "high" ? 1 : 0;
      acc.criticalRiskCount += dependency.riskLevel === "critical" ? 1 : 0;
      acc.deprecatedCount += dependency.deprecated ? 1 : 0;
      acc.missingLicenseCount += dependency.metadataStatus === "success" && !dependency.license ? 1 : 0;
      acc.installScriptRiskCount += dependency.hasInstallScripts ? 1 : 0;
      acc.inactivePackageCount += (yearsSince(dependency.latestPublishDate) ?? 0) > 2 ? 1 : 0;
      acc.metadataFailureCount += dependency.metadataStatus === "success" ? 0 : 1;
      return acc;
    },
    {
      totalPackages,
      lowRiskCount: 0,
      mediumRiskCount: 0,
      highRiskCount: 0,
      criticalRiskCount: 0,
      deprecatedCount: 0,
      missingLicenseCount: 0,
      installScriptRiskCount: 0,
      inactivePackageCount: 0,
      metadataFailureCount: 0
    }
  );

  if (totalPackages === 0) {
    return {
      ...summary,
      overallScore: 100,
      overallRiskLevel: "low"
    };
  }

  const averageScore = dependencies.reduce((sum, dependency) => sum + dependency.score, 0) / totalPackages;
  const criticalPenalty = Math.min(20, summary.criticalRiskCount * 5);
  const overallScore = Math.max(0, Math.min(100, Math.round(averageScore - criticalPenalty)));
  const overallRiskLevel = riskLevelFromProject(overallScore, summary.criticalRiskCount);

  return {
    ...summary,
    overallScore,
    overallRiskLevel
  };
}

function riskLevelFromProject(score: number, criticalRiskCount: number): RiskLevel {
  if (criticalRiskCount > 0 && score < 70) {
    return "critical";
  }

  return riskLevelFromScore(score);
}
