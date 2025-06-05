
import React from 'react';
import { DashboardHeader } from './dashboard/DashboardHeader';
import { DashboardStats } from './dashboard/DashboardStats';
import { ManagementToolsSection } from './dashboard/ManagementToolsSection';
import { RecentActivityCard } from './dashboard/RecentActivityCard';
import { EmployeeRequestForm } from '@/components/modules/employees/EmployeeRequestForm';
import { EmployeeRequestsApproval } from '@/components/modules/employees/EmployeeRequestsApproval';
import { useDashboardData } from './dashboard/useDashboardData';
import { useBusiness } from '@/hooks/useBusiness';

export const BusinessDashboard: React.FC = () => {
  const {
    business,
    businessLoading,
    activeEmployees,
    shifts,
    todayAttendance,
    requests
  } = useDashboardData();

  const { profile } = useBusiness();
  const isAdmin = profile?.role === 'business_admin' || profile?.role === 'super_admin';

  const recentActivity = [
    {
      title: 'נתונים אמיתיים זמינים',
      description: 'המערכת מציגה נתונים אמיתיים מהמסד נתונים',
      time: 'עכשיו',
      type: 'system'
    },
    {
      title: `${activeEmployees.length} עובדים פעילים`,
      description: 'עובדים רשומים במערכת',
      time: 'עדכון אחרון',
      type: 'employee'
    },
    {
      title: `${shifts?.length || 0} משמרות היום`,
      description: 'משמרות מתוכננות להיום',
      time: 'היום',
      type: 'shift'
    }
  ];

  if (businessLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6" dir="rtl">
        <div className="text-center">טוען...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6" dir="rtl">
      <DashboardHeader businessName={business?.name} />

      <DashboardStats
        activeEmployeesCount={activeEmployees.length}
        shiftsCount={shifts?.length || 0}
        attendanceCount={todayAttendance.length}
        pendingRequestsCount={requests?.length || 0}
      />

      <ManagementToolsSection />

      {/* Employee Requests Approval Section - Only for Admins */}
      {isAdmin && (
        <section className="mb-8">
          <EmployeeRequestsApproval />
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivityCard activities={recentActivity} />
        <EmployeeRequestForm employeeId={activeEmployees[0]?.id} />
      </div>
    </div>
  );
};
