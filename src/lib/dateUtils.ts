import { format, startOfWeek, endOfWeek, addDays, eachDayOfInterval } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { he } from 'date-fns/locale';

/**
 * Date utility functions for consistent week calculations across the application
 * All dates are handled in Israel timezone (Asia/Jerusalem)
 */

// אזור זמן ירושלים
export const ISRAEL_TIMEZONE = 'Asia/Jerusalem';

/**
 * מחזיר תאריך באזור זמן ירושלים
 */
export function getIsraelDate(date?: Date): Date {
  const sourceDate = date || new Date();
  return toZonedTime(sourceDate, ISRAEL_TIMEZONE);
}

/**
 * מחזיר מחרוזת תאריך בפורמט YYYY-MM-DD באזור זמן ירושלים
 */
export function getIsraelDateString(date: Date): string {
  const israelDate = getIsraelDate(date);
  const year = israelDate.getFullYear();
  const month = String(israelDate.getMonth() + 1).padStart(2, '0');
  const day = String(israelDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * יוצר תאריך מ-YYYY-MM-DD string באזור זמן ירושלים
 */
export function createIsraelDateFromString(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  const localDate = new Date(year, month - 1, day);
  return getIsraelDate(localDate);
}

/**
 * שמות הימים בעברית (ראשון עד שבת)
 */
export const HEBREW_DAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
export const HEBREW_DAY_NAMES_SHORT = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

/**
 * Get the upcoming week dates (next week starting from Sunday) - Israel timezone
 * This is used as the default week selection throughout the system
 */
export const getUpcomingWeekDates = () => {
  const now = getIsraelDate();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Calculate the start of upcoming week (next Sunday)
  // If today is Sunday, get next Sunday. Otherwise get the coming Sunday.
  let daysUntilNextSunday;
  if (currentDay === 0) {
    // If today is Sunday, get next Sunday (7 days ahead)
    daysUntilNextSunday = 7;
  } else {
    // If today is Monday-Saturday, get the coming Sunday
    daysUntilNextSunday = 7 - currentDay;
  }
  
  const startOfUpcomingWeek = new Date(now);
  startOfUpcomingWeek.setDate(now.getDate() + daysUntilNextSunday);
  startOfUpcomingWeek.setHours(0, 0, 0, 0);
  
  // Calculate the end of upcoming week (Saturday)
  const endOfUpcomingWeek = new Date(startOfUpcomingWeek);
  endOfUpcomingWeek.setDate(startOfUpcomingWeek.getDate() + 6);
  endOfUpcomingWeek.setHours(23, 59, 59, 999);

  return {
    start: getIsraelDateString(startOfUpcomingWeek),
    end: getIsraelDateString(endOfUpcomingWeek),
    startDate: startOfUpcomingWeek,
    endDate: endOfUpcomingWeek
  };
};

/**
 * Get current week dates (for backwards compatibility if needed) - Israel timezone
 */
export const getCurrentWeekDates = () => {
  const now = getIsraelDate();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Calculate the start of current week (this Sunday or last Sunday)
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - currentDay);
  startOfWeek.setHours(0, 0, 0, 0);
  
  // Calculate the end of current week (this Saturday)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return {
    start: getIsraelDateString(startOfWeek),
    end: getIsraelDateString(endOfWeek),
    startDate: startOfWeek,
    endDate: endOfWeek
  };
};

/**
 * Get week dates for a specific date - Israel timezone
 */
export const getWeekDatesForDate = (date: Date) => {
  const israelDate = getIsraelDate(date);
  const currentDay = israelDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Calculate the start of week (Sunday)
  const startOfWeek = new Date(israelDate);
  startOfWeek.setDate(israelDate.getDate() - currentDay);
  startOfWeek.setHours(0, 0, 0, 0);
  
  // Calculate the end of week (Saturday)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return {
    start: getIsraelDateString(startOfWeek),
    end: getIsraelDateString(endOfWeek),
    startDate: startOfWeek,
    endDate: endOfWeek
  };
};