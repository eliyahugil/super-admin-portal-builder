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
    // Handle both GET and POST requests
    let token = null;
    
    if (req.method === 'GET') {
      const url = new URL(req.url);
      token = url.searchParams.get('token');
    } else {
      const body = await req.json();
      token = body.token;
    }

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔍 Getting weekly shifts context for token:', token);

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

    if (!tokenData) {
      console.error('❌ Token not found or expired');
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token', success: false }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const businessId = tokenData.employee.business_id;
    const employeeId = tokenData.employee_id;
    const weekStart = tokenData.week_start_date;
    const weekEnd = tokenData.week_end_date;

    console.log('✅ Token validated for employee:', employeeId, 'business:', businessId, 'week:', weekStart, 'to', weekEnd);

    // Check if shifts have been published for this week
    const { data: publishedShifts, error: publishedError } = await supabaseAdmin
      .from('scheduled_shifts')
      .select('id')
      .eq('business_id', businessId)
      .gte('shift_date', weekStart)
      .lte('shift_date', weekEnd)
      .limit(1);

    if (publishedError) {
      console.error('❌ Error checking published shifts:', publishedError);
      // Don't throw, just log and continue with available shifts
      console.log('Continuing with available shifts mode...');
    }

    // Check if this specific employee has assigned shifts for this week
    const { data: employeeAssignedShifts, error: assignedError } = await supabaseAdmin
      .from('scheduled_shifts')
      .select('id')
      .eq('business_id', businessId)
      .eq('employee_id', employeeId)
      .gte('shift_date', weekStart)
      .lte('shift_date', weekEnd)
      .limit(1);

    if (assignedError) {
      console.error('❌ Error checking employee assigned shifts:', assignedError);
      // Don't throw, just log and continue with available shifts
      console.log('Continuing with available shifts mode...');
    }

    const employeeHasAssignedShifts = employeeAssignedShifts && employeeAssignedShifts.length > 0;
    console.log('📅 Employee has assigned shifts for this week:', employeeHasAssignedShifts);

    // Update token with current publication status based on employee's assignments
    await supabaseAdmin
      .from('employee_weekly_tokens')
      .update({
        shifts_published: employeeHasAssignedShifts,
        context_type: employeeHasAssignedShifts ? 'assigned_shifts' : 'available_shifts'
      })
      .eq('id', tokenData.id);

    let shifts = [];
    let context = {};

    if (employeeHasAssignedShifts) {
      // Get assigned shifts for this employee
      console.log('🎯 Getting assigned shifts for employee');
      const { data: assignedShifts, error: assignedError } = await supabaseAdmin
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
        .order('shift_date', { ascending: true });

      if (assignedError) {
        console.error('❌ Error fetching assigned shifts:', assignedError);
        // Don't throw, return empty shifts instead
        shifts = [];
        context = {
          type: 'assigned_shifts',
          title: 'המשמרות שלך לשבוע הקרוב',
          description: 'לא נמצאו משמרות מוקצות לשבוע זה',
          shiftsPublished: true
        };
      } else {
        shifts = assignedShifts || [];
        context = {
          type: 'assigned_shifts',
          title: 'המשמרות שלך לשבוע הקרוב',
          description: 'אלו המשמרות שהוקצו לך לשבוע זה',
          shiftsPublished: true
        };
      }

      console.log('✅ Found', shifts.length, 'assigned shifts');
    } else {
      // Get available shifts that haven't been assigned yet
      console.log('📋 Getting available shifts for next week');
      const { data: availableShifts, error: availableError } = await supabaseAdmin
        .from('available_shifts')
        .select(`
          *,
          branch:branches(id, name, address),
          business:businesses(id, name)
        `)
        .eq('business_id', businessId)
        .eq('week_start_date', weekStart)
        .eq('week_end_date', weekEnd)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });

      if (availableError) {
        console.error('❌ Error fetching available shifts:', availableError);
        // Don't throw, return empty shifts instead
        shifts = [];
        context = {
          type: 'available_shifts',
          title: 'משמרות זמינות לשבוע הקרוב',
          description: 'לא נמצאו משמרות זמינות לשבוע זה',
          shiftsPublished: false
        };
      } else {
        shifts = availableShifts || [];
        context = {
          type: 'available_shifts',
          title: 'משמרות זמינות לשבוע הקרוב',
          description: 'אלו המשמרות הזמינות להרשמה לשבוע זה',
          shiftsPublished: false
        };
      }

      console.log('✅ Found', shifts.length, 'available shifts');
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