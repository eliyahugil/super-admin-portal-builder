
import React from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { AuthForm } from '@/components/auth/AuthForm';

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

  // If no user or profile, show auth form
  if (!user || !profile) {
    console.log('ProtectedRoute - No user or profile, showing auth form');
    return <AuthForm />;
  }

  console.log('ProtectedRoute - User authenticated, rendering children');
  return <>{children}</>;
};
