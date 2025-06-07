
import React from 'react';
import { useBusinessModules } from '@/hooks/useBusinessModules';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { useAuth } from '@/components/auth/AuthContext';
import { Navigate } from 'react-router-dom';

interface ProtectedModuleRouteProps {
  children: React.ReactNode;
  moduleName: string;
  fallbackPath?: string;
}

export const ProtectedModuleRoute: React.FC<ProtectedModuleRouteProps> = ({ 
  children, 
  moduleName, 
  fallbackPath = "/" 
}) => {
  const { businessId, loading: businessLoading } = useCurrentBusiness();
  const { isSuperAdmin } = useAuth();
  const { isModuleEnabled, isLoading: moduleLoading } = useBusinessModules(businessId);

  // Super admins bypass module restrictions
  if (isSuperAdmin) {
    return <>{children}</>;
  }

  if (businessLoading || moduleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">בודק הרשאות מודול...</p>
        </div>
      </div>
    );
  }

  // Check if module is enabled for this business
  if (!isModuleEnabled(moduleName)) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center" dir="rtl">
        <h2 className="text-xl font-semibold mb-4">מודול לא זמין</h2>
        <p className="text-gray-600 mb-4">המודול "{moduleName}" אינו פעיל עבור העסק הזה</p>
        <p className="text-sm text-gray-500">אנא פנה למנהל המערכת להפעלת המודול</p>
      </div>
    );
  }

  return <>{children}</>;
};
