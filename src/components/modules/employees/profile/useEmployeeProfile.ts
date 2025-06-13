
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/hooks/useBusiness';
import { useToast } from '@/hooks/use-toast';
import type { Employee } from '@/types/supabase';

export const useEmployeeProfile = (employeeId: string | undefined) => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const { businessId } = useBusiness();
  const { toast } = useToast();

  const fetchEmployee = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', employeeId)
        .eq('business_id', businessId)
        .single();

      if (error) {
        console.error('Error fetching employee:', error);
        toast({
          title: 'שגיאה',
          description: 'Failed to load employee data.',
          variant: 'destructive',
        });
        return;
      }

      setEmployee(data);
    } catch (error) {
      console.error('Error fetching employee:', error);
      toast({
        title: 'שגיאה',
        description: 'Failed to load employee data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (businessId && employeeId) {
      fetchEmployee();
    }
  }, [businessId, employeeId]);

  return {
    employee,
    loading,
    refetchEmployee: fetchEmployee,
  };
};
