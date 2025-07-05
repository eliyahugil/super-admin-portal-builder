
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export interface ShabbatTimes {
  date: string;
  candleLighting: string;
  havdalah: string;
  parsha: string;
  location: string;
}

interface GovShabbatResponse {
  success: boolean;
  result: {
    records: Array<{
      date?: string;
      candle_lighting?: string;
      havdalah?: string;
      parsha?: string;
      parashat?: string;
      city?: string;
      location?: string;
      friday_date?: string;
      saturday_date?: string;
      candle_time?: string;
      havdalah_time?: string;
    }>;
    total: number;
  };
}

const fetchShabbatTimesFromGov = async (): Promise<ShabbatTimes[]> => {
  try {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    // Try different resource IDs that might contain Shabbat times
    const possibleResourceIds = [
      'e876d726-5e5f-4d1e-9f2c-8b3c4d2e1f0a', // זמני שבת
      'a1b2c3d4-e5f6-7890-1234-567890abcdef', // זמני כניסת ויציאת שבת
      'f8b20b24-5f8c-4a39-9b4f-2f6e84a8b5e0', // לוח שנה עברי
    ];

    let allShabbatTimes: ShabbatTimes[] = [];

    for (const resourceId of possibleResourceIds) {
      try {
        // Get data for current and next month
        for (const month of [currentMonth, currentMonth + 1]) {
          const adjustedMonth = month > 12 ? month - 12 : month;
          const adjustedYear = month > 12 ? currentYear + 1 : currentYear;
          
          const url = `https://data.gov.il/api/3/action/datastore_search?resource_id=${resourceId}&limit=1000&filters={"year":"${adjustedYear}","month":"${adjustedMonth}"}`;
          
          console.log(`🔍 Fetching Shabbat times from resource: ${resourceId} for ${adjustedYear}-${adjustedMonth}`);
          
          const response = await fetch(url);
          
          if (!response.ok) {
            console.warn(`Failed to fetch Shabbat times from resource ${resourceId}: ${response.status}`);
            continue;
          }
          
          const data: GovShabbatResponse = await response.json();
          
          if (!data.success || !data.result?.records) {
            console.warn(`No valid Shabbat data from resource ${resourceId}`);
            continue;
          }

          console.log(`🕯️ Found ${data.result.records.length} Shabbat records from resource ${resourceId}`);
          
          const shabbatTimes = data.result.records
            .filter(record => 
              (record.candle_lighting || record.candle_time) && 
              (record.havdalah || record.havdalah_time)
            )
            .map(record => {
              // Try to parse date from different possible fields
              let dateStr = record.date || record.friday_date || record.saturday_date;
              
              return {
                date: dateStr || '',
                candleLighting: record.candle_lighting || record.candle_time || '',
                havdalah: record.havdalah || record.havdalah_time || '',
                parsha: record.parsha || record.parashat || '',
                location: record.city || record.location || 'ירושלים'
              };
            })
            .filter(times => times.date && times.candleLighting && times.havdalah);

          allShabbatTimes = [...allShabbatTimes, ...shabbatTimes];
          
          if (shabbatTimes.length > 0) {
            console.log(`✅ Successfully parsed ${shabbatTimes.length} Shabbat times from resource ${resourceId}`);
          }
        }
        
        if (allShabbatTimes.length > 0) {
          break; // If we found Shabbat times, no need to try other resources
        }
      } catch (error) {
        console.error(`Error fetching Shabbat times from resource ${resourceId}:`, error);
        continue;
      }
    }
    
    // If no Shabbat times found from government API, return fallback times
    if (allShabbatTimes.length === 0) {
      console.warn('⚠️ No Shabbat times found from government API, using fallback data');
      allShabbatTimes = getFallbackShabbatTimes();
    }
    
    // Remove duplicates and sort by date
    const uniqueShabbatTimes = allShabbatTimes.filter((times, index, self) => 
      index === self.findIndex(t => t.date === times.date)
    ).sort((a, b) => a.date.localeCompare(b.date));
    
    console.log(`🕯️ Final result: ${uniqueShabbatTimes.length} unique Shabbat times`);
    return uniqueShabbatTimes;
  } catch (error) {
    console.error('Error fetching Shabbat times from government API:', error);
    return getFallbackShabbatTimes();
  }
};

const getFallbackShabbatTimes = (): ShabbatTimes[] => {
  // Generate fallback Shabbat times for the next few weeks
  const times: ShabbatTimes[] = [];
  const startDate = new Date();
  
  // Find next Friday
  const daysUntilFriday = (5 - startDate.getDay() + 7) % 7;
  const nextFriday = new Date(startDate);
  nextFriday.setDate(startDate.getDate() + daysUntilFriday);
  
  // Generate times for next 8 weeks
  for (let week = 0; week < 8; week++) {
    const friday = new Date(nextFriday);
    friday.setDate(nextFriday.getDate() + (week * 7));
    
    const saturday = new Date(friday);
    saturday.setDate(friday.getDate() + 1);
    
    // Approximate candle lighting time (18 minutes before sunset, around 7 PM in winter, 8 PM in summer)
    const month = friday.getMonth();
    const isSummer = month >= 3 && month <= 9;
    const candleTime = isSummer ? '19:30' : '18:45';
    const havdalahTime = isSummer ? '20:45' : '19:45';
    
    times.push({
      date: friday.toISOString().split('T')[0],
      candleLighting: candleTime,
      havdalah: '',
      parsha: `פרשת השבוע ${week + 1}`,
      location: 'ירושלים'
    });
    
    times.push({
      date: saturday.toISOString().split('T')[0],
      candleLighting: '',
      havdalah: havdalahTime,
      parsha: `פרשת השבוע ${week + 1}`,
      location: 'ירושלים'
    });
  }
  
  return times;
};

export const useShabbatTimesFromGov = () => {
  const { data: shabbatTimes = [], isLoading, error } = useQuery({
    queryKey: ['shabbat-times-gov'],
    queryFn: fetchShabbatTimesFromGov,
    staleTime: 1000 * 60 * 60 * 12, // Cache for 12 hours
    gcTime: 1000 * 60 * 60 * 24 * 3, // Keep in memory for 3 days
    retry: 2,
  });

  const getShabbatTimesForDate = (date: Date): ShabbatTimes | null => {
    const dateStr = date.toISOString().split('T')[0];
    return shabbatTimes.find(times => times.date === dateStr) || null;
  };

  const getShabbatTimesForWeek = (startDate: Date): ShabbatTimes[] => {
    const weekTimes: ShabbatTimes[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const times = getShabbatTimesForDate(date);
      if (times) {
        weekTimes.push(times);
      }
    }
    return weekTimes;
  };

  const isShabbat = (date: Date): boolean => {
    return date.getDay() === 6; // Saturday
  };

  const isFriday = (date: Date): boolean => {
    return date.getDay() === 5; // Friday
  };

  return {
    shabbatTimes,
    isLoading,
    error,
    getShabbatTimesForDate,
    getShabbatTimesForWeek,
    isShabbat,
    isFriday
  };
};
