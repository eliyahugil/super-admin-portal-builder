
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
    console.log('🔍 useEmployeeProfile - Starting fetch with:', { 
      employeeId, 
      userRole: profile?.role, 
      businessId: profile?.business_id 
    });

    if (!employeeId) {
      console.log('❌ useEmployeeProfile - No employeeId provided');
      setLoading(false);
      return;
    }

    if (!profile) {
      console.log('❌ useEmployeeProfile - No profile available');
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
        console.log('🔒 Adding business filter for regular user:', profile.business_id);
        query = query.eq('business_id', profile.business_id);
      } else {
        console.log('👑 Super admin - no business filter applied');
      }

      const { data, error } = await query.single();

      if (error) {
        console.error('❌ Error fetching employee:', error);
        console.error('❌ Error details:', { 
          message: error.message, 
          details: error.details, 
          hint: error.hint,
          code: error.code
        });
        
        if (error.code === 'PGRST116') {
          toast({
            title: 'עובד לא נמצא',
            description: 'העובד המבוקש לא נמצא במערכת או שאין לך הרשאה לצפות בו',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'שגיאה',
            description: 'לא ניתן לטעון את פרטי העובד',
            variant: 'destructive',
          });
        }
        setEmployee(null);
        return;
      }

      console.log('✅ Employee profile loaded:', { 
        name: `${data.first_name} ${data.last_name}`,
        businessId: data.business_id,
        employeeId: data.id
      });

      setEmployee(data);
    } catch (error) {
      console.error('💥 Unexpected error fetching employee:', error);
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
    console.log('🔄 useEmployeeProfile - useEffect triggered:', { 
      employeeId, 
      profileRole: profile?.role, 
      profileBusinessId: profile?.business_id 
    });
    fetchEmployee();
  }, [employeeId, profile?.role, profile?.business_id]);

  return {
    employee,
    loading,
    refetchEmployee: fetchEmployee,
  };
};
