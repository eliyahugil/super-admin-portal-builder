import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSignupFlow = () => {
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [needsEmailVerification, setNeedsEmailVerification] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const { toast } = useToast();

  const signUpWithBetterFlow = async (email: string, password: string, fullName: string, phone: string) => {
    setIsSigningUp(true);
    try {
      // Set better redirect URL to avoid DNS issues
      const redirectUrl = `${window.location.origin}/auth?verified=true`;
      
      console.log('🔄 Starting signup with improved flow:', { email, redirectUrl });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
          },
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        console.error('❌ Signup error:', error);
        throw error;
      }

      console.log('✅ Signup successful, user needs email verification:', data);
      
      // Save email for verification help
      setSignupEmail(email);
      setNeedsEmailVerification(true);
      
      toast({
        title: '✅ הרשמה בוצעה בהצלחה',
        description: 'מייל אישור נשלח אליך. אנא בדוק את תיבת המייל שלך.',
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('💥 Signup failed:', error);
      
      let errorMessage = error.message;
      if (error.message?.includes('User already registered')) {
        errorMessage = 'משתמש עם מייל זה כבר קיים במערכת. נסה להתחבר.';
      }
      
      toast({
        title: 'שגיאה בהרשמה',
        description: errorMessage,
        variant: 'destructive',
      });
      
      return { data: null, error };
    } finally {
      setIsSigningUp(false);
    }
  };

  const resendVerificationEmail = async () => {
    if (!signupEmail) return;
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: signupEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth?verified=true`,
        },
      });

      if (error) throw error;

      toast({
        title: 'מייל נשלח מחדש',
        description: 'מייל אישור חדש נשלח אליך',
      });
    } catch (error: any) {
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לשלוח מייל אישור. נסה שוב מאוחר יותר.',
        variant: 'destructive',
      });
    }
  };

  return {
    isSigningUp,
    needsEmailVerification,
    signupEmail,
    signUpWithBetterFlow,
    resendVerificationEmail,
    setNeedsEmailVerification,
  };
};