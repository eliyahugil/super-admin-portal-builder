
import React, { createContext, useContext } from 'react';
import { AuthContextType, AuthProviderProps } from './types';
import { useAuthState } from './useAuthState';
import { useAuthOperations } from './useAuthOperations';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  try {
    const context = useContext(AuthContext);
    if (!context) {
      console.error('❌ useAuth called outside of AuthProvider');
      throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
  } catch (error) {
    console.error('❌ Failed to get auth context:', error);
    // Return a safe fallback to prevent app crash
    return {
      user: null,
      session: null,
      profile: null,
      loading: false,
      signIn: async () => ({ error: new Error('Auth context not available') }),
      signUp: async () => ({ error: new Error('Auth context not available') }),
      signOut: async () => {},
      isSuperAdmin: false,
      refreshProfile: async () => {},
    };
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  try {
    const { user, session, profile, loading, refreshProfile } = useAuthState();
    const { signIn, signUp, signOut } = useAuthOperations();

    const isSuperAdmin = profile?.role === 'super_admin';

    const value: AuthContextType = {
      user,
      session,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      isSuperAdmin,
      refreshProfile,
    };

    return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
    );
  } catch (error) {
    console.error('❌ Error in AuthProvider:', error);
    // Return children without provider to prevent complete crash
    return <>{children}</>;
  }
};
