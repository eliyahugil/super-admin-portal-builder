
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useBusiness } from '@/hooks/useBusiness';

export const useBusinessCloning = () => {
  const { businessId } = useBusiness();
  const { toast } = useToast();
  const [isCloning, setIsCloning] = useState(false);

  const { data: availableBusinesses, isLoading } = useQuery({
    queryKey: ['available-businesses-for-cloning'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('id, name')
        .eq('is_active', true)
        .neq('id', businessId || ''); // Exclude current business

      if (error) {
        console.error('Error fetching businesses:', error);
        throw error;
      }

      return data;
    },
    enabled: !!businessId,
  });

  const cloneEmployeesToBusiness = async (targetBusinessId: string) => {
    if (!businessId) {
      toast({
        title: 'שגיאה',
        description: 'לא נמצא מזהה עסק',
        variant: 'destructive',
      });
      return null;
    }

    setIsCloning(true);
    try {
      const { data, error } = await supabase.rpc('clone_employees_to_business', {
        from_business_id: businessId,
        to_business_id: targetBusinessId,
      });

      if (error) {
        console.error('Error cloning employees:', error);
        throw error;
      }

      const result = data as any;
      
      toast({
        title: 'הצלחה',
        description: result.message,
      });

      return result;
    } catch (error: any) {
      console.error('Error in cloneEmployeesToBusiness:', error);
      toast({
        title: 'שגיאה',
        description: `שגיאה בשכפול העובדים: ${error.message}`,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsCloning(false);
    }
  };

  return {
    availableBusinesses: availableBusinesses || [],
    isLoading,
    isCloning,
    cloneEmployeesToBusiness,
  };
};
