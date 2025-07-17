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
    console.log('📥 Request received, method:', req.method);
    console.log('📥 Request headers:', Object.fromEntries(req.headers.entries()));
    
    const body = await req.json();
    console.log('📥 Request body:', body);
    
    const { token } = body;

    if (!token) {
      console.log('❌ No token provided in request');
      return new Response(
        JSON.stringify({ error: 'Token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔍 Getting weekly shifts context for token:', token);
    console.log('🔍 Using SUPABASE_URL:', Deno.env.get('SUPABASE_URL'));
    console.log('🔍 Using SERVICE_ROLE_KEY:', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? 'Present' : 'Missing');

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get token data with employee and business information
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('employee_weekly_tokens')
      .select(`
        *,
        employee:employees(
          id,
          first_name,
          last_name,
          employee_id,
          phone,
          business_id,
          business:businesses(id, name)
        )
      `)
      .eq('token', token)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (tokenError) {
      console.error('❌ Token validation error:', tokenError);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const businessId = tokenData.employee.business_id;
    const employeeId = tokenData.employee_id;
    const weekStart = tokenData.week_start_date;
    const weekEnd = tokenData.week_end_date;

    console.log('✅ Token validated for employee:', employeeId, 'business:', businessId, 'week:', weekStart, 'to', weekEnd);
    console.log('🔍 Token data details:', {
      tokenId: tokenData.id,
      employeeName: `${tokenData.employee.first_name} ${tokenData.employee.last_name}`,
      businessName: tokenData.employee.business.name,
      weekDates: { start: weekStart, end: weekEnd }
    });

    // Check if shifts have been published for this specific employee
    console.log('📅 Checking if shifts have been published for this employee...');
    const { data: employeeScheduledShifts, error: employeeShiftsError } = await supabaseAdmin
      .from('scheduled_shifts')
      .select('id')
      .eq('employee_id', employeeId)
      .eq('business_id', businessId)
      .gte('shift_date', weekStart)
      .lte('shift_date', weekEnd)
      .limit(1);

    if (employeeShiftsError) {
      console.error('❌ Error checking employee scheduled shifts:', employeeShiftsError);
      throw employeeShiftsError;
    }

    const employeeHasShifts = employeeScheduledShifts && employeeScheduledShifts.length > 0;
    console.log('📅 Employee has scheduled shifts for this week:', employeeHasShifts);
    console.log('🔍 Employee scheduled shifts query result:', {
      shiftsFound: employeeScheduledShifts?.length || 0,
      queryParams: { employeeId, businessId, weekStart, weekEnd }
    });

    // Also check if ANY shifts have been published for this business this week
    const { data: businessScheduledShifts, error: businessShiftsError } = await supabaseAdmin
      .from('scheduled_shifts')
      .select('id')
      .eq('business_id', businessId)
      .gte('shift_date', weekStart)
      .lte('shift_date', weekEnd)
      .limit(1);

    if (businessShiftsError) {
      console.error('❌ Error checking business scheduled shifts:', businessShiftsError);
      throw businessShiftsError;
    }

    const businessHasShifts = businessScheduledShifts && businessScheduledShifts.length > 0;
    console.log('📅 Business has any scheduled shifts for this week:', businessHasShifts);

    // Update token with current publication status
    const shiftsPublished = employeeHasShifts;
    await supabaseAdmin
      .from('employee_weekly_tokens')
      .update({
        shifts_published: shiftsPublished,
        context_type: shiftsPublished ? 'assigned_shifts' : 'available_shifts'
      })
      .eq('id', tokenData.id);

    let shifts = [];
    let context = {};

    // Get scheduled shifts for this employee in the specified week
    console.log('📋 Getting scheduled shifts for employee:', employeeId, 'in week:', weekStart, 'to', weekEnd);
    
    const { data: scheduledShifts, error: scheduledError } = await supabaseAdmin
      .from('scheduled_shifts')
      .select(`
        *,
        branch:branches(id, name, address),
        business:businesses(id, name)
      `)
      .eq('employee_id', employeeId)
      .eq('business_id', businessId)
      .gte('shift_date', weekStart)
      .lte('shift_date', weekEnd)
      .eq('is_assigned', true)
      .eq('is_archived', false)
      .order('shift_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (scheduledError) {
      console.error('❌ Error fetching scheduled shifts:', scheduledError);
      throw scheduledError;
    }

    console.log('🔍 Scheduled shifts query result:', {
      shiftsFound: scheduledShifts?.length || 0,
      shifts: scheduledShifts
    });

    shifts = scheduledShifts || [];
    
    // Context for showing scheduled shifts
    context = {
      type: shiftsPublished ? 'assigned_shifts' : 'available_shifts',
      title: shiftsPublished ? 'המשמרות שלך לשבוע הקרוב' : 'הגשת משמרות לשבוע הקרוב',
      description: shifts.length > 0 
        ? (shiftsPublished ? 'אלו המשמרות שהוקצו לך השבוע' : 'בחר את המשמרות שברצונך לעבוד השבוע והגש את בקשתך')
        : 'טרם הוגדרו משמרות לשבוע זה. אנא פנה למנהל העבודה.',
      shiftsPublished: shiftsPublished
    };

    console.log('✅ Found', shifts.length, 'scheduled shifts for employee');
    console.log('📝 Context type:', context.type);

    const response = {
      success: true,
      tokenData: {
        id: tokenData.id,
        token: tokenData.token,
        employeeId: tokenData.employee_id,
        weekStart: tokenData.week_start_date,
        weekEnd: tokenData.week_end_date,
        expiresAt: tokenData.expires_at,
        employee: tokenData.employee
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