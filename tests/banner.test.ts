import { afterEach, describe, expect, it, vi } from "vitest";
import { renderJsonReport } from "../src/reporters/jsonReporter.js";
import { shouldShowBanner, showBanner } from "../src/utils/banner.js";
import type { ScanReport } from "../src/types/index.js";

const originalCi = process.env.CI;
const originalIsTTY = Object.getOwnPropertyDescriptor(process.stdout, "isTTY");

afterEach(() => {
  vi.restoreAllMocks();
  if (originalCi === undefined) {
    delete process.env.CI;
  } else {
    process.env.CI = originalCi;
  }

  if (originalIsTTY) {
    Object.defineProperty(process.stdout, "isTTY", originalIsTTY);
  }
});

describe("banner", () => {
  it("skips banner when disabled", () => {
    setStdoutTty(true);
    const spy = vi.spyOn(console, "log").mockImplementation(() => undefined);

    showBanner({ disabled: true });

    expect(spy).not.toHaveBeenCalled();
  });

  it("skips banner in JSON mode", () => {
    setStdoutTty(true);
    const spy = vi.spyOn(console, "log").mockImplementation(() => undefined);

    showBanner({ json: true });

    expect(spy).not.toHaveBeenCalled();
  });

  it("skips banner in CI", () => {
    setStdoutTty(true);
    process.env.CI = "true";

    expect(shouldShowBanner()).toBe(false);
  });

  it("does not add banner text to JSON reports", () => {
    const json = renderJsonReport(reportFixture());

    expect(() => JSON.parse(json)).not.toThrow();
    expect(json).not.toContain("NPM PACKAGE DOCTOR");
    expect(json).not.toContain("Created by Sri Pavan Tej Balam");
  });
});

function setStdoutTty(value: boolean): void {
  Object.defineProperty(process.stdout, "isTTY", {
    configurable: true,
    value
  });
}

function reportFixture(): ScanReport {
  return {
    projectName: "sample-project",
    projectPath: "/tmp/sample-project",
    timestamp: "2026-05-30T00:00:00.000Z",
    packageManager: "npm",
    dependenciesScanned: 1,
    overallScore: 95,
    overallRiskLevel: "low",
    summary: {
      totalPackages: 1,
      lowRiskCount: 1,
      mediumRiskCount: 0,
      highRiskCount: 0,
      criticalRiskCount: 0,
      deprecatedCount: 0,
      missingLicenseCount: 0,
      installScriptRiskCount: 0,
      inactivePackageCount: 0,
      metadataFailureCount: 0
    },
    dependencies: [],
    recommendations: ["No immediate project-level action needed."]
  };
}
