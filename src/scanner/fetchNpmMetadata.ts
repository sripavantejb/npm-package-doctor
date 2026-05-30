import semver from "semver";
import type { DistInfo, NpmMetadataResult, NpmPackageMetadata } from "../types/index.js";

const registryBaseUrl = "https://registry.npmjs.org";
const installLifecycleScripts = new Set(["preinstall", "install", "postinstall"]);

export interface FetchNpmMetadataOptions {
  timeoutMs?: number;
}

export async function fetchNpmMetadata(
  packageName: string,
  options: FetchNpmMetadataOptions = {}
): Promise<NpmMetadataResult> {
  const timeoutMs = options.timeoutMs ?? 10_000;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const url = `${registryBaseUrl}/${encodeURIComponent(packageName)}`;

  try {
    const response = await fetch(url, {
      headers: {
        accept: "application/json"
      },
      signal: controller.signal
    });

    if (response.status === 404) {
      return {
        status: "not_found",
        packageName,
        reason: "Package was not found in the npm registry."
      };
    }

    if (!response.ok) {
      return {
        status: "network_error",
        packageName,
        reason: `Registry request failed with status ${response.status}.`
      };
    }

    const rawMetadata = (await response.json()) as unknown;
    const metadata = parseNpmMetadata(packageName, rawMetadata);

    if (!metadata) {
      return {
        status: "invalid_metadata",
        packageName,
        reason: "Registry response did not contain usable package metadata."
      };
    }

    return {
      status: "success",
      packageName,
      metadata
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return {
        status: "timeout",
        packageName,
        reason: `Registry request timed out after ${timeoutMs}ms.`
      };
    }

    return {
      status: "network_error",
      packageName,
      reason: error instanceof Error ? error.message : String(error)
    };
  } finally {
    clearTimeout(timeout);
  }
}

function parseNpmMetadata(packageName: string, rawMetadata: unknown): NpmPackageMetadata | undefined {
  if (!isRecord(rawMetadata)) {
    return undefined;
  }

  const versions = isRecord(rawMetadata.versions) ? rawMetadata.versions : undefined;
  if (!versions) {
    return undefined;
  }

  const distTags = isRecord(rawMetadata["dist-tags"]) ? rawMetadata["dist-tags"] : {};
  const latestFromTag = typeof distTags.latest === "string" ? distTags.latest : undefined;
  const latestVersion = latestFromTag ?? findLatestSemverVersion(Object.keys(versions));
  if (!latestVersion) {
    return undefined;
  }

  const latestRaw = versions[latestVersion];
  if (!isRecord(latestRaw)) {
    return undefined;
  }

  const scripts = readStringRecord(latestRaw.scripts);
  const dependencies = readStringRecord(latestRaw.dependencies);
  const dist = readDistInfo(latestRaw.dist);
  const maintainers = Array.isArray(rawMetadata.maintainers) ? rawMetadata.maintainers : undefined;
  const deprecated = typeof latestRaw.deprecated === "string" && latestRaw.deprecated.trim().length > 0;
  const time = isRecord(rawMetadata.time) ? rawMetadata.time : undefined;
  const latestPublishDate = time && typeof time[latestVersion] === "string" ? time[latestVersion] : undefined;

  return {
    name: typeof rawMetadata.name === "string" ? rawMetadata.name : packageName,
    description: typeof rawMetadata.description === "string" ? rawMetadata.description : undefined,
    latestVersion,
    license: readLicense(latestRaw.license ?? rawMetadata.license),
    repository: readRepository(latestRaw.repository ?? rawMetadata.repository),
    maintainersCount: maintainers?.length,
    dependencyCount: Object.keys(dependencies).length,
    deprecated,
    latestPublishDate,
    scripts,
    hasInstallScripts: Object.keys(scripts).some((scriptName) => installLifecycleScripts.has(scriptName)),
    dist
  };
}

function findLatestSemverVersion(versions: string[]): string | undefined {
  return versions.filter((version) => semver.valid(version)).sort(semver.rcompare)[0];
}

function readStringRecord(value: unknown): Record<string, string> {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
}

function readLicense(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }

  if (isRecord(value) && typeof value.type === "string") {
    return value.type;
  }

  return undefined;
}

function readRepository(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.replace(/^git\+/, "");
  }

  if (isRecord(value) && typeof value.url === "string" && value.url.trim().length > 0) {
    return value.url.replace(/^git\+/, "");
  }

  return undefined;
}

function readDistInfo(value: unknown): DistInfo | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const dist: DistInfo = {};

  if (typeof value.tarball === "string") dist.tarball = value.tarball;
  if (typeof value.shasum === "string") dist.shasum = value.shasum;
  if (typeof value.integrity === "string") dist.integrity = value.integrity;
  if (typeof value.unpackedSize === "number") dist.unpackedSize = value.unpackedSize;

  return Object.keys(dist).length > 0 ? dist : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
