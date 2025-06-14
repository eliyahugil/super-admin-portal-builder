
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { useRealData } from '@/hooks/useRealData';
import { useMemo } from 'react';

export const useDashboardData = () => {
  const { businessId, role, loading: businessLoading, isSuperAdmin, businessName } = useCurrentBusiness();
  
  console.log('useDashboardData - Using business:', { businessId, role, isSuperAdmin });

  const { data: employees } = useRealData<any>({
    queryKey: ['employees', businessId],
    tableName: 'employees',
    filters: businessId ? { business_id: businessId } : {},
    enabled: !!businessId && !businessLoading,
    enforceBusinessFilter: !isSuperAdmin
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

  // Get recent employee activity (created/updated employees)
  const { data: recentEmployeeActivity } = useRealData<any>({
    queryKey: ['recent-employee-activity', businessId],
    tableName: 'employees',
    filters: businessId ? { business_id: businessId } : {},
    enabled: !!businessId && !businessLoading,
    enforceBusinessFilter: !isSuperAdmin,
    select: 'id, first_name, last_name, created_at, updated_at',
    orderBy: { column: 'updated_at', ascending: false }
  });

  // Get recent shift submissions
  const { data: recentShiftSubmissions } = useRealData<any>({
    queryKey: ['recent-shift-submissions', businessId],
    tableName: 'shift_submissions',
    enabled: !!businessId && !businessLoading,
    enforceBusinessFilter: !isSuperAdmin,
    select: 'id, employee_id, submitted_at, week_start_date, week_end_date',
    orderBy: { column: 'submitted_at', ascending: false }
  });

  // Get recent requests activity
  const { data: recentRequestsActivity } = useRealData<any>({
    queryKey: ['recent-requests-activity', businessId],
    tableName: 'employee_requests',
    enabled: !!businessId && !businessLoading,
    enforceBusinessFilter: !isSuperAdmin,
    select: 'id, employee_id, subject, request_type, created_at, status',
    orderBy: { column: 'created_at', ascending: false }
  });

  // Filter today's attendance records
  const todayAttendance = attendance?.filter((record: any) => {
    const recordDate = new Date(record.recorded_at).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    return recordDate === today;
  }) || [];

  const activeEmployees = employees?.filter((emp: any) => emp.is_active) || [];

  // Generate real activity data from actual database records
  const recentActivity = useMemo(() => {
    const activities: Array<{
      title: string;
      description: string;
      time: string;
      type: string;
    }> = [];

    // Add recent employee activities
    if (recentEmployeeActivity && recentEmployeeActivity.length > 0) {
      const recentEmployee = recentEmployeeActivity[0];
      const isNewEmployee = new Date(recentEmployee.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      if (isNewEmployee) {
        activities.push({
          title: 'עובד חדש נוסף',
          description: `${recentEmployee.first_name} ${recentEmployee.last_name} נוסף למערכת`,
          time: new Date(recentEmployee.created_at).toLocaleDateString('he-IL'),
          type: 'employee'
        });
      } else {
        activities.push({
          title: 'עובד עודכן',
          description: `${recentEmployee.first_name} ${recentEmployee.last_name} - פרטים עודכנו`,
          time: new Date(recentEmployee.updated_at).toLocaleDateString('he-IL'),
          type: 'employee'
        });
      }
    }

    // Add recent shift submissions
    if (recentShiftSubmissions && recentShiftSubmissions.length > 0) {
      const recentSubmission = recentShiftSubmissions[0];
      activities.push({
        title: 'הגשת משמרות חדשה',
        description: `הוגשו משמרות לשבוע ${new Date(recentSubmission.week_start_date).toLocaleDateString('he-IL')}`,
        time: new Date(recentSubmission.submitted_at).toLocaleDateString('he-IL'),
        type: 'shift'
      });
    }

    // Add recent requests
    if (recentRequestsActivity && recentRequestsActivity.length > 0) {
      const recentRequest = recentRequestsActivity[0];
      activities.push({
        title: 'בקשה חדשה התקבלה',
        description: `${recentRequest.subject} - ${recentRequest.request_type}`,
        time: new Date(recentRequest.created_at).toLocaleDateString('he-IL'),
        type: 'request'
      });
    }

    // Add attendance activity
    if (todayAttendance.length > 0) {
      activities.push({
        title: 'נוכחות עובדים היום',
        description: `${todayAttendance.length} עובדים נכחו היום`,
        time: 'היום',
        type: 'attendance'
      });
    }

    // If no real activities, show system status
    if (activities.length === 0) {
      activities.push({
        title: 'המערכת פעילה',
        description: 'כל המערכות פועלות כרגיל',
        time: 'עכשיו',
        type: 'system'
      });
    }

    return activities.slice(0, 3); // Show only the 3 most recent activities
  }, [recentEmployeeActivity, recentShiftSubmissions, recentRequestsActivity, todayAttendance]);

  return {
    business: { id: businessId, name: businessName },
    businessLoading,
    activeEmployees,
    shifts,
    todayAttendance,
    requests,
    currentBusinessId: businessId,
    userRole: role,
    isSuperAdmin,
    recentActivity
  };
};
