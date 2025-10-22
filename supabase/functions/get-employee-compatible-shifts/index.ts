
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

    // Enhanced time utility functions
    const timeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const minutesToTime = (minutes) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };

    // Enhanced shift containment logic
    const isShiftFullyContained = (innerShift, outerShift) => {
      const innerStart = timeToMinutes(innerShift.start_time);
      const innerEnd = timeToMinutes(innerShift.end_time);
      const outerStart = timeToMinutes(outerShift.start_time);
      const outerEnd = timeToMinutes(outerShift.end_time);
      
      return innerStart >= outerStart && innerEnd <= outerEnd;
    };

    // Enhanced overlap detection
    const shiftsOverlap = (shift1, shift2) => {
      const start1 = timeToMinutes(shift1.start_time);
      const end1 = timeToMinutes(shift1.end_time);
      const start2 = timeToMinutes(shift2.start_time);
      const end2 = timeToMinutes(shift2.end_time);
      
      return start1 < end2 && start2 < end1;
    };

    // Find shorter shifts within a time range
    const findShorterShiftsInRange = (availableShifts, startTime, endTime) => {
      const rangeStart = timeToMinutes(startTime);
      const rangeEnd = timeToMinutes(endTime);
      
      return availableShifts.filter(shift => {
        const shiftStart = timeToMinutes(shift.start_time);
        const shiftEnd = timeToMinutes(shift.end_time);
        
        // Check if shift is fully contained within the range
        const isContained = shiftStart >= rangeStart && shiftEnd <= rangeEnd;
        
        // Check if shift is shorter than the range
        const shiftDuration = shiftEnd - shiftStart;
        const rangeDuration = rangeEnd - rangeStart;
        const isShorter = shiftDuration < rangeDuration;
        
        return isContained && isShorter;
      });
    };

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

        // Sort shifts by start time for better processing
        regularCompatibleShifts.sort((a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time));

        // Enhanced auto-selection logic
        const autoSelectedShifts = [];
        const processedShifts = new Set();
        
        // Process submitted availability for this day
        submittedAvailability.forEach(submittedShift => {
          const shiftDate = new Date(submittedShift.date);
          const shiftDayOfWeek = shiftDate.getDay();
          
          if (shiftDayOfWeek === dayIndex) {
            console.log(`📅 Processing submitted availability for ${dayName}:`, submittedShift);
            
            // Create a virtual shift from submitted availability
            const virtualShift = {
              start_time: submittedShift.start_time,
              end_time: submittedShift.end_time,
              day_of_week: dayIndex
            };
            
            // Strategy 1: Find shorter shifts within the submitted time range
            const shorterShifts = findShorterShiftsInRange(
              regularCompatibleShifts.filter(s => !processedShifts.has(s.id)),
              virtualShift.start_time,
              virtualShift.end_time
            );
            
            if (shorterShifts.length > 0) {
              console.log(`🎯 Found ${shorterShifts.length} shorter shifts within range ${virtualShift.start_time}-${virtualShift.end_time}`);
              
              // Auto-select all shorter shifts within the range
              shorterShifts.forEach(shift => {
                if (!processedShifts.has(shift.id)) {
                  autoSelectedShifts.push({
                    ...shift,
                    autoSelected: true,
                    reason: `משמרת קצרה בתוך הזמינות ${virtualShift.start_time}-${virtualShift.end_time}`
                  });
                  processedShifts.add(shift.id);
                }
              });
            } else {
              // Strategy 2: Find shifts that are fully contained within the submitted availability
              const containedShifts = regularCompatibleShifts.filter(availableShift => {
                return !processedShifts.has(availableShift.id) && 
                       isShiftFullyContained(availableShift, virtualShift);
              });
              
              if (containedShifts.length > 0) {
                console.log(`📦 Found ${containedShifts.length} contained shifts`);
                containedShifts.forEach(shift => {
                  if (!processedShifts.has(shift.id)) {
                    autoSelectedShifts.push({
                      ...shift,
                      autoSelected: true,
                      reason: `נכלל בזמינות ${virtualShift.start_time}-${virtualShift.end_time}`
                    });
                    processedShifts.add(shift.id);
                  }
                });
              } else {
                // Strategy 3: Find overlapping shifts as fallback
                const overlappingShifts = regularCompatibleShifts.filter(availableShift => {
                  return !processedShifts.has(availableShift.id) && 
                         shiftsOverlap(availableShift, virtualShift);
                });
                
                if (overlappingShifts.length > 0) {
                  console.log(`🔄 Found ${overlappingShifts.length} overlapping shifts`);
                  overlappingShifts.forEach(shift => {
                    if (!processedShifts.has(shift.id)) {
                      autoSelectedShifts.push({
                        ...shift,
                        autoSelected: true,
                        reason: `חפיפה עם זמינות ${virtualShift.start_time}-${virtualShift.end_time}`
                      });
                      processedShifts.add(shift.id);
                    }
                  });
                }
              }
            }
          }
        });

        // Handle optional morning availability
        if (optionalMorningAvailability && optionalMorningAvailability.includes(dayIndex)) {
          const morningShifts = regularCompatibleShifts.filter(shift => {
            const startHour = parseInt(shift.start_time.split(':')[0]);
            return startHour >= 6 && startHour <= 12 && !processedShifts.has(shift.id);
          });
          
          morningShifts.forEach(shift => {
            if (!processedShifts.has(shift.id)) {
              autoSelectedShifts.push({
                ...shift,
                autoSelected: true,
                reason: 'זמין לבוקר (אופציונלי)'
              });
              processedShifts.add(shift.id);
            }
          });
        }

        console.log(`📊 Day ${dayName}: ${regularCompatibleShifts.length} compatible, ${autoSelectedShifts.length} auto-selected`);

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

    console.log('🎉 Successfully prepared compatible shifts with enhanced auto-selection');

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
