import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import type { ShiftScheduleData, CreateShiftData } from '../types';

export const useShiftScheduleMutations = (businessId: string | null) => {
  const queryClient = useQueryClient();
  const { logActivity } = useActivityLogger();

  // Check for duplicate shifts before creation
  const checkForDuplicates = async (shiftData: CreateShiftData) => {
    console.log('🔍 Checking for duplicates:', shiftData);
    
    const { data: existingShifts, error } = await supabase
      .from('scheduled_shifts')
      .select('id, shift_date, start_time, end_time, employee_id, branch_id, is_archived')
      .eq('business_id', businessId)
      .eq('shift_date', shiftData.shift_date)
      .eq('start_time', shiftData.start_time)
      .eq('end_time', shiftData.end_time)
      .eq('is_archived', false); // רק משמרות לא מוקפאות

    if (error) {
      console.error('Error checking for duplicates:', error);
      return false;
    }

    console.log('🔍 Found existing shifts:', existingShifts);

    // Check for exact duplicates - only if employee AND branch are the same
    const exactDuplicates = existingShifts?.filter(shift => 
      shift.employee_id === shiftData.employee_id &&
      shift.branch_id === shiftData.branch_id &&
      shift.employee_id !== null // רק אם יש עובד מוקצה
    );

    console.log('🔍 Exact duplicates found:', exactDuplicates);
    return exactDuplicates && exactDuplicates.length > 0;
  };

  const createShift = useMutation({
    mutationFn: async (shiftData: CreateShiftData) => {
      console.log('🔄 Creating shift with business ID:', businessId);
      console.log('🔄 Shift data:', shiftData);
      
      if (!businessId) {
        console.error('❌ No business ID provided');
        throw new Error('Business ID is required');
      }

      // Check for duplicates
      const isDuplicate = await checkForDuplicates(shiftData);
      if (isDuplicate) {
        const errorMsg = `Duplicate shift detected for ${shiftData.shift_date} ${shiftData.start_time}-${shiftData.end_time}`;
        console.warn('⚠️', errorMsg);
        
        // Log the duplicate attempt
        await logActivity({
          action: 'duplicate_shift_prevented',
          target_type: 'shift',
          target_id: 'duplicate_prevention',
          details: {
            shift_date: shiftData.shift_date,
            start_time: shiftData.start_time,
            end_time: shiftData.end_time,
            employee_id: shiftData.employee_id,
            branch_id: shiftData.branch_id,
            prevented_at: new Date().toISOString()
          }
        });
        
        throw new Error('משמרת זהה כבר קיימת עבור התאריך והשעות הנבחרים');
      }

      const insertData = {
        business_id: businessId,
        shift_date: shiftData.shift_date,
        start_time: shiftData.start_time,
        end_time: shiftData.end_time,
        employee_id: shiftData.employee_id,
        branch_id: shiftData.branch_id,
        role: shiftData.role,
        notes: shiftData.notes,
        status: shiftData.status || (shiftData.employee_id ? 'approved' : 'pending'),
        is_assigned: !!shiftData.employee_id,
        is_archived: false,
        required_employees: shiftData.required_employees || 1,
        priority: shiftData.priority || 'normal',
        shift_template_id: shiftData.shift_template_id
      };

      console.log('🔄 Insert data:', insertData);

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
      
      // Log the successful creation with detailed information
      await logActivity({
        action: 'shift_created',
        target_type: 'shift',
        target_id: data.id,
        details: {
          shift_date: data.shift_date,
          start_time: data.start_time,
          end_time: data.end_time,
          employee_id: data.employee_id,
          branch_id: data.branch_id,
          role: data.role,
          status: data.status,
          is_assigned: data.is_assigned,
          business_id: businessId,
          created_at: new Date().toISOString(),
          creation_method: 'form_submission'
        }
      });
      
      return data;
    },
    onSuccess: (data) => {
      console.log('✅ Mutation success callback:', data);
      // רענן את כל ה-queries הקשורים למשמרות
      queryClient.removeQueries({ queryKey: ['schedule-shifts'] });
      queryClient.invalidateQueries({ queryKey: ['schedule-shifts', businessId] });
      queryClient.refetchQueries({ queryKey: ['schedule-shifts', businessId] });
    },
    onError: (error) => {
      console.error('❌ Mutation error callback:', error);
    }
  });

  const updateShift = useMutation({
    mutationFn: async ({ shiftId, updates, managerOverrideCode }: { 
      shiftId: string; 
      updates: Partial<ShiftScheduleData>; 
      managerOverrideCode?: string 
    }) => {
      console.log('🔄 Updating shift:', shiftId, updates);

      // אם מנסים לשייך עובד, בודק אם יש קונפליקט
      if (updates.employee_id && businessId) {
        console.log('🔍 Checking for employee assignment conflicts...');
        
        // קבל פרטי המשמרת הנוכחית
        const { data: currentShift, error: shiftError } = await supabase
          .from('scheduled_shifts')
          .select('shift_date, branch_id, start_time, end_time')
          .eq('id', shiftId)
          .single();

        if (shiftError) {
          console.error('❌ Error getting current shift:', shiftError);
          throw shiftError;
        }

        // בדיקה לקונפליקטים - עובד באותו יום באותו סניף
        const { data: conflictingShifts, error: conflictError } = await supabase
          .from('scheduled_shifts')
          .select('id, shift_date, start_time, end_time, branch_id')
          .eq('business_id', businessId)
          .eq('employee_id', updates.employee_id)
          .eq('shift_date', currentShift.shift_date)
          .eq('branch_id', currentShift.branch_id)
          .eq('is_archived', false)
          .neq('id', shiftId); // לא כולל את המשמרת הנוכחית

        if (conflictError) {
          console.error('❌ Error checking conflicts:', conflictError);
          throw conflictError;
        }

        if (conflictingShifts && conflictingShifts.length > 0) {
          console.warn('⚠️ Employee assignment conflict detected:', {
            employeeId: updates.employee_id,
            date: currentShift.shift_date,
            branchId: currentShift.branch_id,
            conflictingShifts
          });

          // אם אין קוד מנהל או הקוד שגוי
          if (!managerOverrideCode || managerOverrideCode !== '130898') {
            // רישום התראה בלוג הפעילות
            await logActivity({
              action: 'employee_double_assignment_blocked',
              target_type: 'shift',
              target_id: shiftId,
              details: {
                employee_id: updates.employee_id,
                shift_date: currentShift.shift_date,
                branch_id: currentShift.branch_id,
                conflicting_shifts: conflictingShifts,
                attempted_at: new Date().toISOString(),
                warning_level: 'high',
                override_attempted: !!managerOverrideCode,
                override_success: false
              }
            });

            const conflictTimes = conflictingShifts.map(s => `${s.start_time}-${s.end_time}`).join(', ');
            const error = new Error(`⚠️ אזהרה: העובד כבר משויך למשמרת באותו יום באותו סניף (${conflictTimes}). לא ניתן לשייך עובד לשתי משמרות באותו יום באותו סניף.`);
            (error as any).code = 'MANAGER_OVERRIDE_REQUIRED';
            (error as any).conflictData = {
              conflictingShifts,
              currentShift,
              employeeId: updates.employee_id
            };
            throw error;
          } else {
            // קוד מנהל נכון - אישור עקיפה
            console.log('✅ Manager override code accepted - allowing double assignment');
            await logActivity({
              action: 'employee_double_assignment_approved_with_override',
              target_type: 'shift',
              target_id: shiftId,
              details: {
                employee_id: updates.employee_id,
                shift_date: currentShift.shift_date,
                branch_id: currentShift.branch_id,
                conflicting_shifts: conflictingShifts,
                approved_at: new Date().toISOString(),
                warning_level: 'critical',
                override_used: true,
                manager_code_used: '130898'
              }
            });
          }
        }
      }

      const updateData: any = {};
      
      if (updates.employee_id !== undefined) {
        updateData.employee_id = updates.employee_id || null;
        updateData.is_assigned = !!updates.employee_id;
      }
      
      if (updates.branch_id !== undefined) {
        updateData.branch_id = updates.branch_id || null;
      }
      
      if (updates.notes !== undefined) {
        updateData.notes = updates.notes || null;
      }

      if (updates.role !== undefined) {
        updateData.role = updates.role || null;
      }

      if (updates.start_time !== undefined) {
        updateData.start_time = updates.start_time;
      }

      if (updates.end_time !== undefined) {
        updateData.end_time = updates.end_time;
      }

      if (updates.status !== undefined) {
        updateData.status = updates.status;
      }

      if (updates.shift_template_id !== undefined) {
        updateData.shift_template_id = updates.shift_template_id || null;
      }

      if (updates.required_employees !== undefined) {
        const newRequiredCount = Math.max(1, parseInt(String(updates.required_employees)) || 1);
        updateData.required_employees = newRequiredCount;
        
        // יצירת הקצאות אוטומטית לפי מספר העובדים הנדרש
        const currentAssignments = updateData.shift_assignments || [];
        const assignments = [];
        
        for (let i = 0; i < newRequiredCount; i++) {
          const existingAssignment = currentAssignments[i];
          assignments.push({
            id: existingAssignment?.id || crypto.randomUUID(),
            type: i === 0 ? 'חובה' : 'תגבור', // הראשון חובה, השאר תגבור
            employee_id: existingAssignment?.employee_id || null,
            position: i + 1,
            is_required: i === 0 // הראשון חובה
          });
        }
        
        updateData.shift_assignments = assignments;
        console.log('🔢 Created assignments:', assignments);
      }

      // שמירת הקצאות עובדים כשמעדכנים ידנית
      if (updates.shift_assignments !== undefined) {
        updateData.shift_assignments = updates.shift_assignments;
        console.log('💼 Updating shift assignments manually:', updates.shift_assignments);
      }

      console.log('📊 Final updateData being sent to Supabase:', updateData);

      if (updates.priority !== undefined) {
        updateData.priority = updates.priority || 'normal';
        console.log('🔥 Setting priority to:', updateData.priority);
      }

      console.log('📊 Final updateData being sent to Supabase:', updateData);
      console.log('📊 Updating shift with ID:', shiftId);

      const { data, error } = await supabase
        .from('scheduled_shifts')
        .update(updateData)
        .eq('id', shiftId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating shift:', error);
        throw error;
      }

      console.log('✅ Shift updated successfully in DB:', data);
      console.log('✅ Updated required_employees value:', data.required_employees);
      
      // אם שיוך עובד הצליח, רשום בלוג
      if (updates.employee_id) {
        await logActivity({
          action: 'employee_assigned_to_shift',
          target_type: 'shift',
          target_id: shiftId,
          details: {
            employee_id: updates.employee_id,
            shift_date: data.shift_date,
            branch_id: data.branch_id,
            start_time: data.start_time,
            end_time: data.end_time,
            assigned_at: new Date().toISOString(),
            override_used: !!managerOverrideCode
          }
        });
      }
      
      return data;
    },
    onSuccess: (data) => {
      console.log('🔄 Mutation success - invalidating queries for businessId:', businessId);
      queryClient.invalidateQueries({ queryKey: ['schedule-shifts', businessId] });
      console.log('📈 Query invalidated, data should refresh now');
    }
  });

  const deleteShift = useMutation({
    mutationFn: async (shiftId: string) => {
      console.log('🔄 Deleting shift:', shiftId);

      // Get shift details before deletion for logging
      const { data: shiftDetails } = await supabase
        .from('scheduled_shifts')
        .select('*')
        .eq('id', shiftId)
        .single();

      const { error } = await supabase
        .from('scheduled_shifts')
        .delete()
        .eq('id', shiftId);

      if (error) {
        console.error('❌ Error deleting shift:', error);
        throw error;
      }

      console.log('✅ Shift deleted successfully');

      // Log the deletion
      if (shiftDetails) {
        await logActivity({
          action: 'shift_deleted',
          target_type: 'shift',
          target_id: shiftId,
          details: {
            deleted_shift: shiftDetails,
            deleted_at: new Date().toISOString(),
            deletion_method: 'user_action'
          }
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-shifts', businessId] });
    }
  });

  return {
    createShift: async (shiftData: CreateShiftData) => {
      console.log('🚀 Starting shift creation process...');
      await createShift.mutateAsync(shiftData);
    },
    updateShift: async (shiftId: string, updates: Partial<ShiftScheduleData>, managerOverrideCode?: string) => {
      await updateShift.mutateAsync({ shiftId, updates, managerOverrideCode });
    },
    deleteShift: async (shiftId: string) => {
      await deleteShift.mutateAsync(shiftId);
    },
    isCreating: createShift.isPending,
    isUpdating: updateShift.isPending,
    isDeleting: deleteShift.isPending
  };
};