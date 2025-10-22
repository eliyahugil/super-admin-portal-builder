import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { business_id, week_start_date, week_end_date, employee_ids } = await req.json();

    if (!business_id || !week_start_date || !week_end_date) {
      return new Response(
        JSON.stringify({ error: 'Business ID and week dates are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔧 Generating employee tokens for business:', business_id, 'week:', week_start_date, 'to', week_end_date);

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get all active employees for the business (or specific employees if provided)
    let employeeQuery = supabaseAdmin
      .from('employees')
      .select('id, first_name, last_name, employee_id, business_id')
      .eq('business_id', business_id)
      .eq('is_active', true)
      .eq('is_archived', false);

    if (employee_ids && employee_ids.length > 0) {
      employeeQuery = employeeQuery.in('id', employee_ids);
    }

    const { data: employees, error: employeeError } = await employeeQuery;

    if (employeeError) {
      console.error('❌ Error fetching employees:', employeeError);
      throw employeeError;
    }

    if (!employees || employees.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No active employees found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('👥 Found', employees.length, 'employees to generate tokens for');

    const generatedTokens = [];
    const errors = [];

    // Generate tokens for each employee
    for (const employee of employees) {
      try {
        console.log('🔄 Generating token for employee:', employee.first_name, employee.last_name);
        
        const { data: tokenResult, error: tokenError } = await supabaseAdmin
          .rpc('generate_employee_weekly_token', {
            p_employee_id: employee.id,
            p_week_start_date: week_start_date,
            p_week_end_date: week_end_date
          });

        if (tokenError) {
          console.error('❌ Error generating token for employee', employee.id, ':', tokenError);
          errors.push({
            employee_id: employee.id,
            employee_name: `${employee.first_name} ${employee.last_name}`,
            error: tokenError.message
          });
          continue;
        }

        console.log('✅ Generated token for', employee.first_name, employee.last_name, ':', tokenResult.substring(0, 8) + '...');
        
        generatedTokens.push({
          employee_id: employee.id,
          employee_name: `${employee.first_name} ${employee.last_name}`,
          employee_code: employee.employee_id,
          token: tokenResult,
          week_start_date,
          week_end_date
        });

      } catch (error) {
        console.error('💥 Unexpected error for employee', employee.id, ':', error);
        errors.push({
          employee_id: employee.id,
          employee_name: `${employee.first_name} ${employee.last_name}`,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const response = {
      success: true,
      message: `Generated ${generatedTokens.length} tokens successfully`,
      tokens: generatedTokens,
      errors: errors,
      business_id,
      week_start_date,
      week_end_date,
      total_employees: employees.length,
      successful_tokens: generatedTokens.length,
      failed_tokens: errors.length
    };

    console.log('🎉 Token generation complete:', {
      successful: generatedTokens.length,
      failed: errors.length,
      total: employees.length
    });

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});