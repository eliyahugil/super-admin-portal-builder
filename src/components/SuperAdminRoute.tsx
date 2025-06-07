
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useIsSuperAdmin } from '@/hooks/useIsSuperAdmin';

interface SuperAdminRouteProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

export const SuperAdminRoute: React.FC<SuperAdminRouteProps> = ({ 
  children, 
  fallbackPath = "/" 
}) => {
  const { isSuperAdmin, loading } = useIsSuperAdmin();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">בודק הרשאות מנהל...</p>
        </div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};
