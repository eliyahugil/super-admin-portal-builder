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
    const { business_id, employee_ids } = await req.json();

    if (!business_id) {
      return new Response(
        JSON.stringify({ error: 'Business ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔧 Generating permanent tokens for business:', business_id, 'employees:', employee_ids);

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let targetEmployees = [];
    let successful_tokens = 0;
    let failed_tokens = 0;
    const results = [];

    // If specific employee IDs provided, use them; otherwise get all employees
    if (employee_ids && employee_ids.length > 0) {
      const { data: specificEmployees, error: employeesError } = await supabaseAdmin
        .from('employees')
        .select('id, first_name, last_name, employee_id')
        .eq('business_id', business_id)
        .in('id', employee_ids)
        .eq('is_active', true);

      if (employeesError) {
        console.error('❌ Error fetching specific employees:', employeesError);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'שגיאה בטעינת עובדים' 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      targetEmployees = specificEmployees || [];
    } else {
      // Get all active employees for the business
      const { data: allEmployees, error: employeesError } = await supabaseAdmin
        .from('employees')
        .select('id, first_name, last_name, employee_id')
        .eq('business_id', business_id)
        .eq('is_active', true);

      if (employeesError) {
        console.error('❌ Error fetching all employees:', employeesError);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'שגיאה בטעינת עובדים' 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      targetEmployees = allEmployees || [];
    }

    console.log(`📋 Processing ${targetEmployees.length} employees for permanent tokens`);

    // Process each employee
    for (const employee of targetEmployees) {
      try {
        // Check if employee already has an active permanent token
        const { data: existingToken, error: checkError } = await supabaseAdmin
          .from('employee_permanent_tokens')
          .select('id, token')
          .eq('employee_id', employee.id)
          .eq('is_active', true)
          .maybeSingle();

        if (checkError && checkError.code !== 'PGRST116') {
          console.error('❌ Error checking existing token for employee:', employee.id, checkError);
          failed_tokens++;
          results.push({
            employee_id: employee.id,
            employee_name: `${employee.first_name} ${employee.last_name}`,
            success: false,
            error: 'שגיאה בבדיקת טוקן קיים'
          });
          continue;
        }

        if (existingToken) {
          console.log('ℹ️ Employee already has active permanent token:', employee.id);
          successful_tokens++;
          results.push({
            employee_id: employee.id,
            employee_name: `${employee.first_name} ${employee.last_name}`,
            success: true,
            token: existingToken.token,
            existed: true
          });
          continue;
        }

        // Generate new permanent token using the database function
        const { data: tokenResult, error: tokenError } = await supabaseAdmin
          .rpc('generate_employee_permanent_token', { 
            p_employee_id: employee.id 
          });

        if (tokenError || !tokenResult) {
          console.error('❌ Error generating permanent token for employee:', employee.id, tokenError);
          failed_tokens++;
          results.push({
            employee_id: employee.id,
            employee_name: `${employee.first_name} ${employee.last_name}`,
            success: false,
            error: 'שגיאה ביצירת טוקן'
          });
          continue;
        }

        console.log('✅ Generated permanent token for employee:', employee.id);
        successful_tokens++;
        results.push({
          employee_id: employee.id,
          employee_name: `${employee.first_name} ${employee.last_name}`,
          success: true,
          token: tokenResult,
          existed: false
        });

      } catch (error) {
        console.error('❌ Unexpected error processing employee:', employee.id, error);
        failed_tokens++;
        results.push({
          employee_id: employee.id,
          employee_name: `${employee.first_name} ${employee.last_name}`,
          success: false,
          error: 'שגיאה לא צפויה'
        });
      }
    }

    const response = {
      success: true,
      successful_tokens,
      failed_tokens,
      total_processed: targetEmployees.length,
      results,
      summary: `נוצרו ${successful_tokens} טוקנים קבועים בהצלחה מתוך ${targetEmployees.length} עובדים`
    };

    console.log('✅ Permanent token generation completed:', {
      successful: successful_tokens,
      failed: failed_tokens,
      total: targetEmployees.length
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
        success: false,
        error: 'שגיאה פנימית בשרת',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});