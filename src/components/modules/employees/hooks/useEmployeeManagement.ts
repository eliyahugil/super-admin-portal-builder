
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useEmployeeManagement = (employeeId: string | undefined) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get employee details with all related data
  const { data: employee, isLoading, refetch } = useQuery({
    queryKey: ['employee-full-details', employeeId],
    queryFn: async () => {
      if (!employeeId) return null;
      
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          main_branch:branches(name),
          branch_assignments:employee_branch_assignments(
            *,
            branch:branches(name)
          )
        `)
        .eq('id', employeeId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!employeeId,
  });

  // Update employee mutation
  const updateEmployeeMutation = useMutation({
    mutationFn: async (updates: any) => {
      const { error } = await supabase
        .from('employees')
        .update(updates)
        .eq('id', employeeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-full-details', employeeId] });
      toast({
        title: 'הצלחה',
        description: 'פרטי העובד עודכנו בהצלחה',
      });
    },
    onError: () => {
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לעדכן את פרטי העובד',
        variant: 'destructive',
      });
    },
  });

  return {
    employee,
    isLoading,
    refetch,
    updateEmployee: updateEmployeeMutation.mutate,
    isUpdating: updateEmployeeMutation.isPending,
  };
};
