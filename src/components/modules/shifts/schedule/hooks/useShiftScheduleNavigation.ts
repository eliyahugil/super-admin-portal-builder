
import { useState, useCallback } from 'react';

export const useShiftScheduleNavigation = () => {
  // Start with next week instead of current week
  const getNextWeek = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek;
  };
  
  const [currentDate, setCurrentDate] = useState(getNextWeek());

  const navigateDate = useCallback((direction: -1 | 0 | 1) => {
    const newDate = new Date(currentDate);
    
    if (direction === 0) {
      setCurrentDate(new Date());
    } else {
      newDate.setDate(newDate.getDate() + (direction * 7));
      setCurrentDate(newDate);
    }
  }, [currentDate]);

  return {
    currentDate,
    navigateDate
  };
};
