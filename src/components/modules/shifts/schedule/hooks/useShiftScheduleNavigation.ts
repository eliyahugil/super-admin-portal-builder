
import { useState } from 'react';

export const useShiftScheduleNavigation = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const navigateDate = (date: Date) => {
    setCurrentDate(date);
  };

  return {
    currentDate,
    navigateDate
  };
};
