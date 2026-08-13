/**
 * Date Utility for Pure Calendar Session Dates in FRAGX.
 *
 * Session dates represent calendar days (e.g. "Aug 14, 2026"), not exact timestamps.
 * To ensure bulletproof timezone consistency across Vercel (UTC), Supabase PostgreSQL,
 * and client browsers (e.g. IST +05:30 or US timezones):
 *
 * 1. Calendar dates are normalized to UTC 12:00:00 (Noon).
 *    UTC 12:00:00 remains on the exact same calendar day across ALL timezones worldwide (UTC-11 to UTC+12).
 *
 * 2. Display formatting uses UTC getters (`getUTCFullYear`, `getUTCMonth`, `getUTCDate`) or `{ timeZone: "UTC" }`.
 */

/**
 * Returns today's calendar date as YYYY-MM-DD in local time.
 */
export function getTodayYMD(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Converts a YYYY-MM-DD string into a Date object normalized to UTC 12:00:00.
 */
export function parseYMDToUtcNoon(dateStr: string): Date {
  const cleanStr = dateStr.split("T")[0];
  const parts = cleanStr.split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    const fallback = new Date();
    return new Date(Date.UTC(fallback.getFullYear(), fallback.getMonth(), fallback.getDate(), 12, 0, 0, 0));
  }
  const year = parts[0];
  const month = parts[1] - 1;
  const day = parts[2];
  return new Date(Date.UTC(year, month, day, 12, 0, 0, 0));
}

/**
 * Returns the start (00:00:00) and end (23:59:59.999) of the UTC calendar day for a given YYYY-MM-DD date.
 */
export function getUtcDayBounds(dateStr: string) {
  const cleanStr = dateStr.split("T")[0];
  const parts = cleanStr.split("-").map(Number);
  const year = parts[0];
  const month = parts[1] - 1;
  const day = parts[2];

  return {
    startOfDay: new Date(Date.UTC(year, month, day, 0, 0, 0, 0)),
    endOfDay: new Date(Date.UTC(year, month, day, 23, 59, 59, 999)),
    utcNoon: new Date(Date.UTC(year, month, day, 12, 0, 0, 0)),
  };
}

/**
 * Formats a Date or ISO string to uppercase calendar string e.g. "AUG 14, 2026" using UTC timezone.
 */
export function formatSessionDate(date: Date | string, options?: { short?: boolean }): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  if (options?.short) {
    return d
      .toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      })
      .toUpperCase();
  }

  return d
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    })
    .toUpperCase();
}
