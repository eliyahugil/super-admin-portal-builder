
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Simple types to avoid Supabase type recursion
interface SimpleProfile {
  role: string;
}

interface SimpleBusiness {
  id: string;
  name?: string;
}

export const useBusiness = () => {
  const [currentBusinessId, setCurrentBusinessId] = useState<string | null>(null);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return null;
      return user;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as SimpleProfile | null;
    },
    enabled: !!user?.id,
  });

  const { data: business } = useQuery({
    queryKey: ['user-business', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      // Super admin can access all businesses
      if (profile?.role === 'super_admin') {
        setCurrentBusinessId('super_admin');
        return { id: 'super_admin', role: 'super_admin' };
      }

      const { data, error } = await (supabase as any)
        .from('businesses')
        .select('id, name')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (error || !data) return null;
      
      const businessData = data as SimpleBusiness;
      setCurrentBusinessId(businessData.id);
      return businessData;
    },
    enabled: !!user?.id && !!profile,
  });

  return {
    businessId: currentBusinessId,
    business,
    isLoading: !user || !profile || !business,
    isSuperAdmin: profile?.role === 'super_admin',
  };
};
