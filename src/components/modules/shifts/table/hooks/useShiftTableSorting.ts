
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
