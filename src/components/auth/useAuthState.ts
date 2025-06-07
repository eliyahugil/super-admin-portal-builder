
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from './types';
import { useAuthOperations } from './useAuthOperations';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);
  
  const { fetchProfile } = useAuthOperations();

  const refreshProfile = async () => {
    if (user?.id) {
      console.log('🔄 Refreshing profile for user:', user.id);
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    if (!initializing) return; // Prevent multiple initializations
    
    console.log('🚀 Setting up auth state listener');
    
    let mounted = true;
    let authSubscription: any = null;

    // Safety timeout - if still loading after 10 seconds, stop
    const safetyTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.error('⚠️ Safety timeout reached - stopping loading state');
        setLoading(false);
      }
    }, 10000);

    // Get initial session with better error handling
    const getInitialSession = async () => {
      try {
        console.log('⏳ מתחיל לבדוק סשן');
        
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('💥 שגיאה בקבלת הסשן:', error);
          
          if (mounted) {
            setSession(null);
            setUser(null);
            setProfile(null);
            setLoading(false);
          }
          return;
        }

        console.log('🔍 Initial session result:', {
          hasSession: !!initialSession,
          userEmail: initialSession?.user?.email || 'no user',
        });
        
        if (!mounted) return;

        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        if (initialSession?.user) {
          console.log('👤 יש משתמש, שולף פרופיל...');
          try {
            const profileData = await fetchProfile(initialSession.user.id);
            if (mounted) {
              console.log('✅ פרופיל נטען בהצלחה:', profileData);
              setProfile(profileData);
            }
          } catch (profileError) {
            console.error('❌ שגיאה בשליפת פרופיל:', profileError);
            if (mounted) {
              setProfile(null);
            }
          }
        } else {
          console.log('🔴 אין משתמש מחובר');
          if (mounted) {
            setProfile(null);
          }
        }
        
        if (mounted) {
          console.log('✅ סיים טעינה ראשונית');
          setLoading(false);
        }
      } catch (error) {
        console.error('💥 Exception in getInitialSession:', error);
        
        if (mounted) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      } finally {
        clearTimeout(safetyTimeout);
      }
    };

    // Set up auth state listener with error handling
    const setupAuthListener = () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          console.log('🔄 Auth state changed:', event, {
            hasSession: !!newSession,
            userEmail: newSession?.user?.email || 'no session'
          });
          
          if (!mounted) return;
          
          try {
            // Update state immediately
            setSession(newSession);
            setUser(newSession?.user ?? null);
            
            if (newSession?.user) {
              console.log('👤 משתמש חדש, שולף פרופיל...');
              try {
                const profileData = await fetchProfile(newSession.user.id);
                if (mounted) {
                  console.log('✅ פרופיל עודכן:', profileData);
                  setProfile(profileData);
                }
              } catch (profileError) {
                console.error('❌ שגיאה בעדכון פרופיל:', profileError);
                if (mounted) {
                  setProfile(null);
                }
              }
            } else {
              console.log('🔴 משתמש התנתק');
              if (mounted) {
                setProfile(null);
              }
            }
          } catch (error) {
            console.error('💥 Error in auth state change handler:', error);
          }
        }
      );
      
      authSubscription = subscription;
    };

    setupAuthListener();
    getInitialSession();
    setInitializing(false);

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      console.log('🧹 Cleaning up auth subscription');
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [fetchProfile, initializing]);

  // Log state changes for debugging
  useEffect(() => {
    console.log('📊 Auth state update:', {
      hasUser: !!user,
      userEmail: user?.email,
      hasProfile: !!profile,
      profileRole: profile?.role,
      loading,
      timestamp: new Date().toISOString()
    });
  }, [user, profile, loading]);

  return {
    user,
    session,
    profile,
    loading,
    refreshProfile,
  };
};
