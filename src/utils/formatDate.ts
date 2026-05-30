export function formatDate(value?: string | Date): string {
  if (!value) {
    return "Unknown";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toISOString().slice(0, 10);
}

export function yearsSince(value?: string, referenceDate = new Date()): number | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  const diffMs = referenceDate.getTime() - date.getTime();
  return diffMs / (1000 * 60 * 60 * 24 * 365.25);
}
