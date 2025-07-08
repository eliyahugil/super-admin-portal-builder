
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export interface IsraeliHoliday {
  date: string;
  name: string;
  hebrewName: string;
  type: 'חג' | 'מועד' | 'יום זיכרון' | 'יום עצמאות' | 'צום';
  isWorkingDay: boolean;
}

// נתונים סטטיים של חגים ישראליים לשנים 2025-2026
const staticHolidays: IsraeliHoliday[] = [
  // 2025
  { date: '2025-01-13', name: 'Tu BiShvat', hebrewName: 'ט״ו בשבט', type: 'מועד', isWorkingDay: true },
  { date: '2025-03-14', name: 'Purim', hebrewName: 'פורים', type: 'חג', isWorkingDay: false },
  { date: '2025-04-13', name: 'Passover', hebrewName: 'פסח', type: 'חג', isWorkingDay: false },
  { date: '2025-04-14', name: 'Passover', hebrewName: 'פסח', type: 'חג', isWorkingDay: false },
  { date: '2025-04-19', name: 'Passover', hebrewName: 'פסח', type: 'חג', isWorkingDay: false },
  { date: '2025-04-20', name: 'Passover', hebrewName: 'פסח', type: 'חג', isWorkingDay: false },
  { date: '2025-05-05', name: 'Independence Day', hebrewName: 'יום העצמאות', type: 'יום עצמאות', isWorkingDay: false },
  { date: '2025-05-04', name: 'Memorial Day', hebrewName: 'יום הזיכרון', type: 'יום זיכרון', isWorkingDay: false },
  { date: '2025-05-25', name: 'Lag BaOmer', hebrewName: 'ל״ג בעומר', type: 'מועד', isWorkingDay: true },
  { date: '2025-06-02', name: 'Shavuot', hebrewName: 'שבועות', type: 'חג', isWorkingDay: false },
  { date: '2025-09-16', name: 'Rosh Hashana', hebrewName: 'ראש השנה', type: 'חג', isWorkingDay: false },
  { date: '2025-09-17', name: 'Rosh Hashana', hebrewName: 'ראש השנה', type: 'חג', isWorkingDay: false },
  { date: '2025-09-25', name: 'Yom Kippur', hebrewName: 'יום כיפור', type: 'חג', isWorkingDay: false },
  { date: '2025-09-30', name: 'Sukkot', hebrewName: 'סוכות', type: 'חג', isWorkingDay: false },
  { date: '2025-10-07', name: 'Simchat Torah', hebrewName: 'שמחת תורה', type: 'חג', isWorkingDay: false },
  
  // 2026
  { date: '2026-02-02', name: 'Tu BiShvat', hebrewName: 'ט״ו בשבט', type: 'מועד', isWorkingDay: true },
  { date: '2026-03-05', name: 'Purim', hebrewName: 'פורים', type: 'חג', isWorkingDay: false },
  { date: '2026-04-01', name: 'Passover', hebrewName: 'פסח', type: 'חג', isWorkingDay: false },
  { date: '2026-04-02', name: 'Passover', hebrewName: 'פסח', type: 'חג', isWorkingDay: false },
  { date: '2026-04-07', name: 'Passover', hebrewName: 'פסח', type: 'חג', isWorkingDay: false },
  { date: '2026-04-08', name: 'Passover', hebrewName: 'פסח', type: 'חג', isWorkingDay: false },
  { date: '2026-04-22', name: 'Memorial Day', hebrewName: 'יום הזיכרון', type: 'יום זיכרון', isWorkingDay: false },
  { date: '2026-04-23', name: 'Independence Day', hebrewName: 'יום העצמאות', type: 'יום עצמאות', isWorkingDay: false },
  { date: '2026-05-12', name: 'Lag BaOmer', hebrewName: 'ל״ג בעומר', type: 'מועד', isWorkingDay: true },
  { date: '2026-05-21', name: 'Shavuت', hebrewName: 'שבועות', type: 'חג', isWorkingDay: false },
  { date: '2026-09-05', name: 'Rosh Hashana', hebrewName: 'ראש השנה', type: 'חג', isWorkingDay: false },
  { date: '2026-09-06', name: 'Rosh Hashana', hebrewName: 'ראש השנה', type: 'חג', isWorkingDay: false },
  { date: '2026-09-14', name: 'Yom Kippur', hebrewName: 'יום כיפור', type: 'חג', isWorkingDay: false },
  { date: '2026-09-19', name: 'Sukkot', hebrewName: 'סוכות', type: 'חג', isWorkingDay: false },
  { date: '2026-09-26', name: 'Simchat Torah', hebrewName: 'שמחת תורה', type: 'חג', isWorkingDay: false }
];

export const useIsraeliHolidaysFromHebcal = () => {
  const { data: holidays = staticHolidays, isLoading, error } = useQuery({
    queryKey: ['israeli-holidays-static'],
    queryFn: () => Promise.resolve(staticHolidays),
    staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 7, // Keep in memory for a week
  });

  console.log('🔍 useIsraeliHolidaysFromHebcal state:', {
    holidaysCount: holidays.length,
    isLoading: false,
    hasError: false
  });

  const getHolidaysForDate = (date: Date): IsraeliHoliday[] => {
    const dateStr = date.toISOString().split('T')[0];
    const found = holidays.filter(holiday => holiday.date === dateStr);
    console.log(`📅 Holidays for ${dateStr}:`, found);
    return found;
  };

  const getHolidaysForMonth = (year: number, month: number): IsraeliHoliday[] => {
    return holidays.filter(holiday => {
      const holidayDate = new Date(holiday.date);
      return holidayDate.getFullYear() === year && holidayDate.getMonth() === month;
    });
  };

  const isHoliday = (date: Date): boolean => {
    return getHolidaysForDate(date).length > 0;
  };

  const isWorkingDay = (date: Date): boolean => {
    const holidaysForDate = getHolidaysForDate(date);
    if (holidaysForDate.length === 0) return true;
    return holidaysForDate.some(h => h.isWorkingDay);
  };

  return {
    holidays,
    isLoading: false,
    error: null,
    refetch: () => Promise.resolve(),
    getHolidaysForDate,
    getHolidaysForMonth,
    isHoliday,
    isWorkingDay
  };
};
