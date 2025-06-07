
import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useSessionManagement = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const handleAuthStateChange = useCallback((event: string, newSession: Session | null) => {
    console.log('🔄 Auth state changed:', event, {
      hasSession: !!newSession,
      userEmail: newSession?.user?.email || 'no session'
    });

    // Handle specific auth events for better debugging
    if (event === 'TOKEN_REFRESHED') {
      console.log('✅ Token refreshed successfully');
    } else if (event === 'SIGNED_OUT') {
      console.log('👋 User signed out');
      // Clear all state on sign out
      setSession(null);
      setUser(null);
      setLoading(false);
      return;
    } else if (event === 'SIGNED_IN') {
      console.log('👤 User signed in');
    }
    
    // Update session and user immediately
    setSession(newSession);
    setUser(newSession?.user ?? null);
  }, []);

  const getInitialSession = useCallback(async () => {
    try {
      console.log('⏳ Getting initial session...');
      const { data: { session: initialSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('💥 Error getting initial session:', error);
        if (error.message.includes('refresh_token_not_found') || error.message.includes('Invalid Refresh Token')) {
          console.warn('🔄 Refresh token not found - user needs to re-authenticate');
          // Clear any stale auth state
          await supabase.auth.signOut();
        }
        setSession(null);
        setUser(null);
        return null;
      }

      console.log('🔍 Initial session check:', {
        hasSession: !!initialSession,
        userEmail: initialSession?.user?.email || 'no user'
      });
      
      // Update state with initial session
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      
      return initialSession;
    } catch (error) {
      console.error('💥 Exception getting initial session:', error);
      setSession(null);
      setUser(null);
      return null;
    }
  }, []);

  return {
    user,
    session,
    loading,
    setLoading,
    handleAuthStateChange,
    getInitialSession
  };
};
