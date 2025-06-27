
import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { ShiftData, ShiftSortBy, SortOrder, ShiftFilters } from './types';

export const useShiftTableLogic = (businessId?: string) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [sortBy, setSortBy] = useState<ShiftSortBy>('shift_date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const { toast } = useToast();

  console.log('🔄 useShiftTableLogic initializing with businessId:', businessId);

  // Fetch shifts data
  const { data: shifts = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['shifts-table', businessId],
    queryFn: async (): Promise<ShiftData[]> => {
      console.log('📊 Fetching shifts for business:', businessId);
      
      let query = supabase
        .from('employee_shift_requests')
        .select(`
          *,
          employee:employees(first_name, last_name, business_id)
        `)
        .order('shift_date', { ascending: false });

      if (businessId) {
        query = query.eq('employee.business_id', businessId);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching shifts:', error);
        throw error;
      }

      const formattedData: ShiftData[] = (data || []).map(shift => ({
        id: shift.id,
        employee_id: shift.employee_id,
        employee_name: `${shift.employee?.first_name || ''} ${shift.employee?.last_name || ''}`.trim(),
        shift_date: shift.shift_date,
        start_time: shift.start_time,
        end_time: shift.end_time,
        status: shift.status,
        branch_name: shift.branch_preference,
        branch_preference: shift.branch_preference,
        role_preference: shift.role_preference,
        notes: shift.notes,
        created_at: shift.created_at,
        reviewed_at: shift.reviewed_at,
        reviewed_by: shift.reviewed_by,
      }));

      console.log('✅ Fetched shifts:', formattedData.length);
      return formattedData;
    },
    enabled: !!businessId,
  });

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

    // Sort
    filtered.sort((a, b) => {
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

    return filtered;
  }, [shifts, searchTerm, statusFilter, dateFilter, branchFilter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredShifts.length / pageSize);
  const paginatedShifts = filteredShifts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Handlers
  const handleSort = (field: ShiftSortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleStatusUpdate = async (shiftId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('employee_shift_requests')
        .update({ 
          status: newStatus,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', shiftId);

      if (error) throw error;

      toast({
        title: 'סטטוס עודכן',
        description: `הסטטוס שונה בהצלחה`,
      });

      refetch();
    } catch (error) {
      console.error('Error updating shift status:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לעדכן את הסטטוס',
        variant: 'destructive',
      });
    }
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFilter, branchFilter]);

  return {
    shifts,
    filteredShifts: paginatedShifts,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    branchFilter,
    setBranchFilter,
    sortBy,
    sortOrder,
    handleSort,
    currentPage,
    totalPages,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    handleStatusUpdate,
    refetch
  };
};
