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
    const { token } = await req.json();

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

    if (employeeHasShifts) {
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
      // Employee doesn't have assigned shifts, check available shifts
      console.log('📋 Getting available shifts for next week');
      console.log('🔍 Searching for available shifts with criteria:', {
        businessId,
        weekStart,
        weekEnd
      });
      
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
        throw availableError;
      }

      console.log('🔍 Available shifts query result:', {
        shiftsFound: availableShifts?.length || 0,
        shifts: availableShifts
      });

      // Also check if there are ANY available shifts for this business
      const { data: allAvailableShifts, error: allShiftsError } = await supabaseAdmin
        .from('available_shifts')
        .select('id, week_start_date, week_end_date, business_id')
        .eq('business_id', businessId);
      
      console.log('🔍 All available shifts for business:', {
        totalShifts: allAvailableShifts?.length || 0,
        allShifts: allAvailableShifts
      });

      shifts = availableShifts || [];
      
      // Determine context based on whether business has any scheduled shifts
      if (businessHasShifts) {
        context = {
          type: 'no_shifts_assigned',
          title: 'לא הוקצו לך משמרות השבוע',
          description: 'המשמרות לשבוע זה פורסמו אבל לא הוקצו לך משמרות. אנא פנה למנהל העבודה.',
          shiftsPublished: true
        };
      } else {
        context = {
          type: 'available_shifts',
          title: 'משמרות זמינות לשבוע הקרוב',
          description: shifts.length > 0 ? 'אלו המשמרות הזמינות להרשמה לשבוע זה' : 'טרם הוגדרו משמרות זמינות לשבוע זה. אנא פנה למנהל העבודה.',
          shiftsPublished: false
        };
      }

      console.log('✅ Found', shifts.length, 'available shifts');
      console.log('📝 Context type determined:', context.type);
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