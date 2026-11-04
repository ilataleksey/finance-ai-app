export function formatDisplayName(name: string): string {
  const normalized = name.trim().toLowerCase();

  if (!normalized) {
    return "";
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}