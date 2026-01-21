/**
 * Determines if two dates fall within the same calendar month and year.
 * * @example
 * const date1 = new Date(2026, 0, 15); // Jan 15, 2026
 * const date2 = new Date(2026, 0, 20); // Jan 20, 2026
 * isSameCalendarMonth(date1, date2); // true
 * * @param a - The first date to compare.
 * @param b - The second date to compare.
 * @returns `true` if both dates share the same year and month; otherwise `false`.
 */
export const isSameCalendarMonth = (a: Date, b: Date): boolean => {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
};