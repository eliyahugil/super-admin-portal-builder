
import React from 'react';
import { useBusiness } from '@/hooks/useBusiness';
import { SuperAdminIntegrationsDashboard } from '@/components/admin/SuperAdminIntegrationsDashboard';
import { IntegrationDashboard } from '@/components/integrations/IntegrationDashboard';

export const IntegrationsRoute: React.FC = () => {
  const { isSuperAdmin } = useBusiness();

  console.log('=== IntegrationsRoute ===');
  console.log('Is Super Admin:', isSuperAdmin);

  // For super admin, show the advanced dashboard with real data
  if (isSuperAdmin) {
    return <SuperAdminIntegrationsDashboard />;
  }

  // For regular users, show the standard integration dashboard
  return <IntegrationDashboard />;
};
