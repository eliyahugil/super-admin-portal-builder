
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type ShiftType = 'morning' | 'afternoon' | 'evening' | 'night';

interface FormData {
  name: string;
  start_time: string;
  end_time: string;
  shift_type: ShiftType;
  required_employees: number;
  branch_id: string;
}

export const useShiftTemplatesLogic = (businessId: string | undefined, refetch: () => void) => {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    start_time: '',
    end_time: '',
    shift_type: 'morning',
    required_employees: 1,
    branch_id: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.start_time || !formData.end_time || !formData.branch_id) {
      toast({
        title: "שגיאה",
        description: "אנא מלא את כל השדות הנדרשים",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('shift_templates')
        .insert({
          ...formData,
          business_id: businessId
        });

      if (error) throw error;

      toast({
        title: "הצלחה",
        description: "תבנית המשמרת נוצרה בהצלחה"
      });

      setDialogOpen(false);
      setFormData({
        name: '',
        start_time: '',
        end_time: '',
        shift_type: 'morning',
        required_employees: 1,
        branch_id: ''
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "שגיאה",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deactivateTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('shift_templates')
        .update({ is_active: false })
        .eq('id', templateId);

      if (error) throw error;

      toast({
        title: "הצלחה",
        description: "תבנית המשמרת הוסרה"
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "שגיאה",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const openCreateDialog = () => {
    setDialogOpen(true);
  };

  return {
    dialogOpen,
    setDialogOpen,
    formData,
    setFormData,
    handleSubmit,
    deactivateTemplate,
    openCreateDialog
  };
};
