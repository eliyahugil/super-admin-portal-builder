
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentBusiness } from './useCurrentBusiness';
import { useAuth } from '@/components/auth/AuthContext';

interface Employee {
  id: string;
  business_id: string; // Made required to match database reality
  employee_id: string | null;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  employee_type: string;
  is_active: boolean;
  hire_date: string | null;
  weekly_hours_required: number | null;
  notes: string | null;
  main_branch?: { name: string } | null;
  branch_assignments?: Array<{
    branch: { name: string };
    role_name: string;
    is_active: boolean;
  }>;
  weekly_tokens?: Array<{
    token: string;
    week_start_date: string;
    week_end_date: string;
    is_active: boolean;
  }>;
  employee_notes?: Array<{
    id: string;
    content: string;
    note_type: string;
    created_at: string;
  }>;
  salary_info?: {
    hourly_rate?: number;
    monthly_salary?: number;
    currency?: string;
  };
}

// רשימת המשתמשים המורשים לראות את כל העסקים
const AUTHORIZED_SUPER_USERS = [
  'HABULGARTI@gmail.com',
  'eligil1308@gmail.com'
];

/**
 * Unified hook for fetching employee data with consistent business filtering
 * This ensures all components use the same data source and filtering logic
 */
export function useEmployeesData(selectedBusinessId?: string | null) {
  const { profile, user } = useAuth();
  const { businessId, isSuperAdmin, loading: businessLoading } = useCurrentBusiness();

  const userEmail = user?.email?.toLowerCase();
  const isRealSuperAdmin = (userEmail && AUTHORIZED_SUPER_USERS.includes(userEmail)) || 
                          profile?.role === 'super_admin' || 
                          isSuperAdmin;

  // For super admin, use selectedBusinessId if provided, otherwise use their businessId
  // For regular users, always use their businessId
  const effectiveBusinessId = isRealSuperAdmin ? (selectedBusinessId || businessId) : businessId;

  return useQuery({
    queryKey: ['employees', effectiveBusinessId, isRealSuperAdmin, selectedBusinessId],
    queryFn: async (): Promise<Employee[]> => {
      console.log('🔄 useEmployeesData - Fetching employees with unified logic:', {
        effectiveBusinessId,
        isRealSuperAdmin,
        selectedBusinessId,
        userType: isRealSuperAdmin ? 'super_admin' : 'business_user'
      });
      
      let query = supabase
        .from('employees')
        .select(`
          *,
          main_branch:branches!main_branch_id(name),
          branch_assignments:employee_branch_assignments(
            role_name,
            is_active,
            branch:branches(name)
          ),
          weekly_tokens:employee_weekly_tokens(
            token,
            week_start_date,
            week_end_date,
            is_active
          ),
          employee_notes:employee_notes(
            id,
            content,
            note_type,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      // Apply business filter based on user type and selection
      if (isRealSuperAdmin) {
        if (effectiveBusinessId) {
          // Super admin with specific business selected
          console.log('🎯 Super admin filtering by business:', effectiveBusinessId);
          query = query.eq('business_id', effectiveBusinessId);
        } else {
          // Super admin wants to see all businesses - no filter needed
          console.log('👁️ Super admin viewing all employees across all businesses');
        }
      } else {
        // Regular user - filter by their business
        if (!businessId) {
          console.log('⚠️ No business ID available for non-super admin user');
          return [];
        }
        console.log('🏢 Regular user filtering by business:', businessId);
        query = query.eq('business_id', businessId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('❌ useEmployeesData - Error fetching employees:', error);
        throw error;
      }
      
      console.log('✅ useEmployeesData - Successfully fetched employees:', {
        count: data?.length || 0,
        businessFilter: effectiveBusinessId || 'all',
        userType: isRealSuperAdmin ? 'super_admin' : 'business_user'
      });
      
      return (data as Employee[]) || [];
    },
    enabled: !businessLoading && !!profile && (!!businessId || isRealSuperAdmin),
  });
}
