/** Split a single “full name” into two non-empty ship_* fields. */
export function splitFullName(fullName: string): { first: string; last: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const first = parts[0] || "Customer";
  const last = parts.length > 1 ? parts.slice(1).join(" ") : first;
  return { first, last };
}
