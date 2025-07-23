
import { useState } from 'react';
import type { ShabbatTimes } from '@/types/calendar';

export const useShabbatTimes = () => {
  const [shabbatTimes] = useState<ShabbatTimes[]>([]);
  const [isLoading] = useState(false);
  const [error] = useState<Error | null>(null);

  const getShabbatTimesForDate = (date: Date): ShabbatTimes | null => {
    const dateStr = date.toISOString().split('T')[0];
    return shabbatTimes.find(st => st.date === dateStr) || null;
  };

  const getShabbatTimesForWeek = (startDate: Date): ShabbatTimes[] => {
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      weekDates.push(date.toISOString().split('T')[0]);
    }
    return shabbatTimes.filter(st => weekDates.includes(st.date));
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
