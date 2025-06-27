
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useShiftTableActions = (refetch: () => void) => {
  const { toast } = useToast();

  const handleStatusUpdate = async (shiftId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('employee_shift_requests')
        .update({ 
          status: newStatus,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', shiftId);

      if (error) throw error;

      toast({
        title: 'סטטוס עודכן',
        description: `הסטטוס שונה בהצלחה`,
      });

      refetch();
    } catch (error) {
      console.error('Error updating shift status:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לעדכן את הסטטוס',
        variant: 'destructive',
      });
    }
  };

  return { handleStatusUpdate };
};
