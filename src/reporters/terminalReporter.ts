import { Chalk } from "chalk";
import type { DependencyAnalysis, RiskLevel, ScanReport } from "../types/index.js";
import { formatDate } from "../utils/formatDate.js";

export interface TerminalReporterOptions {
  color?: boolean;
}

type ChalkFormatter = InstanceType<typeof Chalk>;

export function renderTerminalReport(report: ScanReport, options: TerminalReporterOptions = {}): string {
  const useColor = options.color ?? Boolean(process.stdout.isTTY);
  const chalk = new Chalk({ level: useColor ? 1 : 0 });
  const highRiskPackages = report.dependencies.filter((dependency) => dependency.riskLevel === "high" || dependency.riskLevel === "critical");

  const lines: string[] = [
    chalk.bold("npm-package-doctor report"),
    "",
    `${chalk.gray("Project:")} ${report.projectName}`,
    `${chalk.gray("Path:")} ${report.projectPath}`,
    `${chalk.gray("Package manager:")} ${report.packageManager}`,
    `${chalk.gray("Generated:")} ${formatDate(report.timestamp)}`,
    `${chalk.gray("Packages scanned:")} ${report.dependenciesScanned}`,
    `${chalk.gray("Overall score:")} ${scoreText(report.overallScore, report.overallRiskLevel, chalk)}`,
    `${chalk.gray("Risk level:")} ${riskText(report.overallRiskLevel, chalk)}`,
    "",
    chalk.bold("Summary:"),
    `  ${bullet(chalk)} Deprecated packages: ${report.summary.deprecatedCount}`,
    `  ${bullet(chalk)} Packages with install scripts: ${report.summary.installScriptRiskCount}`,
    `  ${bullet(chalk)} Packages with missing licenses: ${report.summary.missingLicenseCount}`,
    `  ${bullet(chalk)} Inactive packages: ${report.summary.inactivePackageCount}`,
    `  ${bullet(chalk)} Metadata failures: ${report.summary.metadataFailureCount}`,
    "",
    chalk.bold("Risk distribution:"),
    `  ${riskText("low", chalk)}: ${report.summary.lowRiskCount}`,
    `  ${riskText("medium", chalk)}: ${report.summary.mediumRiskCount}`,
    `  ${riskText("high", chalk)}: ${report.summary.highRiskCount}`,
    `  ${riskText("critical", chalk)}: ${report.summary.criticalRiskCount}`,
    ""
  ];

  if (highRiskPackages.length > 0) {
    lines.push(chalk.bold("High risk packages:"), "");
    for (const dependency of highRiskPackages.slice(0, 10)) {
      lines.push(...renderDependencySummary(dependency, chalk));
    }
  } else {
    lines.push(chalk.bold("High risk packages:"), "", `  ${chalk.green("None found.")}`, "");
  }

  lines.push(chalk.bold("Recommendations:"), ...report.recommendations.map((item) => `  ${bullet(chalk)} ${item}`), "");

  return lines.join("\n");
}

function renderDependencySummary(dependency: DependencyAnalysis, chalk: ChalkFormatter): string[] {
  const lines = [
    `  ${chalk.bold(dependency.name)} ${chalk.gray(`(${dependency.dependencyType})`)}`,
    `    Score: ${scoreText(dependency.score, dependency.riskLevel, chalk)}`,
    `    Requested: ${dependency.requestedVersion}${dependency.latestVersion ? ` | Latest: ${dependency.latestVersion}` : ""}`,
    "    Reasons:"
  ];

  lines.push(...(dependency.reasons.length > 0 ? dependency.reasons : ["No major risk signals found."]).map((reason) => `      ${bullet(chalk)} ${reason}`));
  lines.push("    Recommendations:");
  lines.push(...dependency.recommendations.map((recommendation) => `      ${bullet(chalk)} ${recommendation}`));
  lines.push("");

  return lines;
}

function scoreText(score: number, riskLevel: RiskLevel, chalk: ChalkFormatter): string {
  return riskColor(riskLevel, chalk)(`${score}/100`);
}

function riskText(riskLevel: RiskLevel, chalk: ChalkFormatter): string {
  const label = riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1);
  return riskColor(riskLevel, chalk)(label);
}

function riskColor(riskLevel: RiskLevel, chalk: ChalkFormatter): (value: string) => string {
  if (riskLevel === "low") return (value: string) => chalk.green(value);
  if (riskLevel === "medium") return (value: string) => chalk.yellow(value);
  return (value: string) => chalk.red(value);
}

function bullet(chalk: ChalkFormatter): string {
  return chalk.gray("-");
}
