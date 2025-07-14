
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

        // קודם נבדוק אם למשתמש יש business_id בפרופיל שלו
        if (profile.business_id) {
          const { data: profileBusiness, error: profileBusinessError } = await supabase
            .from('businesses')
            .select('*')
            .eq('id', profile.business_id)
            .eq('is_active', true)
            .single();

          if (!profileBusinessError && profileBusiness) {
            setBusiness(profileBusiness);
            setBusinessId(profileBusiness.id);
            setIsBusinessOwner(profileBusiness.owner_id === profile.id);
            
            // נספור כמה עסקים המשתמש בעל
            const { data: ownedBusinesses } = await supabase
              .from('businesses')
              .select('id')
              .eq('owner_id', profile.id)
              .eq('is_active', true);
              
            setTotalOwnedBusinesses(ownedBusinesses?.length || 0);
            return;
          }
        }

        // אם אין business_id בפרופיל, נבדוק אם הוא בעלים של עסק
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
