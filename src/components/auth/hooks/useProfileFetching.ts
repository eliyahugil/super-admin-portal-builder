
import { useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '../types';

export const useProfileFetching = (user: User | null) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  
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
        throw error;
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
              role: 'business_user' as const,
              business_id: null // New users start without business assignment
            };
            
            const { data: createdProfile, error: createError } = await supabase
              .from('profiles')
              .insert([newProfile])
              .select()
              .single();
              
            if (createError) {
              console.error('❌ שגיאה ביצירת פרופיל:', createError);
              throw createError;
            }
            
            console.log('✅ פרופיל חדש נוצר:', createdProfile);
            setProfile(createdProfile);
            return;
          }
        } catch (createError) {
          console.error('💥 Exception ביצירת פרופיל:', createError);
          throw createError;
        }
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
        role: 'business_user' as const,
        business_id: null
      });
    }
  }, [user?.email]);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      console.log('🔄 Refreshing profile for user:', user.id);
      await fetchProfile(user.id);
    }
  }, [user?.id, fetchProfile]);

  return {
    profile,
    setProfile,
    fetchProfile,
    refreshProfile
  };
};
