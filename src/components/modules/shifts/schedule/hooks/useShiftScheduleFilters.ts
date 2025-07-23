
import { useState, useMemo } from 'react';
import type { ScheduleFiltersType, ShiftScheduleData } from '../types';

export const useShiftScheduleFilters = (shifts: ShiftScheduleData[]) => {
  const [filters, setFilters] = useState<ScheduleFiltersType>({
    status: 'all',
    employee: 'all',
    branch: 'all',
    role: 'all'
  });

  const updateFilters = (newFilters: Partial<ScheduleFiltersType>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const filteredShifts = useMemo(() => {
    return shifts.filter(shift => {
      if (filters.status !== 'all' && shift.status !== filters.status) {
        return false;
      }
      
      if (filters.employee !== 'all' && shift.employee_id !== filters.employee) {
        return false;
      }
      
      if (filters.branch !== 'all' && shift.branch_id !== filters.branch) {
        return false;
      }
      
      if (filters.role !== 'all' && shift.role !== filters.role) {
        return false;
      }
      
      return true;
    });
  }, [shifts, filters]);

  return {
    filters,
    filteredShifts,
    updateFilters
  };
};
