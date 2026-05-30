import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { existsSync } from "node:fs";
import type { PackageManager } from "../types/index.js";

export function detectPackageManager(projectPath: string, declaredPackageManager?: string): PackageManager {
  if (declaredPackageManager) {
    if (declaredPackageManager.startsWith("pnpm@")) return "pnpm";
    if (declaredPackageManager.startsWith("yarn@")) return "yarn";
    if (declaredPackageManager.startsWith("bun@")) return "bun";
    if (declaredPackageManager.startsWith("npm@")) return "npm";
  }

  if (existsSync(path.join(projectPath, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(path.join(projectPath, "yarn.lock"))) return "yarn";
  if (existsSync(path.join(projectPath, "bun.lock")) || existsSync(path.join(projectPath, "bun.lockb"))) return "bun";
  if (existsSync(path.join(projectPath, "package-lock.json")) || existsSync(path.join(projectPath, "npm-shrinkwrap.json"))) return "npm";

  return "unknown";
}

export async function writeTextFile(filePath: string, contents: string): Promise<string> {
  const resolvedPath = path.resolve(filePath);
  await mkdir(path.dirname(resolvedPath), { recursive: true });
  await writeFile(resolvedPath, contents, "utf8");
  return resolvedPath;
}
