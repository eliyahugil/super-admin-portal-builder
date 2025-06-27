
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useEmployeeArchive = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const archiveEntity = useMutation({
    mutationFn: async (employee: any) => {
      console.log('📁 Archiving employee:', employee.id);
      
      const { data, error } = await supabase
        .from('employees')
        .update({ is_archived: true })
        .eq('id', employee.id)
        .select();

      if (error) {
        console.error('Error archiving employee:', error);
        throw error;
      }
      
      console.log('✅ Employee archived successfully');
      return data;
    },
    onSuccess: async (data, employee) => {
      const employeeName = `${employee.first_name} ${employee.last_name}`;
      
      toast({
        title: 'הצלחה',
        description: `העובד "${employeeName}" הועבר לארכיון`,
      });

      // Clear all employee-related queries
      await queryClient.invalidateQueries({ queryKey: ['employees'] });
      await queryClient.invalidateQueries({ queryKey: ['employee-stats'] });
      
      // Force refetch
      await queryClient.refetchQueries({ queryKey: ['employees'] });
      await queryClient.refetchQueries({ queryKey: ['employee-stats'] });
      
      console.log('🔄 All queries invalidated and refetched');
    },
    onError: (error) => {
      console.error('Error archiving employee:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן להעביר את העובד לארכיון',
        variant: 'destructive',
      });
    },
  });

  return {
    archiveEntity: (employee: any, callbacks?: { onSuccess?: () => void; onError?: (error: any) => void }) => {
      archiveEntity.mutate(employee, {
        onSuccess: () => {
          if (callbacks?.onSuccess) {
            callbacks.onSuccess();
          }
        },
        onError: (error) => {
          if (callbacks?.onError) {
            callbacks.onError(error);
          }
        }
      });
    },
    isArchiving: archiveEntity.isPending,
  };
};
