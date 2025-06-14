import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Branch } from '@/types/branch';
import { addDays, eachDayOfInterval, isWithinInterval } from "date-fns";

// Archive/unarchive helpers for scheduled shifts
export const useScheduledShiftsArchiver = () => {
  const { toast } = useToast();
  // Archive a scheduled shift (set is_archived = true)
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

  // Restore a scheduled shift (set is_archived = false)
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

function getDatesForSelectedWeekdays(start: string, end: string, weekdays: number[]): string[] {
  // start & end are yyyy-MM-dd strings
  if (!start || !end || weekdays.length === 0) return [];
  const from = new Date(start);
  const to = new Date(end);
  const all = eachDayOfInterval({ start: from, end: to });
  return all
    .filter((d) => weekdays.includes(d.getDay()))
    .map((d) => d.toISOString().slice(0,10));
}

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

  const resetForm = () => {
    setSelectedEmployeeId('');
    setSelectedTemplateId('');
    setSelectedBranchId([]);
    setShiftDates([]);
    setWeekdayRange({start: '', end: ''});
    setSelectedWeekdays([]);
    setNotes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // חייב לבחור template & סניף
    if (
      !selectedTemplateId ||
      !selectedBranchId || selectedBranchId.length === 0 ||
      (
        (shiftDates.length === 0) &&
        (!(weekdayRange.start && weekdayRange.end && selectedWeekdays.length > 0))
      )
    ) {
      toast({
        title: "שגיאה",
        description: "אנא מלא את כל השדות הנדרשים (תבנית, תאריכים/חזרות, סניפים)",
        variant: "destructive"
      });
      return;
    }

    if (!businessId) {
      toast({
        title: "שגיאה",
        description: "לא נמצא מזהה עסק",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      let allDates: string[] = [];

      // אם בחרו יום/ים בשבוע וטווח – חישוב כל התאריכים הרלוונטיים
      if (weekdayRange.start && weekdayRange.end && selectedWeekdays.length > 0) {
        allDates = getDatesForSelectedWeekdays(weekdayRange.start, weekdayRange.end, selectedWeekdays);
      }

      // להוסיף גם תאריכים בודדים (avoid duplicates)
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

      const branchIds = Array.isArray(selectedBranchId) ? selectedBranchId : [selectedBranchId];
      const newShifts = uniqueDates.flatMap((shiftDate) =>
        branchIds.map(branch_id => {
          const shiftData: any = {
            shift_template_id: selectedTemplateId,
            shift_date: shiftDate,
            branch_id,
            is_assigned: !!selectedEmployeeId,
            notes: notes || null,
            business_id: businessId
          };
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
  };
};
