
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Branch } from '@/types/branch';

export const useCreateShiftForm = (
  businessId?: string,
  branches?: Branch[]
) => {
  const { toast } = useToast();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  // now for multi branch selection
  const [selectedBranchId, setSelectedBranchId] = useState<string[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [shiftDates, setShiftDates] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setSelectedEmployeeId('');
    setSelectedTemplateId('');
    setSelectedBranchId([]);
    setShiftDates([]);
    setNotes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTemplateId || shiftDates.length === 0 || !selectedBranchId || selectedBranchId.length === 0) {
      toast({
        title: "שגיאה",
        description: "אנא מלא את כל השדות הנדרשים (תבנית, תאריכים, סניפים)",
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
      // For every date and every branch, create a shift row
      const branchIds = Array.isArray(selectedBranchId) ? selectedBranchId : [selectedBranchId];
      const newShifts = shiftDates.flatMap((shiftDate) =>
        branchIds.map(branch_id => {
          const shiftData: any = {
            shift_template_id: selectedTemplateId,
            shift_date: shiftDate,
            branch_id,
            is_assigned: !!selectedEmployeeId,
            notes: notes || null
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
    handleSubmit
  };
};
