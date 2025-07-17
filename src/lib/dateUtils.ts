/**
 * Date utility functions for consistent week calculations across the application
 */

/**
 * Get the upcoming week dates (next week starting from Sunday)
 * This is used as the default week selection throughout the system
 */
export const getUpcomingWeekDates = () => {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Calculate the start of next week (next Sunday)
  const startOfUpcomingWeek = new Date(now);
  startOfUpcomingWeek.setDate(now.getDate() - currentDay + 7);
  startOfUpcomingWeek.setHours(0, 0, 0, 0);
  
  // Calculate the end of upcoming week (next Saturday)
  const endOfUpcomingWeek = new Date(startOfUpcomingWeek);
  endOfUpcomingWeek.setDate(startOfUpcomingWeek.getDate() + 6);
  endOfUpcomingWeek.setHours(23, 59, 59, 999);

  return {
    start: startOfUpcomingWeek.toISOString().split('T')[0],
    end: endOfUpcomingWeek.toISOString().split('T')[0],
    startDate: startOfUpcomingWeek,
    endDate: endOfUpcomingWeek
  };
};

/**
 * Get current week dates (for backwards compatibility if needed)
 */
export const getCurrentWeekDates = () => {
  const now = new Date();
  const currentDay = now.getDay();
  
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - currentDay);
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return {
    start: startOfWeek.toISOString().split('T')[0],
    end: endOfWeek.toISOString().split('T')[0],
    startDate: startOfWeek,
    endDate: endOfWeek
  };
};

/**
 * Get week dates for a specific date
 */
export const getWeekDatesForDate = (date: Date) => {
  const targetDate = new Date(date);
  const currentDay = targetDate.getDay();
  
  const startOfWeek = new Date(targetDate);
  startOfWeek.setDate(targetDate.getDate() - currentDay);
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return {
    start: startOfWeek.toISOString().split('T')[0],
    end: endOfWeek.toISOString().split('T')[0],
    startDate: startOfWeek,
    endDate: endOfWeek
  };
};