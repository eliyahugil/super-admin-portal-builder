
import { useState } from 'react';
import type { ShiftScheduleFilters, ShiftScheduleData } from '../types';

export const useShiftScheduleFilters = (shifts: ShiftScheduleData[]) => {
  const [filters, setFilters] = useState<ShiftScheduleFilters>({
    status: 'all',
    employee: 'all',
    branch: 'all',
    role: 'all'
  });

  const filteredShifts = shifts.filter(shift => {
    if (filters.status !== 'all' && shift.status !== filters.status) return false;
    if (filters.employee !== 'all' && shift.employee_id !== filters.employee) return false;
    if (filters.branch !== 'all' && shift.branch_id !== filters.branch) return false;
    if (filters.role !== 'all' && shift.role_preference !== filters.role) return false;
    return true;
  });

  return {
    filters,
    filteredShifts,
    updateFilters: setFilters
  };
};
