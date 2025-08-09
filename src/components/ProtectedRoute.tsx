
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthContext';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<'super_admin' | 'business_admin' | 'business_user'>;
  requireActiveBusiness?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles,
  requireActiveBusiness
}) => {
  const { user, profile, loading } = useAuth();
  const { businessId, loading: businessLoading } = useCurrentBusiness();

  console.log('🛡️ ProtectedRoute - Current state:', {
    hasUser: !!user,
    userEmail: user?.email,
    hasProfile: !!profile,
    profileRole: profile?.role,
    loading,
    allowedRoles,
    currentTime: new Date().toISOString(),
    businessId,
    businessLoading,
    requireActiveBusiness
  });

  if (loading || businessLoading) {
    console.log('⏳ ProtectedRoute - Still loading, showing spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">טוען...</p>
          <p className="mt-1 text-xs text-gray-400">בודק אימות המשתמש...</p>
        </div>
      </div>
    );
  }

  // If no user or profile, redirect to auth page
  if (!user || !profile) {
    console.log('🔐 ProtectedRoute - No user or profile, redirecting to /auth');
    return <Navigate to="/auth" replace />;
  }

  // Check role-based access if allowedRoles is provided
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRequiredRole = allowedRoles.includes(profile.role);
    if (!hasRequiredRole) {
      console.log('⚠️ ProtectedRoute - User does not have required role, redirecting to /not-authorized');
      return <Navigate to="/not-authorized" replace />;
    }
  }
  console.log('✅ ProtectedRoute - User authenticated and authorized, rendering children');
  return <>{children}</>;
};
