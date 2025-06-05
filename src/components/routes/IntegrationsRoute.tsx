import React from 'react';
import { useParams } from 'react-router-dom';
import { IntegrationDashboard } from '@/components/integrations/IntegrationDashboard';
import { BusinessIntegrationsManager } from '@/components/business/BusinessIntegrationsManager';
import { useBusiness } from '@/hooks/useBusiness';

export const IntegrationsRoute: React.FC = () => {
  const { businessId } = useParams();
  const { isSuperAdmin } = useBusiness();

  // If we have a business ID in the URL, show business-specific integrations
  if (businessId) {
    return <BusinessIntegrationsManager />;
  }

  // Otherwise show the main integrations dashboard
  return <IntegrationDashboard />;
};
