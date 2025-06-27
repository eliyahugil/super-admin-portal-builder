
import { useState, useMemo } from 'react';
import type { ShiftData } from '../types';

export const useShiftTableFilters = (shifts: ShiftData[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');

  // Filter shifts
  const filteredShifts = useMemo(() => {
    let filtered = [...shifts];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(shift =>
        shift.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shift.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shift.branch_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(shift => shift.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(shift => {
        const shiftDate = new Date(shift.shift_date);
        
        switch (dateFilter) {
          case 'today':
            return shiftDate.getTime() === today.getTime();
          case 'this_week':
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            return shiftDate >= startOfWeek && shiftDate <= endOfWeek;
          case 'this_month':
            return shiftDate.getMonth() === now.getMonth() && shiftDate.getFullYear() === now.getFullYear();
          case 'next_week':
            const nextWeekStart = new Date(today);
            nextWeekStart.setDate(today.getDate() + (7 - today.getDay()));
            const nextWeekEnd = new Date(nextWeekStart);
            nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
            return shiftDate >= nextWeekStart && shiftDate <= nextWeekEnd;
          default:
            return true;
        }
      });
    }

    // Branch filter
    if (branchFilter !== 'all') {
      filtered = filtered.filter(shift => shift.branch_name === branchFilter);
    }

    return filtered;
  }, [shifts, searchTerm, statusFilter, dateFilter, branchFilter]);

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    branchFilter,
    setBranchFilter,
    filteredShifts
  };
};
