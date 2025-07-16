
import { supabase } from '@/integrations/supabase/client';

export const useAuthOperations = () => {
  const signIn = async (email: string, password: string) => {
    console.log('🔐 Attempting sign in for:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log('🔐 Sign in result:', { 
      user: data?.user?.email, 
      error: error?.message 
    });

    return { data, error };
  };

  const signUp = async (email: string, password: string, fullName?: string, phone?: string) => {
    console.log('📝 Attempting sign up for:', email, 'with name:', fullName, 'and phone:', phone);
    
    const metadata: Record<string, any> = {};
    if (fullName) {
      metadata.full_name = fullName;
    }
    if (phone) {
      metadata.phone = phone;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `https://xmhmztipuvzmwgbcovch.supabase.co/`,
        data: metadata
      }
    });

    console.log('📝 Sign up result:', { 
      user: data?.user?.email, 
      error: error?.message 
    });

    return { data, error };
  };

  const signOut = async () => {
    console.log('🚪 Attempting sign out');
    
    const { error } = await supabase.auth.signOut();
    
    console.log('🚪 Sign out result:', { error: error?.message });
    
    return { error };
  };

  return {
    signIn,
    signUp,
    signOut,
  };
};
