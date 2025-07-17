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

    // Get employee preferences to filter relevant shifts
    console.log('📋 Getting employee preferences and branch assignments for:', employeeId);
    
    const { data: employeeData, error: employeeError } = await supabaseAdmin
      .from('employees')
      .select(`
        *,
        employee_branch_assignments(
          branch_id,
          shift_types,
          available_days,
          max_weekly_hours,
          is_active
        ),
        employee_default_preferences(
          shift_types,
          available_days,
          max_weekly_hours
        )
      `)
      .eq('id', employeeId)
      .eq('business_id', businessId)
      .single();

    if (employeeError) {
      console.error('❌ Error fetching employee data:', employeeError);
      throw employeeError;
    }

    console.log('👤 Employee data retrieved:', {
      employeeId,
      branchAssignments: employeeData.employee_branch_assignments?.length || 0,
      defaultPreferences: employeeData.employee_default_preferences?.length || 0,
      shiftTypes: employeeData.preferred_shift_time
    });

    // Get available shifts filtered by employee's branches and preferences
    console.log('📋 Getting available shifts for week submission');
    console.log('🔍 Searching for available shifts with criteria:', {
      businessId,
      weekStart,
      weekEnd,
      employeeId
    });

    // Build branch filter based on employee assignments
    let branchFilter = null;
    const activeBranchAssignments = employeeData.employee_branch_assignments?.filter(ba => ba.is_active) || [];
    
    if (activeBranchAssignments.length > 0) {
      const branchIds = activeBranchAssignments.map(ba => ba.branch_id);
      branchFilter = branchIds;
      console.log('🏢 Filtering by employee branches:', branchIds);
    }

    // Build shift type filter
    let allowedShiftTypes = [];
    
    // First check employee's current preference
    if (employeeData.preferred_shift_time && employeeData.preferred_shift_time !== 'any') {
      allowedShiftTypes.push(employeeData.preferred_shift_time);
    } else {
      // Check branch assignments for shift types
      activeBranchAssignments.forEach(ba => {
        if (ba.shift_types && ba.shift_types.length > 0) {
          allowedShiftTypes = [...allowedShiftTypes, ...ba.shift_types];
        }
      });
      
      // Fallback to default preferences
      if (allowedShiftTypes.length === 0 && employeeData.employee_default_preferences?.length > 0) {
        const defaultPrefs = employeeData.employee_default_preferences[0];
        if (defaultPrefs.shift_types && defaultPrefs.shift_types.length > 0) {
          allowedShiftTypes = defaultPrefs.shift_types;
        }
      }
      
      // Final fallback - if still no types, allow morning and evening
      if (allowedShiftTypes.length === 0) {
        allowedShiftTypes = ['morning', 'evening'];
      }
    }

    // Remove duplicates
    allowedShiftTypes = [...new Set(allowedShiftTypes)];
    console.log('⏰ Allowed shift types for employee:', allowedShiftTypes);

    // Query available shifts with filters
    let shiftsQuery = supabaseAdmin
      .from('available_shifts')
      .select(`
        *,
        branch:branches(id, name, address),
        business:businesses(id, name)
      `)
      .eq('business_id', businessId)
      .eq('week_start_date', weekStart)
      .eq('week_end_date', weekEnd)
      .in('shift_type', allowedShiftTypes);

    // Apply branch filter if employee has specific branch assignments
    if (branchFilter && branchFilter.length > 0) {
      shiftsQuery = shiftsQuery.in('branch_id', branchFilter);
    }

    shiftsQuery = shiftsQuery
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });

    const { data: availableShifts, error: availableError } = await shiftsQuery;

    if (availableError) {
      console.error('❌ Error fetching available shifts:', availableError);
      throw availableError;
    }

    console.log('🔍 Available shifts query result:', {
      shiftsFound: availableShifts?.length || 0,
      shifts: availableShifts
    });

    shifts = availableShifts || [];
    
    // Context for shift submission
    context = {
      type: 'available_shifts',
      title: 'הגשת משמרות לשבוע הקרוב',
      description: shifts.length > 0 
        ? 'בחר את המשמרות שברצונך לעבד השבוע והגש את בקשתך' 
        : 'טרם הוגדרו משמרות זמינות לשבוע זה. אנא פנה למנהל העבודה.',
      shiftsPublished: false
    };

    console.log('✅ Found', shifts.length, 'available shifts for submission');
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