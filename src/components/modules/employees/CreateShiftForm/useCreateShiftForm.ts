
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useCreateShiftForm = (businessId?: string) => {
  const { toast } = useToast();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [shiftDate, setShiftDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setSelectedEmployeeId('');
    setSelectedTemplateId('');
    setShiftDate('');
    setNotes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTemplateId || !shiftDate) {
      toast({
        title: "שגיאה",
        description: "אנא מלא את כל השדות הנדרשים",
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
      const shiftData: any = {
        shift_template_id: selectedTemplateId,
        shift_date: shiftDate,
        is_assigned: !!selectedEmployeeId,
        notes: notes || null
      };

      if (selectedEmployeeId) {
        shiftData.employee_id = selectedEmployeeId;
      }

      const { error } = await supabase
        .from('scheduled_shifts')
        .insert([shiftData]);

      if (error) throw error;

      toast({
        title: "הצלחה",
        description: "המשמרת נוצרה בהצלחה"
      });

      resetForm();
    } catch (error: any) {
      console.error('Error creating shift:', error);
      toast({
        title: "שגיאה",
        description: error.message,
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
    shiftDate,
    setShiftDate,
    notes,
    setNotes,
    submitting,
    handleSubmit
  };
};
