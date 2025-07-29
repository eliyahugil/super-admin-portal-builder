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

    // Create employee directly in the business
    const { data: employeeData, error: employeeError } = await supabase
      .from('employees')
      .insert({
        business_id: tokenData.business_id,
        first_name: registrationData.first_name,
        last_name: registrationData.last_name,
        id_number: registrationData.id_number,
        email: registrationData.email,
        phone: registrationData.phone,
        birth_date: registrationData.birth_date,
        address: registrationData.address,
        employee_type: 'permanent',
        is_active: true,
        hire_date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (employeeError) {
      console.error('❌ Employee creation error:', employeeError);
      return new Response(
        JSON.stringify({ error: 'שגיאה ביצירת העובד' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    console.log('✅ Employee created:', employeeData);

    // Insert registration request for tracking
    const { data, error } = await supabase
      .from('employee_registration_requests')
      .insert({
        ...registrationData,
        status: 'approved',
        employee_id: employeeData.id,
        approved_at: new Date().toISOString(),
        approved_by: null
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Registration request insertion error:', error);
      // Don't fail here since employee was already created
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