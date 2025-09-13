/* src/lib/dates.ts */
const dtf = new Intl.DateTimeFormat("en-ZA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Africa/Johannesburg",
});

// Accepts "2024-01-15" or ISO strings. Returns "2024/01/15".
export function formatDateYMD(dateInput: string | Date): string {
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  // If the string is day-only (e.g., "2024-01-15"), force midnight local by adding 'T00:00:00'
  // to avoid UTC offset surprises.
  const normalized =
    typeof dateInput === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)
      ? new Date(`${dateInput}T00:00:00`)
      : d;
  return dtf.format(normalized).replace(/-/g, "/"); // en-ZA often uses YYYY/MM/DD already; ensure slashes
}
