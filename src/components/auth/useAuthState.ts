
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
  const fetchProfile = useCallback(async (userId: string): Promise<void> => {
    try {
      console.log('🔍 Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('❌ Profile fetch error:', error);
        
        // If profile doesn't exist, try to create one
        console.log('🔧 Profile not found, creating new profile...');
        try {
          const { data: userData } = await supabase.auth.getUser();
          if (userData.user) {
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
              // If creation fails, return a default profile
              setProfile({
                id: userId,
                email: userData.user.email || '',
                full_name: userData.user.email || '',
                role: 'business_user' as const
              });
              return;
            }
            
            console.log('✅ פרופיל חדש נוצר:', createdProfile);
            setProfile(createdProfile);
            return;
          }
        } catch (createError) {
          console.error('💥 Exception ביצירת פרופיל:', createError);
        }
        
        // Return a default profile if everything fails
        setProfile({
          id: userId,
          email: user?.email || '',
          full_name: user?.email || '',
          role: 'business_user' as const
        });
        return;
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
              // Return default profile if creation fails
              setProfile({
                id: userId,
                email: userData.user.email || '',
                full_name: userData.user.email || '',
                role: 'business_user' as const
              });
              return;
            }
            
            console.log('✅ פרופיל חדש נוצר:', createdProfile);
            setProfile(createdProfile);
            return;
          }
        } catch (createError) {
          console.error('💥 Exception ביצירת פרופיל:', createError);
        }
        
        // Return default profile
        setProfile({
          id: userId,
          email: user?.email || '',
          full_name: user?.email || '',
          role: 'business_user' as const
        });
        return;
      }

      console.log('✅ Profile fetched successfully:', data);
      setProfile(data);
    } catch (error) {
      console.error('💥 Exception in fetchProfile:', error);
      // Return default profile on any error
      setProfile({
        id: userId,
        email: user?.email || '',
        full_name: user?.email || '',
        role: 'business_user' as const
      });
    }
  }, [user?.email]);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      console.log('🔄 Refreshing profile for user:', user.id);
      await fetchProfile(user.id);
    }
  }, [user?.id, fetchProfile]);

  useEffect(() => {
    console.log('🚀 useAuthState - Starting auth setup');
    
    let isMounted = true;

    // Safety timeout reduced to 8 seconds
    const safetyTimeout = setTimeout(() => {
      if (isMounted && loading) {
        console.error('⚠️ Safety timeout - forcing loading to false');
        setLoading(false);
      }
    }, 8000);

    const setupAuth = async () => {
      try {
        console.log('🎧 Setting up auth state listener...');
        
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, newSession) => {
            console.log('🔄 Auth state changed:', event, {
              hasSession: !!newSession,
              userEmail: newSession?.user?.email || 'no session'
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
              // Use setTimeout to prevent blocking the auth state change
              setTimeout(async () => {
                if (isMounted) {
                  try {
                    await fetchProfile(newSession.user.id);
                    if (isMounted) {
                      setLoading(false);
                    }
                  } catch (profileError) {
                    console.error('❌ Error loading profile:', profileError);
                    if (isMounted) {
                      // Set default profile on error
                      setProfile({
                        id: newSession.user.id,
                        email: newSession.user.email || '',
                        full_name: newSession.user.email || '',
                        role: 'business_user' as const
                      });
                      setLoading(false);
                    }
                  }
                }
              }, 100);
            } else {
              console.log('🔴 No user in session');
              if (isMounted) {
                setProfile(null);
                setLoading(false);
              }
            }
          }
        );

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
          userEmail: initialSession?.user?.email || 'no user'
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
            await fetchProfile(initialSession.user.id);
            if (isMounted) {
              console.log('✅ Initial profile loaded');
            }
          } catch (profileError) {
            console.error('❌ Error fetching initial profile:', profileError);
            if (isMounted) {
              // Set default profile on error
              setProfile({
                id: initialSession.user.id,
                email: initialSession.user.email || '',
                full_name: initialSession.user.email || '',
                role: 'business_user' as const
              });
            }
          }
        } else {
          console.log('🔴 No initial user');
          if (isMounted) {
            setProfile(null);
          }
        }
        
        // Always stop loading after initial setup
        if (isMounted) {
          console.log('✅ Initial auth setup complete');
          setLoading(false);
        }

        return () => {
          subscription.unsubscribe();
        };
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
    const cleanup = setupAuth();

    return () => {
      console.log('🧹 Cleaning up useAuthState');
      isMounted = false;
      clearTimeout(safetyTimeout);
      cleanup?.then(unsubscribe => unsubscribe?.());
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
