import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import type { DependencyType, PackageDependency, ProjectPackageJson } from "../types/index.js";
import { detectPackageManager } from "../utils/fileUtils.js";

type PackageJsonLike = {
  name?: unknown;
  version?: unknown;
  packageManager?: unknown;
  dependencies?: unknown;
  devDependencies?: unknown;
  optionalDependencies?: unknown;
  peerDependencies?: unknown;
};

export async function readPackageJson(projectPath = process.cwd()): Promise<ProjectPackageJson> {
  const resolvedInput = path.resolve(projectPath);
  const inputStat = await statIfExists(resolvedInput);
  const packageJsonPath =
    inputStat?.isFile() && path.basename(resolvedInput) === "package.json"
      ? resolvedInput
      : path.join(resolvedInput, "package.json");
  const projectRoot = path.dirname(packageJsonPath);

  let raw: string;
  try {
    raw = await readFile(packageJsonPath, "utf8");
  } catch (error) {
    const code = error instanceof Error && "code" in error ? String(error.code) : "";
    if (code === "ENOENT") {
      throw new Error(`No package.json found at ${packageJsonPath}. Run this command inside a Node.js project or pass --path.`);
    }

    throw new Error(`Unable to read package.json at ${packageJsonPath}: ${error instanceof Error ? error.message : String(error)}`);
  }

  let parsed: PackageJsonLike;
  try {
    const value = JSON.parse(raw) as unknown;
    if (!isObject(value)) {
      throw new Error("package.json must contain a JSON object.");
    }
    parsed = value;
  } catch (error) {
    throw new Error(`Invalid package.json at ${packageJsonPath}: ${error instanceof Error ? error.message : String(error)}`);
  }

  const dependencies = [
    ...readDependencyBlock(parsed.dependencies, "production"),
    ...readDependencyBlock(parsed.devDependencies, "development"),
    ...readDependencyBlock(parsed.optionalDependencies, "optional"),
    ...readDependencyBlock(parsed.peerDependencies, "peer")
  ];

  return {
    name: typeof parsed.name === "string" && parsed.name.length > 0 ? parsed.name : path.basename(projectRoot),
    version: typeof parsed.version === "string" ? parsed.version : undefined,
    packageJsonPath,
    projectPath: projectRoot,
    packageManager: detectPackageManager(projectRoot, typeof parsed.packageManager === "string" ? parsed.packageManager : undefined),
    dependencies
  };
}

function readDependencyBlock(value: unknown, dependencyType: DependencyType): PackageDependency[] {
  if (!isObject(value)) {
    return [];
  }

  return Object.entries(value)
    .filter((entry): entry is [string, string] => typeof entry[1] === "string")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, requestedVersion]) => ({
      name,
      requestedVersion,
      dependencyType
    }));
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function statIfExists(targetPath: string) {
  try {
    return await stat(targetPath);
  } catch {
    return undefined;
  }
}
