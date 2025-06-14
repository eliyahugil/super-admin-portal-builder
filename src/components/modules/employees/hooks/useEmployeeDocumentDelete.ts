
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook מחיקת מסמך עובד (מבצע מחיקת קובץ וגם רשומה)
 */
export const useEmployeeDocumentDelete = (employeeId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteDocumentMutation = useMutation({
    mutationFn: async ({ documentId, filePath }: { documentId: string; filePath: string }) => {
      await supabase.storage.from('employee-files').remove([filePath]);
      await supabase.from('employee_documents').delete().eq('id', documentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-documents', employeeId] });
      toast({
        title: 'הצלחה',
        description: 'המסמך נמחק בהצלחה',
      });
    },
    onError: () => {
      toast({
        title: 'שגיאה',
        description: 'לא ניתן למחוק את המסמך',
        variant: 'destructive',
      });
    },
  });

  return deleteDocumentMutation;
};
