
import React from 'react';
import { IntegrationManagement } from '../integrations/IntegrationManagement';

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
      return <div className="p-6 text-center">רכיב WhatsApp בפיתוח</div>;
    case 'facebook':
      return <div className="p-6 text-center">רכיב Facebook בפיתוח</div>;
    case 'invoices':
      return <div className="p-6 text-center">רכיב חשבוניות בפיתוח</div>;
    case 'crm':
      return <div className="p-6 text-center">רכיב CRM בפיתוח</div>;
    case 'payments':
      return <div className="p-6 text-center">רכיב תשלומים בפיתוח</div>;
    default:
      return null;
  }
};
