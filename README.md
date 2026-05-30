# npm-package-doctor

[![CI](https://github.com/sripavantejb/npm-package-doctor/actions/workflows/ci.yml/badge.svg)](https://github.com/sripavantejb/npm-package-doctor/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/npm-package-doctor.svg)](https://www.npmjs.com/package/npm-package-doctor)
[![npm downloads](https://img.shields.io/npm/dm/npm-package-doctor.svg)](https://www.npmjs.com/package/npm-package-doctor)
[![License: MIT](https://img.shields.io/npm/l/npm-package-doctor.svg)](LICENSE)

A CLI that scans npm dependencies and generates package health, security, and maintainability reports.

`npm-package-doctor` is an independent open-source CLI for the npm ecosystem. It is not official npm software.

## Problem Statement

Modern JavaScript projects often depend on dozens or hundreds of packages. A single dependency can introduce maintenance risk, license uncertainty, lifecycle scripts, stale releases, or supply-chain exposure. Developers need a quick way to inspect dependency health before upgrades, releases, and reviews.

## Why This Exists

`npm-package-doctor` turns dependency metadata into a readable health report. It combines package.json data, npm registry metadata, simple scoring rules, and professional report formats so teams can make better dependency decisions without digging through registry pages one package at a time.

## Features

- Scans `dependencies`, `devDependencies`, `optionalDependencies`, and `peerDependencies`
- Supports custom project paths
- Fetches npm registry metadata for each dependency
- Scores package health from 0 to 100
- Flags deprecated packages, missing licenses, missing repositories, stale publish dates, single-maintainer packages, high dependency counts, metadata failures, and install lifecycle scripts
- Calculates an overall project score and risk level
- Prints a polished terminal report
- Writes valid JSON reports for scripts and dashboards
- Creates a self-contained HTML report with inline CSS
- Includes an interactive CLI banner for terminal reports
- Ships with TypeScript types, tests, CI, and open-source project files

## Installation

Run with npx:

```bash
npx npm-package-doctor scan
```

Install globally:

```bash
npm install -g npm-package-doctor
npm-package-doctor scan
```

For local development:

```bash
npm install
npm run build
node dist/cli.js scan --path .
```

## Usage

```bash
npm-package-doctor scan
npm-package-doctor scan --path ./some-project
npm-package-doctor scan --json
npm-package-doctor scan --html
npm-package-doctor scan --output report.json
npm-package-doctor scan --output report.html
npm-package-doctor scan --include-dev
npm-package-doctor scan --only production
npm-package-doctor scan --only development
npm-package-doctor scan --no-banner
```

## CLI Options

| Option | Description |
| --- | --- |
| `--path <path>` | Scan a project directory or a direct `package.json` path. Defaults to the current directory. |
| `--json` | Print valid JSON to stdout, or write JSON when used with `--output`. |
| `--html` | Generate a self-contained HTML report. |
| `--output <file>` | Write the selected report to a file. `.json` and `.html` extensions are detected when no format flag is supplied. |
| `--include-dev` | Compatibility alias. The default scan already includes development dependencies. |
| `--only <scope>` | Limit the scan to `production` or `development` dependencies. |
| `--no-banner` | Hide the interactive terminal banner. |

## Example Terminal Output

```text
npm-package-doctor report

Project: my-node-app
Packages scanned: 42
Overall score: 78/100
Risk level: Medium

Summary:
  - Deprecated packages: 2
  - Packages with install scripts: 3
  - Packages with missing licenses: 1
  - Inactive packages: 5

High risk packages:

  old-package (production)
    Score: 42/100
    Reasons:
      - Package is deprecated.
      - Last published more than 3 years ago.
    Recommendations:
      - Replace deprecated packages with maintained alternatives.
```

## JSON Report Usage

Print JSON only:

```bash
npm-package-doctor scan --json
```

Write JSON:

```bash
npm-package-doctor scan --json --output report.json
```

JSON mode never prints the banner or colored terminal text, which makes it safe for scripts.

## HTML Report Usage

Generate the default HTML report:

```bash
npm-package-doctor scan --html
```

Choose the output file:

```bash
npm-package-doctor scan --html --output package-health-report.html
```

The HTML report is self-contained and includes the project summary, overall score, risk badges, dependency table, reasons, recommendations, author details, and timestamp.

## Scoring Explanation

Each package starts at 100 points. The score is reduced for clear, explainable signals:

- Deprecated package
- Metadata fetch failure
- Missing license
- Missing repository
- Last publish date older than 1, 2, or 3 years
- Requested version at least one major version behind latest
- Single maintainer or no listed maintainers
- High runtime dependency count
- Install lifecycle scripts

The project score is based on the average package score, with an additional penalty when critical-risk packages are present.

## Risk Levels

| Score | Risk level |
| --- | --- |
| 80 to 100 | Low |
| 60 to 79 | Medium |
| 40 to 59 | High |
| 0 to 39 | Critical |

## Example Use Cases

- Review dependency health before a release
- Compare risk before adding a new package
- Produce a JSON report for internal dashboards
- Attach an HTML report to a dependency review
- Spot deprecated or inactive packages during maintenance
- Review lifecycle scripts before running installs in sensitive environments

## CLI Banner

By default, npm-package-doctor shows a short interactive banner when printing terminal reports.

Disable it with:

```bash
npm-package-doctor scan --no-banner
```

The banner is hidden for JSON output, CI environments, and non-interactive terminals.

## Publishing Checklist

Do not publish until final review.

Before publishing:

```bash
npm install
npm run typecheck
npm test
npm run build
npm pack --dry-run
```

When ready:

```bash
npm login
npm version patch
npm publish --access public
```

Use `npm version minor` or `npm version major` when the release size calls for it.

## Roadmap

- GitHub Action integration
- Lockfile analysis
- npm audit integration
- SBOM generation
- Package replacement suggestions
- Web dashboard
- Monorepo and workspaces support
- Trusted publishing and provenance checks
- Dependency diff between branches
- Organization-level dependency reports

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for local setup, workflow, and pull request guidance.

## Security Note

This project provides risk signals from package metadata. It is not a complete security audit and should be used alongside code review, lockfile review, and vulnerability scanning. See [SECURITY.md](SECURITY.md).

## License

MIT License. See [LICENSE](LICENSE).

## Author

Created by Sri Pavan Tej Balam  
GitHub: [@sripavantejb](https://github.com/sripavantejb)
