import type { DependencyAnalysis, PackageDependency, ScanProjectOptions, ScanReport } from "../types/index.js";
import { calculateProjectScore } from "../scoring/calculateProjectScore.js";
import { analyzeDependency } from "./analyzeDependency.js";
import { fetchNpmMetadata } from "./fetchNpmMetadata.js";
import { readPackageJson } from "./readPackageJson.js";

export async function scanProject(options: ScanProjectOptions = {}): Promise<ScanReport> {
  const packageJson = await readPackageJson(options.projectPath ?? process.cwd());
  const dependencies = filterDependencies(packageJson.dependencies, options);

  if (dependencies.length === 0) {
    throw new Error(`No dependencies found to scan for the selected scope in ${packageJson.packageJsonPath}.`);
  }

  const analyses = await mapWithConcurrency(dependencies, options.concurrency ?? 6, async (dependency) => {
    const metadata = await fetchNpmMetadata(dependency.name, { timeoutMs: options.timeoutMs });
    return analyzeDependency(dependency, metadata);
  });

  const projectScore = calculateProjectScore(analyses);

  return {
    projectName: packageJson.name,
    projectPath: packageJson.projectPath,
    timestamp: new Date().toISOString(),
    packageManager: packageJson.packageManager,
    dependenciesScanned: analyses.length,
    overallScore: projectScore.overallScore,
    overallRiskLevel: projectScore.overallRiskLevel,
    summary: {
      totalPackages: projectScore.totalPackages,
      lowRiskCount: projectScore.lowRiskCount,
      mediumRiskCount: projectScore.mediumRiskCount,
      highRiskCount: projectScore.highRiskCount,
      criticalRiskCount: projectScore.criticalRiskCount,
      deprecatedCount: projectScore.deprecatedCount,
      missingLicenseCount: projectScore.missingLicenseCount,
      installScriptRiskCount: projectScore.installScriptRiskCount,
      inactivePackageCount: projectScore.inactivePackageCount,
      metadataFailureCount: projectScore.metadataFailureCount
    },
    dependencies: analyses.sort((a, b) => a.score - b.score || a.name.localeCompare(b.name)),
    recommendations: buildProjectRecommendations(analyses)
  };
}

function filterDependencies(dependencies: PackageDependency[], options: ScanProjectOptions): PackageDependency[] {
  if (options.only === "production") {
    return dependencies.filter((dependency) => dependency.dependencyType === "production");
  }

  if (options.only === "development") {
    return dependencies.filter((dependency) => dependency.dependencyType === "development");
  }

  return dependencies;
}

function buildProjectRecommendations(dependencies: DependencyAnalysis[]): string[] {
  const recommendations = new Set<string>();

  if (dependencies.some((dependency) => dependency.deprecated)) {
    recommendations.add("Replace deprecated packages.");
  }

  if (dependencies.some((dependency) => dependency.hasInstallScripts)) {
    recommendations.add("Review packages with install scripts.");
  }

  if (dependencies.some((dependency) => !dependency.license && dependency.metadataStatus === "success")) {
    recommendations.add("Verify licenses before production use.");
  }

  if (dependencies.some((dependency) => dependency.reasons.some((reason) => reason.includes("Last published more than")))) {
    recommendations.add("Prefer actively maintained packages.");
  }

  if (dependencies.some((dependency) => dependency.metadataStatus !== "success")) {
    recommendations.add("Retry failed metadata lookups and review unresolved packages manually.");
  }

  if (recommendations.size === 0) {
    recommendations.add("No immediate project-level action needed.");
  }

  return Array.from(recommendations);
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      const item = items[currentIndex];

      if (item !== undefined) {
        results[currentIndex] = await mapper(item);
      }
    }
  }

  const workerCount = Math.min(Math.max(1, concurrency), items.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  return results;
}
