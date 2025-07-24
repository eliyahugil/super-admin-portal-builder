import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const { business_id, employee_ids } = await req.json();

    if (!business_id) {
      return new Response(
        JSON.stringify({ error: 'Business ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔧 Generating permanent tokens for business:', business_id);

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get employees to generate tokens for
    let employeesQuery = supabaseAdmin
      .from('employees')
      .select('id, first_name, last_name, employee_id, phone')
      .eq('business_id', business_id)
      .eq('is_active', true)
      .eq('is_archived', false);

    if (employee_ids && employee_ids.length > 0) {
      employeesQuery = employeesQuery.in('id', employee_ids);
    }

    const { data: employees, error: employeesError } = await employeesQuery;

    if (employeesError) {
      console.error('❌ Error fetching employees:', employeesError);
      throw employeesError;
    }

    if (!employees || employees.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No active employees found',
          business_id,
          employee_ids
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('👥 Found', employees.length, 'employees to generate permanent tokens for');

    const generatedTokens = [];
    const errors = [];

    // Generate or get existing permanent token for each employee
    for (const employee of employees) {
      try {
        console.log('🔄 Generating permanent token for employee:', employee.first_name, employee.last_name);

        const { data: tokenResult, error: tokenError } = await supabaseAdmin
          .rpc('generate_employee_permanent_token', {
            p_employee_id: employee.id
          });

        if (tokenError) {
          console.error('❌ Error generating permanent token for employee', employee.id, ':', tokenError);
          errors.push({
            employee_id: employee.id,
            employee_name: `${employee.first_name} ${employee.last_name}`,
            error: tokenError.message
          });
          continue;
        }

        console.log('✅ Generated/Retrieved permanent token for', employee.first_name, employee.last_name, ':', tokenResult.substring(0, 8) + '...');
        
        generatedTokens.push({
          employee_id: employee.id,
          employee_name: `${employee.first_name} ${employee.last_name}`,
          employee_code: employee.employee_id,
          phone: employee.phone,
          token: tokenResult,
          isPermanent: true
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
      message: `Generated ${generatedTokens.length} permanent tokens successfully`,
      tokens: generatedTokens,
      errors: errors,
      business_id,
      total_employees: employees.length,
      successful_tokens: generatedTokens.length,
      failed_tokens: errors.length,
      isPermanent: true
    };

    console.log('🎉 Permanent token generation complete:', {
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