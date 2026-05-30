import type { DependencyAnalysis, NpmMetadataResult, PackageDependency } from "../types/index.js";
import { calculatePackageScore } from "../scoring/calculatePackageScore.js";

export function analyzeDependency(dependency: PackageDependency, metadataResult: NpmMetadataResult): DependencyAnalysis {
  if (metadataResult.status !== "success") {
    const score = calculatePackageScore({
      name: dependency.name,
      requestedVersion: dependency.requestedVersion,
      metadataStatus: metadataResult.status,
      metadataFailureReason: metadataResult.reason
    });

    return {
      name: dependency.name,
      dependencyType: dependency.dependencyType,
      requestedVersion: dependency.requestedVersion,
      deprecated: false,
      hasInstallScripts: false,
      score: score.score,
      riskLevel: score.riskLevel,
      reasons: score.reasons,
      recommendations: score.recommendations,
      metadataStatus: metadataResult.status,
      metadataFailureReason: metadataResult.reason
    };
  }

  const metadata = metadataResult.metadata;
  const score = calculatePackageScore({
    name: dependency.name,
    requestedVersion: dependency.requestedVersion,
    latestVersion: metadata.latestVersion,
    license: metadata.license,
    repository: metadata.repository,
    maintainersCount: metadata.maintainersCount,
    dependencyCount: metadata.dependencyCount,
    deprecated: metadata.deprecated,
    latestPublishDate: metadata.latestPublishDate,
    hasInstallScripts: metadata.hasInstallScripts,
    metadataStatus: "success"
  });

  return {
    name: dependency.name,
    dependencyType: dependency.dependencyType,
    requestedVersion: dependency.requestedVersion,
    latestVersion: metadata.latestVersion,
    description: metadata.description,
    license: metadata.license,
    repository: metadata.repository,
    maintainersCount: metadata.maintainersCount,
    dependencyCount: metadata.dependencyCount,
    deprecated: metadata.deprecated,
    latestPublishDate: metadata.latestPublishDate,
    hasInstallScripts: metadata.hasInstallScripts,
    score: score.score,
    riskLevel: score.riskLevel,
    reasons: score.reasons,
    recommendations: score.recommendations,
    metadataStatus: "success"
  };
}
