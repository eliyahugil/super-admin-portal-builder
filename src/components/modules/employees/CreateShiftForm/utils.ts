
import { eachDayOfInterval } from "date-fns";

export function getDatesForSelectedWeekdays(start: string, end: string, weekdays: number[]): string[] {
  // start & end are yyyy-MM-dd strings
  if (!start || !end || weekdays.length === 0) return [];
  const from = new Date(start);
  const to = new Date(end);
  const all = eachDayOfInterval({ start: from, end: to });
  return all
    .filter((d) => weekdays.includes(d.getDay()))
    .map((d) => d.toISOString().slice(0,10));
}
