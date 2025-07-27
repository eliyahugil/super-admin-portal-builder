
import { useState, useMemo } from 'react';
import { startOfDay, endOfDay, addDays, startOfWeek, endOfWeek, addWeeks, isWithinInterval } from 'date-fns';
import type { ScheduleFiltersType, ShiftScheduleData } from '../types';

export const useShiftScheduleFilters = (shifts: ShiftScheduleData[]) => {
  const [filters, setFilters] = useState<ScheduleFiltersType>({
    status: 'all',
    employee: 'all',
    branch: 'all',
    role: 'all'
  });

  const [dateFilter, setDateFilter] = useState<{
    type: 'all' | 'today' | 'tomorrow' | 'this_week' | 'next_week' | 'custom';
    startDate?: Date;
    endDate?: Date;
  }>({
    type: 'all'
  });

  const updateFilters = (newFilters: Partial<ScheduleFiltersType>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const updateDateFilter = (type: 'today' | 'tomorrow' | 'this_week' | 'next_week' | 'all') => {
    const today = new Date();
    
    switch (type) {
      case 'today':
        setDateFilter({
          type: 'today',
          startDate: startOfDay(today),
          endDate: endOfDay(today)
        });
        break;
      case 'tomorrow':
        const tomorrow = addDays(today, 1);
        setDateFilter({
          type: 'tomorrow',
          startDate: startOfDay(tomorrow),
          endDate: endOfDay(tomorrow)
        });
        break;
      case 'this_week':
        setDateFilter({
          type: 'this_week',
          startDate: startOfWeek(today, { weekStartsOn: 0 }),
          endDate: endOfWeek(today, { weekStartsOn: 0 })
        });
        break;
      case 'next_week':
        const nextWeek = addWeeks(today, 1);
        setDateFilter({
          type: 'next_week',
          startDate: startOfWeek(nextWeek, { weekStartsOn: 0 }),
          endDate: endOfWeek(nextWeek, { weekStartsOn: 0 })
        });
        break;
      case 'all':
      default:
        setDateFilter({ type: 'all' });
        break;
    }
  };

  const resetFilters = () => {
    setFilters({
      status: 'all',
      employee: 'all',
      branch: 'all',
      role: 'all'
    });
    setDateFilter({ type: 'all' });
  };

  const filteredShifts = useMemo(() => {
    return shifts.filter(shift => {
      // Status filter
      if (filters.status !== 'all' && shift.status !== filters.status) {
        return false;
      }
      
      // Employee filter
      if (filters.employee !== 'all') {
        if (filters.employee === 'unassigned' && shift.employee_id !== null) {
          return false;
        }
        if (filters.employee !== 'unassigned' && shift.employee_id !== filters.employee) {
          return false;
        }
      }
      
      // Branch filter
      if (filters.branch !== 'all' && shift.branch_id !== filters.branch) {
        return false;
      }
      
      // Role filter
      if (filters.role !== 'all' && shift.role !== filters.role) {
        return false;
      }

      // Date filter
      if (dateFilter.type !== 'all' && dateFilter.startDate && dateFilter.endDate) {
        const shiftDate = new Date(shift.shift_date);
        if (!isWithinInterval(shiftDate, { start: dateFilter.startDate, end: dateFilter.endDate })) {
          return false;
        }
      }
      
      return true;
    });
  }, [shifts, filters, dateFilter]);

  return {
    filters,
    dateFilter,
    filteredShifts,
    updateFilters,
    updateDateFilter,
    resetFilters
  };
};
