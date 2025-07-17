import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ShiftChoice {
  shiftId: string;
  weekStartDate: string;
  choiceType: 'regular' | 'unassigned_request';
  preferenceLevel: number;
  notes?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Submit shift choices function started');
    
    const body = await req.json();
    console.log('📦 Request body:', JSON.stringify(body, null, 2));
    
    const { token, choices } = body;

    if (!token) {
      console.log('❌ No token provided');
      return new Response(
        JSON.stringify({ error: 'Token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!choices || !Array.isArray(choices) || choices.length === 0) {
      console.log('❌ No choices provided');
      return new Response(
        JSON.stringify({ error: 'Choices array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('🔑 Supabase URL:', supabaseUrl ? 'Set' : 'Not set');
    console.log('🔑 Service role key:', supabaseKey ? 'Set' : 'Not set');

    const supabaseAdmin = createClient(
      supabaseUrl ?? '',
      supabaseKey ?? ''
    );

    // Validate token
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('employee_weekly_tokens')
      .select('*')
      .eq('token', token)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (tokenError || !tokenData) {
      console.error('❌ Token validation error:', tokenError);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Token validated for employee:', tokenData.employee_id);

    // Get employee data with quota info
    const { data: employee, error: employeeError } = await supabaseAdmin
      .from('employees')
      .select('id, shift_submission_quota, business_id')
      .eq('id', tokenData.employee_id)
      .maybeSingle();

    if (employeeError || !employee) {
      console.error('❌ Employee fetch error:', employeeError);
      return new Response(
        JSON.stringify({ error: 'Employee not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const quota = employee.shift_submission_quota || 3;
    
    // Check if employee has exceeded their quota
    if (choices.length > quota) {
      console.log('❌ Quota exceeded:', choices.length, 'choices vs', quota, 'quota');
      return new Response(
        JSON.stringify({ 
          error: 'Shift submission quota exceeded',
          message: `You can select a maximum of ${quota} shifts, but ${choices.length} were submitted` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for existing submissions for this week
    const { data: existingChoices, error: existingError } = await supabaseAdmin
      .from('employee_shift_choices')
      .select('id')
      .eq('employee_id', tokenData.employee_id)
      .eq('week_start_date', tokenData.week_start_date);

    if (existingError) {
      console.error('❌ Error checking existing choices:', existingError);
      return new Response(
        JSON.stringify({ error: 'Error checking existing submissions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If there are existing choices, delete them first
    if (existingChoices && existingChoices.length > 0) {
      console.log('🗑️ Deleting existing choices:', existingChoices.length);
      const { error: deleteError } = await supabaseAdmin
        .from('employee_shift_choices')
        .delete()
        .eq('employee_id', tokenData.employee_id)
        .eq('week_start_date', tokenData.week_start_date);

      if (deleteError) {
        console.error('❌ Error deleting existing choices:', deleteError);
        return new Response(
          JSON.stringify({ error: 'Error updating existing submissions' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Prepare choices for insertion
    const choicesForInsertion = choices.map((choice: ShiftChoice) => ({
      employee_id: tokenData.employee_id,
      available_shift_id: choice.shiftId,
      week_start_date: choice.weekStartDate,
      choice_type: choice.choiceType,
      preference_level: choice.preferenceLevel,
      notes: choice.notes || null,
      is_approved: null // Will be set by manager later
    }));

    console.log('💾 Inserting shift choices:', choicesForInsertion.length);

    // Insert the choices
    const { data: insertedChoices, error: insertError } = await supabaseAdmin
      .from('employee_shift_choices')
      .insert(choicesForInsertion)
      .select();

    if (insertError) {
      console.error('❌ Error inserting choices:', insertError);
      return new Response(
        JSON.stringify({ 
          error: 'Error saving shift choices',
          message: insertError.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Successfully inserted', insertedChoices.length, 'shift choices');

    // Mark token as used (optional - you might want to keep it active for viewing)
    await supabaseAdmin
      .from('employee_weekly_tokens')
      .update({ 
        last_used_at: new Date().toISOString(),
        choices_submitted: true
      })
      .eq('id', tokenData.id);

    const response = {
      success: true,
      choicesCount: insertedChoices.length,
      message: `Successfully submitted ${insertedChoices.length} shift choices`,
      choices: insertedChoices
    };

    console.log('🎉 Successfully processed shift choices submission');

    return new Response(
      JSON.stringify(response),
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