import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BirthdayNotification {
  id: string;
  employee_id: string;
  notification_date: string;
  sent_at: string;
  message: string;
  created_at: string;
  employee?: {
    first_name: string;
    last_name: string;
  };
}

export const useBirthdayNotifications = (businessId: string | null) => {
  return useQuery({
    queryKey: ['birthday-notifications', businessId],
    queryFn: async (): Promise<BirthdayNotification[]> => {
      if (!businessId) {
        throw new Error('Business ID is required');
      }

      const { data, error } = await supabase
        .from('birthday_notifications')
        .select(`
          id,
          employee_id,
          notification_date,
          sent_at,
          message,
          created_at,
          employee:employees!employee_id(
            first_name,
            last_name
          )
        `)
        .order('sent_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching birthday notifications:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!businessId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useTodaysBirthdays = (businessId: string | null) => {
  return useQuery({
    queryKey: ['todays-birthdays', businessId],
    queryFn: async () => {
      if (!businessId) return [];

      const today = new Date();
      const todayFormatted = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}`;

      const { data: employees, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, birth_date')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .not('birth_date', 'is', null);

      if (error) {
        console.error('Error fetching employees for birthdays:', error);
        throw error;
      }

      // Filter employees with birthdays today
      const birthdayEmployees = (employees || []).filter(employee => {
        if (!employee.birth_date) return false;
        
        const birthDate = new Date(employee.birth_date);
        const birthFormatted = `${String(birthDate.getDate()).padStart(2, '0')}-${String(birthDate.getMonth() + 1).padStart(2, '0')}`;
        
        return birthFormatted === todayFormatted;
      });

      return birthdayEmployees;
    },
    enabled: !!businessId,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};