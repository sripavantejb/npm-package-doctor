import semver from "semver";

export function getMinimumVersion(versionRange: string): semver.SemVer | null {
  if (!versionRange || isNonRegistryVersion(versionRange)) {
    return null;
  }

  return semver.minVersion(versionRange);
}

export function getMajorVersionGap(requestedVersion: string, latestVersion?: string): number {
  if (!latestVersion) {
    return 0;
  }

  const requested = getMinimumVersion(requestedVersion);
  const latest = semver.parse(semver.clean(latestVersion) ?? semver.coerce(latestVersion)?.version ?? "");

  if (!requested || !latest) {
    return 0;
  }

  return Math.max(0, latest.major - requested.major);
}

export function isMajorVersionBehind(requestedVersion: string, latestVersion?: string): boolean {
  return getMajorVersionGap(requestedVersion, latestVersion) > 0;
}

export function isNonRegistryVersion(versionRange: string): boolean {
  return /^(workspace:|file:|link:|git\+|github:|https?:)/i.test(versionRange.trim());
}
