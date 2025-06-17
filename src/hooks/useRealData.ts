
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';

interface Business {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  is_active: boolean;
  created_at: string;
}

// Hook לשליפת נתוני העסקים
export const useBusinessesData = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['businesses-data', profile?.role],
    queryFn: async (): Promise<Business[]> => {
      console.log('🏢 useBusinessesData - Starting query...');
      
      if (!profile) {
        console.log('❌ No profile available');
        return [];
      }

      // For super admin, get all businesses
      if (profile.role === 'super_admin') {
        console.log('👑 Fetching all businesses for super admin');
        
        const { data, error } = await supabase
          .from('businesses')
          .select('id, name, description, logo_url, is_active, created_at')
          .eq('is_active', true)
          .order('name', { ascending: true });

        if (error) {
          console.error('❌ Error fetching businesses:', error);
          throw error;
        }

        console.log('✅ Businesses fetched:', data?.length || 0);
        return data || [];
      }

      // For regular users, get their businesses through user_businesses
      console.log('👤 Fetching user businesses for regular user');
      
      const { data, error } = await supabase
        .from('user_businesses')
        .select(`
          business:businesses!inner (
            id,
            name,
            description,
            logo_url,
            is_active,
            created_at
          )
        `)
        .eq('user_id', profile.id)
        .eq('business.is_active', true);

      if (error) {
        console.error('❌ Error fetching user businesses:', error);
        throw error;
      }

      console.log('✅ User businesses fetched:', data?.length || 0);
      
      // Transform the data structure
      return data?.map(item => item.business) || [];
    },
    enabled: !!profile,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });
};
