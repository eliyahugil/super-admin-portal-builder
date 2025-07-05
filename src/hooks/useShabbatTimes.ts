
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export interface ShabbatTimes {
  date: string;
  candleLighting: string;
  havdalah: string;
  parsha: string;
  location: string;
}

interface HebcalApiResponse {
  items: Array<{
    date: string;
    title: string;
    category: string;
    hebrew?: string;
    memo?: string;
  }>;
  location: {
    title: string;
  };
}

const fetchShabbatTimes = async (): Promise<ShabbatTimes[]> => {
  try {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    // Get data for current month and next month
    const promises = [currentMonth, currentMonth + 1].map(async (month) => {
      const adjustedMonth = month > 12 ? month - 12 : month;
      const adjustedYear = month > 12 ? currentYear + 1 : currentYear;
      
      const response = await fetch(
        `https://www.hebcal.com/hebcal?v=1&cfg=json&maj=on&min=on&nx=on&year=${adjustedYear}&month=${adjustedMonth}&geonameid=293397&M=on&s=on&c=on`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: HebcalApiResponse = await response.json();
      
      if (!data.items) {
        return [];
      }
      
      // Group by date to combine candle lighting and havdalah
      const dateGroups: { [key: string]: any } = {};
      
      data.items.forEach(item => {
        const date = item.date.split('T')[0];
        if (!dateGroups[date]) {
          dateGroups[date] = { date };
        }
        
        if (item.category === 'candles') {
          dateGroups[date].candleLighting = item.title.match(/(\d{1,2}:\d{2})/)?.[1] || '';
        } else if (item.category === 'havdalah') {
          dateGroups[date].havdalah = item.title.match(/(\d{1,2}:\d{2})/)?.[1] || '';
        } else if (item.category === 'parashat') {
          dateGroups[date].parsha = item.title.replace('Parashat ', '');
        }
      });
      
      return Object.values(dateGroups).filter(group => 
        group.candleLighting || group.havdalah
      ) as ShabbatTimes[];
    });
    
    const results = await Promise.all(promises);
    return results.flat().map(times => ({
      ...times,
      location: 'ירושלים'
    }));
  } catch (error) {
    console.error('Error fetching Shabbat times:', error);
    return [];
  }
};

export const useShabbatTimes = () => {
  const { data: shabbatTimes = [], isLoading, error } = useQuery({
    queryKey: ['shabbat-times'],
    queryFn: fetchShabbatTimes,
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
