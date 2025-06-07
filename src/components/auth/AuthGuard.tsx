
import React from 'react';
import { useAuth } from './AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, fallback }) => {
  try {
    const authContext = useAuth();
    
    if (!authContext) {
      console.error('AuthGuard: Auth context is null');
      return fallback || <div>Auth context not available</div>;
    }

    return <>{children}</>;
  } catch (error) {
    console.error('AuthGuard: Error accessing auth context:', error);
    return fallback || <div>Authentication error</div>;
  }
};
