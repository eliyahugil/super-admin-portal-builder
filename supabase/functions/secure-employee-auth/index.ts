import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AuthRequest {
  phone: string;
  password: string;
  businessId: string;
  userAgent?: string;
  timestamp: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { phone, password, businessId, userAgent, timestamp }: AuthRequest = await req.json();

    console.log('🔐 Secure employee auth attempt:', { phone, businessId, timestamp });

    // Validate input
    if (!phone || !password || !businessId) {
      return new Response(
        JSON.stringify({ success: false, message: 'חסרים פרטים נדרשים' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Find employee by phone and business
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('*')
      .eq('phone', phone)
      .eq('business_id', businessId)
      .eq('is_active', true)
      .maybeSingle();

    if (employeeError || !employee) {
      console.log('❌ Employee not found:', { phone, businessId });
      
      // Log failed attempt
      await supabase.from('security_audit_log').insert({
        action: 'employee_login_failed',
        resource_type: 'employee_auth',
        details: { 
          phone, 
          businessId, 
          reason: 'employee_not_found',
          userAgent,
          timestamp 
        }
      });

      return new Response(
        JSON.stringify({ success: false, message: 'פרטי התחברות לא נכונים' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Enhanced password validation
    let isValidPassword = false;
    
    // Check if using default password (insecure)
    if (password === '123456') {
      console.log('⚠️ Employee using default password');
      isValidPassword = true;
      
      // Log security concern
      await supabase.from('security_audit_log').insert({
        action: 'weak_password_used',
        resource_type: 'employee_auth',
        resource_id: employee.id,
        details: { 
          phone, 
          businessId,
          security_issue: 'default_password_used',
          userAgent,
          timestamp 
        }
      });
    } else if (employee.birth_date) {
      // Check birth date password format
      const birthPassword = employee.birth_date.replace(/-/g, '');
      if (password === birthPassword || password === birthPassword.slice(-6)) {
        isValidPassword = true;
      }
    }

    if (!isValidPassword) {
      console.log('❌ Invalid password for employee:', employee.id);
      
      await supabase.from('security_audit_log').insert({
        action: 'employee_login_failed',
        resource_type: 'employee_auth',
        resource_id: employee.id,
        details: { 
          phone, 
          businessId, 
          reason: 'invalid_password',
          userAgent,
          timestamp 
        }
      });

      return new Response(
        JSON.stringify({ success: false, message: 'פרטי התחברות לא נכונים' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Generate secure session token
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + (8 * 60 * 60 * 1000)); // 8 hours

    // Create employee session
    const { error: sessionError } = await supabase
      .from('employee_auth_sessions')
      .insert({
        employee_id: employee.id,
        business_id: businessId,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: userAgent || 'unknown'
      });

    if (sessionError) {
      console.error('❌ Failed to create session:', sessionError);
      return new Response(
        JSON.stringify({ success: false, message: 'שגיאה ביצירת סשן' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Log successful authentication
    await supabase.from('security_audit_log').insert({
      action: 'employee_login_success',
      resource_type: 'employee_auth',
      resource_id: employee.id,
      details: { 
        phone, 
        businessId,
        sessionToken: sessionToken.slice(0, 8) + '...',
        userAgent,
        timestamp 
      }
    });

    console.log('✅ Employee authenticated successfully:', employee.id);

    // Check if this is a high-risk login (requires additional security)
    const requiresSecurityCode = password === '123456' || !employee.email;

    return new Response(
      JSON.stringify({ 
        success: true, 
        employee: {
          id: employee.id,
          first_name: employee.first_name,
          last_name: employee.last_name,
          email: employee.email,
          phone: employee.phone,
          business_id: employee.business_id
        },
        sessionToken,
        expiresAt: expiresAt.toISOString(),
        requiresSecurityCode
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('💥 Secure employee auth error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'שגיאת מערכת' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});