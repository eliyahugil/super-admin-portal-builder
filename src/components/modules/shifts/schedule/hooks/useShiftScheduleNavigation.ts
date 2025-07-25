
import { useState } from 'react';

export const useShiftScheduleNavigation = (view: 'week' | 'month' | 'year' | 'grouped' = 'month') => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const navigateDate = (direction: 'prev' | 'next' | 'today' | Date) => {
    if (direction instanceof Date) {
      setCurrentDate(direction);
      return;
    }

    switch (direction) {
      case 'prev':
        setCurrentDate(prev => {
          const newDate = new Date(prev);
          if (view === 'week') {
            newDate.setDate(newDate.getDate() - 7);
          } else if (view === 'month') {
            newDate.setMonth(newDate.getMonth() - 1);
          } else {
            newDate.setFullYear(newDate.getFullYear() - 1);
          }
          return newDate;
        });
        break;
      case 'next':
        setCurrentDate(prev => {
          const newDate = new Date(prev);
          if (view === 'week') {
            newDate.setDate(newDate.getDate() + 7);
          } else if (view === 'month') {
            newDate.setMonth(newDate.getMonth() + 1);
          } else {
            newDate.setFullYear(newDate.getFullYear() + 1);
          }
          return newDate;
        });
        break;
      case 'today':
        setCurrentDate(new Date());
        break;
    }
  };

  return {
    currentDate,
    navigateDate
  };
};
