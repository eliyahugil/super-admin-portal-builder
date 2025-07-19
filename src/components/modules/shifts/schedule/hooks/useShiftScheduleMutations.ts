import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ShiftScheduleData, CreateShiftData } from '../types';

export const useShiftScheduleMutations = (businessId: string | null) => {
  const queryClient = useQueryClient();

  // Check for overlapping shifts for the same employee
  const checkForOverlappingShifts = async (shiftData: CreateShiftData) => {
    console.log('🔍 Checking for overlapping shifts:', shiftData);
    
    // Only check if there's an employee assigned
    if (!shiftData.employee_id) {
      console.log('✅ No employee assigned, no overlap check needed');
      return false;
    }
    
    const { data: existingShifts, error } = await supabase
      .from('scheduled_shifts')
      .select('id, shift_date, start_time, end_time, employee_id, branch_id, is_archived')
      .eq('business_id', businessId)
      .eq('employee_id', shiftData.employee_id)
      .eq('shift_date', shiftData.shift_date)
      .eq('is_archived', false);

    if (error) {
      console.error('Error checking for overlapping shifts:', error);
      return false;
    }

    console.log('🔍 Found existing shifts for employee:', existingShifts);

    // Check for time overlaps
    const overlappingShifts = existingShifts?.filter(shift => {
      const newStart = shiftData.start_time;
      const newEnd = shiftData.end_time;
      const existingStart = shift.start_time;
      const existingEnd = shift.end_time;
      
      // Check if times overlap
      return (
        // New shift starts during existing shift
        (newStart >= existingStart && newStart < existingEnd) ||
        // New shift ends during existing shift  
        (newEnd > existingStart && newEnd <= existingEnd) ||
        // New shift completely contains existing shift
        (newStart <= existingStart && newEnd >= existingEnd)
      );
    });

    console.log('🔍 Overlapping shifts found:', overlappingShifts);
    return overlappingShifts && overlappingShifts.length > 0;
  };

  const createShift = useMutation({
    mutationFn: async (shiftData: CreateShiftData) => {
      console.log('🔄 Creating shift with business ID:', businessId);
      console.log('🔄 Shift data:', shiftData);
      
      if (!businessId) {
        console.error('❌ No business ID provided');
        throw new Error('Business ID is required');
      }

      // Check for overlapping shifts
      const hasOverlap = await checkForOverlappingShifts(shiftData);
      if (hasOverlap) {
        const errorMsg = `Overlapping shift detected for employee ${shiftData.employee_id} on ${shiftData.shift_date} ${shiftData.start_time}-${shiftData.end_time}`;
        console.warn('⚠️', errorMsg);
        
        // Log the overlap attempt
        console.log('🚫 Overlap prevented for:', {
          shift_date: shiftData.shift_date,
          start_time: shiftData.start_time,
          end_time: shiftData.end_time,
          employee_id: shiftData.employee_id,
          branch_id: shiftData.branch_id,
          prevented_at: new Date().toISOString()
        });
        
        throw new Error('העובד כבר משויך למשמרת חופפת באותו תאריך. לא ניתן לשייך עובד לשתי משמרות חופפות.');
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
      console.log('✅ Shift created with details:', {
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

      // אם מנסים לשייך עובד, בודק אם יש חופפות
      if (updates.employee_id && businessId) {
        console.log('🔍 Checking for overlapping shifts on update...');
        
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

        // Use the current times or the updated times
        const shiftDate = currentShift.shift_date;
        const startTime = updates.start_time || currentShift.start_time;
        const endTime = updates.end_time || currentShift.end_time;

        // בדיקה לחופפות זמן עם משמרות אחרות של אותו עובד
        const { data: overlappingShifts, error: conflictError } = await supabase
          .from('scheduled_shifts')
          .select('id, shift_date, start_time, end_time, branch_id')
          .eq('business_id', businessId)
          .eq('employee_id', updates.employee_id)
          .eq('shift_date', shiftDate)
          .eq('is_archived', false)
          .neq('id', shiftId); // לא כולל את המשמרת הנוכחית

        if (conflictError) {
          console.error('❌ Error checking overlaps:', conflictError);
          throw conflictError;
        }

        // Check for time overlaps
        const timeOverlaps = overlappingShifts?.filter(shift => {
          // Check if times overlap
          return (
            // New shift starts during existing shift
            (startTime >= shift.start_time && startTime < shift.end_time) ||
            // New shift ends during existing shift  
            (endTime > shift.start_time && endTime <= shift.end_time) ||
            // New shift completely contains existing shift
            (startTime <= shift.start_time && endTime >= shift.end_time)
          );
        });

        if (timeOverlaps && timeOverlaps.length > 0) {
          console.warn('⚠️ Employee overlapping shift detected:', {
            employeeId: updates.employee_id,
            date: shiftDate,
            newTime: `${startTime}-${endTime}`,
            overlappingShifts: timeOverlaps
          });

          // אם אין קוד מנהל או הקוד שגוי
          if (!managerOverrideCode || managerOverrideCode !== '130898') {
            // רישום התראה בלוג הפעילות
            console.log('🚫 Overlapping shift update blocked:', {
              employee_id: updates.employee_id,
              shift_date: shiftDate,
              new_start_time: startTime,
              new_end_time: endTime,
              overlapping_shifts: timeOverlaps,
              attempted_at: new Date().toISOString(),
              warning_level: 'high',
              override_attempted: !!managerOverrideCode,
              override_success: false
            });

            const overlapTimes = timeOverlaps.map(s => `${s.start_time}-${s.end_time}`).join(', ');
            const error = new Error(`⚠️ אזהרה: העובד כבר משויך למשמרת חופפת באותו תאריך (${overlapTimes}). לא ניתן לשייך עובד לשתי משמרות חופפות.`);
            (error as any).code = 'MANAGER_OVERRIDE_REQUIRED';
            (error as any).conflictData = {
              overlappingShifts: timeOverlaps,
              currentShift,
              employeeId: updates.employee_id
            };
            throw error;
          } else {
            // קוד מנהל נכון - אישור עקיפה
            console.log('✅ Manager override code accepted - allowing overlapping assignment');
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
        const currentAssignments = updates.shift_assignments || updateData.shift_assignments || [];
        const assignments = [];
        
        for (let i = 0; i < newRequiredCount; i++) {
          const existingAssignment = currentAssignments[i];
          assignments.push({
            id: existingAssignment?.id || crypto.randomUUID(),
            type: existingAssignment?.type || (i === 0 ? 'חובה' : 'תגבור'),
            employee_id: existingAssignment?.employee_id || null,
            position: i + 1,
            is_required: existingAssignment?.is_required !== undefined ? existingAssignment.is_required : (i === 0)
          });
        }
        
        updateData.shift_assignments = assignments;
        
        // עדכון employee_id הראשי לפי ההקצאה הראשונה
        const firstAssignment = assignments[0];
        updateData.employee_id = firstAssignment?.employee_id || null;
        
        console.log('🔢 Created assignments for required_employees update:', assignments);
        console.log('👤 Main employee_id set to:', updateData.employee_id);
      }

      // שמירת הקצאות עובדים כשמעדכנים ידנית
      if (updates.shift_assignments !== undefined) {
        updateData.shift_assignments = updates.shift_assignments;
        
        // עדכון employee_id הראשי לפי ההקצאה הראשונה
        const firstAssignment = updates.shift_assignments?.[0];
        if (firstAssignment) {
          updateData.employee_id = firstAssignment.employee_id || null;
        }
        
        console.log('💼 Updating shift assignments manually:', updates.shift_assignments);
        console.log('👤 Main employee_id updated to:', updateData.employee_id);
      }

      // אם אין shift_assignments אבל יש required_employees > 1, צור הקצאות ריקות
      if (!updateData.shift_assignments && updateData.required_employees > 1) {
        const assignments = [];
        for (let i = 0; i < updateData.required_employees; i++) {
          assignments.push({
            id: crypto.randomUUID(),
            type: i === 0 ? 'חובה' : 'תגבור',
            employee_id: i === 0 ? updateData.employee_id : null,
            position: i + 1,
            is_required: i === 0
          });
        }
        updateData.shift_assignments = assignments;
        console.log('🆕 Created new assignments for existing shift:', assignments);
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
      
      // אם שיוך עובד הצליח, מחק את הבקשות שלו לאותו יום ורשום בלוג
      if (updates.employee_id) {
        const employeeId = updates.employee_id;
        const shiftDate = data.shift_date;
        
        // מחיקת כל הבקשות להגשת משמרות של העובד לאותו יום
        console.log('🗑️ מוחק בקשות משמרת לעובד', employeeId, 'לתאריך', shiftDate);
        
        try {
          const { error: deleteError } = await (supabase as any)
            .from('employee_shift_requests')
            .delete()
            .eq('employee_id', employeeId)
            .eq('request_date', shiftDate);
            
          if (deleteError) {
            console.error('❌ שגיאה במחיקת בקשות המשמרת:', deleteError);
          } else {
            console.log('✅ בקשות המשמרת נמחקו בהצלחה לעובד', employeeId, 'לתאריך', shiftDate);
          }
        } catch (error) {
          console.error('❌ שגיאה כללית במחיקת בקשות:', error);
        }
        
        // רישום בלוג פעילות
        console.log('📝 Employee assigned to shift:', {
          employee_id: employeeId,
          shift_date: shiftDate,
          branch_id: data.branch_id,
          start_time: data.start_time,
          end_time: data.end_time,
          assigned_at: new Date().toISOString(),
          override_used: !!managerOverrideCode,
          shift_requests_deleted: true
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
        console.log('📝 Shift deleted:', {
          deleted_shift: shiftDetails,
          deleted_at: new Date().toISOString(),
          deletion_method: 'user_action'
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