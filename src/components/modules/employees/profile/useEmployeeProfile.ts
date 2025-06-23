
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthContext';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { normalizeEmployee, type Employee } from '@/types/employee';

export const useEmployeeProfile = (employeeId: string | undefined) => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const { businessId, isSuperAdmin } = useCurrentBusiness();
  const { toast } = useToast();

  const fetchEmployee = async () => {
    console.log('🔍 useEmployeeProfile - Starting fetch:', {
      employeeId,
      userRole: profile?.role,
      businessId,
      isSuperAdmin,
      userEmail: profile?.email
    });

    if (!employeeId) {
      console.log('❌ useEmployeeProfile - No employeeId provided');
      setEmployee(null);
      setLoading(false);
      return;
    }

    if (!profile) {
      console.log('❌ useEmployeeProfile - No profile available, waiting...');
      return;
    }

    // CRITICAL SECURITY FIX: For super admin without selected business, block access
    if (isSuperAdmin && !businessId) {
      console.log('🔒 Super admin without selected business - blocking access to employee profile');
      setEmployee(null);
      setLoading(false);
      toast({
        title: 'בחר עסק',
        description: 'יש לבחור עסק ספציפי לפני צפייה בפרופיל עובד',
        variant: 'destructive',
      });
      return;
    }

    if (!businessId) {
      console.log('❌ useEmployeeProfile - No business ID available');
      setEmployee(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    try {
      console.log('🔍 Fetching employee with full data:', { employeeId, businessId });

      let query = supabase
        .from('employees')
        .select(`
          *,
          main_branch:branches!main_branch_id(
            id,
            name,
            address
          ),
          branch_assignments:employee_branch_assignments(
            id,
            role_name,
            is_active,
            max_weekly_hours,
            priority_order,
            created_at,
            branch:branches!employee_branch_assignments_branch_id_fkey(
              id,
              name,
              address
            )
          ),
          weekly_tokens:employee_weekly_tokens(
            id,
            token,
            week_start_date,
            week_end_date,
            is_active,
            created_at,
            expires_at
          ),
          employee_notes:employee_notes(
            id,
            content,
            note_type,
            is_warning,
            created_at,
            created_by
          ),
          salary_history:employee_salary_history(
            id,
            amount,
            currency,
            type,
            effective_date,
            reason,
            created_at
          )
        `)
        .eq('id', employeeId);

      // CRITICAL SECURITY: Always apply business filter
      console.log('🔒 Adding mandatory business filter:', businessId);
      query = query.eq('business_id', businessId);

      const { data, error } = await query.single();

      if (error) {
        console.error('❌ Error fetching employee:', error);
        
        if (error.code === 'PGRST116') {
          console.error('❌ Employee not found or access denied');
          toast({
            title: 'עובד לא נמצא',
            description: 'העובד המבוקש לא נמצא במערכת או שאין לך הרשאה לצפות בו',
            variant: 'destructive',
          });
        } else {
          console.error('❌ Database error:', error.message);
          toast({
            title: 'שגיאה',
            description: 'לא ניתן לטעון את פרטי העובד: ' + error.message,
            variant: 'destructive',
          });
        }
        setEmployee(null);
        return;
      }

      if (!data) {
        console.log('❌ No employee data returned');
        setEmployee(null);
        return;
      }

      console.log('✅ Raw employee profile loaded:', {
        name: `${data.first_name} ${data.last_name}`,
        businessId: data.business_id,
        employeeId: data.id
      });

      // Normalize the data to our Employee type
      const normalizedEmployee = normalizeEmployee(data);

      console.log('✅ Normalized employee profile:', {
        name: `${normalizedEmployee.first_name} ${normalizedEmployee.last_name}`,
        hasPhone: !!normalizedEmployee.phone,
        hasEmail: !!normalizedEmployee.email,
        type: normalizedEmployee.employee_type,
        hasBranchAssignments: normalizedEmployee.branch_assignments?.length || 0,
        hasNotes: normalizedEmployee.employee_notes?.length || 0,
        hasTokens: normalizedEmployee.weekly_tokens?.length || 0
      });

      setEmployee(normalizedEmployee);
    } catch (error) {
      console.error('💥 Unexpected error:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה לא צפויה בטעינת פרטי העובד',
        variant: 'destructive',
      });
      setEmployee(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 useEmployeeProfile - useEffect triggered:', {
      employeeId,
      hasProfile: !!profile,
      profileRole: profile?.role,
      businessId,
      isSuperAdmin
    });
    
    if (profile && businessId) {
      fetchEmployee();
    }
  }, [employeeId, profile?.id, businessId, profile?.role]);

  return {
    employee,
    loading,
    refetchEmployee: fetchEmployee,
  };
};
