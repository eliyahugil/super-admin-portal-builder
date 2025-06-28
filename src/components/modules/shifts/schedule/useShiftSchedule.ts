
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useBusiness } from '@/hooks/useBusiness';
import type { ShiftScheduleData, EmployeeData, BranchData, ScheduleFilters } from './types';

export const useShiftSchedule = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filters, setFilters] = useState<ScheduleFilters>({
    status: 'all',
    employee: 'all',
    branch: 'all',
    role: 'all'
  });
  
  const { toast } = useToast();
  const { businessId } = useBusiness();
  const queryClient = useQueryClient();

  // Fetch shifts
  const { data: shifts = [], isLoading: shiftsLoading } = useQuery({
    queryKey: ['schedule-shifts', businessId, filters],
    queryFn: async (): Promise<ShiftScheduleData[]> => {
      let query = supabase
        .from('employee_shift_requests')
        .select(`
          *,
          employee:employees(first_name, last_name, business_id)
        `)
        .order('shift_date', { ascending: true });

      if (businessId) {
        query = query.eq('employee.business_id', businessId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(shift => ({
        id: shift.id,
        employee_id: shift.employee_id,
        shift_date: shift.shift_date,
        start_time: shift.start_time,
        end_time: shift.end_time,
        status: shift.status as 'pending' | 'approved' | 'rejected' | 'completed',
        branch_name: shift.branch_preference,
        branch_id: shift.branch_preference,
        role_preference: shift.role_preference,
        notes: shift.notes,
        created_at: shift.created_at
      }));
    },
    enabled: !!businessId
  });

  // Fetch employees
  const { data: employees = [] } = useQuery({
    queryKey: ['schedule-employees', businessId],
    queryFn: async (): Promise<EmployeeData[]> => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, phone, email')
        .eq('business_id', businessId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!businessId
  });

  // Fetch branches (mock data for now)
  const branches: BranchData[] = [
    { id: 'main', name: 'סניף ראשי' },
    { id: 'branch1', name: 'סניף א' },
    { id: 'branch2', name: 'סניף ב' }
  ];

  // Navigation
  const navigateDate = useCallback((direction: -1 | 0 | 1) => {
    const newDate = new Date(currentDate);
    
    if (direction === 0) {
      setCurrentDate(new Date());
    } else {
      newDate.setDate(newDate.getDate() + (direction * 7));
      setCurrentDate(newDate);
    }
  }, [currentDate]);

  // Update shift mutation
  const updateShiftMutation = useMutation({
    mutationFn: async ({ shiftId, updates }: { shiftId: string; updates: Partial<ShiftScheduleData> }) => {
      const { error } = await supabase
        .from('employee_shift_requests')
        .update({
          employee_id: updates.employee_id,
          shift_date: updates.shift_date,
          start_time: updates.start_time,
          end_time: updates.end_time,
          status: updates.status,
          branch_preference: updates.branch_name,
          role_preference: updates.role_preference,
          notes: updates.notes
        })
        .eq('id', shiftId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-shifts'] });
      toast({
        title: 'הצלחה',
        description: 'המשמרת עודכנה בהצלחה'
      });
    },
    onError: (error) => {
      console.error('Error updating shift:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לעדכן את המשמרת',
        variant: 'destructive'
      });
    }
  });

  // Delete shift mutation
  const deleteShiftMutation = useMutation({
    mutationFn: async (shiftId: string) => {
      const { error } = await supabase
        .from('employee_shift_requests')
        .delete()
        .eq('id', shiftId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-shifts'] });
      toast({
        title: 'הצלחה',
        description: 'המשמרת נמחקה בהצלחה'
      });
    },
    onError: (error) => {
      console.error('Error deleting shift:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן למחוק את המשמרת',
        variant: 'destructive'
      });
    }
  });

  // Create shift mutation
  const createShiftMutation = useMutation({
    mutationFn: async (shiftData: Omit<ShiftScheduleData, 'id' | 'created_at'>) => {
      const { error } = await supabase
        .from('employee_shift_requests')
        .insert({
          employee_id: shiftData.employee_id,
          shift_date: shiftData.shift_date,
          start_time: shiftData.start_time,
          end_time: shiftData.end_time,
          status: shiftData.status,
          branch_preference: shiftData.branch_name,
          role_preference: shiftData.role_preference,
          notes: shiftData.notes
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-shifts'] });
      toast({
        title: 'הצלחה',
        description: 'המשמרת נוספה בהצלחה'
      });
    },
    onError: (error) => {
      console.error('Error creating shift:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן ליצור את המשמרת',
        variant: 'destructive'
      });
    }
  });

  // Filter shifts based on current filters
  const filteredShifts = shifts.filter(shift => {
    if (filters.status !== 'all' && shift.status !== filters.status) return false;
    if (filters.employee !== 'all' && shift.employee_id !== filters.employee) return false;
    if (filters.branch !== 'all' && shift.branch_id !== filters.branch) return false;
    if (filters.role !== 'all' && shift.role_preference !== filters.role) return false;
    return true;
  });

  return {
    currentDate,
    shifts: filteredShifts,
    employees,
    branches,
    loading: shiftsLoading,
    filters,
    navigateDate,
    updateFilters: setFilters,
    updateShift: (shiftId: string, updates: Partial<ShiftScheduleData>) => 
      updateShiftMutation.mutate({ shiftId, updates }),
    deleteShift: (shiftId: string) => deleteShiftMutation.mutate(shiftId),
    createShift: (shiftData: Omit<ShiftScheduleData, 'id' | 'created_at'>) => 
      createShiftMutation.mutate(shiftData)
  };
};
