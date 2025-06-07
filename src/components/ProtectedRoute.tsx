
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, profile, loading } = useAuth();

  console.log('ProtectedRoute - Current state:', {
    hasUser: !!user,
    hasProfile: !!profile,
    profileRole: profile?.role,
    loading
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

  console.log('ProtectedRoute - User authenticated, rendering children');
  return <>{children}</>;
};
