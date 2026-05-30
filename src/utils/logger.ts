import chalk from "chalk";

export function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function writeError(message: string, useColor = process.stderr.isTTY): void {
  const prefix = useColor ? chalk.red("Error:") : "Error:";
  process.stderr.write(`${prefix} ${message}\n`);
}
