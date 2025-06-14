
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import type { Employee } from '@/types/employee';

export const useEmployeeArchive = () => {
  const { toast } = useToast();
  const { logActivity } = useActivityLogger();
  const queryClient = useQueryClient();

  const archiveEmployee = useMutation({
    mutationFn: async (employee: Employee) => {
      const { error } = await supabase
        .from('employees')
        .update({ is_archived: true })
        .eq('id', employee.id);

      if (error) throw error;
      return employee;
    },
    onSuccess: (employee) => {
      logActivity({
        action: 'archive',
        target_type: 'employee',
        target_id: employee.id,
        details: { 
          employee_name: `${employee.first_name} ${employee.last_name}`,
          employee_id: employee.employee_id || 'לא הוגדר'
        }
      });

      toast({
        title: 'הצלחה',
        description: `העובד ${employee.first_name} ${employee.last_name} הועבר לארכיון`,
      });

      // Invalidate employee queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['employees'] });
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

  const restoreEmployee = useMutation({
    mutationFn: async (employee: Employee) => {
      const { error } = await supabase
        .from('employees')
        .update({ is_archived: false })
        .eq('id', employee.id);

      if (error) throw error;
      return employee;
    },
    onSuccess: (employee) => {
      logActivity({
        action: 'restore',
        target_type: 'employee',
        target_id: employee.id,
        details: { 
          employee_name: `${employee.first_name} ${employee.last_name}`,
          employee_id: employee.employee_id || 'לא הוגדר'
        }
      });

      toast({
        title: 'הצלחה',
        description: `העובד ${employee.first_name} ${employee.last_name} שוחזר מהארכיון`,
      });

      // Invalidate employee queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (error) => {
      console.error('Error restoring employee:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לשחזר את העובד מהארכיון',
        variant: 'destructive',
      });
    },
  });

  return {
    archiveEmployee: archiveEmployee.mutate,
    restoreEmployee: restoreEmployee.mutate,
    isArchiving: archiveEmployee.isPending,
    isRestoring: restoreEmployee.isPending,
  };
};
