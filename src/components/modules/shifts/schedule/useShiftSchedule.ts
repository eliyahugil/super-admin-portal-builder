
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

  // Fetch shifts from scheduled_shifts table (the main shift schedule)
  const { data: shifts = [], isLoading: shiftsLoading } = useQuery({
    queryKey: ['schedule-shifts', businessId, filters],
    queryFn: async (): Promise<ShiftScheduleData[]> => {
      console.log('🔍 Fetching shifts for business:', businessId);
      
      let query = supabase
        .from('scheduled_shifts')
        .select(`
          *,
          employee:employees(first_name, last_name, business_id),
          branch:branches(name)
        `)
        .eq('is_archived', false)
        .order('shift_date', { ascending: true });

      // Filter by business through branches or employees if businessId is available
      if (businessId) {
        // We need to filter through the employee's business_id or branch's business_id
        const { data: businessEmployees } = await supabase
          .from('employees')
          .select('id')
          .eq('business_id', businessId);
          
        const employeeIds = businessEmployees?.map(emp => emp.id) || [];
        
        if (employeeIds.length > 0) {
          query = query.or(`employee_id.in.(${employeeIds.join(',')}),employee_id.is.null`);
        }
      }

      const { data, error } = await query;
      if (error) {
        console.error('❌ Error fetching shifts:', error);
        throw error;
      }

      console.log('✅ Fetched shifts:', data?.length || 0);

      return (data || []).map(shift => ({
        id: shift.id,
        employee_id: shift.employee_id || '',
        shift_date: shift.shift_date,
        start_time: shift.shift_template?.start_time || '09:00',
        end_time: shift.shift_template?.end_time || '17:00',
        status: shift.is_assigned ? 'approved' : 'pending',
        branch_id: shift.branch_id || '',
        branch_name: shift.branch?.name || 'לא צוין',
        role_preference: '',
        notes: shift.notes || '',
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
        .eq('business_id', businessId)
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    },
    enabled: !!businessId
  });

  // Fetch branches
  const { data: branches = [] } = useQuery({
    queryKey: ['schedule-branches', businessId],
    queryFn: async (): Promise<BranchData[]> => {
      const { data, error } = await supabase
        .from('branches')
        .select('id, name, address')
        .eq('business_id', businessId)
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    },
    enabled: !!businessId
  });

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

  // Create shift mutation - creates in scheduled_shifts table
  const createShiftMutation = useMutation({
    mutationFn: async (shiftData: Omit<ShiftScheduleData, 'id' | 'created_at'>) => {
      console.log('🔧 Creating new shift:', shiftData);
      
      const insertData = {
        shift_date: shiftData.shift_date,
        branch_id: shiftData.branch_id || null,
        employee_id: shiftData.employee_id || null,
        is_assigned: !!shiftData.employee_id,
        notes: shiftData.notes || null,
        business_id: businessId,
        shift_template_id: null, // We can create a basic template or reference existing ones
        is_archived: false
      };

      const { data, error } = await supabase
        .from('scheduled_shifts')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating shift:', error);
        throw error;
      }

      console.log('✅ Shift created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-shifts'] });
      toast({
        title: 'הצלחה',
        description: 'המשמרת נוצרה בהצלחה'
      });
    },
    onError: (error) => {
      console.error('💥 Error creating shift:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן ליצור את המשמרת',
        variant: 'destructive'
      });
    }
  });

  // Update shift mutation
  const updateShiftMutation = useMutation({
    mutationFn: async ({ shiftId, updates }: { shiftId: string; updates: Partial<ShiftScheduleData> }) => {
      console.log('🔧 Updating shift:', shiftId, updates);
      
      const updateData: any = {};
      
      if (updates.employee_id !== undefined) {
        updateData.employee_id = updates.employee_id || null;
        updateData.is_assigned = !!updates.employee_id;
      }
      if (updates.shift_date) updateData.shift_date = updates.shift_date;
      if (updates.branch_id) updateData.branch_id = updates.branch_id;
      if (updates.notes !== undefined) updateData.notes = updates.notes || null;

      const { error } = await supabase
        .from('scheduled_shifts')
        .update(updateData)
        .eq('id', shiftId);

      if (error) {
        console.error('❌ Error updating shift:', error);
        throw error;
      }

      console.log('✅ Shift updated successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-shifts'] });
      toast({
        title: 'הצלחה',
        description: 'המשמרת עודכנה בהצלחה'
      });
    },
    onError: (error) => {
      console.error('💥 Error updating shift:', error);
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
      console.log('🗑️ Deleting shift:', shiftId);
      
      // Instead of deleting, we archive the shift
      const { error } = await supabase
        .from('scheduled_shifts')
        .update({ is_archived: true })
        .eq('id', shiftId);

      if (error) {
        console.error('❌ Error archiving shift:', error);
        throw error;
      }

      console.log('✅ Shift archived successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-shifts'] });
      toast({
        title: 'הצלחה',
        description: 'המשמרת נמחקה בהצלחה'
      });
    },
    onError: (error) => {
      console.error('💥 Error deleting shift:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן למחוק את המשמרת',
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
