
import { useState } from 'react';
import { addWeeks, subWeeks, startOfWeek } from 'date-fns';

export const useShiftScheduleNavigation = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedWeek, setSelectedWeek] = useState(new Date());

  const navigateDate = (direction: 'prev' | 'next' | 'today' | Date) => {
    if (direction instanceof Date) {
      setCurrentDate(direction);
      return;
    }

    switch (direction) {
      case 'prev':
        setCurrentDate(prev => {
          const newDate = new Date(prev);
          newDate.setMonth(newDate.getMonth() - 1);
          return newDate;
        });
        break;
      case 'next':
        setCurrentDate(prev => {
          const newDate = new Date(prev);
          newDate.setMonth(newDate.getMonth() + 1);
          return newDate;
        });
        break;
      case 'today':
        setCurrentDate(new Date());
        break;
    }
  };

  const navigateWeek = (direction: 'prev' | 'next' | 'current' | Date) => {
    if (direction instanceof Date) {
      setSelectedWeek(direction);
      return;
    }

    switch (direction) {
      case 'prev':
        setSelectedWeek(prev => subWeeks(prev, 1));
        break;
      case 'next':
        setSelectedWeek(prev => addWeeks(prev, 1));
        break;
      case 'current':
        setSelectedWeek(new Date());
        break;
    }
  };

  const getWeekBounds = (date: Date) => {
    const weekStart = startOfWeek(date, { weekStartsOn: 0 });
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return { weekStart, weekEnd };
  };

  return {
    currentDate,
    selectedWeek,
    navigateDate,
    navigateWeek,
    getWeekBounds,
    setSelectedWeek
  };
};
