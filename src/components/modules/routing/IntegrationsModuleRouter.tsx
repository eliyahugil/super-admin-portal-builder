
import React from 'react';
import { IntegrationManagement } from '../integrations/IntegrationManagement';
import { WhatsAppDashboard } from '@/components/whatsapp/WhatsAppDashboard';
import { useBusinessId } from '@/hooks/useBusinessId';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { Navigate } from 'react-router-dom';

interface Props {
  route: string;
}
export const IntegrationsModuleRouter: React.FC<Props> = ({ route }) => {
  const businessId = useBusinessId();
  const { businessName } = useCurrentBusiness();
  
  if (!businessId) {
    return <div className="p-6 text-center">לא נמצא עסק פעיל</div>;
  }

  switch (route) {
    case '':
      return <IntegrationManagement />;
    case 'google-maps':
      return <div className="p-6 text-center">רכיב Google Maps בפיתוח</div>;
    case 'whatsapp':
      return <WhatsAppDashboard businessId={businessId} businessName={businessName || "העסק שלי"} />;
    case 'facebook':
      return <div className="p-6 text-center">רכיב Facebook בפיתוח</div>;
    case 'invoices': {
      const target = `/modules/accounting?tab=invoices`;
      return <Navigate to={target} replace />;
    }
    case 'payments': {
      const target = `/modules/accounting?tab=receipts`;
      return <Navigate to={target} replace />;
    }
    default:
      return null;
  }
};
