
import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthContext';
import { useBusiness } from '@/hooks/useBusiness';
import { ModuleRouteHandler } from './routing/ModuleRouteHandler';
import { SuperAdminDashboard } from '@/components/admin/SuperAdminDashboard';
import { BusinessManagement } from '@/components/business/BusinessManagement';
import { EmployeeProfilePage } from './employees/EmployeeProfilePage';
import { ModuleManagement } from './ModuleManagement';

export const ModuleWrapper: React.FC = () => {
  const { businessId, moduleRoute, subModule, employeeId } = useParams();
  const { profile, isSuperAdmin, loading } = useAuth();
  const { business, ownedBusinesses, isBusinessOwner } = useBusiness();

  console.log('ModuleWrapper - Current params:', {
    businessId,
    moduleRoute,
    subModule,
    employeeId
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

  if (!isSuperAdmin && !isBusinessOwner && !business && ownedBusinesses.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">אין לך גישה לעסק</h2>
        <p className="text-gray-600 mb-4">נראה שאתה לא משויך לשום עסק במערכת</p>
        <p className="text-sm text-gray-500">אנא פנה למנהל המערכת להוספת הרשאות</p>
      </div>
    );
  }

  // Handle super admin routes
  if (!businessId && !moduleRoute) {
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
  if ((businessId === 'admin' && moduleRoute === 'businesses') || (moduleRoute === 'businesses' && isSuperAdmin)) {
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

  // Handle employee profile route specifically
  if (moduleRoute === 'employees' && subModule === 'profile') {
    return <EmployeeProfilePage />;
  }

  // Handle modules route
  if (moduleRoute === 'modules') {
    return <ModuleManagement />;
  }

  // Handle general module routes
  const fullRoute = subModule ? `${moduleRoute}/${subModule}` : moduleRoute;
  
  return (
    <ModuleRouteHandler 
      fullRoute={fullRoute} 
      employeeId={employeeId}
      businessId={businessId}
    />
  );
};
