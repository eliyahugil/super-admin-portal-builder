
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { normalizeEmployee, type Employee } from '@/types/employee';

export const useEmployeesData = (selectedBusinessId?: string | null) => {
  const { profile } = useAuth();
  const { businessId, isSuperAdmin } = useCurrentBusiness();

  const targetBusinessId = selectedBusinessId || businessId;

  console.log('🔍 useEmployeesData - Query parameters:', {
    userRole: profile?.role,
    businessId,
    selectedBusinessId,
    targetBusinessId,
    isSuperAdmin
  });

  return useQuery({
    queryKey: ['employees', targetBusinessId, profile?.role],
    queryFn: async (): Promise<Employee[]> => {
      console.log('📊 useEmployeesData - Starting query...');
      
      if (!profile) {
        console.log('❌ No profile available');
        throw new Error('User profile not available');
      }

      // CRITICAL FIX: For super admin without specific business selected, return empty array
      if (isSuperAdmin && !targetBusinessId) {
        console.log('🔒 Super admin without selected business - returning empty array');
        return [];
      }

      if (!targetBusinessId) {
        console.log('❌ No business ID available');
        throw new Error('Business ID required');
      }

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
          )
        `)
        .eq('is_archived', false); // Exclude archived employees

      // Apply business filter - MANDATORY for all queries
      console.log('🔒 Adding business filter:', targetBusinessId);
      query = query.eq('business_id', targetBusinessId);

      // Order by creation date (newest first)
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching employees:', error);
        throw error;
      }

      console.log('✅ Raw employees data fetched:', data?.length || 0);

      // Normalize the data to our Employee type
      const normalizedEmployees = (data || []).map(normalizeEmployee);

      console.log('✅ Normalized employees data:', {
        count: normalizedEmployees.length,
        sample: normalizedEmployees[0] ? {
          name: `${normalizedEmployees[0].first_name} ${normalizedEmployees[0].last_name}`,
          hasPhone: !!normalizedEmployees[0].phone,
          hasEmail: !!normalizedEmployees[0].email,
          type: normalizedEmployees[0].employee_type
        } : null
      });

      return normalizedEmployees;
    },
    // CRITICAL FIX: Only enable query when we have a target business ID
    enabled: !!profile && !!targetBusinessId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
