# Architecture

`npm-package-doctor` is organized by responsibility so each layer can be explained, tested, and extended independently.

## CLI Layer

File: `src/cli.ts`

Responsibilities:

- Define the `npm-package-doctor scan` command
- Validate command options
- Select terminal, JSON, or HTML output
- Write output files when requested
- Keep JSON output clean
- Show the banner only for interactive terminal reports

## Scanner Layer

Files:

- `src/scanner/readPackageJson.ts`
- `src/scanner/fetchNpmMetadata.ts`
- `src/scanner/analyzeDependency.ts`
- `src/scanner/scanProject.ts`

Responsibilities:

- Locate and parse `package.json`
- Normalize dependency sections
- Fetch npm registry metadata
- Convert metadata and requested versions into dependency analysis
- Build the final scan report

## Metadata Layer

File: `src/scanner/fetchNpmMetadata.ts`

Responsibilities:

- Call the npm registry API
- Support scoped packages
- Handle not found, timeout, network, and invalid metadata states
- Extract latest version, license, repository, maintainers, dependency count, deprecation, publish date, lifecycle scripts, and dist information

## Scoring Layer

Files:

- `src/scoring/calculatePackageScore.ts`
- `src/scoring/calculateProjectScore.ts`

Responsibilities:

- Calculate package scores from 0 to 100
- Classify package risk levels
- Calculate project summary counts
- Calculate overall project health and risk
- Produce reasons and recommendations

## Reporting Layer

Files:

- `src/reporters/terminalReporter.ts`
- `src/reporters/jsonReporter.ts`
- `src/reporters/htmlReporter.ts`

Responsibilities:

- Render readable terminal output
- Render valid JSON output
- Render self-contained HTML output
- Keep report formatting separate from scanning and scoring

## Utility Layer

Files:

- `src/utils/banner.ts`
- `src/utils/fileUtils.ts`
- `src/utils/formatDate.ts`
- `src/utils/logger.ts`
- `src/utils/semverUtils.ts`

Responsibilities:

- Banner display rules
- Output file writing
- Package manager detection
- Date formatting
- Semver comparisons
- Error formatting
