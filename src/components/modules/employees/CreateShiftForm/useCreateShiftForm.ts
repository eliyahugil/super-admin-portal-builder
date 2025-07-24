
import { useState } from 'react';
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
  branches?: Branch[]
) => {
  const { toast } = useToast();
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

  const resetForm = () => {
    setSelectedEmployeeId('');
    setSelectedTemplateId('');
    setSelectedBranchId([]);
    setShiftDates([]);
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
    const branchIds = Array.isArray(selectedBranchId) ? selectedBranchId : [selectedBranchId];
    const newShifts = allDates.flatMap((shiftDate) =>
      branchIds.map(branch_id => {
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
        } else {
          shiftData.shift_template_id = selectedTemplateId;
        }
        
        if (selectedEmployeeId) shiftData.employee_id = selectedEmployeeId;
        return shiftData;
      })
    );

    const { error } = await supabase
      .from('scheduled_shifts')
      .insert(newShifts);

    if (error) throw error;

    toast({
      title: "הצלחה",
      description: `נוצרו ${newShifts.length} משמרות בהצלחה`
    });

    resetForm();
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
