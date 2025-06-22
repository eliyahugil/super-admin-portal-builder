
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Business } from '@/types/business';

export const useBusiness = () => {
  const { profile, isSuperAdmin } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [businessId, setBusinessId] = useState<string>('');
  const [totalOwnedBusinesses, setTotalOwnedBusinesses] = useState<number>(0);
  const [isBusinessOwner, setIsBusinessOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBusiness = async () => {
      if (!profile) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // אם המשתמש סופר־אדמין – לא נביא עסק
        if (isSuperAdmin) {
          setBusiness(null);
          setBusinessId('');
          setTotalOwnedBusinesses(0);
          setIsBusinessOwner(false);
          return;
        }

        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .eq('owner_id', profile.id)
          .eq('is_active', true);

        if (error) {
          console.error('🔴 שגיאה בשליפת עסק:', error);
          setIsLoading(false);
          return;
        }

        if (data.length > 0) {
          setBusiness(data[0]);
          setBusinessId(data[0].id);
          setTotalOwnedBusinesses(data.length);
          setIsBusinessOwner(true);
        } else {
          setBusiness(null);
          setBusinessId('');
          setTotalOwnedBusinesses(0);
          setIsBusinessOwner(false);
        }
      } catch (err) {
        console.error('💥 שגיאת מערכת בשליפת עסק:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusiness();
  }, [profile, isSuperAdmin]);

  return {
    business,
    businessId,
    totalOwnedBusinesses,
    isBusinessOwner,
    isSuperAdmin,
    isLoading
  };
};
