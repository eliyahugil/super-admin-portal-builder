
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

    console.log('🔍 Getting compatible shifts for token:', token);

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Validate token and get employee information
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('employee_weekly_tokens')
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
      .gt('expires_at', new Date().toISOString())
      .single();

    if (tokenError) {
      console.error('❌ Token validation error:', tokenError);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const businessId = tokenData.business_id;
    const employeeId = tokenData.employee_id;
    const weekStart = tokenData.week_start_date;
    const weekEnd = tokenData.week_end_date;

    console.log('✅ Token validated for employee:', employeeId, 'business:', businessId);

    // Get employee's branch assignments and preferences
    const { data: employeeBranches, error: branchError } = await supabaseAdmin
      .from('employee_branch_assignments')
      .select('branch_id, shift_types, available_days, role_name')
      .eq('employee_id', employeeId)
      .eq('is_active', true);

    if (branchError) {
      console.error('❌ Error fetching employee branches:', branchError);
      throw branchError;
    }

    // Get employee's previous submissions
    const { data: previousSubmissions, error: submissionError } = await supabaseAdmin
      .from('shift_submissions')
      .select('shifts, notes, optional_morning_availability')
      .eq('employee_id', employeeId)
      .eq('week_start_date', weekStart)
      .eq('week_end_date', weekEnd)
      .order('submitted_at', { ascending: false })
      .limit(1);

    if (submissionError) {
      console.error('❌ Error fetching previous submissions:', submissionError);
    }

    // Parse submitted availability
    let submittedAvailability = [];
    let optionalMorningAvailability = null;
    
    if (previousSubmissions && previousSubmissions.length > 0) {
      try {
        const shifts = typeof previousSubmissions[0].shifts === 'string' 
          ? JSON.parse(previousSubmissions[0].shifts) 
          : previousSubmissions[0].shifts;
        submittedAvailability = shifts || [];
        optionalMorningAvailability = previousSubmissions[0].optional_morning_availability;
      } catch (e) {
        console.error('Error parsing submitted shifts:', e);
      }
    }

    const daysOfWeek = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    let shiftsByDay = {};
    let totalCompatibleShifts = 0;
    let totalSpecialShifts = 0;

    if (!employeeBranches || employeeBranches.length === 0) {
      console.log('⚠️ No branch assignments found for employee');
      
      // Initialize empty days
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const dayName = daysOfWeek[dayIndex];
        shiftsByDay[dayName] = {
          dayIndex,
          dayName,
          shifts: [],
          compatibleShifts: [],
          autoSelectedShifts: [],
          specialShifts: []
        };
      }
    } else {
      // Extract branch IDs and shift types from assignments
      const assignedBranchIds = employeeBranches.map(ba => ba.branch_id);
      const assignedShiftTypes = [...new Set(employeeBranches.flatMap(ba => ba.shift_types || []))];
      const availableDays = [...new Set(employeeBranches.flatMap(ba => ba.available_days || []))];

      console.log('🏢 Employee assigned to branches:', assignedBranchIds);
      console.log('⏰ Employee shift types:', assignedShiftTypes);
      console.log('📅 Employee available days:', availableDays);

      // Get all available shifts for the business and week
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

      // Process each day
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const dayName = daysOfWeek[dayIndex];
        const dayShifts = (allAvailableShifts || []).filter(shift => shift.day_of_week === dayIndex);
        
        // Filter shifts by employee assignments
        const compatibleDayShifts = dayShifts.filter(shift => {
          const branchMatch = assignedBranchIds.includes(shift.branch_id);
          const shiftTypeMatch = assignedShiftTypes.includes(shift.shift_type);
          const dayMatch = availableDays.includes(shift.day_of_week);
          return branchMatch && shiftTypeMatch && dayMatch;
        });

        // Separate regular and special shifts
        const regularCompatibleShifts = compatibleDayShifts.filter(shift => 
          shift.shift_type !== 'special' && shift.shift_type !== 'emergency'
        );
        
        const specialCompatibleShifts = compatibleDayShifts.filter(shift => 
          shift.shift_type === 'special' || shift.shift_type === 'emergency'
        );

        // Auto-select shifts based on submitted availability
        const autoSelectedShifts = [];
        
        // Check if employee submitted availability for this day
        submittedAvailability.forEach(submittedShift => {
          const shiftDate = new Date(submittedShift.date);
          const shiftDayOfWeek = shiftDate.getDay();
          
          if (shiftDayOfWeek === dayIndex) {
            // Find shifts that overlap with employee's available time
            const availableShifts = regularCompatibleShifts.filter(availableShift => {
              const submittedStart = submittedShift.start_time;
              const submittedEnd = submittedShift.end_time;
              const availableStart = availableShift.start_time;
              const availableEnd = availableShift.end_time;
              
              // Check if there's any overlap between submitted availability and available shift
              return (
                (availableStart >= submittedStart && availableStart < submittedEnd) ||
                (availableEnd > submittedStart && availableEnd <= submittedEnd) ||
                (submittedStart >= availableStart && submittedStart < availableEnd) ||
                (submittedEnd > availableStart && submittedEnd <= availableEnd)
              );
            });
            
            availableShifts.forEach(shift => {
              if (!autoSelectedShifts.find(s => s.id === shift.id)) {
                autoSelectedShifts.push({
                  ...shift,
                  autoSelected: true,
                  reason: `זמין ${submittedShift.start_time}-${submittedShift.end_time}`
                });
              }
            });
          }
        });

        // Handle optional morning availability
        if (optionalMorningAvailability && dayIndex < 5) { // Weekdays only
          const morningShifts = regularCompatibleShifts.filter(shift => {
            const startHour = parseInt(shift.start_time.split(':')[0]);
            return startHour >= 6 && startHour <= 12; // Morning shifts
          });
          
          morningShifts.forEach(shift => {
            if (!autoSelectedShifts.find(s => s.id === shift.id)) {
              autoSelectedShifts.push({
                ...shift,
                autoSelected: true,
                reason: 'זמין לבוקר (אופציונלי)'
              });
            }
          });
        }

        shiftsByDay[dayName] = {
          dayIndex,
          dayName,
          shifts: dayShifts,
          compatibleShifts: regularCompatibleShifts,
          autoSelectedShifts: autoSelectedShifts,
          specialShifts: specialCompatibleShifts
        };

        totalCompatibleShifts += regularCompatibleShifts.length;
        totalSpecialShifts += specialCompatibleShifts.length;
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
      shiftsByDay,
      totalCompatibleShifts,
      totalSpecialShifts,
      employeeAssignments: employeeBranches || [],
      submittedAvailability: submittedAvailability,
      optionalMorningAvailability: optionalMorningAvailability
    };

    console.log('🎉 Successfully prepared compatible shifts by day');

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
