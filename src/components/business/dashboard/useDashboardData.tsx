
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { useRealData } from '@/hooks/useRealData';

export const useDashboardData = () => {
  const { businessId, role, loading: businessLoading, isSuperAdmin, businessName } = useCurrentBusiness();
  
  console.log('useDashboardData - Using business:', { businessId, role, isSuperAdmin });

  const { data: employees } = useRealData<any>({
    queryKey: ['employees', businessId],
    tableName: 'employees',
    filters: businessId ? { business_id: businessId } : {},
    enabled: !!businessId && !businessLoading,
    enforceBusinessFilter: !isSuperAdmin // Auto-filter for non-super-admins
  });

  const { data: shifts } = useRealData<any>({
    queryKey: ['shifts-today', businessId],
    tableName: 'scheduled_shifts',
    filters: { shift_date: new Date().toISOString().split('T')[0] },
    enabled: !!businessId && !businessLoading,
    enforceBusinessFilter: !isSuperAdmin
  });

  const { data: attendance } = useRealData<any>({
    queryKey: ['attendance-today', businessId],
    tableName: 'attendance_records',
    enabled: !!businessId && !businessLoading,
    enforceBusinessFilter: !isSuperAdmin
  });

  const { data: requests } = useRealData<any>({
    queryKey: ['pending-requests', businessId],
    tableName: 'employee_requests',
    filters: { status: 'pending' },
    enabled: !!businessId && !businessLoading,
    enforceBusinessFilter: !isSuperAdmin
  });

  // Filter today's attendance records
  const todayAttendance = attendance?.filter((record: any) => {
    const recordDate = new Date(record.recorded_at).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    return recordDate === today;
  }) || [];

  const activeEmployees = employees?.filter((emp: any) => emp.is_active) || [];

  return {
    business: { id: businessId, name: businessName },
    businessLoading,
    activeEmployees,
    shifts,
    todayAttendance,
    requests,
    currentBusinessId: businessId,
    userRole: role,
    isSuperAdmin
  };
};
