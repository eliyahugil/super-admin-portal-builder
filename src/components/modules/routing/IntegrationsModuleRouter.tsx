
import React from 'react';
import { IntegrationManagement } from '../integrations/IntegrationManagement';
import { WhatsAppDashboard } from '@/components/whatsapp/WhatsAppDashboard';
import { useAuth } from '@/components/auth/AuthContext';

interface Props {
  route: string;
}
export const IntegrationsModuleRouter: React.FC<Props> = ({ route }) => {
  const { profile } = useAuth();
  
  if (!profile?.business_id) {
    return <div className="p-6 text-center">לא נמצא עסק פעיל</div>;
  }

  switch (route) {
    case '':
      return <IntegrationManagement />;
    case 'google-maps':
      return <div className="p-6 text-center">רכיב Google Maps בפיתוח</div>;
    case 'whatsapp':
      return <WhatsAppDashboard businessId={profile.business_id} businessName="העסק שלי" />;
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
