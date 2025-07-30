
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Branch } from '@/types/branch';
import { getDatesForSelectedWeekdays } from './utils';

// Archive/unarchive helpers for scheduled shifts
export const useScheduledShiftsArchiver = () => {
  const { toast } = useToast();
  
  const archiveShift = async (shiftId: string) => {
    const { error } = await supabase
      .from('scheduled_shifts')
      .update({ is_archived: true })
      .eq('id', shiftId);
    if (error) {
      toast({
        title: "שגיאה",
        description: "שגיאה בארכוב משמרת: " + (error.message || ''),
        variant: "destructive"
      });
      return false;
    }
    toast({ title: "המשמרת הועברה לארכיון" });
    return true;
  };

  const unarchiveShift = async (shiftId: string) => {
    const { error } = await supabase
      .from('scheduled_shifts')
      .update({ is_archived: false })
      .eq('id', shiftId);
    if (error) {
      toast({
        title: "שגיאה",
        description: "שגיאה בשחזור משמרת: " + (error.message || ''),
        variant: "destructive"
      });
      return false;
    }
    toast({ title: "המשמרת שוחזרה מארכיון" });
    return true;
  };

  return { archiveShift, unarchiveShift };
};

export const useCreateShiftForm = (
  businessId?: string, 
  branches?: Branch[],
  onSuccess?: () => void,
  onCreate?: (shiftData: any) => Promise<void>,
  selectedDate?: Date | null
) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState<string[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [shiftDates, setShiftDates] = useState<string[]>([]);
  const [weekdayRange, setWeekdayRange] = useState<{start: string; end: string}>({start: '', end: ''});
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [requiredEmployees, setRequiredEmployees] = useState(1);
  const [selectedRoleId, setSelectedRoleId] = useState('');

  // Set initial date if selectedDate is provided
  useEffect(() => {
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      setShiftDates([dateString]);
      console.log('📅 Auto-set selected date:', dateString);
    }
  }, [selectedDate]);

  const resetForm = () => {
    setSelectedEmployeeId('');
    setSelectedTemplateId('');
    setSelectedBranchId([]);
    // Don't reset shiftDates if we have selectedDate - keep the pre-selected date
    if (!selectedDate) {
      setShiftDates([]);
    }
    setWeekdayRange({start: '', end: ''});
    setSelectedWeekdays([]);
    setNotes('');
    setStartTime('09:00');
    setEndTime('17:00');
    setUseCustomTime(false);
    setRequiredEmployees(1);
    setSelectedRoleId('');
  };

  const validateForm = () => {
    if ((!selectedTemplateId && !useCustomTime) || !selectedBranchId || selectedBranchId.length === 0) {
      toast({
        title: "שגיאה",
        description: "אנא מלא את כל השדות הנדרשים (תבנית או שעות מותאמות, תאריכים/חזרות, סניפים)",
        variant: "destructive"
      });
      return false;
    }

    if (useCustomTime && (!startTime || !endTime)) {
      toast({
        title: "שגיאה",
        description: "אנא מלא את שעות התחלה וסיום המשמרת",
        variant: "destructive"
      });
      return false;
    }

    if (shiftDates.length === 0 && !(weekdayRange.start && weekdayRange.end && selectedWeekdays.length > 0)) {
      toast({
        title: "שגיאה",
        description: "אנא מלא את כל השדות הנדרשים (תבנית, תאריכים/חזרות, סניפים)",
        variant: "destructive"
      });
      return false;
    }

    if (!businessId) {
      toast({
        title: "שגיאה",
        description: "לא נמצא מזהה עסק",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const createShifts = async (allDates: string[]) => {
    console.log('🔄 Creating shifts with dates:', allDates);
    const branchIds = Array.isArray(selectedBranchId) ? selectedBranchId : [selectedBranchId];
    console.log('🏢 Branch IDs:', branchIds);
    
    // Get template data if using template
    let templateData = null;
    if (!useCustomTime && selectedTemplateId) {
      console.log('📋 Fetching template data for ID:', selectedTemplateId);
      const { data: template, error: templateError } = await supabase
        .from('shift_templates')
        .select('start_time, end_time, shift_type, role_name')
        .eq('id', selectedTemplateId)
        .single();
      
      if (templateError) {
        console.error('❌ Error fetching template:', templateError);
        throw new Error('שגיאה בטעינת תבנית המשמרת');
      }
      
      templateData = template;
      console.log('📋 Template data loaded:', templateData);
    }
    
    const newShifts = allDates.flatMap((shiftDate) => {
      return branchIds.map(branch_id => {
        const shiftData: any = {
          shift_date: shiftDate,
          branch_id,
          is_assigned: !!selectedEmployeeId,
          notes: notes || null,
          business_id: businessId,
          required_employees: requiredEmployees,
          role: selectedRoleId && selectedRoleId !== 'no-role' ? selectedRoleId : null
        };
        
        // Use custom time or template
        if (useCustomTime) {
          shiftData.start_time = startTime;
          shiftData.end_time = endTime;
          console.log('⏰ Using custom time:', { startTime, endTime });
        } else {
          shiftData.shift_template_id = selectedTemplateId;
          // Copy time data from template
          if (templateData) {
            shiftData.start_time = templateData.start_time;
            shiftData.end_time = templateData.end_time;
            shiftData.shift_type = templateData.shift_type;
            console.log('📋 Using template time:', { 
              start_time: templateData.start_time, 
              end_time: templateData.end_time 
            });
          }
        }
        
        // Create shift assignments based on required employees
        const assignments = [];
        
        // If employee is selected, add them as first assignment
        if (selectedEmployeeId) {
          shiftData.employee_id = selectedEmployeeId;
          assignments.push({
            id: crypto.randomUUID(),
            type: 'חובה',
            employee_id: selectedEmployeeId,
            position: 1,
            is_required: true
          });
        }
        
        // Add additional unassigned positions for required employees
        const startPosition = selectedEmployeeId ? 2 : 1;
        for (let i = startPosition; i <= requiredEmployees; i++) {
          assignments.push({
            id: crypto.randomUUID(),
            type: 'חובה',
            employee_id: null,
            position: i,
            is_required: true
          });
        }
        
        // Only set shift_assignments if we have more than just the main employee
        if (assignments.length > 0) {
          shiftData.shift_assignments = assignments;
        }
        return shiftData;
      });
    });

    console.log('📦 Shifts to create:', newShifts);

    // If onCreate is provided (from dialog), use it instead of direct supabase call
    if (onCreate) {
      console.log('🔄 Using onCreate callback from dialog');
      for (const shift of newShifts) {
        await onCreate(shift);
      }
      
      toast({
        title: "הצלחה",
        description: `נוצרו ${newShifts.length} משמרות בהצלחה`
      });

      resetForm();
      
      if (onSuccess) {
        console.log('📞 Calling onSuccess callback');
        onSuccess();
      }
      return;
    }

    // Use React Query mutation for better cache management
    const { error } = await supabase
      .from('scheduled_shifts')
      .insert(newShifts);

    if (error) {
      console.error('❌ Error inserting shifts:', error);
      throw error;
    }

    console.log('✅ Shifts created successfully:', newShifts.length);
    
    console.log('🔄 Starting cache invalidation...');
    
    // Force immediate refresh of shift data
    await queryClient.invalidateQueries({ 
      queryKey: ['shift-schedule-data', businessId],
      refetchType: 'active'
    });
    
    console.log('✅ Shift data cache invalidated');
    
    // Also invalidate employees data in case of assignment changes
    await queryClient.invalidateQueries({ 
      queryKey: ['employees', businessId],
      refetchType: 'active'
    });
    
    console.log('✅ Employee data cache invalidated');
    
    toast({
      title: "הצלחה",
      description: `נוצרו ${newShifts.length} משמרות בהצלחה`
    });

    resetForm();
    
    console.log('🎉 Form reset completed');
    
    // סגירת הדיאלוג אחרי יצירה מוצלחת
    if (onSuccess) {
      console.log('📞 Calling onSuccess callback');
      onSuccess();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      let allDates: string[] = [];

      if (weekdayRange.start && weekdayRange.end && selectedWeekdays.length > 0) {
        allDates = getDatesForSelectedWeekdays(weekdayRange.start, weekdayRange.end, selectedWeekdays);
      }

      const uniqueDates = Array.from(new Set([...shiftDates, ...allDates]));

      if (uniqueDates.length === 0) {
        toast({
          title: "שגיאה",
          description: "לא נבחרו תאריכים מתאימים.",
          variant: "destructive"
        });
        setSubmitting(false);
        return;
      }

      await createShifts(uniqueDates);
    } catch (error: any) {
      console.error('Error creating shifts:', error);
      toast({
        title: "שגיאה",
        description: error.message || "שגיאה ביצירת משמרות",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    selectedEmployeeId,
    setSelectedEmployeeId,
    selectedTemplateId,
    setSelectedTemplateId,
    selectedBranchId,
    setSelectedBranchId,
    shiftDates,
    setShiftDates,
    notes,
    setNotes,
    submitting,
    handleSubmit,
    weekdayRange,
    setWeekdayRange,
    selectedWeekdays,
    setSelectedWeekdays,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    useCustomTime,
    setUseCustomTime,
    requiredEmployees,
    setRequiredEmployees,
    selectedRoleId,
    setSelectedRoleId,
  };
};
