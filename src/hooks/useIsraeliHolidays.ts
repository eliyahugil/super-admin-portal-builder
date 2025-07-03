
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export interface IsraeliHoliday {
  date: string;
  name: string;
  hebrewName: string;
  type: 'חג' | 'מועד' | 'יום זיכרון' | 'יום עצמאות';
  isWorkingDay: boolean;
}

interface GovApiResponse {
  success: boolean;
  result: {
    records: Array<{
      date: string;
      hebrew_name: string;
      english_name: string;
      type: string;
      is_working_day: string;
    }>;
  };
}

const fetchIsraeliHolidays = async (): Promise<IsraeliHoliday[]> => {
  try {
    const currentYear = new Date().getFullYear();
    
    // נבקש נתונים לשנה הנוכחית והשנה הבאה
    const promises = [currentYear, currentYear + 1].map(async (year) => {
      const response = await fetch(
        `https://data.gov.il/api/3/action/datastore_search?resource_id=c9b9f42c-8edb-4373-84f8-15c6b53c6947&filters={"year":"${year}"}&limit=100`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: GovApiResponse = await response.json();
      
      if (!data.success || !data.result?.records) {
        return [];
      }
      
      return data.result.records.map(record => ({
        date: record.date,
        name: record.english_name || record.hebrew_name,
        hebrewName: record.hebrew_name,
        type: mapHolidayType(record.type),
        isWorkingDay: record.is_working_day === 'כן' || record.is_working_day === 'yes'
      }));
    });
    
    const results = await Promise.all(promises);
    return results.flat();
  } catch (error) {
    console.error('Error fetching Israeli holidays:', error);
    return [];
  }
};

const mapHolidayType = (type: string): IsraeliHoliday['type'] => {
  if (type?.includes('חג') || type?.includes('holiday')) return 'חג';
  if (type?.includes('מועד') || type?.includes('festival')) return 'מועד';
  if (type?.includes('זיכרון') || type?.includes('memorial')) return 'יום זיכרון';
  if (type?.includes('עצמאות') || type?.includes('independence')) return 'יום עצמאות';
  return 'חג';
};

export const useIsraeliHolidays = () => {
  const { data: holidays = [], isLoading, error } = useQuery({
    queryKey: ['israeli-holidays'],
    queryFn: fetchIsraeliHolidays,
    staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 7, // Keep in memory for 7 days
    retry: 2,
  });

  const getHolidaysForDate = (date: Date): IsraeliHoliday[] => {
    const dateStr = date.toISOString().split('T')[0];
    return holidays.filter(holiday => holiday.date === dateStr);
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
    isLoading,
    error,
    getHolidaysForDate,
    getHolidaysForMonth,
    isHoliday,
    isWorkingDay
  };
};
