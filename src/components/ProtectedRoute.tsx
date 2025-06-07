
import React from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { AuthForm } from '@/components/auth/AuthForm';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, profile, loading } = useAuth();

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

  // אם אין יוזר או אין פרופיל עדיין - תציג טופס התחברות
  if (!user || !profile) {
    return <AuthForm />;
  }

  return <>{children}</>;
};
