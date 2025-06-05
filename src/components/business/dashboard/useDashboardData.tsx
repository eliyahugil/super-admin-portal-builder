
import { useParams } from 'react-router-dom';
import { useRealData } from '@/hooks/useRealData';
import { useBusiness } from '@/hooks/useBusiness';

export const useDashboardData = () => {
  const { businessId: urlBusinessId } = useParams();
  const { businessId, business, isLoading: businessLoading } = useBusiness();
  
  // Use businessId from URL if available, otherwise use from context
  const currentBusinessId = urlBusinessId || businessId;

  const { data: employees } = useRealData<any>({
    queryKey: ['employees', currentBusinessId],
    tableName: 'employees',
    filters: currentBusinessId !== 'super_admin' ? { business_id: currentBusinessId } : {},
    enabled: !!currentBusinessId && !businessLoading
  });

  const { data: shifts } = useRealData<any>({
    queryKey: ['shifts-today', currentBusinessId],
    tableName: 'scheduled_shifts',
    filters: { shift_date: new Date().toISOString().split('T')[0] },
    enabled: !!currentBusinessId && !businessLoading
  });

  const { data: attendance } = useRealData<any>({
    queryKey: ['attendance-today', currentBusinessId],
    tableName: 'attendance_records',
    enabled: !!currentBusinessId && !businessLoading
  });

  const { data: requests } = useRealData<any>({
    queryKey: ['pending-requests', currentBusinessId],
    tableName: 'employee_requests',
    filters: { status: 'pending' },
    enabled: !!currentBusinessId && !businessLoading
  });

  // Filter today's attendance records
  const todayAttendance = attendance?.filter((record: any) => {
    const recordDate = new Date(record.recorded_at).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    return recordDate === today;
  }) || [];

  const activeEmployees = employees?.filter((emp: any) => emp.is_active) || [];

  return {
    business,
    businessLoading,
    activeEmployees,
    shifts,
    todayAttendance,
    requests,
    currentBusinessId
  };
};
