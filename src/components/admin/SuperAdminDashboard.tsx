
import React from 'react';
import { EmployeeRequestsApproval } from '@/components/modules/employees/EmployeeRequestsApproval';
import { SuperAdminHeader } from './dashboard/SuperAdminHeader';
import { SuperAdminStats } from './dashboard/SuperAdminStats';
import { SuperAdminQuickActions } from './dashboard/SuperAdminQuickActions';
import { SuperAdminRecentActivity } from './dashboard/SuperAdminRecentActivity';
import { SuperAdminSystemAlerts } from './dashboard/SuperAdminSystemAlerts';

export const SuperAdminDashboard: React.FC = () => {
  // Mock data - יוחלף בנתונים אמיתיים
  const systemStats = {
    totalBusinesses: 47,
    activeBusinesses: 42,
    totalUsers: 1247,
    activeModules: 12,
    pendingApprovals: 3,
    systemHealth: 98.5
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6" dir="rtl">
      <SuperAdminHeader />

      <SuperAdminStats systemStats={systemStats} />

      <SuperAdminQuickActions systemStats={systemStats} />

      {/* Employee Requests Approval Section */}
      <section className="mb-8">
        <EmployeeRequestsApproval />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SuperAdminRecentActivity />
        <SuperAdminSystemAlerts pendingApprovals={systemStats.pendingApprovals} />
      </div>
    </div>
  );
};
