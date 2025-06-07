
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user, profile, loading } = useAuth();

  console.log('ProtectedRoute - Current state:', {
    hasUser: !!user,
    hasProfile: !!profile,
    profileRole: profile?.role,
    loading,
    allowedRoles
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">טוען...</p>
        </div>
      </div>
    );
  }

  // If no user or profile, redirect to auth page
  if (!user || !profile) {
    console.log('ProtectedRoute - No user or profile, redirecting to /auth');
    return <Navigate to="/auth" replace />;
  }

  // Check role-based access if allowedRoles is provided
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRequiredRole = allowedRoles.includes(profile.role);
    if (!hasRequiredRole) {
      console.log('ProtectedRoute - User does not have required role, redirecting to /not-authorized');
      return <Navigate to="/not-authorized" replace />;
    }
  }

  console.log('ProtectedRoute - User authenticated and authorized, rendering children');
  return <>{children}</>;
};
