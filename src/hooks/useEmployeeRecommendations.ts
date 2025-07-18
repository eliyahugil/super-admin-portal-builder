import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EmployeeRecommendation {
  employeeId: string;
  employeeName: string;
  phone?: string;
  matchScore: number;
  reasons: string[];
  warnings: string[];
  isHighPriority: boolean;
  branchMatch: boolean;
  shiftTypeMatch: boolean;
  availabilityMatch: boolean;
  weeklyHoursStatus: 'under' | 'normal' | 'over';
}

export interface ShiftRecommendationData {
  shiftId: string;
  shiftTime: string;
  date: string;
  branchId?: string;
  recommendations: EmployeeRecommendation[];
}

// Calculate employee recommendation score for a specific shift
const calculateEmployeeScore = (
  employee: any,
  shift: any,
  businessRules: any[],
  currentWeeklyHours: Record<string, number>
): EmployeeRecommendation => {
  let score = 0;
  const reasons: string[] = [];
  const warnings: string[] = [];

  // Parse employee preferences
  const preferences = employee.employee_default_preferences?.[0] || {};
  const branchAssignments = employee.employee_branch_assignments || [];
  
  // 1. Check shift type match (morning/evening preference)
  const shiftHour = parseInt(shift.start_time.split(':')[0]);
  const isMorningShift = shiftHour < 14;
  const isEveningShift = shiftHour >= 14;
  
  const preferredShiftTypes = preferences.shift_types || ['morning', 'evening'];
  const prefersThisShiftType = 
    (isMorningShift && preferredShiftTypes.includes('morning')) ||
    (isEveningShift && preferredShiftTypes.includes('evening'));
  
  const shiftTypeMatch = prefersThisShiftType;
  
  if (prefersThisShiftType) {
    score += 30;
    reasons.push(`✅ מעדיף משמרות ${isMorningShift ? 'בוקר' : 'ערב'}`);
  } else {
    warnings.push(`⚠️ לא מעדיף משמרות ${isMorningShift ? 'בוקר' : 'ערב'}`);
  }

  // 2. Check day availability 
  const shiftDayOfWeek = new Date(shift.date || shift.week_start_date).getDay();
  const availableDays = preferences.available_days || [0, 1, 2, 3, 4, 5, 6];
  const availabilityMatch = availableDays.includes(shiftDayOfWeek);
  
  if (availabilityMatch) {
    score += 25;
    reasons.push('✅ זמין ביום זה');
  } else {
    warnings.push('❌ לא זמין ביום זה');
  }

  // 3. Check branch assignment
  const shiftBranchId = shift.branch_id;
  const branchMatch = !shiftBranchId || branchAssignments.some((ba: any) => 
    ba.branch_id === shiftBranchId && ba.is_active
  );
  
  if (branchMatch && shiftBranchId) {
    score += 20;
    reasons.push('✅ משויך לסניף זה');
  } else if (!shiftBranchId) {
    score += 10;
    reasons.push('ℹ️ משמרת כללית (ללא סניף)');
  } else {
    warnings.push('⚠️ לא משויך לסניף זה');
  }

  // 4. Check weekly hours status
  const employeeWeeklyHours = currentWeeklyHours[employee.id] || 0;
  const requiredWeeklyHours = employee.weekly_hours_required || 40;
  const shiftDuration = calculateShiftDuration(shift.start_time, shift.end_time);
  const projectedHours = employeeWeeklyHours + shiftDuration;
  
  let weeklyHoursStatus: 'under' | 'normal' | 'over' = 'normal';
  
  if (projectedHours < requiredWeeklyHours) {
    weeklyHoursStatus = 'under';
    score += 15;
    reasons.push(`✅ צריך עוד ${requiredWeeklyHours - projectedHours} שעות השבוע`);
  } else if (projectedHours <= requiredWeeklyHours + 5) {
    weeklyHoursStatus = 'normal';
    score += 10;
    reasons.push('✅ כמות שעות תקינה');
  } else {
    weeklyHoursStatus = 'over';
    warnings.push(`⚠️ יחרוג ב-${projectedHours - requiredWeeklyHours} שעות`);
  }

  // 5. Check employee type preference
  if (employee.employee_type === 'regular') {
    score += 5;
    reasons.push('✅ עובד קבוע');
  }

  // Determine priority
  const isHighPriority = score >= 70 && warnings.length <= 1;

  return {
    employeeId: employee.id,
    employeeName: `${employee.first_name} ${employee.last_name || ''}`.trim(),
    phone: employee.phone,
    matchScore: Math.min(100, score),
    reasons,
    warnings,
    isHighPriority,
    branchMatch,
    shiftTypeMatch,
    availabilityMatch,
    weeklyHoursStatus
  };
};

// Calculate shift duration in hours
const calculateShiftDuration = (startTime: string, endTime: string): number => {
  const start = new Date(`1970-01-01T${startTime}`);
  const end = new Date(`1970-01-01T${endTime}`);
  const diffMs = end.getTime() - start.getTime();
  return diffMs / (1000 * 60 * 60); // Convert to hours
};

