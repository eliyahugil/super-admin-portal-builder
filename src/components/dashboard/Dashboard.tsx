
import React from 'react';
import { SuperAdminStats } from './SuperAdminStats';
import { SuperAdminHeader } from './SuperAdminHeader';
import { BusinessesGrid } from './BusinessesGrid';
import { SuperAdminEmptyState } from './SuperAdminEmptyState';
import { SuperAdminAccessDenied } from './SuperAdminAccessDenied';
import { SuperAdminLoading } from './SuperAdminLoading';
import { useDashboard } from './useDashboard';

export const Dashboard: React.FC = () => {
  const {
    isSuperAdmin,
    businesses,
    stats,
    loading,
    handleManageBusiness,
    handleEditBusiness,
    handleCreateBusiness,
  } = useDashboard();

  if (!isSuperAdmin) {
    return <SuperAdminAccessDenied />;
  }

  if (loading) {
    return <SuperAdminLoading />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SuperAdminStats stats={stats} />
        <SuperAdminHeader onCreateBusiness={handleCreateBusiness} />
        
        {businesses.length === 0 ? (
          <SuperAdminEmptyState onCreateBusiness={handleCreateBusiness} />
        ) : (
          <BusinessesGrid
            businesses={businesses}
            onManage={handleManageBusiness}
            onEdit={handleEditBusiness}
          />
        )}
      </div>
    </div>
  );
};
