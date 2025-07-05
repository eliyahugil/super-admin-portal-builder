
import { useState, useCallback } from 'react';

export const useShiftScheduleNavigation = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

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
