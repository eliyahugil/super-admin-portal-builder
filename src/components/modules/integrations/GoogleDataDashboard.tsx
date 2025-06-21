
import React from 'react';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { useDataSummary } from './dashboard/useDataSummary';
import { StatsCards } from './dashboard/StatsCards';
import { DataOverview } from './dashboard/DataOverview';
import { ActivityFeed } from './dashboard/ActivityFeed';
import { SyncStatus } from './dashboard/SyncStatus';

interface GoogleDataDashboardProps {
  businessId: string;
}

export const GoogleDataDashboard: React.FC<GoogleDataDashboardProps> = ({ businessId }) => {
  const { events, integrations, loading } = useGoogleCalendar(businessId);
  const dataSummary = useDataSummary(events, integrations);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <StatsCards dataSummary={dataSummary} />

      {/* Main Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Data Overview */}
        <div className="lg:col-span-2">
          <DataOverview events={events} />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <ActivityFeed />
          <SyncStatus dataSummary={dataSummary} />
        </div>
      </div>
    </div>
  );
};
