import { describe, expect, it } from "vitest";
import { getMajorVersionGap, isMajorVersionBehind, isNonRegistryVersion } from "../src/utils/semverUtils.js";

describe("semverUtils", () => {
  it("detects major version drift", () => {
    expect(isMajorVersionBehind("^1.2.0", "3.0.0")).toBe(true);
    expect(getMajorVersionGap("^1.2.0", "3.0.0")).toBe(2);
  });

  it("does not flag compatible major versions", () => {
    expect(isMajorVersionBehind("^2.0.0", "2.9.0")).toBe(false);
  });

  it("ignores non-registry version specifiers", () => {
    expect(isNonRegistryVersion("workspace:*")).toBe(true);
    expect(isMajorVersionBehind("workspace:*", "3.0.0")).toBe(false);
  });
});
