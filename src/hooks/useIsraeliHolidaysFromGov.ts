
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export interface IsraeliHoliday {
  date: string;
  name: string;
  hebrewName: string;
  type: 'חג' | 'מועד' | 'יום זיכרון' | 'יום עצמאות';
  isWorkingDay: boolean;
}

interface GovDataResponse {
  success: boolean;
  result: {
    records: Array<{
      date?: string;
      hebrew_date?: string;
      holiday_name?: string;
      hebrew_name?: string;
      english_name?: string;
      type?: string;
      is_working_day?: string;
      year?: string;
      month?: string;
      day?: string;
    }>;
    total: number;
  };
}

const fetchIsraeliHolidaysFromGov = async (): Promise<IsraeliHoliday[]> => {
  try {
    const currentYear = new Date().getFullYear();
    
    // Try different resource IDs that might contain holiday data
    const possibleResourceIds = [
      'c9b9f42c-8edb-4373-84f8-15c6b53c6947', // חגים ומועדים
      '67492cda-b36e-45f4-9ed1-0471af297e8b', // נתונים כלליים
      'f8b20b24-5f8c-4a39-9b4f-2f6e84a8b5e0', // לוח שנה עברי
    ];

    let allHolidays: IsraeliHoliday[] = [];

    for (const resourceId of possibleResourceIds) {
      try {
        const url = `https://data.gov.il/api/3/action/datastore_search?resource_id=${resourceId}&limit=1000&filters={"year":"${currentYear}"}`;
        
        console.log(`🔍 Fetching holidays from resource: ${resourceId}`);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          console.warn(`Failed to fetch from resource ${resourceId}: ${response.status}`);
          continue;
        }
        
        const data: GovDataResponse = await response.json();
        
        if (!data.success || !data.result?.records) {
          console.warn(`No valid data from resource ${resourceId}`);
          continue;
        }

        console.log(`📅 Found ${data.result.records.length} records from resource ${resourceId}`);
        
        const holidays = data.result.records
          .filter(record => record.hebrew_name || record.holiday_name || record.english_name)
          .map(record => {
            // Try to parse date from different possible fields
            let dateStr = record.date;
            if (!dateStr && record.year && record.month && record.day) {
              const month = record.month.padStart(2, '0');
              const day = record.day.padStart(2, '0');
              dateStr = `${record.year}-${month}-${day}`;
            }
            
            return {
              date: dateStr || '',
              name: record.english_name || record.holiday_name || record.hebrew_name || '',
              hebrewName: record.hebrew_name || record.holiday_name || record.english_name || '',
              type: mapHolidayType(record.type || ''),
              isWorkingDay: record.is_working_day === 'כן' || record.is_working_day === 'yes' || record.is_working_day === '1'
            };
          })
          .filter(holiday => holiday.date && holiday.hebrewName);

        allHolidays = [...allHolidays, ...holidays];
        
        if (holidays.length > 0) {
          console.log(`✅ Successfully parsed ${holidays.length} holidays from resource ${resourceId}`);
          break; // If we found holidays, no need to try other resources
        }
      } catch (error) {
        console.error(`Error fetching from resource ${resourceId}:`, error);
        continue;
      }
    }
    
    // If no holidays found from government API, return some fallback holidays
    if (allHolidays.length === 0) {
      console.warn('⚠️ No holidays found from government API, using fallback data');
      allHolidays = getFallbackHolidays(currentYear);
    }
    
    // Remove duplicates and sort by date
    const uniqueHolidays = allHolidays.filter((holiday, index, self) => 
      index === self.findIndex(h => h.date === holiday.date && h.hebrewName === holiday.hebrewName)
    ).sort((a, b) => a.date.localeCompare(b.date));
    
    console.log(`🎉 Final result: ${uniqueHolidays.length} unique holidays`);
    return uniqueHolidays;
  } catch (error) {
    console.error('Error fetching Israeli holidays from government API:', error);
    return getFallbackHolidays(new Date().getFullYear());
  }
};

const mapHolidayType = (type: string): IsraeliHoliday['type'] => {
  if (!type) return 'חג';
  
  const lowerType = type.toLowerCase();
  if (lowerType.includes('חג') || lowerType.includes('holiday')) return 'חג';
  if (lowerType.includes('מועד') || lowerType.includes('festival')) return 'מועד';
  if (lowerType.includes('זיכרון') || lowerType.includes('memorial')) return 'יום זיכרון';
  if (lowerType.includes('עצמאות') || lowerType.includes('independence')) return 'יום עצמאות';
  return 'חג';
};

const getFallbackHolidays = (year: number): IsraeliHoliday[] => {
  // Fallback holidays for the current year (approximate dates)
  return [
    {
      date: `${year}-01-01`,
      name: "New Year's Day",
      hebrewName: 'ראש השנה הלועזית',
      type: 'חג',
      isWorkingDay: false
    },
    {
      date: `${year}-04-14`,
      name: 'Independence Day',
      hebrewName: 'יום העצמאות',
      type: 'יום עצמאות',
      isWorkingDay: false
    },
    {
      date: `${year}-04-13`,
      name: 'Memorial Day',
      hebrewName: 'יום הזיכרון',
      type: 'יום זיכרון',
      isWorkingDay: false
    },
    {
      date: `${year}-05-13`,
      name: 'Lag BaOmer',
      hebrewName: 'ל״ג בעומר',
      type: 'חג',
      isWorkingDay: true
    }
  ];
};

export const useIsraeliHolidaysFromGov = () => {
  const { data: holidays = [], isLoading, error } = useQuery({
    queryKey: ['israeli-holidays-gov'],
    queryFn: fetchIsraeliHolidaysFromGov,
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
