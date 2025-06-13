
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentBusiness } from './useCurrentBusiness';
import { useAuth } from '@/components/auth/AuthContext';
import type { Employee, mapEmployeeType } from '@/types/supabase';

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
            id,
            role_name,
            is_active,
            branch:branches(name)
          ),
          weekly_tokens:employee_weekly_tokens(
            id,
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
      
      // Map and sanitize the data to ensure type safety
      const mappedData = (data || []).map(employee => ({
        ...employee,
        employee_type: mapEmployeeType(employee.employee_type), // Ensure proper type mapping
        phone: employee.phone || undefined, // Ensure undefined rather than null
        email: employee.email || undefined, // Ensure undefined rather than null
      })) as Employee[];
      
      console.log('✅ useEmployeesData - Successfully fetched employees:', {
        count: mappedData.length,
        businessFilter: effectiveBusinessId || 'all',
        userType: isRealSuperAdmin ? 'super_admin' : 'business_user'
      });
      
      return mappedData;
    },
    enabled: !businessLoading && !!profile && (!!businessId || isRealSuperAdmin),
  });
}
