
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSessionManagement } from './hooks/useSessionManagement';
import { useProfileFetching } from './hooks/useProfileFetching';

export const useAuthState = () => {
  const {
    user,
    session,
    loading,
    setLoading,
    handleAuthStateChange,
    getInitialSession
  } = useSessionManagement();

  const {
    profile,
    setProfile,
    fetchProfile,
    refreshProfile
  } = useProfileFetching(user);

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
          async (event, newSession) => {
            if (!isMounted) {
              console.log('❌ Component unmounted, ignoring auth change');
              return;
            }

            handleAuthStateChange(event, newSession);
            
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
                        role: 'business_user' as const,
                        business_id: null
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

        // Get initial session with improved error handling
        const initialSession = await getInitialSession();
        
        if (!isMounted) {
          console.log('❌ Component unmounted during session check');
          return;
        }
        
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
                role: 'business_user' as const,
                business_id: null
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
      businessId: profile?.business_id,
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
