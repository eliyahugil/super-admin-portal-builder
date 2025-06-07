
import { supabase } from '@/integrations/supabase/client';
import { Profile } from './types';

export const useAuthOperations = () => {
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      console.log('🔍 Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('❌ Profile fetch error:', error);
        console.error('❌ Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        
        // Check for network/connection errors
        if (error.message?.includes('fetch') || error.message?.includes('Failed to fetch')) {
          console.error('🌐 Network error detected while fetching profile');
          throw new Error('Network connection failed. Please check your internet connection.');
        }
        
        // If table doesn't exist or no record found
        if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
          console.warn('⚠️ טבלת profiles לא קיימת או לא נמצאה רשומה');
          return null;
        }
        
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
      console.error('💥 Exception details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      
      // Re-throw network errors with a user-friendly message
      if (error instanceof Error && error.message?.includes('fetch')) {
        throw new Error('שגיאת חיבור לשרת. אנא בדוק את החיבור לאינטרנט.');
      }
      
      return null;
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔑 Attempting to sign in with email:', email);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('❌ Sign in error:', error);
        console.error('❌ Sign in error details:', {
          message: error.message,
          status: error.status
        });
        
        // Check for network errors
        if (error.message?.includes('fetch') || error.message?.includes('Failed to fetch')) {
          return { error: new Error('שגיאת חיבור לשרת. אנא בדוק את החיבור לאינטרנט.') };
        }
      } else {
        console.log('✅ Sign in successful');
      }
      
      return { error };
    } catch (error) {
      console.error('💥 Exception in signIn:', error);
      return { error: new Error('שגיאה במערכת האימות') };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      console.log('📝 Attempting to sign up with email:', email, 'redirect:', redirectUrl);
      
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
      
      if (error) {
        console.error('❌ Sign up error:', error);
        
        // Check for network errors
        if (error.message?.includes('fetch') || error.message?.includes('Failed to fetch')) {
          return { error: new Error('שגיאת חיבור לשרת. אנא בדוק את החיבור לאינטרנט.') };
        }
      } else {
        console.log('✅ Sign up successful');
      }
      
      return { error };
    } catch (error) {
      console.error('💥 Exception in signUp:', error);
      return { error: new Error('שגיאה במערכת הרישום') };
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 Signing out');
      await supabase.auth.signOut();
    } catch (error) {
      console.error('💥 Exception in signOut:', error);
    }
  };

  return {
    fetchProfile,
    signIn,
    signUp,
    signOut,
  };
};
