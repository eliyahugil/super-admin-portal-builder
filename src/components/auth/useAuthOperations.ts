
import { supabase } from '@/integrations/supabase/client';
import { Profile } from './types';

export const useAuthOperations = () => {
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      console.log('🔍 Fetching profile for user:', userId);
      
      // בדיקה אם הטבלה profiles קיימת
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // שימוש ב-maybeSingle במקום single כדי למנוע שגיאות

      if (error) {
        console.error('❌ Profile fetch error:', error);
        
        // אם הטבלה לא קיימת, ננסה ליצור פרופיל חדש
        if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
          console.warn('⚠️ טבלת profiles לא קיימת או לא נמצאה רשומה');
          return null;
        }
        
        return null;
      }

      if (!data) {
        console.warn('⚠️ לא נמצא פרופיל למשתמש:', userId);
        
        // ננסה ליצור פרופיל חדש אוטומטית
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
  };

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

  return {
    fetchProfile,
    signIn,
    signUp,
    signOut,
  };
};
