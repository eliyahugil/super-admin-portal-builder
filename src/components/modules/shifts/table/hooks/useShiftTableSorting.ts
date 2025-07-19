
import { useState, useMemo } from 'react';
import type { ShiftData, ShiftSortBy, SortOrder } from '../types';

export const useShiftTableSorting = (filteredShifts: ShiftData[]) => {
  const [sortBy, setSortBy] = useState<ShiftSortBy>('shift_date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Sort shifts
  const sortedShifts = useMemo(() => {
    const sorted = [...filteredShifts];
    
    sorted.sort((a, b) => {
      let compareValue = 0;
      
      switch (sortBy) {
        case 'employee_name':
          compareValue = a.employee_name.localeCompare(b.employee_name, 'he');
          break;
        case 'shift_date':
          compareValue = new Date(a.shift_date).getTime() - new Date(b.shift_date).getTime();
          // אם התאריכים זהים, מיין לפי שעת התחלה ואז לפי משך המשמרת
          if (compareValue === 0) {
            const timeA = (a.start_time || '00:00').split(':').map(n => parseInt(n));
            const timeB = (b.start_time || '00:00').split(':').map(n => parseInt(n));
            const minutesA = timeA[0] * 60 + (timeA[1] || 0);
            const minutesB = timeB[0] * 60 + (timeB[1] || 0);
            
            // אם שעות ההתחלה זהות, מיין לפי שעת הסיום (המשמרת הארוכה קודם)
            if (minutesA === minutesB) {
              const endTimeA = (a.end_time || '23:59').split(':').map(n => parseInt(n));
              const endTimeB = (b.end_time || '23:59').split(':').map(n => parseInt(n));
              const endMinutesA = endTimeA[0] * 60 + (endTimeA[1] || 0);
              const endMinutesB = endTimeB[0] * 60 + (endTimeB[1] || 0);
              compareValue = endMinutesB - endMinutesA; // הארוכה קודם
            } else {
              compareValue = minutesA - minutesB;
            }
          }
          break;
        case 'status':
          compareValue = a.status.localeCompare(b.status);
          break;
        case 'created_at':
          compareValue = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        default:
          compareValue = 0;
      }
      
      return sortOrder === 'desc' ? -compareValue : compareValue;
    });

    return sorted;
  }, [filteredShifts, sortBy, sortOrder]);

  const handleSort = (field: ShiftSortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return {
    sortBy,
    sortOrder,
    handleSort,
    sortedShifts
  };
};
