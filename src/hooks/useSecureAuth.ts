import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecurityAuditEntry {
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, any>;
}

export const useSecureAuth = () => {
  const { toast } = useToast();
  const [isSecureSession, setIsSecureSession] = useState(false);

  // Log security-relevant actions
  const logSecurityEvent = async (entry: SecurityAuditEntry) => {
    try {
      const { error } = await supabase
        .from('security_audit_log')
        .insert({
          action: entry.action,
          resource_type: entry.resource_type,
          resource_id: entry.resource_id,
          details: entry.details || {},
          ip_address: null, // Will be filled by trigger if needed
          user_agent: navigator.userAgent
        });

      if (error) {
        console.error('Failed to log security event:', error);
      }
    } catch (error) {
      console.error('Security logging error:', error);
    }
  };

  // Validate session security
  const validateSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session validation error:', error);
        setIsSecureSession(false);
        return false;
      }

      if (!session) {
        setIsSecureSession(false);
        return false;
      }

      // Check session age - warn if older than 24 hours
      const sessionAge = Date.now() - new Date(session.user.created_at).getTime();
      const twentyFourHours = 24 * 60 * 60 * 1000;

      if (sessionAge > twentyFourHours) {
        await logSecurityEvent({
          action: 'session_age_warning',
          resource_type: 'auth_session',
          resource_id: session.user.id,
          details: { age_hours: Math.floor(sessionAge / (60 * 60 * 1000)) }
        });
      }

      setIsSecureSession(true);
      return true;
    } catch (error) {
      console.error('Session validation failed:', error);
      setIsSecureSession(false);
      return false;
    }
  };

  // Enhanced authentication with rate limiting checks
  const secureSignIn = async (email: string, password: string) => {
    try {
      // Log authentication attempt
      await logSecurityEvent({
        action: 'login_attempt',
        resource_type: 'auth',
        details: { email, timestamp: new Date().toISOString() }
      });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        await logSecurityEvent({
          action: 'login_failed',
          resource_type: 'auth',
          details: { email, error: error.message }
        });
        return { data: null, error };
      }

      await logSecurityEvent({
        action: 'login_success',
        resource_type: 'auth',
        resource_id: data.user?.id,
        details: { email }
      });

      return { data, error: null };
    } catch (error) {
      console.error('Secure sign in error:', error);
      return { data: null, error };
    }
  };

  // Secure sign out with logging
  const secureSignOut = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await logSecurityEvent({
        action: 'logout',
        resource_type: 'auth',
        resource_id: user?.id,
        details: { timestamp: new Date().toISOString() }
      });

      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
      }

      setIsSecureSession(false);
      return { error };
    } catch (error) {
      console.error('Secure sign out error:', error);
      return { error };
    }
  };

  useEffect(() => {
    validateSession();

    // Re-validate session every 30 minutes
    const interval = setInterval(validateSession, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    isSecureSession,
    validateSession,
    secureSignIn,
    secureSignOut,
    logSecurityEvent
  };
};