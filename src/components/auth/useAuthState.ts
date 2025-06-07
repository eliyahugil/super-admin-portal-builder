
import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from './types';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Stable fetchProfile function that doesn't change on re-renders
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      console.log('🔍 Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('❌ Profile fetch error:', error);
        return null;
      }

      if (!data) {
        console.warn('⚠️ לא נמצא פרופיל למשתמש:', userId);
        
        // Try to create a new profile automatically
        try {
          const { data: userData } = await supabase.auth.getUser();
          if (userData.user) {
            console.log('🔧 מנסה ליצור פרופיל חדש...');
            
            const newProfile = {
              id: userId,
              email: userData.user.email || '',
              full_name: userData.user.user_metadata?.full_name || userData.user.email || '',
              role: 'business_user' as const
            };
            
            const { data: createdProfile, error: createError } = await supabase
              .from('profiles')
              .insert([newProfile])
              .select()
              .single();
              
            if (createError) {
              console.error('❌ שגיאה ביצירת פרופיל:', createError);
              return null;
            }
            
            console.log('✅ פרופיל חדש נוצר:', createdProfile);
            return createdProfile;
          }
        } catch (createError) {
          console.error('💥 Exception ביצירת פרופיל:', createError);
        }
        
        return null;
      }

      console.log('✅ Profile fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('💥 Exception in fetchProfile:', error);
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      console.log('🔄 Refreshing profile for user:', user.id);
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  }, [user?.id, fetchProfile]);

  useEffect(() => {
    console.log('🚀 useAuthState - Starting auth setup');
    
    let isMounted = true;
    let authSubscription: any = null;
    let isInitialized = false;

    // Safety timeout - if still loading after 15 seconds, force completion
    const safetyTimeout = setTimeout(() => {
      if (isMounted && loading) {
        console.error('⚠️ Safety timeout - forcing loading to false');
        setLoading(false);
      }
    }, 15000);

    const setupAuth = async () => {
      try {
        // Set up auth listener first
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
              console.log('👤 User detected, fetching profile...');
              try {
                const profileData = await fetchProfile(newSession.user.id);
                if (isMounted) {
                  console.log('✅ Profile loaded:', profileData);
                  setProfile(profileData);
                }
              } catch (profileError) {
                console.error('❌ Error loading profile:', profileError);
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
            
            // Set loading to false after handling auth change
            if (isMounted && !isInitialized) {
              console.log('✅ Auth initialization complete');
              setLoading(false);
              isInitialized = true;
            }
          }
        );
        
        authSubscription = subscription;
        console.log('✅ Auth listener set up successfully');

        // Get initial session
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
          console.log('👤 Initial user found, fetching profile...');
          try {
            const profileData = await fetchProfile(initialSession.user.id);
            if (isMounted) {
              console.log('✅ Initial profile loaded:', profileData);
              setProfile(profileData);
            }
          } catch (profileError) {
            console.error('❌ Error fetching initial profile:', profileError);
            if (isMounted) {
              setProfile(null);
            }
          }
        } else {
          console.log('🔴 No initial user');
          if (isMounted) {
            setProfile(null);
          }
        }
        
        // Mark as initialized and stop loading
        if (isMounted) {
          console.log('✅ Initial auth setup complete');
          setLoading(false);
          isInitialized = true;
        }
      } catch (error) {
        console.error('💥 Exception in setupAuth:', error);
        if (isMounted) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    };

    // Start the auth setup
    setupAuth();

    return () => {
      console.log('🧹 Cleaning up useAuthState');
      isMounted = false;
      clearTimeout(safetyTimeout);
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []); // Empty dependency array to prevent unnecessary re-runs

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
