
import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthContext';
import { useBusiness } from '@/hooks/useBusiness';
import { ModuleRouteHandler } from './routing/ModuleRouteHandler';
import { SuperAdminDashboard } from '@/components/admin/SuperAdminDashboard';
import { BusinessManagement } from '@/components/business/BusinessManagement';
import { EmployeeProfilePage } from './employees/profile/EmployeeProfilePage';
import { ModuleManagement } from './ModuleManagement';

export const ModuleWrapper: React.FC = () => {
  const { businessId, moduleRoute, subModule, employeeId } = useParams();
  const { profile, isSuperAdmin, loading } = useAuth();
  const { business, totalOwnedBusinesses, isBusinessOwner } = useBusiness();

  const fullPath = window.location.pathname;
  const segments = fullPath.split('/').filter(Boolean);
  const inferredModule = moduleRoute || (segments[0] === 'modules' ? segments[1] : undefined);
  const inferredSubModule = subModule || (segments[0] === 'modules' ? segments[2] : undefined);

  console.log('ModuleWrapper - Current params:', {
    businessId,
    moduleRoute,
    subModule,
    employeeId,
    inferredModule,
    inferredSubModule,
    fullPath
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">טוען משתמש...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">שגיאה בטעינת הפרופיל</h2>
        <p className="text-gray-600 mb-4">לא ניתן לטעון את פרטי המשתמש</p>
        <p className="text-sm text-gray-500">נסה לרענן את הדף או להתחבר מחדש</p>
      </div>
    );
  }

  if (!isSuperAdmin && !isBusinessOwner && !business && totalOwnedBusinesses === 0) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">אין לך גישה לעסק</h2>
        <p className="text-gray-600 mb-4">נראה שאתה לא משויך לשום עסק במערכת</p>
        <p className="text-sm text-gray-500">אנא פנה למנהל המערכת להוספת הרשאות</p>
      </div>
    );
  }

  // Handle super admin routes
  if (!businessId && !inferredModule) {
    if (isSuperAdmin) {
      return <SuperAdminDashboard />;
    }
    return (
      <div className="max-w-7xl mx-auto p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">אין הרשאה</h2>
        <p className="text-gray-600">אין לך הרשאות מנהל ראשי</p>
      </div>
    );
  }

  // Handle business management routes
  if ((businessId === 'admin' && inferredModule === 'businesses') || (inferredModule === 'businesses' && isSuperAdmin)) {
    if (isSuperAdmin) {
      return <BusinessManagement />;
    }
    return (
      <div className="max-w-7xl mx-auto p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">אין הרשאה</h2>
        <p className="text-gray-600">אין לך הרשאות מנהל ראשי</p>
      </div>
    );
  }

  // Handle employee profile route specifically - check for URL pattern like /modules/employees/profile/123
  if (inferredModule === 'employees' && inferredSubModule === 'profile' && employeeId) {
    console.log('🎯 Detected employee profile route, rendering EmployeeProfilePage for:', employeeId);
    return <EmployeeProfilePage />;
  }

  // Handle modules route
  if (inferredModule === 'modules') {
    return <ModuleManagement />;
  }

  // Handle general module routes
  const fullRoute = inferredSubModule ? `${inferredModule}/${inferredSubModule}` : inferredModule;
  
  console.log('🔀 Routing to ModuleRouteHandler with:', {
    fullRoute,
    employeeId,
    businessId
  });
  
  return (
    <ModuleRouteHandler 
      fullRoute={fullRoute} 
      employeeId={employeeId}
      businessId={businessId}
    />
  );
};
