
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export interface IsraeliHoliday {
  date: string;
  name: string;
  hebrewName: string;
  type: 'חג' | 'מועד' | 'יום זיכרון' | 'יום עצמאות' | 'צום';
  isWorkingDay: boolean;
}

interface HebcalResponse {
  items: Array<{
    date: string;
    hebrew: string;
    title: string;
    category: string;
    subcat?: string;
    yomtov?: boolean;
    memo?: string;
  }>;
}

const fetchIsraeliHolidaysFromHebcal = async (): Promise<IsraeliHoliday[]> => {
  try {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    
    console.log('🎃 Fetching holidays from Hebcal for years:', currentYear, nextYear);
    
    // נקבל נתונים לשנה הנוכחית והשנה הבאה
    const promises = [currentYear, nextYear].map(async (year) => {
      const url = `https://www.hebcal.com/hebcal?v=1&cfg=json&maj=on&min=on&mod=on&nx=on&year=${year}&month=x&ss=on&mf=on&c=on&geo=geoname&geonameid=281184&M=on&s=on`;
      
      console.log(`📅 Fetching holidays for year ${year}:`, url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`HTTP error for year ${year}:`, response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: HebcalResponse = await response.json();
      console.log(`✅ Received ${data.items?.length || 0} items for year ${year}`);
      
      if (!data.items || !Array.isArray(data.items)) {
        console.warn(`No items array found for year ${year}`);
        return [];
      }
      
      return data.items
        .filter(item => {
          // סנן רק חגים ומועדים רלוונטיים
          const isRelevant = item.category === 'holiday' || 
                           item.category === 'roshchodesh' ||
                           item.yomtov === true ||
                           item.subcat === 'major' ||
                           item.subcat === 'minor';
          
          if (isRelevant) {
            console.log(`📍 Including holiday: ${item.hebrew} (${item.title}) - ${item.date}`);
          }
          
          return isRelevant;
        })
        .map(item => ({
          date: item.date,
          name: item.title || item.hebrew,
          hebrewName: item.hebrew || item.title,
          type: mapHolidayType(item.category, item.subcat, item.title),
          isWorkingDay: !item.yomtov // אם זה לא יום טוב, זה יום עבודה
        }));
    });
    
    const results = await Promise.all(promises);
    const allHolidays = results.flat();
    
    console.log('🎊 Total holidays loaded:', allHolidays.length);
    console.log('🎊 Sample holidays:', allHolidays.slice(0, 5));
    
    return allHolidays;
  } catch (error) {
    console.error('❌ Error fetching Israeli holidays from Hebcal:', error);
    // החזר רשימה ריקה במקום לגרום לקריסה
    return [];
  }
};

const mapHolidayType = (category: string, subcat?: string, title?: string): IsraeliHoliday['type'] => {
  if (title?.includes('זיכרון') || title?.includes('Memorial')) return 'יום זיכרון';
  if (title?.includes('עצמאות') || title?.includes('Independence')) return 'יום עצמאות';
  if (title?.includes('צום') || title?.includes('Fast')) return 'צום';
  if (category === 'holiday' || subcat === 'major') return 'חג';
  return 'מועד';
};

export const useIsraeliHolidaysFromHebcal = () => {
  const { data: holidays = [], isLoading, error, refetch } = useQuery({
    queryKey: ['israeli-holidays-hebcal'],
    queryFn: fetchIsraeliHolidaysFromHebcal,
    staleTime: 1000 * 60 * 60 * 12, // Cache for 12 hours
    gcTime: 1000 * 60 * 60 * 24, // Keep in memory for 24 hours
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  console.log('🔍 useIsraeliHolidaysFromHebcal state:', {
    holidaysCount: holidays.length,
    isLoading,
    hasError: !!error
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
    isLoading,
    error,
    refetch,
    getHolidaysForDate,
    getHolidaysForMonth,
    isHoliday,
    isWorkingDay
  };
};
