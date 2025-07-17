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
    console.log('🚀 Function started');
    console.log(`🔍 Headers: ${JSON.stringify(Object.fromEntries(req.headers.entries()), null, 2)}`);
    
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    console.log('🔑 Supabase URL:', supabaseUrl ? 'Set' : 'Missing');
    console.log('🔑 Service role key:', supabaseServiceRoleKey ? 'Set' : 'Missing');

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const requestBody = await req.json();
    console.log(`📦 Request body: ${JSON.stringify(requestBody, null, 2)}`);

    const { token, choices } = requestBody;

    if (!token || !choices || !Array.isArray(choices)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: token and choices array' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`🔍 Validating token: ${token}`);

    // Validate token and get employee info
    const { data: tokenData, error: tokenError } = await supabase
      .from('employee_shift_preferences')
      .select(`
        id,
        employee_id,
        submission_deadline,
        employees!inner(
          id,
          first_name,
          last_name,
          business_id,
          shift_submission_quota
        )
      `)
      .eq('submission_token', token)
      .single();

    if (tokenError || !tokenData) {
      console.log('❌ Token validation error:', tokenError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid or expired token' 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`✅ Token validated for employee: ${tokenData.employee_id}`);

    // Check submission deadline
    if (tokenData.submission_deadline && new Date() > new Date(tokenData.submission_deadline)) {
      console.log('❌ Submission deadline passed');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Submission deadline has passed' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if employee has already exceeded their quota
    const { data: existingChoices, error: existingError } = await supabase
      .from('employee_shift_choices')
      .select('id')
      .eq('employee_id', tokenData.employee_id);

    if (existingError) {
      console.log('❌ Error checking existing choices:', existingError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Error checking existing choices' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const currentChoicesCount = existingChoices?.length || 0;
    const newChoicesCount = choices.length;
    const quota = tokenData.employees.shift_submission_quota || 3;

    if (currentChoicesCount + newChoicesCount > quota) {
      console.log(`❌ Quota exceeded: current ${currentChoicesCount} + new ${newChoicesCount} > quota ${quota}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Cannot exceed quota of ${quota} shift choices. You currently have ${currentChoicesCount} choices.` 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`📊 Quota check passed: ${currentChoicesCount + newChoicesCount}/${quota}`);

    // Prepare shift choices for insertion
    const shiftChoicesToInsert = choices.map((choice: any) => ({
      employee_id: tokenData.employee_id,
      available_shift_id: choice.shiftId,
      week_start_date: choice.weekStartDate,
      choice_type: choice.choiceType || 'regular',
      preference_level: choice.preferenceLevel || 1,
      notes: choice.notes || null,
    }));

    console.log(`💾 Inserting ${shiftChoicesToInsert.length} shift choices`);

    // Insert shift choices
    const { data: insertedChoices, error: insertError } = await supabase
      .from('employee_shift_choices')
      .insert(shiftChoicesToInsert)
      .select();

    if (insertError) {
      console.log('❌ Error inserting choices:', insertError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to submit shift choices' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`✅ Successfully inserted ${insertedChoices?.length || 0} shift choices`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Shift choices submitted successfully',
        choicesCount: insertedChoices?.length || 0
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Function error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});