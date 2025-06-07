import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { useAuth } from '@/components/auth/AuthContext';

interface Business {
  id: string;
  name: string;
}

export function useBusinessCloning() {
  const { toast } = useToast();
  const { businessId: currentBusinessId } = useCurrentBusiness();
  const { isSuperAdmin, profile } = useAuth();

  const [availableBusinesses, setAvailableBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCloning, setIsCloning] = useState(false);

  // Fetch available businesses for cloning
  useEffect(() => {
    const fetchAvailableBusinesses = async () => {
      if (!currentBusinessId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        let query = supabase
          .from('businesses')
          .select('id, name')
          .neq('id', currentBusinessId)
          .eq('is_active', true);

        // If not super admin, filter by businesses the user has access to
        if (!isSuperAdmin && profile?.id) {
          // For business admins, only show businesses they own
          query = query.eq('owner_id', profile.id);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching businesses for cloning:', error);
          toast({
            title: 'שגיאה',
            description: 'לא ניתן לטעון רשימת עסקים',
            variant: 'destructive',
          });
          setAvailableBusinesses([]);
        } else {
          setAvailableBusinesses(data || []);
        }
      } catch (error) {
        console.error('Exception in fetchAvailableBusinesses:', error);
        setAvailableBusinesses([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Only super admins and business owners can clone
    if (isSuperAdmin || profile?.role === 'business_admin') {
      fetchAvailableBusinesses();
    } else {
      setIsLoading(false);
      setAvailableBusinesses([]);
    }
  }, [currentBusinessId, isSuperAdmin, profile]);

  const cloneEmployeesToBusiness = async (targetBusinessId: string): Promise<boolean> => {
    if (!currentBusinessId || !targetBusinessId || currentBusinessId === targetBusinessId) {
      return false;
    }

    if (!isSuperAdmin && profile?.role !== 'business_admin') {
      toast({
        title: 'אין הרשאה',
        description: 'אין לך הרשאות לשכפל עובדים',
        variant: 'destructive',
      });
      return false;
    }

    try {
      setIsCloning(true);

      // Fetch active employees from current business
      const { data: employees, error: fetchError } = await supabase
        .from('employees')
        .select('*')
        .eq('business_id', currentBusinessId)
        .eq('is_active', true);

      if (fetchError) {
        throw fetchError;
      }

      if (!employees || employees.length === 0) {
        toast({
          title: 'אין עובדים לשכפול',
          description: 'לא נמצאו עובדים פעילים בעסק הנוכחי',
          variant: 'destructive',
        });
        return false;
      }

      // Prepare cloned employee data
      const clonedEmployees = employees.map(employee => ({
        first_name: employee.first_name,
        last_name: employee.last_name,
        phone: employee.phone,
        email: employee.email,
        id_number: employee.id_number,
        employee_id: employee.employee_id,
        employee_type: employee.employee_type,
        weekly_hours_required: employee.weekly_hours_required,
        address: employee.address,
        notes: `${employee.notes || ''}\n\n--- משוכפל מעסק ${currentBusinessId} בתאריך ${new Date().toLocaleDateString('he-IL')} ---`,
        business_id: targetBusinessId,
        is_active: true,
        hire_date: new Date().toISOString().split('T')[0], // Today's date
        // Keep track of original source
        original_business_id: currentBusinessId,
        cloned_at: new Date().toISOString(),
      }));

      // Insert cloned employees
      const { error: insertError } = await supabase
        .from('employees')
        .insert(clonedEmployees);

      if (insertError) {
        throw insertError;
      }

      toast({
        title: 'השכפול הצליח!',
        description: `${clonedEmployees.length} עובדים הועתקו לעסק החדש בהצלחה`,
      });

      return true;
    } catch (error) {
      console.error('Error cloning employees:', error);
      toast({
        title: 'שגיאה בשכפול',
        description: 'אירעה שגיאה במהלך שכפול העובדים. נסה שוב.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsCloning(false);
    }
  };

  return {
    availableBusinesses,
    isLoading,
    isCloning,
    cloneEmployeesToBusiness,
  };
}
