
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useEmployeeAttendance = (employeeId: string) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data: logs, error } = await supabase
          .from('attendance_records')
          .select('*')
          .eq('employee_id', employeeId)
          .order('recorded_at', { ascending: false });

        if (error) {
          console.error('Error fetching attendance logs:', error);
        } else {
          setData(logs || []);
        }
      } catch (error) {
        console.error('Exception in fetchLogs:', error);
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) {
      fetchLogs();
    }
  }, [employeeId]);

  return { data, loading };
};
