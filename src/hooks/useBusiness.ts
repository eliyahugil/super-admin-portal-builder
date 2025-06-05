
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
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

      const { data, error } = await supabase
        .from('businesses')
        .select('id, name')
        .eq('owner_id', user.id)
        .single();

      if (error || !data) return null;
      
      setCurrentBusinessId(data.id);
      return data;
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
