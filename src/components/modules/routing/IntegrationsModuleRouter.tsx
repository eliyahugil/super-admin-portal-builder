
import React from 'react';
import { IntegrationManagement } from '../integrations/IntegrationManagement';
import { CRMDashboard } from '@/components/crm/CRMDashboard';
import { WhatsAppDashboard } from '@/components/whatsapp/WhatsAppDashboard';

interface Props {
  route: string;
}
export const IntegrationsModuleRouter: React.FC<Props> = ({ route }) => {
  switch (route) {
    case '':
      return <IntegrationManagement />;
    case 'google-maps':
      return <div className="p-6 text-center">רכיב Google Maps בפיתוח</div>;
    case 'whatsapp':
      return <WhatsAppDashboard />;
    case 'facebook':
      return <div className="p-6 text-center">רכיב Facebook בפיתוח</div>;
    case 'invoices':
      return <div className="p-6 text-center">רכיב חשבוניות בפיתוח</div>;
    case 'crm':
      return <CRMDashboard />;
    case 'payments':
      return <div className="p-6 text-center">רכיב תשלומים בפיתוח</div>;
    default:
      return null;
  }
};
