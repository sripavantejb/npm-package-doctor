# Interview Explanation

## What Problem This Project Solves

Node.js projects depend on third-party packages for almost every layer of development. Those packages can become deprecated, stale, under-maintained, missing license metadata, or risky because they run install lifecycle scripts. `npm-package-doctor` gives developers a fast dependency health report they can use before releases, upgrades, and technical reviews.

## Why npm Dependency Health Matters

Dependencies are part of the application supply chain. A healthy dependency is more likely to have active maintenance, clear ownership, visible source history, and understandable license terms. A risky dependency can slow upgrades, create operational surprises, or increase exposure through transitive packages and install scripts.

## Architecture Overview

The project is split into small TypeScript modules:

- CLI layer: parses commands and routes output
- Scanner layer: reads `package.json`, fetches npm metadata, and builds dependency analysis
- Scoring layer: turns metadata signals into package and project scores
- Reporting layer: renders terminal, JSON, and HTML reports
- Utility layer: shared formatting, file output, semver helpers, logging, and banner behavior

This structure keeps the CLI thin and makes the core logic testable without real network calls.

## How Package Metadata Scanning Works

The scanner reads dependency sections from `package.json` and normalizes every dependency into a name, requested version, and dependency type. It then requests metadata from the npm registry endpoint:

```text
https://registry.npmjs.org/<package-name>
```

The metadata layer extracts the latest version, license, repository URL, maintainer count, runtime dependency count, deprecation status, latest publish date, lifecycle scripts, and selected dist information. Failed lookups return structured failure results, so one package cannot break the whole scan.

## How Scoring Works

Each package starts at 100. The score is reduced for explainable risk signals such as deprecation, missing metadata, stale publish dates, missing license, missing repository, single maintainer, major version drift, high dependency count, and install lifecycle scripts.

Risk levels are intentionally simple:

- 80 to 100: low
- 60 to 79: medium
- 40 to 59: high
- 0 to 39: critical

The project score averages package scores and applies an extra penalty when critical packages exist.

## Why Multiple Report Formats Are Useful

Terminal reports are useful for quick local review. JSON reports are useful for scripts, dashboards, and future integrations. HTML reports are useful for sharing a readable dependency review with teammates or including it in release notes.

## Why the Banner Is Safely Disabled

The banner only appears for interactive terminal reports. It is hidden for JSON output, CI environments, and non-interactive terminals. That keeps machine-readable output clean and avoids noisy logs in pipelines.

## Tradeoffs

- The first version uses npm registry metadata instead of lockfile-level analysis.
- The scoring model is intentionally transparent instead of complex.
- The CLI avoids install-time scripts to keep package installation predictable.
- Registry failures are reported as package-level results instead of stopping the scan.
- The HTML report is self-contained, which makes it portable but keeps styling simple.

## Future Improvements

- Lockfile analysis
- npm audit integration
- SBOM generation
- Package replacement suggestions
- Monorepo and workspace support
- Dependency diffs between branches
- Provenance and trusted publishing checks

## How to Explain This Project in Interviews

Describe it as a TypeScript CLI that inspects a Node.js project's npm dependency graph from `package.json`, enriches each package with npm registry metadata, calculates explainable health scores, and emits terminal, JSON, and HTML reports. The strongest engineering points are modular architecture, robust error handling, supply-chain awareness, report generation, and testable scoring logic.
