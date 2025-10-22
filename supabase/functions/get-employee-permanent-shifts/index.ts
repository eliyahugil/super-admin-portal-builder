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
    const { token, weekOffset = 0 } = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('📅 Getting permanent shifts for token:', token.substring(0, 8) + '...', 'Week offset:', weekOffset);

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // First validate the permanent token
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('employee_permanent_tokens')
      .select(`
        *,
        employee:employees(
          id,
          first_name,
          last_name,
          employee_id,
          business_id,
          phone,
          business:businesses(id, name)
        )
      `)
      .eq('token', token)
      .eq('is_active', true)
      .maybeSingle();

    if (tokenError || !tokenData) {
      console.error('❌ Token validation error:', tokenError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'טוקן לא תקין או לא פעיל' 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const employeeId = tokenData.employee_id;
    const businessId = tokenData.business_id;

    console.log('✅ Token validated for employee:', employeeId, 'business:', businessId);

    // Calculate week dates based on offset
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - currentDay + (weekOffset * 7));
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    console.log('📅 Week range:', weekStartStr, 'to', weekEndStr);

    // Get available shifts for this week
    const { data: availableShifts, error: shiftsError } = await supabaseAdmin
      .from('available_shifts')
      .select(`
        *,
        branch:branches(id, name, address)
      `)
      .eq('business_id', businessId)
      .eq('week_start_date', weekStartStr)
      .eq('week_end_date', weekEndStr);

    if (shiftsError) {
      console.error('❌ Error fetching available shifts:', shiftsError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'שגיאה בטעינת משמרות זמינות' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get employee's scheduled shifts for this week
    const { data: scheduledShifts, error: scheduledError } = await supabaseAdmin
      .from('scheduled_shifts')
      .select(`
        *,
        branch:branches(id, name, address)
      `)
      .eq('employee_id', employeeId)
      .gte('shift_date', weekStartStr)
      .lte('shift_date', weekEndStr);

    if (scheduledError) {
      console.error('❌ Error fetching scheduled shifts:', scheduledError);
    }

    // Get business shift types for styling
    const { data: businessShiftTypes, error: typesError } = await supabaseAdmin
      .from('business_shift_types')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true);

    if (typesError) {
      console.error('❌ Error fetching shift types:', typesError);
    }

    // Get employee branch assignments
    const { data: employeeAssignments, error: assignmentsError } = await supabaseAdmin
      .from('employee_branch_assignments')
      .select(`
        *,
        branch:branches(id, name, address)
      `)
      .eq('employee_id', employeeId)
      .eq('is_active', true);

    if (assignmentsError) {
      console.error('❌ Error fetching employee assignments:', assignmentsError);
    }

    // Update token usage
    await supabaseAdmin
      .from('employee_permanent_tokens')
      .update({ 
        last_used_at: new Date().toISOString(),
        uses_count: tokenData.uses_count + 1
      })
      .eq('id', tokenData.id);

    // Prepare enhanced available shifts with additional info
    const enhancedAvailableShifts = (availableShifts || []).map(shift => {
      // Calculate actual shift date based on day_of_week and week_start
      const shiftDate = new Date(weekStart);
      shiftDate.setDate(weekStart.getDate() + shift.day_of_week);
      
      return {
        ...shift,
        shift_date: shiftDate.toISOString().split('T')[0],
        source: 'available_shifts'
      };
    });

    // Prepare enhanced scheduled shifts
    const enhancedScheduledShifts = (scheduledShifts || []).map(shift => ({
      ...shift,
      source: 'employee_scheduled'
    }));

    const response = {
      success: true,
      availableShifts: enhancedAvailableShifts,
      employeeScheduledShifts: enhancedScheduledShifts,
      businessShiftTypes: businessShiftTypes || [],
      employeeAssignments: employeeAssignments || [],
      context: {
        weekStart: weekStartStr,
        weekEnd: weekEndStr,
        weekOffset,
        employee: tokenData.employee,
        description: enhancedAvailableShifts?.length ? 
          `נמצאו ${enhancedAvailableShifts.length} משמרות זמינות לשבוע זה` : 
          'אין משמרות זמינות לשבוע זה',
        error: employeeAssignments?.length === 0 ? 'NO_BRANCH_ASSIGNMENTS' : null
      }
    };

    console.log('✅ Permanent shifts response prepared:', {
      availableShifts: enhancedAvailableShifts.length,
      scheduledShifts: enhancedScheduledShifts.length,
      weekRange: `${weekStartStr} - ${weekEndStr}`
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