export const useEmployeeRecommendations = (businessId: string, weekStartDate: string) => {
  return useQuery({
    queryKey: ['employee-recommendations', businessId, weekStartDate],
    queryFn: async (): Promise<ShiftRecommendationData[]> => {
      console.log('🚀 Starting employee recommendations query:', { businessId, weekStartDate });
      
      // First, find the active token for this week and business
      // Check if the week falls within any active token's range
      const { data: activeToken, error: tokenError } = await supabase
        .from('shift_submission_tokens')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .lte('week_start_date', weekStartDate)
        .gte('week_end_date', weekStartDate)
        .single();

      console.log('🔍 Token query result:', { activeToken, tokenError });

      if (tokenError) {
        console.log('❌ No active token found for this week:', tokenError);
        // Try to find any token that might have submissions for this week
        const { data: fallbackToken, error: fallbackError } = await supabase
          .from('shift_submission_tokens')
          .select('*')
          .eq('business_id', businessId)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (fallbackError || !fallbackToken) {
          console.log('❌ No active tokens found at all');
          return [];
        }
        
        console.log('🔄 Using fallback token:', fallbackToken);
        
        // Use the fallback token for submissions but still filter by weekStartDate
        const { data: submissions, error: submissionsError } = await supabase
          .from('shift_submissions')
          .select(`
            employee_id,
            shifts,
            employees!inner(
              id,
              first_name,
              last_name,
              phone,
              employee_type,
              weekly_hours_required,
              employee_default_preferences(*),
              employee_branch_assignments(*)
            )
          `)
          .eq('week_start_date', fallbackToken.week_start_date);

        if (submissionsError) throw submissionsError;

        console.log('📋 Fallback submissions found:', submissions?.length || 0);
        console.log('📋 Fallback submissions data:', submissions);

        // Extract unique employees from submissions
        const employees = submissions?.map(sub => sub.employees).filter(Boolean) || [];
        
        console.log('👥 Employees from fallback submissions:', employees?.length || 0);
        
        
        // Process employees and shifts for fallback case
        const fallbackShifts = await supabase
          .from('available_shifts')
          .select('*')
          .eq('business_id', businessId)
          .eq('week_start_date', weekStartDate);

        if (fallbackShifts.error) throw fallbackShifts.error;

        const fallbackRules = await supabase
          .from('business_scheduling_rules')
          .select('*')
          .eq('business_id', businessId)
          .eq('is_active', true);

        if (fallbackRules.error) throw fallbackRules.error;

        const currentWeeklyHours: Record<string, number> = {};
        
        const fallbackRecommendations: ShiftRecommendationData[] = fallbackShifts.data.map(shift => {
          const employeeRecommendations = employees.map(employee => 
            calculateEmployeeScore(employee, shift, fallbackRules.data, currentWeeklyHours)
          );

          employeeRecommendations.sort((a, b) => b.matchScore - a.matchScore);

          return {
            shiftId: shift.id,
            shiftTime: `${shift.start_time}-${shift.end_time}`,
            date: shift.week_start_date,
            branchId: shift.branch_id,
            recommendations: employeeRecommendations.slice(0, 5)
          };
        });

        console.log('🎯 Fallback recommendations generated:', fallbackRecommendations.length);
        return fallbackRecommendations;
      }

      console.log('✅ Found active token:', activeToken);

      // Get all employees who submitted for this token by matching week dates
      const { data: submissions, error: submissionsError } = await supabase
        .from('shift_submissions')
        .select(`
          employee_id,
          shifts,
          employees!inner(
            id,
            first_name,
            last_name,
            phone,
            employee_type,
            weekly_hours_required,
            employee_default_preferences(*),
            employee_branch_assignments(*)
          )
        `)
        .eq('week_start_date', weekStartDate);

      if (submissionsError) throw submissionsError;

      console.log('📋 Submissions found:', submissions?.length || 0);
      console.log('📋 Submissions data:', submissions);

      // Extract unique employees from submissions
      const employees = submissions?.map(sub => sub.employees).filter(Boolean) || [];
      
      console.log('👥 Employees from submissions:', employees?.length || 0);

      // Fetch available shifts for the week
      const { data: shifts, error: shiftsError } = await supabase
        .from('available_shifts')
        .select('*')
        .eq('business_id', businessId)
        .eq('week_start_date', weekStartDate);

      if (shiftsError) throw shiftsError;

      console.log('📅 Available shifts found:', shifts?.length || 0);

      // Fetch business scheduling rules
      const { data: rules, error: rulesError } = await supabase
        .from('business_scheduling_rules')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true);

      if (rulesError) throw rulesError;

      // Calculate current weekly hours for each employee (simplified)
      // In a real implementation, this would query scheduled_shifts
      const currentWeeklyHours: Record<string, number> = {};
      
      // Generate recommendations for each shift
      const recommendations: ShiftRecommendationData[] = shifts.map(shift => {
        const employeeRecommendations = employees.map(employee => 
          calculateEmployeeScore(employee, shift, rules, currentWeeklyHours)
        );

        // Sort by match score (highest first)
        employeeRecommendations.sort((a, b) => b.matchScore - a.matchScore);

        console.log(`📊 Shift ${shift.start_time}-${shift.end_time}: ${employeeRecommendations.length} recommendations`);

        return {
          shiftId: shift.id,
          shiftTime: `${shift.start_time}-${shift.end_time}`,
          date: shift.week_start_date, // Simplified
          branchId: shift.branch_id,
          recommendations: employeeRecommendations.slice(0, 5) // Top 5 recommendations
        };
      });

      console.log('🎯 Total recommendations generated:', recommendations.length);

      return recommendations;
    },
    enabled: !!businessId && !!weekStartDate && businessId !== '',
  });
};