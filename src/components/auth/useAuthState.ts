
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
  
  const { fetchProfile } = useAuthOperations();

  const refreshProfile = async () => {
    if (user?.id) {
      console.log('🔄 Refreshing profile for user:', user.id);
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    console.log('🚀 useAuthState - Starting auth setup');
    
    let isMounted = true;
    let authSubscription: any = null;
    let isInitialized = false;

    // Safety timeout - if still loading after 10 seconds, force completion
    const safetyTimeout = setTimeout(() => {
      if (isMounted && loading) {
        console.error('⚠️ Safety timeout - forcing loading to false');
        setLoading(false);
      }
    }, 10000);

    const initializeAuth = async () => {
      try {
        console.log('⏳ Getting initial session...');
        
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('💥 Error getting initial session:', error);
          if (isMounted) {
            setSession(null);
            setUser(null);
            setProfile(null);
            setLoading(false);
          }
          return;
        }

        console.log('🔍 Initial session check:', {
          hasSession: !!initialSession,
          userEmail: initialSession?.user?.email || 'no user',
          userId: initialSession?.user?.id || 'no id'
        });
        
        if (!isMounted) {
          console.log('❌ Component unmounted during session check');
          return;
        }

        // Update state with initial session
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        if (initialSession?.user) {
          console.log('👤 User found, fetching profile...');
          try {
            const profileData = await fetchProfile(initialSession.user.id);
            if (isMounted) {
              console.log('✅ Profile loaded:', profileData);
              setProfile(profileData);
            }
          } catch (profileError) {
            console.error('❌ Error fetching profile:', profileError);
            if (isMounted) {
              setProfile(null);
            }
          }
        } else {
          console.log('🔴 No user in session');
          if (isMounted) {
            setProfile(null);
          }
        }
        
        console.log('✅ Initial auth setup complete, setting loading to false');
        if (isMounted) {
          setLoading(false);
          isInitialized = true;
        }
      } catch (error) {
        console.error('💥 Exception in initializeAuth:', error);
        if (isMounted) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    };

    const setupAuthListener = () => {
      try {
        console.log('🎧 Setting up auth state listener...');
        
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            console.log('🔄 Auth state changed:', event, {
              hasSession: !!newSession,
              userEmail: newSession?.user?.email || 'no session',
              isMounted,
              isInitialized
            });
            
            if (!isMounted) {
              console.log('❌ Component unmounted, ignoring auth change');
              return;
            }
            
            // Update session and user immediately
            setSession(newSession);
            setUser(newSession?.user ?? null);
            
            if (newSession?.user) {
              console.log('👤 New user detected, fetching profile...');
              try {
                const profileData = await fetchProfile(newSession.user.id);
                if (isMounted) {
                  console.log('✅ Profile updated:', profileData);
                  setProfile(profileData);
                }
              } catch (profileError) {
                console.error('❌ Error updating profile:', profileError);
                if (isMounted) {
                  setProfile(null);
                }
              }
            } else {
              console.log('🔴 User signed out');
              if (isMounted) {
                setProfile(null);
              }
            }
            
            // Only set loading to false if we haven't initialized yet
            if (!isInitialized && isMounted) {
              console.log('✅ Auth listener setting loading to false');
              setLoading(false);
              isInitialized = true;
            }
          }
        );
        
        authSubscription = subscription;
        console.log('✅ Auth listener set up successfully');
      } catch (error) {
        console.error('💥 Error setting up auth listener:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Set up listener first
    setupAuthListener();
    
    // Then initialize
    initializeAuth();

    return () => {
      console.log('🧹 Cleaning up useAuthState');
      isMounted = false;
      clearTimeout(safetyTimeout);
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [fetchProfile]);

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
