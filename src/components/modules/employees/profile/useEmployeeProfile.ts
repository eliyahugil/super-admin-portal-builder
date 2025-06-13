
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthContext';
import type { Employee } from '@/types/supabase';

export const useEmployeeProfile = (employeeId: string | undefined) => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const { toast } = useToast();

  const fetchEmployee = async () => {
    if (!employeeId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 Fetching employee profile:', { employeeId, userRole: profile?.role });

      let query = supabase
        .from('employees')
        .select(`
          *,
          main_branch:branches(name),
          branch_assignments:employee_branch_assignments(
            *,
            branch:branches(name)
          )
        `)
        .eq('id', employeeId);

      // For non-super admins, filter by business
      if (profile?.role !== 'super_admin' && profile?.business_id) {
        query = query.eq('business_id', profile.business_id);
      }

      const { data, error } = await query.single();

      if (error) {
        console.error('Error fetching employee:', error);
        toast({
          title: 'שגיאה',
          description: 'לא ניתן לטעון את פרטי העובד',
          variant: 'destructive',
        });
        return;
      }

      console.log('✅ Employee profile loaded:', { 
        name: `${data.first_name} ${data.last_name}`,
        businessId: data.business_id 
      });

      setEmployee(data);
    } catch (error) {
      console.error('Error fetching employee:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לטעון את פרטי העובד',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, [employeeId, profile?.role, profile?.business_id]);

  return {
    employee,
    loading,
    refetchEmployee: fetchEmployee,
  };
};
