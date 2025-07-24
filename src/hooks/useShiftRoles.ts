import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useShiftRoles = (businessId: string | null) => {
  return useQuery({
    queryKey: ['shift-roles', businessId],
    queryFn: async () => {
      if (!businessId) return {};

      const { data, error } = await supabase
        .from('shift_roles')
        .select('id, name')
        .eq('business_id', businessId)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching shift roles:', error);
        throw error;
      }

      // Convert to lookup object: { roleId: roleName }
      const rolesLookup: Record<string, string> = {};
      (data || []).forEach(role => {
        rolesLookup[role.id] = role.name;
      });

      return rolesLookup;
    },
    enabled: !!businessId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};