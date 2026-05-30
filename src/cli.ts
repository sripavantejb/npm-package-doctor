#!/usr/bin/env node
import path from "node:path";
import { Command, InvalidArgumentError } from "commander";
import { renderHtmlReport } from "./reporters/htmlReporter.js";
import { renderJsonReport } from "./reporters/jsonReporter.js";
import { renderTerminalReport } from "./reporters/terminalReporter.js";
import { scanProject } from "./scanner/scanProject.js";
import { showBanner } from "./utils/banner.js";
import { writeTextFile } from "./utils/fileUtils.js";
import { formatError, writeError } from "./utils/logger.js";

type ReportFormat = "terminal" | "json" | "html";

const packageVersion = "0.1.0";

interface ScanCommandOptions {
  path: string;
  json?: boolean;
  html?: boolean;
  output?: string;
  includeDev?: boolean;
  only?: "production" | "development";
  banner?: boolean;
}

const program = new Command();

program
  .name("npm-package-doctor")
  .description("Analyze npm dependencies and generate package health, security, and maintainability reports.")
  .version(packageVersion);

program
  .command("scan")
  .description("Scan npm dependencies in a Node.js project.")
  .option("--path <path>", "Project path to scan.", process.cwd())
  .option("--json", "Print or write a JSON report.")
  .option("--html", "Generate an HTML report.")
  .option("--output <file>", "Write the selected report to a file.")
  .option("--include-dev", "Include development dependencies. Kept for compatibility; default scans all dependency sections.")
  .option("--only <scope>", "Limit scan to production or development dependencies.", parseOnly)
  .option("--no-banner", "Disable the interactive CLI banner.")
  .action(async (options: ScanCommandOptions) => {
    await runScan(options);
  });

program.parseAsync(process.argv).catch((error: unknown) => {
  writeError(formatError(error), false);
  process.exitCode = 1;
});

async function runScan(options: ScanCommandOptions): Promise<void> {
  const format = determineReportFormat(options);

  try {
    const report = await scanProject({
      projectPath: options.path,
      only: options.only,
      includeDev: options.includeDev
    });

    if (format === "json") {
      const json = renderJsonReport(report);
      if (options.output) {
        await writeTextFile(options.output, json);
        return;
      }
      process.stdout.write(json);
      return;
    }

    if (format === "html") {
      const outputPath = options.output ?? "package-health-report.html";
      const writtenPath = await writeTextFile(outputPath, renderHtmlReport(report));
      process.stdout.write(`HTML report written to ${writtenPath}\n`);
      return;
    }

    const terminalReport = renderTerminalReport(report);
    if (options.output) {
      const writtenPath = await writeTextFile(options.output, terminalReport);
      process.stdout.write(`Terminal report written to ${writtenPath}\n`);
      return;
    }

    showBanner({
      disabled: options.banner === false,
      json: false,
      silent: format !== "terminal"
    });
    process.stdout.write(`${terminalReport}\n`);
  } catch (error) {
    if (format === "json") {
      process.stderr.write(`${formatError(error)}\n`);
    } else {
      writeError(formatError(error));
    }
    process.exitCode = 1;
  }
}

function determineReportFormat(options: ScanCommandOptions): ReportFormat {
  if (options.json && options.html) {
    throw new InvalidArgumentError("Choose either --json or --html, not both.");
  }

  const outputExtension = options.output ? path.extname(options.output).toLowerCase() : "";

  if (options.json) {
    if (outputExtension && outputExtension !== ".json") {
      throw new InvalidArgumentError("--json output files should use a .json extension.");
    }
    return "json";
  }

  if (options.html) {
    if (outputExtension && outputExtension !== ".html" && outputExtension !== ".htm") {
      throw new InvalidArgumentError("--html output files should use a .html extension.");
    }
    return "html";
  }

  if (outputExtension === ".json") {
    return "json";
  }

  if (outputExtension === ".html" || outputExtension === ".htm") {
    return "html";
  }

  return "terminal";
}

function parseOnly(value: string): "production" | "development" {
  if (value === "production" || value === "development") {
    return value;
  }

  throw new InvalidArgumentError("--only must be either production or development.");
}
