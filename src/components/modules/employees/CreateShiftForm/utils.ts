
import { eachDayOfInterval } from "date-fns";
import { getIsraelDate, getIsraelDateString, createIsraelDateFromString } from '@/lib/dateUtils';

export function getDatesForSelectedWeekdays(start: string, end: string, weekdays: number[]): string[] {
  // start & end are yyyy-MM-dd strings
  if (!start || !end || weekdays.length === 0) return [];
  
  // Use Israel timezone date construction
  const startDate = createIsraelDateFromString(start);
  const endDate = createIsraelDateFromString(end);
  
  console.log('🗓️ getDatesForSelectedWeekdays:', {
    start,
    end,
    startDate,
    endDate,
    weekdays
  });
  
  const allDates = eachDayOfInterval({ start: startDate, end: endDate });
  return allDates
    .filter((date) => {
      const israelDate = getIsraelDate(date);
      return weekdays.includes(israelDate.getDay());
    })
   .map(date => getIsraelDateString(date));
}
