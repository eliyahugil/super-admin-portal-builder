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

    console.log('🔍 Validating permanent token:', token);

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Validate token and get employee information
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
          business:businesses(id, name)
        )
      `)
      .eq('token', token)
      .eq('is_active', true)
      .maybeSingle();

    if (tokenError || !tokenData) {
      console.error('❌ Token validation error:', tokenError);
      return new Response(
        JSON.stringify({ error: 'Invalid or inactive token' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const businessId = tokenData.business_id;
    const employeeId = tokenData.employee_id;
    
    console.log('✅ Token validated for employee:', employeeId, 'business:', businessId);

    // Update only last used timestamp - DO NOT increment uses_count here
    // uses_count should only be incremented when actual shift submission happens
    await supabaseAdmin
      .from('employee_permanent_tokens')
      .update({ 
        last_used_at: new Date().toISOString()
      })
      .eq('id', tokenData.id);

    // Get employee's branch assignments and preferences
    console.log('📋 Getting employee branch assignments and preferences');
    const { data: employeeBranches, error: branchError } = await supabaseAdmin
      .from('employee_branch_assignments')
      .select('branch_id, shift_types, available_days, role_name')
      .eq('employee_id', employeeId)
      .eq('is_active', true);

    if (branchError) {
      console.error('❌ Error fetching employee branches:', branchError);
      throw branchError;
    }

    let shifts = [];
    let context = {};

    if (!employeeBranches || employeeBranches.length === 0) {
      console.log('⚠️ No branch assignments found for employee');
      shifts = [];
      context = {
        type: 'available_shifts',
        title: 'אין משמרות זמינות',
        description: 'אינך משויך לאף סניף כעת',
        error: 'NO_BRANCH_ASSIGNMENTS'
      };
    } else {
      // Extract branch IDs and shift types from assignments
      const assignedBranchIds = employeeBranches.map(ba => ba.branch_id);
      const assignedShiftTypes = [...new Set(employeeBranches.flatMap(ba => ba.shift_types || []))];
      const availableDays = [...new Set(employeeBranches.flatMap(ba => ba.available_days || []))];

      console.log('🏢 Employee assigned to branches:', assignedBranchIds);
      console.log('⏰ Employee shift types:', assignedShiftTypes);
      console.log('📅 Employee available days:', availableDays);

      // Get current week dates (Sunday to Saturday)
      const today = new Date();
      const currentDayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
      const daysToSunday = currentDayOfWeek === 0 ? 0 : 7 - currentDayOfWeek;
      const nextSunday = new Date(today);
      nextSunday.setDate(today.getDate() + daysToSunday);
      
      const weekStart = nextSunday.toISOString().split('T')[0];
      const weekEnd = new Date(nextSunday);
      weekEnd.setDate(nextSunday.getDate() + 6);
      const weekEndStr = weekEnd.toISOString().split('T')[0];

      console.log('📅 Getting shifts for week:', weekStart, 'to', weekEndStr);

      // Get ALL available shifts for the business and upcoming week
      const { data: allAvailableShifts, error: availableError } = await supabaseAdmin
        .from('available_shifts')
        .select(`
          *,
          branch:branches(id, name, address),
          business:businesses(id, name)
        `)
        .eq('business_id', businessId)
        .eq('week_start_date', weekStart)
        .eq('week_end_date', weekEndStr)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });

      if (availableError) {
        console.error('❌ Error fetching available shifts:', availableError);
        throw availableError;
      }

      console.log('📊 Total available shifts before filtering:', allAvailableShifts?.length || 0);

      // ALSO get unassigned scheduled shifts (employee_id is null) for the week
      const { data: unassignedScheduledShifts, error: scheduledError } = await supabaseAdmin
        .from('scheduled_shifts')
        .select(`
          id,
          shift_date,
          start_time,
          end_time,
          branch_id,
          business_id,
          notes,
          shift_assignments,
          branch:branches(id, name, address),
          business:businesses(id, name)
        `)
        .eq('business_id', businessId)
        .is('employee_id', null)
        .gte('shift_date', weekStart)
        .lte('shift_date', weekEndStr)
        .order('shift_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (scheduledError) {
        console.error('❌ Error fetching unassigned scheduled shifts:', scheduledError);
      }

      console.log('📊 Total unassigned scheduled shifts found:', unassignedScheduledShifts?.length || 0);

      // Convert scheduled shifts to available shifts format and combine
      const scheduledAsAvailable = (unassignedScheduledShifts || []).map(shift => {
        const shiftDate = new Date(shift.shift_date);
        const dayOfWeek = shiftDate.getDay(); // 0 = Sunday, 1 = Monday...
        
        // Determine shift type based on time
        const startHour = parseInt(shift.start_time.split(':')[0]);
        let shift_type = 'morning';
        if (startHour >= 6 && startHour < 14) {
          shift_type = 'morning';
        } else if (startHour >= 14 && startHour < 20) {
          shift_type = 'afternoon';
        } else {
          shift_type = 'evening';
        }

        return {
          id: shift.id,
          business_id: shift.business_id,
          branch_id: shift.branch_id,
          shift_name: `משמרת ${shift_type}`,
          shift_type: shift_type,
          day_of_week: dayOfWeek,
          start_time: shift.start_time,
          end_time: shift.end_time,
          required_employees: 1,
          current_assignments: 0,
          is_open_for_unassigned: true,
          week_start_date: weekStart,
          week_end_date: weekEndStr,
          branch: shift.branch,
          business: shift.business,
          source: 'scheduled_shifts',
          shift_date: shift.shift_date,
          notes: shift.notes,
          shift_assignments: shift.shift_assignments
        };
      });

      // Combine available_shifts with converted scheduled_shifts
      const allShifts = [...(allAvailableShifts || []), ...scheduledAsAvailable];
      
      console.log('📊 Total shifts (available + unassigned scheduled):', allShifts.length);

      // Filter shifts by employee assignments
      const filteredShifts = allShifts.filter(shift => {
        // Check if shift is in assigned branches
        const branchMatch = assignedBranchIds.includes(shift.branch_id);
        
        // Check if shift type matches assigned shift types (if employee has specific types)
        const shiftTypeMatch = assignedShiftTypes.length === 0 || assignedShiftTypes.includes(shift.shift_type);
        
        // Check if day matches available days
        const dayMatch = availableDays.includes(shift.day_of_week);
        
        console.log(`🔍 Filtering shift ${shift.id} (${shift.source || 'available_shifts'}): branch(${shift.branch_id}): ${branchMatch}, type(${shift.shift_type}): ${shiftTypeMatch}, day(${shift.day_of_week}): ${dayMatch}`);
        
        return branchMatch && shiftTypeMatch && dayMatch;
      });

      console.log('✅ Shifts after filtering:', filteredShifts.length);

      shifts = filteredShifts;
      context = {
        type: 'available_shifts',
        title: 'משמרות זמינות לשבוע הקרוב',
        description: `נמצאו ${shifts.length} משמרות זמינות בסניפים ובמשמרות שאליהן אתה משויך`,
        weekStart,
        weekEnd: weekEndStr,
        filterInfo: {
          assignedBranches: assignedBranchIds.length,
          branchNames: employeeBranches.map(ba => ({ id: ba.branch_id, role: ba.role_name })),
          shiftTypes: assignedShiftTypes,
          availableDays: availableDays
        }
      };

      console.log('✅ Found', shifts.length, 'filtered available shifts for employee assignments');
    }

    // Get branches information for the employee
    const { data: branches, error: branchesError } = await supabaseAdmin
      .from('branches')
      .select('id, name, address')
      .eq('business_id', businessId)
      .in('id', employeeBranches?.map(ba => ba.branch_id) || [])
      .eq('is_active', true);

    if (branchesError) {
      console.error('❌ Error fetching branches:', branchesError);
    }

    // Also get scheduled shifts for this employee for the upcoming week
    const { data: scheduledShifts, error: scheduledError } = await supabaseAdmin
      .from('scheduled_shifts')
      .select(`
        *,
        branch:branches(id, name, address),
        employee:employees(id, first_name, last_name, phone)
      `)
      .eq('employee_id', employeeId)
      .gte('shift_date', context.weekStart || new Date().toISOString().split('T')[0])
      .lte('shift_date', context.weekEnd || new Date().toISOString().split('T')[0])
      .order('shift_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (scheduledError) {
      console.error('❌ Error fetching scheduled shifts:', scheduledError);
    }

    const response = {
      success: true,
      tokenData: {
        id: tokenData.id,
        token: tokenData.token,
        employeeId: tokenData.employee_id,
        isPermanent: true,
        employee: tokenData.employee,
        lastUsed: tokenData.last_used_at,
        usesCount: tokenData.uses_count
      },
      context,
      availableShifts: shifts,
      scheduledShifts: scheduledShifts || [],
      branches: branches || [],
      availableShiftsCount: shifts.length,
      scheduledShiftsCount: (scheduledShifts || []).length,
      employeeAssignments: employeeBranches || []
    };

    console.log('🎉 Successfully prepared shifts for permanent employee token');

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