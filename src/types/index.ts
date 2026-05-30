export type DependencyType = "production" | "development" | "optional" | "peer";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type MetadataFetchStatus =
  | "success"
  | "not_found"
  | "network_error"
  | "timeout"
  | "invalid_metadata";

export type PackageManager = "npm" | "pnpm" | "yarn" | "bun" | "unknown";

export interface PackageDependency {
  name: string;
  requestedVersion: string;
  dependencyType: DependencyType;
}

export interface ProjectPackageJson {
  name: string;
  version?: string;
  packageJsonPath: string;
  projectPath: string;
  packageManager: PackageManager;
  dependencies: PackageDependency[];
}

export interface DistInfo {
  tarball?: string;
  shasum?: string;
  integrity?: string;
  unpackedSize?: number;
}

export interface NpmPackageMetadata {
  name: string;
  description?: string;
  latestVersion?: string;
  license?: string;
  repository?: string;
  maintainersCount?: number;
  dependencyCount: number;
  deprecated: boolean;
  latestPublishDate?: string;
  scripts: Record<string, string>;
  hasInstallScripts: boolean;
  dist?: DistInfo;
}

export interface NpmMetadataSuccess {
  status: "success";
  packageName: string;
  metadata: NpmPackageMetadata;
}

export interface NpmMetadataFailure {
  status: Exclude<MetadataFetchStatus, "success">;
  packageName: string;
  reason: string;
}

export type NpmMetadataResult = NpmMetadataSuccess | NpmMetadataFailure;

export interface PackageScoreInput {
  name: string;
  requestedVersion: string;
  latestVersion?: string;
  license?: string;
  repository?: string;
  maintainersCount?: number;
  dependencyCount?: number;
  deprecated?: boolean;
  latestPublishDate?: string;
  hasInstallScripts?: boolean;
  metadataStatus: MetadataFetchStatus;
  metadataFailureReason?: string;
  referenceDate?: Date;
}

export interface PackageScoreResult {
  score: number;
  riskLevel: RiskLevel;
  reasons: string[];
  recommendations: string[];
}

export interface DependencyAnalysis {
  name: string;
  dependencyType: DependencyType;
  requestedVersion: string;
  latestVersion?: string;
  description?: string;
  license?: string;
  repository?: string;
  maintainersCount?: number;
  dependencyCount?: number;
  deprecated: boolean;
  latestPublishDate?: string;
  hasInstallScripts: boolean;
  score: number;
  riskLevel: RiskLevel;
  reasons: string[];
  recommendations: string[];
  metadataStatus: MetadataFetchStatus;
  metadataFailureReason?: string;
}

export interface ProjectSummary {
  totalPackages: number;
  lowRiskCount: number;
  mediumRiskCount: number;
  highRiskCount: number;
  criticalRiskCount: number;
  deprecatedCount: number;
  missingLicenseCount: number;
  installScriptRiskCount: number;
  inactivePackageCount: number;
  metadataFailureCount: number;
}

export interface ProjectScoreResult extends ProjectSummary {
  overallScore: number;
  overallRiskLevel: RiskLevel;
}

export interface ScanReport {
  projectName: string;
  projectPath: string;
  timestamp: string;
  packageManager: PackageManager;
  dependenciesScanned: number;
  overallScore: number;
  overallRiskLevel: RiskLevel;
  summary: ProjectSummary;
  dependencies: DependencyAnalysis[];
  recommendations: string[];
}

export interface ScanProjectOptions {
  projectPath?: string;
  only?: "production" | "development";
  includeDev?: boolean;
  timeoutMs?: number;
  concurrency?: number;
}
