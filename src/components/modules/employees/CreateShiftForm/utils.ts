
import { eachDayOfInterval } from "date-fns";

export function getDatesForSelectedWeekdays(start: string, end: string, weekdays: number[]): string[] {
  // start & end are yyyy-MM-dd strings
  if (!start || !end || weekdays.length === 0) return [];
  
  // Use local date construction to avoid timezone issues
  const [startYear, startMonth, startDay] = start.split('-').map(Number);
  const [endYear, endMonth, endDay] = end.split('-').map(Number);
  
  const from = new Date(startYear, startMonth - 1, startDay);
  const to = new Date(endYear, endMonth - 1, endDay);
  
  const all = eachDayOfInterval({ start: from, end: to });
  return all
    .filter((d) => weekdays.includes(d.getDay()))
    .map((d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    });
}
