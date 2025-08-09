
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAuthOperations = () => {
  const { toast } = useToast();

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

    if (error) {
      toast({ title: 'שגיאת התחברות', description: error.message, variant: 'destructive' });
    } else if (data?.user) {
      toast({ title: 'ברוך הבא', description: 'התחברת בהצלחה' });
    }

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
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: metadata
      }
    });

    console.log('📝 Sign up result:', { 
      user: data?.user?.email, 
      error: error?.message 
    });

    if (error) {
      toast({ title: 'שגיאת הרשמה', description: error.message, variant: 'destructive' });
    } else if (data?.user) {
      toast({ title: 'נרשמת בהצלחה', description: 'נשלח אליך אימייל לאימות' });
    }

    return { data, error };
  };

  const signOut = async () => {
    console.log('🚪 Attempting sign out');
    
    const { error } = await supabase.auth.signOut();
    
    console.log('🚪 Sign out result:', { error: error?.message });

    if (error) {
      toast({ title: 'שגיאה ביציאה', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'התנתקת', description: 'נראה אותך שוב בקרוב' });
    }
    
    return { error };
  };

  return {
    signIn,
    signUp,
    signOut,
  };
};
