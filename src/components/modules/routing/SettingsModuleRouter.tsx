
import React from 'react';
import { BusinessSettings } from '../settings/BusinessSettings';
import { BusinessSettingsMain } from '../settings/BusinessSettingsMain';
import { BusinessProfileEdit } from '../settings/BusinessProfileEdit';
import { UsersManagement } from '../settings/UsersManagement';
import BusinessModulesPage from '../settings/BusinessModulesPage';

interface Props {
  route: string;
  businessId?: string;
}
export const SettingsModuleRouter: React.FC<Props> = ({ route, businessId }) => {
  switch (route) {
    case '':
      return businessId ? <BusinessSettingsMain /> : <BusinessSettings />;
    case 'main':
      return <BusinessSettingsMain />;
    case 'profile':
      return <BusinessProfileEdit />;
    case 'users':
      return <UsersManagement />;
    case 'modules':
      return <BusinessModulesPage />;
    case 'permissions':
      return <div className="p-6 text-center">רכיב הרשאות בפיתוח</div>;
    default:
      return null;
  }
};
