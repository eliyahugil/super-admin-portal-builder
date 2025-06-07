
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'super_admin' | 'business_admin' | 'business_user';
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isSuperAdmin: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string, retryCount = 0): Promise<Profile | null> => {
    try {
      console.log('🔍 Starting fetchProfile for user ID:', userId, 'retry:', retryCount);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      console.log('📊 Profile query result:', { data, error, retryCount });

      if (error) {
        console.error('❌ Error fetching profile:', error);
        
        // If profile doesn't exist and we haven't retried too many times, wait and retry
        if (error.code === 'PGRST116' && retryCount < 3) {
          console.log('⏰ Profile not found, retrying in 1 second...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          return fetchProfile(userId, retryCount + 1);
        }
        
        // If it's a different error or we've retried enough, return null
        console.error('❌ Profile fetch failed permanently:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return null;
      }

      if (data) {
        console.log('✅ Profile fetched successfully:', data);
        return data;
      } else {
        console.log('⚠️ No profile data returned from query');
        return null;
      }
    } catch (error) {
      console.error('💥 Exception in fetchProfile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      console.log('🔄 Refreshing profile for user:', user.id);
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    console.log('🚀 Setting up auth state listener');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email || 'no session');
        console.log('📱 Event details:', event);
        console.log('🆔 Session user ID:', session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('👥 User logged in, fetching profile for:', session.user.id);
          console.log('📧 User email:', session.user.email);
          console.log('🕐 User created at:', session.user.created_at);
          
          // Clear any existing profile first
          console.log('🧹 Clearing existing profile before fetch');
          setProfile(null);
          
          // Fetch profile with retry logic
          const profileData = await fetchProfile(session.user.id);
          console.log('📋 Setting profile data:', profileData);
          setProfile(profileData);
        } else {
          console.log('🚪 No user session, clearing profile');
          setProfile(null);
        }
        
        console.log('⏳ Setting loading to false');
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('🔍 Initial session check:', session?.user?.email || 'no session');
      console.log('📋 Initial session details:', {
        hasSession: !!session,
        userId: session?.user?.id,
        userEmail: session?.user?.email
      });
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('🎯 Found existing session, fetching profile for user:', session.user.email);
        const profileData = await fetchProfile(session.user.id);
        console.log('📋 Initial profile fetch result:', profileData);
        setProfile(profileData);
      } else {
        console.log('❌ No existing session found');
      }
      setLoading(false);
    });

    return () => {
      console.log('🧹 Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  // Debug effect to track profile changes
  useEffect(() => {
    console.log('📊 Profile state changed:', profile);
    console.log('🔐 Is super admin:', profile?.role === 'super_admin');
    console.log('👤 Profile details:', {
      hasProfile: !!profile,
      profileId: profile?.id,
      profileEmail: profile?.email,
      profileRole: profile?.role,
      profileName: profile?.full_name
    });
  }, [profile]);

  // Debug effect to track loading state
  useEffect(() => {
    console.log('⏳ Loading state changed:', loading);
  }, [loading]);

  // Debug effect to track user changes
  useEffect(() => {
    console.log('👥 User state changed:', user?.email || 'no user');
  }, [user]);

  const signIn = async (email: string, password: string) => {
    console.log('🔑 Attempting to sign in with email:', email);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('❌ Sign in error:', error);
    } else {
      console.log('✅ Sign in successful');
    }
    
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        }
      }
    });
    return { error };
  };

  const signOut = async () => {
    console.log('🚪 Signing out');
    await supabase.auth.signOut();
  };

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
};
