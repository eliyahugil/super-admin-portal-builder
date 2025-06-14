
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export const useEmployeeDocumentAssignment = (employeeId: string | undefined, queryKeyForInvalidate: any[]) => {
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleAssignAssignee = async (docId: string, assignId: string) => {
    if (!assignId) return;
    setAssigningId(docId);
    try {
      const { error } = await supabase
        .from('employee_documents')
        .update({ assignee_id: assignId })
        .eq('id', docId);

      if (error) throw error;
      toast({ title: 'הצלחה', description: 'המסמך שובץ לחתימה.' });
      queryClient.invalidateQueries({ queryKey: queryKeyForInvalidate });
    } catch (e: any) {
      toast({
        title: 'שגיאה',
        description: e?.message ?? 'הפעולה נכשלה',
        variant: 'destructive',
      });
    } finally {
      setAssigningId(null);
    }
  };

  return { assigningId, setAssigningId, handleAssignAssignee };
};
