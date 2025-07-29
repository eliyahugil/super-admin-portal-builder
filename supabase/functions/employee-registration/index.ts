import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { registrationData } = await req.json();

    console.log('📥 Received registration data:', registrationData);

    // Create Supabase client with service role key for bypassing RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Validate token first
    const { data: tokenData, error: tokenError } = await supabase
      .from('employee_registration_tokens')
      .select('*')
      .eq('id', registrationData.token_id)
      .eq('is_active', true)
      .single();

    if (tokenError || !tokenData) {
      console.error('❌ Token validation failed:', tokenError);
      return new Response(
        JSON.stringify({ error: 'טוקן לא תקין או לא פעיל' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    console.log('✅ Token validated:', tokenData);

    // Insert registration request
    const { data, error } = await supabase
      .from('employee_registration_requests')
      .insert(registrationData)
      .select()
      .single();

    if (error) {
      console.error('❌ Database insertion error:', error);
      return new Response(
        JSON.stringify({ error: 'שגיאה ביצירת בקשת הרישום' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    console.log('✅ Registration request created:', data);

    return new Response(
      JSON.stringify({ success: true, data }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('💥 Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'שגיאה בלתי צפויה' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
})