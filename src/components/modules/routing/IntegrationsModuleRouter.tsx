
import React from 'react';
import { IntegrationManagement } from '../integrations/IntegrationManagement';
import { WhatsAppDashboard } from '@/components/whatsapp/WhatsAppDashboard';
import { useBusinessId } from '@/hooks/useBusinessId';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

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
    case 'invoices':
      return <div className="p-6 text-center">רכיב חשבוניות בפיתוח</div>;
    case 'payments':
      return <div className="p-6 text-center">רכיב תשלומים בפיתוח</div>;
    default:
      return null;
  }
};
