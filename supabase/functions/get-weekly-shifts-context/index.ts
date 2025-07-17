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
    console.log('🚀 Function started');
    console.log('🔍 Headers:', Object.fromEntries(req.headers.entries()));
    
    const body = await req.json();
    console.log('📦 Request body:', JSON.stringify(body, null, 2));
    
    const { token } = body;

    if (!token) {
      console.log('❌ No token provided');
      return new Response(
        JSON.stringify({ error: 'Token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔍 Getting weekly shifts context for token:', token);
    console.log('🕐 Current time:', new Date().toISOString());

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('🔑 Supabase URL:', supabaseUrl ? 'Set' : 'Not set');
    console.log('🔑 Service role key:', supabaseKey ? 'Set' : 'Not set');

    const supabaseAdmin = createClient(
      supabaseUrl ?? '',
      supabaseKey ?? ''
    );

    // Get token data first
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

    // Get employee data separately
    const { data: employee, error: employeeError } = await supabaseAdmin
      .from('employees')
      .select('id, first_name, last_name, employee_id, phone, business_id')
      .eq('id', tokenData.employee_id)
      .maybeSingle();

    if (employeeError || !employee) {
      console.error('❌ Employee fetch error:', employeeError);
      return new Response(
        JSON.stringify({ error: 'Employee not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get business data separately
    const { data: business, error: businessError } = await supabaseAdmin
      .from('businesses')
      .select('id, name')
      .eq('id', employee.business_id)
      .maybeSingle();

    if (businessError || !business) {
      console.error('❌ Business fetch error:', businessError);
      return new Response(
        JSON.stringify({ error: 'Business not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const businessId = employee.business_id;
    const employeeId = tokenData.employee_id;
    const weekStart = tokenData.week_start_date;
    const weekEnd = tokenData.week_end_date;

    console.log('✅ Token validated for employee:', employeeId, 'business:', businessId, 'week:', weekStart, 'to', weekEnd);

    // Check if this employee has any assigned shifts for this week
    const { data: assignedShiftsCheck, error: assignedCheckError } = await supabaseAdmin
      .from('scheduled_shifts')
      .select('id')
      .eq('employee_id', employeeId)
      .eq('business_id', businessId)
      .gte('shift_date', weekStart)
      .lte('shift_date', weekEnd)
      .limit(1);

    if (assignedCheckError) {
      console.error('❌ Error checking assigned shifts:', assignedCheckError);
      throw assignedCheckError;
    }

    const hasAssignedShifts = assignedShiftsCheck && assignedShiftsCheck.length > 0;
    console.log('📅 Employee has assigned shifts for this week:', hasAssignedShifts);

    // Update token with current status
    await supabaseAdmin
      .from('employee_weekly_tokens')
      .update({
        shifts_published: hasAssignedShifts,
        context_type: hasAssignedShifts ? 'assigned_shifts' : 'available_shifts'
      })
      .eq('id', tokenData.id);

    let shifts = [];
    let context = {};

    if (hasAssignedShifts) {
      // Get assigned shifts for this employee
      console.log('🎯 Getting assigned shifts for employee');
      const { data: assignedShifts, error: assignedError } = await supabaseAdmin
        .from('scheduled_shifts')
        .select(`
          *,
          branch:branches(id, name, address)
        `)
        .eq('employee_id', employeeId)
        .eq('business_id', businessId)
        .gte('shift_date', weekStart)
        .lte('shift_date', weekEnd)
        .order('shift_date', { ascending: true });

      if (assignedError) {
        console.error('❌ Error fetching assigned shifts:', assignedError);
        throw assignedError;
      }

      shifts = assignedShifts || [];
      context = {
        type: 'assigned_shifts',
        title: 'המשמרות שלך לשבוע הקרוב',
        description: 'אלו המשמרות שהוקצו לך לשבוע זה',
        shiftsPublished: true
      };

      console.log('✅ Found', shifts.length, 'assigned shifts');
    } else {
      // Get unassigned scheduled shifts for this week
      console.log('📋 Getting unassigned scheduled shifts for next week');
      const { data: unassignedShifts, error: unassignedError } = await supabaseAdmin
        .from('scheduled_shifts')
        .select(`
          *,
          branch:branches(id, name, address)
        `)
        .eq('business_id', businessId)
        .is('employee_id', null)
        .gte('shift_date', weekStart)
        .lte('shift_date', weekEnd)
        .order('shift_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (unassignedError) {
        console.error('❌ Error fetching unassigned shifts:', unassignedError);
        throw unassignedError;
      }

      shifts = unassignedShifts || [];
      context = {
        type: 'available_shifts',
        title: 'משמרות זמינות לשבוע הקרוב',
        description: 'אלו המשמרות שטרם הוקצו ומחכות לעובדים',
        shiftsPublished: false
      };

      console.log('✅ Found', shifts.length, 'unassigned scheduled shifts');
    }

    const response = {
      success: true,
      tokenData: {
        id: tokenData.id,
        token: tokenData.token,
        employeeId: tokenData.employee_id,
        weekStart: tokenData.week_start_date,
        weekEnd: tokenData.week_end_date,
        expiresAt: tokenData.expires_at,
        employee: {
          id: employee.id,
          first_name: employee.first_name,
          last_name: employee.last_name,
          employee_id: employee.employee_id,
          phone: employee.phone,
          business_id: employee.business_id,
          business: {
            id: business.id,
            name: business.name
          }
        }
      },
      context,
      shifts,
      shiftsCount: shifts.length
    };

    console.log('🎉 Successfully prepared weekly shifts context');

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