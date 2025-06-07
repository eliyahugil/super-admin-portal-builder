import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthContext';

// Module Components
import { BusinessSettings } from './settings/BusinessSettings';
import { BusinessSettingsMain } from './settings/BusinessSettingsMain';
import { BusinessProfileEdit } from './settings/BusinessProfileEdit';
import { UsersManagement } from './settings/UsersManagement';
import { EmployeeManagement } from './employees/EmployeeManagement';
import { ShiftManagement } from './employees/ShiftManagement';
import { ModuleManagement } from './ModuleManagement';
import { SuperAdminDashboard } from '@/components/admin/SuperAdminDashboard';
import { BusinessManagement } from '@/components/business/BusinessManagement';
import { AttendanceManagement } from './employees/AttendanceManagement';
import { EmployeeProfilePage } from './employees/EmployeeProfilePage';
import BusinessModulesPage from './settings/BusinessModulesPage';

export const ModuleWrapper: React.FC = () => {
  const { businessId, moduleRoute, subModule, employeeId } = useParams();
  const { profile, isSuperAdmin, loading } = useAuth();

  console.log('ModuleWrapper - Current params:', {
    businessId: { _type: typeof businessId, value: businessId },
    moduleRoute: { _type: typeof moduleRoute, value: moduleRoute },
    subModule: { _type: typeof subModule, value: subModule },
    employeeId: { _type: typeof employeeId, value: employeeId }
  });

  console.log('ModuleWrapper - Auth state:', {
    profile,
    isSuperAdmin,
    loading,
    user: profile?.email
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Handle super admin routes
  if (!businessId && !moduleRoute) {
    console.log('ModuleWrapper - Handling admin route, isSuperAdmin:', isSuperAdmin);
    if (isSuperAdmin) {
      console.log('ModuleWrapper - Rendering SuperAdminDashboard');
      return <SuperAdminDashboard />;
    }
    return <div>Access denied</div>;
  }

  // Handle business management for super admin - check for admin in businessId
  if (businessId === 'admin' && moduleRoute === 'businesses') {
    console.log('ModuleWrapper - Rendering BusinessManagement for super admin via admin route');
    if (isSuperAdmin) {
      return <BusinessManagement />;
    }
    return <div>Access denied</div>;
  }

  // Handle business management for super admin - direct businesses route
  if (moduleRoute === 'businesses' && isSuperAdmin) {
    console.log('ModuleWrapper - Rendering BusinessManagement for super admin');
    return <BusinessManagement />;
  }

  // Handle employee profile route specifically
  if (moduleRoute === 'employees' && subModule === 'profile') {
    console.log('ModuleWrapper - Rendering EmployeeProfilePage for employeeId:', employeeId);
    return <EmployeeProfilePage />;
  }

  // Handle module routes
  const fullRoute = subModule ? `${moduleRoute}/${subModule}` : moduleRoute;
  console.log('ModuleWrapper - Rendering component for route:', fullRoute);

  switch (fullRoute) {
    case 'settings':
      // When accessing settings for a business, show the main business settings
      return businessId ? <BusinessSettingsMain /> : <BusinessSettings />;
    case 'settings/main':
      return <BusinessSettingsMain />;
    case 'settings/profile':
      return <BusinessProfileEdit />;
    case 'settings/users':
      return <UsersManagement />;
    case 'settings/modules':
      return <BusinessModulesPage />;
    case 'settings/permissions':
      return <div>Permissions component</div>;
    case 'employees':
      return <EmployeeManagement />;
    case 'employees/attendance':
      return <AttendanceManagement />;
    case 'shifts':
      return <ShiftManagement />;
    case 'modules':
      return <ModuleManagement />;
    default:
      return (
        <div className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">המודול לא נמצא</h2>
          <p>הנתיב "{fullRoute}" אינו קיים במערכת</p>
        </div>
      );
  }
};
