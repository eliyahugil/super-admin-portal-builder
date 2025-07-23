import { useMemo, useState } from 'react';
import { ScheduleFiltersType } from '../types';

export const useShiftScheduleFilters = (shifts: any[]) => {
  const [filters, setFilters] = useState<ScheduleFiltersType>({
    status: 'all',
    employee: 'all',
    branch: 'all',
    role: 'all'
  });

  const filteredShifts = useMemo(() => {
    return shifts.filter(shift => {
      const matchesStatus = filters.status === 'all' || shift.status === filters.status;
      const matchesEmployee = filters.employee === 'all' || shift.employee_id === filters.employee;
      const matchesBranch = filters.branch === 'all' || shift.branch_id === filters.branch;
      const matchesRole = filters.role === 'all' || shift.role === filters.role;

      return matchesStatus && matchesEmployee && matchesBranch && matchesRole;
    });
  }, [shifts, filters]);

  const updateFilters = (newFilters: Partial<ScheduleFiltersType>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return {
    filters,
    filteredShifts,
    updateFilters
  };
};
