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
      throw publishedError;
    }

    const shiftsPublished = publishedShifts && publishedShifts.length > 0;
    console.log('📅 Shifts published status for this week:', shiftsPublished);

    // Update token with current publication status
    await supabaseAdmin
      .from('employee_weekly_tokens')
      .update({
        shifts_published: shiftsPublished,
        context_type: shiftsPublished ? 'assigned_shifts' : 'available_shifts'
      })
      .eq('id', tokenData.id);

    let shifts = [];
    let context = {};

    if (shiftsPublished) {
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
      // Get employee's branch assignments and preferences
      console.log('📋 Getting employee branch assignments and preferences');
      const { data: employeeBranches, error: branchError } = await supabaseAdmin
        .from('employee_branch_assignments')
        .select('branch_id, shift_types, available_days')
        .eq('employee_id', employeeId)
        .eq('is_active', true);

      if (branchError) {
        console.error('❌ Error fetching employee branches:', branchError);
        throw branchError;
      }

      if (!employeeBranches || employeeBranches.length === 0) {
        console.log('⚠️ No branch assignments found for employee');
        shifts = [];
        context = {
          type: 'available_shifts',
          title: 'אין משמרות זמינות',
          description: 'אינך משויך לאף סניף כעת',
          shiftsPublished: false
        };
      } else {
        // Extract branch IDs and shift types from assignments
        const assignedBranchIds = employeeBranches.map(ba => ba.branch_id);
        const assignedShiftTypes = [...new Set(employeeBranches.flatMap(ba => ba.shift_types || []))];
        const availableDays = [...new Set(employeeBranches.flatMap(ba => ba.available_days || []))];

        console.log('🏢 Employee assigned to branches:', assignedBranchIds);
        console.log('⏰ Employee shift types:', assignedShiftTypes);
        console.log('📅 Employee available days:', availableDays);

        // Get ALL available shifts for the business and week first
        const { data: allAvailableShifts, error: availableError } = await supabaseAdmin
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

        console.log('📊 Total available shifts before filtering:', allAvailableShifts?.length || 0);

        // Filter shifts by employee assignments
        const filteredShifts = (allAvailableShifts || []).filter(shift => {
          // Check if shift is in assigned branches
          const branchMatch = assignedBranchIds.includes(shift.branch_id);
          
          // Check if shift type matches assigned shift types
          const shiftTypeMatch = assignedShiftTypes.includes(shift.shift_type);
          
          // Check if day matches available days
          const dayMatch = availableDays.includes(shift.day_of_week);
          
          console.log(`🔍 Filtering shift ${shift.id}: branch(${shift.branch_id}): ${branchMatch}, type(${shift.shift_type}): ${shiftTypeMatch}, day(${shift.day_of_week}): ${dayMatch}`);
          
          return branchMatch && shiftTypeMatch && dayMatch;
        });

        console.log('✅ Shifts after filtering:', filteredShifts.length);

        shifts = filteredShifts;
        context = {
          type: 'available_shifts',
          title: 'משמרות זמינות לשבוע הקרוב',
          description: `נמצאו ${shifts.length} משמרות זמינות בסניפים ובמשמרות שאליהן אתה משויך`,
          shiftsPublished: false,
          filterInfo: {
            assignedBranches: assignedBranchIds.length,
            shiftTypes: assignedShiftTypes,
            availableDays: availableDays
          }
        };

        console.log('✅ Found', shifts.length, 'filtered available shifts for employee assignments');
      }
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