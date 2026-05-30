import { mkdtemp, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import { readPackageJson } from "../src/scanner/readPackageJson.js";

let tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.map((tempDir) => rm(tempDir, { recursive: true, force: true })));
  tempDirs = [];
});

describe("readPackageJson", () => {
  it("reads and normalizes dependency sections", async () => {
    const projectPath = await createTempProject({
      name: "sample-project",
      dependencies: { chalk: "^5.0.0" },
      devDependencies: { vitest: "^2.0.0" },
      optionalDependencies: { fsevents: "^2.3.3" },
      peerDependencies: { react: "^19.0.0" }
    });

    const result = await readPackageJson(projectPath);

    expect(result.name).toBe("sample-project");
    expect(result.dependencies).toEqual([
      { name: "chalk", requestedVersion: "^5.0.0", dependencyType: "production" },
      { name: "vitest", requestedVersion: "^2.0.0", dependencyType: "development" },
      { name: "fsevents", requestedVersion: "^2.3.3", dependencyType: "optional" },
      { name: "react", requestedVersion: "^19.0.0", dependencyType: "peer" }
    ]);
  });

  it("throws a clear error when package.json is missing", async () => {
    const projectPath = await mkdtemp(path.join(os.tmpdir(), "npd-missing-"));
    tempDirs.push(projectPath);

    await expect(readPackageJson(projectPath)).rejects.toThrow(/No package\.json found/);
  });

  it("throws a clear error for invalid package.json", async () => {
    const projectPath = await mkdtemp(path.join(os.tmpdir(), "npd-invalid-"));
    tempDirs.push(projectPath);
    await writeFile(path.join(projectPath, "package.json"), "{ invalid json", "utf8");

    await expect(readPackageJson(projectPath)).rejects.toThrow(/Invalid package\.json/);
  });
});

async function createTempProject(packageJson: Record<string, unknown>): Promise<string> {
  const projectPath = await mkdtemp(path.join(os.tmpdir(), "npd-project-"));
  tempDirs.push(projectPath);
  await writeFile(path.join(projectPath, "package.json"), JSON.stringify(packageJson, null, 2), "utf8");
  return projectPath;
}
