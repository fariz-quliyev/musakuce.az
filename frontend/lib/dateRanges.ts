export type EventPeriod = "all" | "today" | "week" | "month";

/** Computes {from, to} ISO bounds for the "Bu gün / Bu həftə / Bu ay"
 * event filters. `to` is omitted for "all" (open-ended upcoming). */
export function getPeriodRange(period: EventPeriod, now: Date = new Date()): { from: string; to?: string } {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (period) {
    case "today": {
      const endOfToday = new Date(startOfToday);
      endOfToday.setDate(endOfToday.getDate() + 1);
      endOfToday.setMilliseconds(-1);
      return { from: startOfToday.toISOString(), to: endOfToday.toISOString() };
    }
    case "week": {
      const endOfWeek = new Date(startOfToday);
      endOfWeek.setDate(endOfWeek.getDate() + 7);
      return { from: now.toISOString(), to: endOfWeek.toISOString() };
    }
    case "month": {
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      return { from: now.toISOString(), to: endOfMonth.toISOString() };
    }
    default:
      return { from: now.toISOString() };
  }
}
