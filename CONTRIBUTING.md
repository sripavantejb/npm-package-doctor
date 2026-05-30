# Contributing

Thank you for your interest in improving `npm-package-doctor`.

## Local Setup

```bash
git clone https://github.com/sripavantejb/npm-package-doctor.git
cd npm-package-doctor
npm install
```

## Development Commands

Run the CLI in development mode:

```bash
npm run dev -- --path .
```

Run tests:

```bash
npm test
```

Run type checks:

```bash
npm run typecheck
```

Build the package:

```bash
npm run build
```

Check package contents:

```bash
npm pack --dry-run
```

## Contribution Workflow

1. Open or find an issue.
2. Create a focused branch.
3. Make a small, testable change.
4. Add or update tests when behavior changes.
5. Update documentation when user-facing behavior changes.
6. Run `npm run typecheck`, `npm test`, and `npm run build`.
7. Open a pull request with a clear description.

## Branch Naming

Recommended branch names:

- `feat/html-report-polish`
- `fix/package-json-errors`
- `docs/scoring-rules`
- `test/project-score`

## Commit Message Examples

- `feat: add lockfile detection`
- `fix: handle scoped package metadata failures`
- `docs: explain scoring rules`
- `test: cover banner skip conditions`

## Pull Request Checklist

- Tests added or updated
- Documentation updated
- Typecheck passes
- Build passes
- No unrelated changes

## Good First Issue Ideas

- Add more package manager detection tests
- Improve HTML report accessibility labels
- Add fixtures for registry metadata parsing
- Add examples for common CI providers
- Improve recommendations for inactive packages
