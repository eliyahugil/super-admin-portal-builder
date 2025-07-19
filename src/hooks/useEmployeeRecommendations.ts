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

  console.log(`\n🧮 מחשב ציון לעובד: ${employee.first_name} ${employee.last_name || ''} למשמרת ${shift.start_time}-${shift.end_time}`);

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
    score += 50; // הכי הרבה נקודות לסוג משמרת!
    reasons.push(`✅ מעדיף משמרות ${isMorningShift ? 'בוקר' : 'ערב'} (+50)`);
    console.log(`  ✅ סוג משמרת: +50 נקודות (מעדיף ${isMorningShift ? 'בוקר' : 'ערב'})`);
  } else {
    warnings.push(`⚠️ לא מעדיף משמרות ${isMorningShift ? 'בוקר' : 'ערב'} (+0)`);
    console.log(`  ❌ סוג משמרת: +0 נקודות (לא מעדיף ${isMorningShift ? 'בוקר' : 'ערב'})`);
  }

  // 2. Check branch assignment (עדיפות גבוהה!)
  const shiftBranchId = shift.branch_id;
  const branchMatch = !shiftBranchId || branchAssignments.some((ba: any) => 
    ba.branch_id === shiftBranchId && ba.is_active
  );
  
  if (branchMatch && shiftBranchId) {
    score += 35; // עדיפות גבוהה לסניף מוקצה
    reasons.push('✅ משויך לסניף זה (+35)');
    console.log(`  ✅ סניף: +35 נקודות (משויך לסניף)`);
  } else if (!shiftBranchId) {
    score += 20; // משמרת כללית
    reasons.push('ℹ️ משמרת כללית (+20)');
    console.log(`  ℹ️ סניף: +20 נקודות (משמרת כללית)`);
  } else {
    warnings.push('⚠️ לא משויך לסניף זה (+0)');
    console.log(`  ❌ סניף: +0 נקודות (לא משויך לסניף זה)`);
  }

  // 3. Check day availability 
  const shiftDayOfWeek = new Date(shift.shift_date || shift.date).getDay();
  const availableDays = preferences.available_days || [0, 1, 2, 3, 4, 5, 6];
  const availabilityMatch = availableDays.includes(shiftDayOfWeek);
  
  if (availabilityMatch) {
    score += 20;
    reasons.push('✅ זמין ביום זה (+20)');
    console.log(`  ✅ זמינות יום: +20 נקודות (זמין ביום ${shiftDayOfWeek})`);
  } else {
    warnings.push('❌ לא זמין ביום זה (+0)');
    console.log(`  ❌ זמינות יום: +0 נקודות (לא זמין ביום ${shiftDayOfWeek})`);
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
    reasons.push(`✅ צריך עוד ${requiredWeeklyHours - projectedHours} שעות השבוע (+15)`);
    console.log(`  ✅ שעות שבועיות: +15 נקודות (צריך עוד ${requiredWeeklyHours - projectedHours} שעות)`);
  } else if (projectedHours <= requiredWeeklyHours + 5) {
    weeklyHoursStatus = 'normal';
    score += 10;
    reasons.push('✅ כמות שעות תקינה (+10)');
    console.log(`  ✅ שעות שבועיות: +10 נקודות (כמות תקינה)`);
  } else {
    weeklyHoursStatus = 'over';
    warnings.push(`⚠️ יחרוג ב-${projectedHours - requiredWeeklyHours} שעות (+0)`);
    console.log(`  ❌ שעות שבועיות: +0 נקודות (יחרוג ב-${projectedHours - requiredWeeklyHours} שעות)`);
  }

  // 5. Check employee type preference
  if (employee.employee_type === 'regular') {
    score += 5;
    reasons.push('✅ עובד קבוע (+5)');
    console.log(`  ✅ סוג עובד: +5 נקודות (עובד קבוע)`);
  } else {
    console.log(`  ℹ️ סוג עובד: +0 נקודות (לא קבוע)`);
  }

  console.log(`  🎯 ציון סופי: ${Math.min(100, score)} נקודות`);

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
      
      // פשוט נקח את כל העובדים הפעילים של העסק
      const { data: allEmployees, error: employeesError } = await supabase
        .from('employees')
        .select(`
          *,
          employee_default_preferences(*),
          employee_branch_assignments(*)
        `)
        .eq('business_id', businessId)
        .eq('is_active', true)
        .eq('is_archived', false);

      if (employeesError) throw employeesError;
      
      const employees = allEmployees || [];
      console.log('👥 Active employees found:', employees.length);
      
      // נמצא את כל ההגשות הקיימות כדי ליצור משמרות מהן
      const { data: latestSubmissions, error: submissionsError } = await supabase
        .from('shift_submissions')
        .select(`
          employee_id,
          shifts,
          week_start_date,
          submission_type,
          employees!inner(
            id,
            first_name,
            last_name
          )
        `)
        .eq('employees.business_id', businessId)
        .order('week_start_date', { ascending: false })
        .limit(50);

      if (submissionsError) throw submissionsError;
      
      console.log('📋 Latest submissions found:', latestSubmissions?.length || 0);

      // Find shifts from submissions that need assignment
      const weekEndDate = new Date(new Date(weekStartDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      console.log('🔍 Looking for shifts between:', weekStartDate, 'and', weekEndDate);

      // Get all unique shifts from submissions
      const allSubmissionShifts: any[] = [];
      if (latestSubmissions && latestSubmissions.length > 0) {
        latestSubmissions.forEach(submission => {
          if (submission.shifts && Array.isArray(submission.shifts)) {
            submission.shifts.forEach((shift: any) => {
              // קח משמרות מכל השבועות, לא רק מהשבוע הנוכחי
              allSubmissionShifts.push({
                ...shift,
                id: `${shift.date}-${shift.start_time}-${shift.end_time}-${shift.branch_id || 'default'}`,
                shift_date: shift.date,
                start_time: shift.start_time,
                end_time: shift.end_time,
                branch_id: shift.branch_id
              });
            });
          }
        });
      }

      // Remove duplicates by creating unique shift identifier
      const uniqueShiftsMap = new Map();
      allSubmissionShifts.forEach(shift => {
        const key = `${shift.shift_date}-${shift.start_time}-${shift.end_time}-${shift.branch_id || 'default'}`;
        if (!uniqueShiftsMap.has(key)) {
          uniqueShiftsMap.set(key, shift);
        }
      });

      const shifts = Array.from(uniqueShiftsMap.values());
      console.log('📅 Unique shifts found from submissions:', shifts.length);
      
      if (shifts.length > 0) {
        console.log('🔍 Sample shifts:', shifts.slice(0, 3).map(s => ({
          date: s.shift_date,
          time: `${s.start_time}-${s.end_time}`,
          branch: s.branch_id
        })));
      }

      // Fetch business scheduling rules
      const { data: rules, error: rulesError } = await supabase
        .from('business_scheduling_rules')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true);

      if (rulesError) throw rulesError;

      // Calculate current weekly hours for each employee (simplified)
      const currentWeeklyHours: Record<string, number> = {};
      
      // Generate recommendations for each shift
      const recommendations: ShiftRecommendationData[] = shifts.map(shift => {
        const employeeRecommendations = employees.map(employee => 
          calculateEmployeeScore(employee, shift, rules, currentWeeklyHours)
        );

        // Sort by match score (highest first) and filter out low scores
        employeeRecommendations.sort((a, b) => b.matchScore - a.matchScore);
        const validRecommendations = employeeRecommendations.filter(rec => rec.matchScore >= 30);

        console.log(`📊 Shift ${shift.start_time}-${shift.end_time}: ${validRecommendations.length} valid recommendations`);
        
        // הדפסת פרטי ההמלצות לדיבוג
        if (validRecommendations.length > 0) {
          console.log(`🔍 Top recommendations for ${shift.start_time}-${shift.end_time}:`, 
            validRecommendations.slice(0, 3).map(r => ({
              name: r.employeeName,
              score: r.matchScore,
              reasons: r.reasons,
              warnings: r.warnings
            }))
          );
        }

        return {
          shiftId: shift.id,
          shiftTime: `${shift.start_time}-${shift.end_time}`,
          date: shift.shift_date,
          branchId: shift.branch_id,
          recommendations: validRecommendations.slice(0, 5) // Top 5 valid recommendations
        };
      });

      console.log('🎯 Total recommendations generated:', recommendations.length);
      console.log('🎯 Total recommendations with valid candidates:', recommendations.filter(r => r.recommendations.length > 0).length);

      return recommendations;
    },
    enabled: !!businessId && !!weekStartDate && businessId !== '',
  });
};