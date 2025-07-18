import { supabase } from '@/integrations/supabase/client';

interface ShiftRequirement {
  id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  shift_type: 'morning' | 'afternoon' | 'evening' | 'night';
  branch_id?: string;
  branch_name?: string;
  required_employees: number;
  current_assignments: number;
  is_special: boolean;
  role_requirements?: string[];
}

interface EmployeePreference {
  employee_id: string;
  available_days: number[];
  shift_types: string[];
  max_weekly_hours: number;
  branch_preferences?: string[];
  priority_score: number;
}

interface SchedulingResult {
  success: boolean;
  assignments: {
    shift_id: string;
    employee_id: string;
    confidence_score: number;
    reasoning: string;
  }[];
  conflicts: {
    shift_id: string;
    issue: string;
    suggestions: string[];
  }[];
  statistics: {
    total_shifts: number;
    assigned_shifts: number;
    coverage_percentage: number;
    employee_satisfaction_score: number;
  };
}

export class SmartSchedulingAlgorithm {
  private businessId: string;
  private employees: any[] = [];
  private shifts: ShiftRequirement[] = [];
  private preferences: Map<string, EmployeePreference> = new Map();
  
  constructor(businessId: string) {
    this.businessId = businessId;
  }

  async loadData(weekStartDate: string, weekEndDate: string) {
    console.log('🔄 טוען נתונים לאלגוריתם החכם...');
    
    // טעינת עובדים
    const { data: employeesData, error: employeesError } = await supabase
      .from('employees')
      .select(`
        *,
        employee_branch_assignments!inner(
          branch_id,
          role_name,
          available_days,
          shift_types,
          max_weekly_hours,
          priority_order
        )
      `)
      .eq('business_id', this.businessId)
      .eq('is_active', true);

    if (employeesError) throw employeesError;
    this.employees = employeesData || [];

    // טעינת משמרות נדרשות
    const { data: shiftsData, error: shiftsError } = await supabase
      .from('available_shifts')
      .select(`
        *,
        branches(name)
      `)
      .eq('business_id', this.businessId)
      .gte('week_start_date', weekStartDate)
      .lte('week_end_date', weekEndDate);

    if (shiftsError) throw shiftsError;

    this.shifts = (shiftsData || []).map(shift => ({
      id: shift.id,
      shift_date: this.calculateShiftDate(shift.week_start_date, shift.day_of_week),
      start_time: shift.start_time,
      end_time: shift.end_time,
      shift_type: shift.shift_type as any,
      branch_id: shift.branch_id,
      branch_name: shift.branches?.name,
      required_employees: shift.required_employees || 1,
      current_assignments: shift.current_assignments || 0,
      is_special: shift.shift_name?.includes('מיוחד') || false,
    }));

    // בניית העדפות עובדים
    this.buildEmployeePreferences();
    
    console.log(`✅ נטענו ${this.employees.length} עובדים ו-${this.shifts.length} משמרות`);
  }

  private calculateShiftDate(weekStart: string, dayOfWeek: number): string {
    const startDate = new Date(weekStart);
    const shiftDate = new Date(startDate);
    shiftDate.setDate(startDate.getDate() + dayOfWeek);
    return shiftDate.toISOString().split('T')[0];
  }

  private buildEmployeePreferences() {
    this.employees.forEach(employee => {
      const assignments = employee.employee_branch_assignments || [];
      
      if (assignments.length > 0) {
        // השתמש בהגדרות ספציפיות לסניף
        const primaryAssignment = assignments[0];
        this.preferences.set(employee.id, {
          employee_id: employee.id,
          available_days: primaryAssignment.available_days || [0,1,2,3,4,5,6],
          shift_types: primaryAssignment.shift_types || ['morning', 'evening'],
          max_weekly_hours: primaryAssignment.max_weekly_hours || 40,
          branch_preferences: assignments.map(a => a.branch_id).filter(Boolean),
          priority_score: this.calculatePriorityScore(employee, primaryAssignment)
        });
      } else {
        // השתמש בהגדרות ברירת מחדל
        this.preferences.set(employee.id, {
          employee_id: employee.id,
          available_days: [0,1,2,3,4,5,6],
          shift_types: ['morning', 'evening'],
          max_weekly_hours: 40,
          priority_score: 0.5
        });
      }
    });
  }

  private calculatePriorityScore(employee: any, assignment: any): number {
    let score = 0.5; // ציון בסיס
    
    // ציון לפי ותק
    if (employee.hire_date) {
      const yearsOfService = (Date.now() - new Date(employee.hire_date).getTime()) / (365 * 24 * 60 * 60 * 1000);
      score += Math.min(yearsOfService * 0.1, 0.3);
    }
    
    // ציון לפי עדיפות בסניף
    if (assignment.priority_order) {
      score += (3 - assignment.priority_order) * 0.1;
    }
    
    // ציון לפי גמישות בסוגי משמרות
    if (assignment.shift_types?.length > 2) {
      score += 0.1;
    }
    
    return Math.min(score, 1.0);
  }

  async generateSchedule(algorithmType: 'basic' | 'advanced' | 'ai_optimized' = 'advanced'): Promise<SchedulingResult> {
    console.log(`🤖 מתחיל אלגוריתם ${algorithmType} לסידור משמרות...`);
    
    const assignments: SchedulingResult['assignments'] = [];
    const conflicts: SchedulingResult['conflicts'] = [];
    const employeeHours = new Map<string, number>();
    const employeeShifts = new Map<string, string[]>();

    // אתחול מעקב שעות עובדים
    this.employees.forEach(emp => {
      employeeHours.set(emp.id, 0);
      employeeShifts.set(emp.id, []);
    });

    // מיון משמרות לפי עדיפות (משמרות מיוחדות קודם, אחר כך לפי זמן)
    const sortedShifts = [...this.shifts].sort((a, b) => {
      if (a.is_special !== b.is_special) {
        return a.is_special ? -1 : 1;
      }
      return new Date(`${a.shift_date} ${a.start_time}`).getTime() - 
             new Date(`${b.shift_date} ${b.start_time}`).getTime();
    });

    for (const shift of sortedShifts) {
      const assignmentsNeeded = shift.required_employees - shift.current_assignments;
      if (assignmentsNeeded <= 0) continue;

      const candidates = this.findBestCandidates(shift, employeeHours, employeeShifts, algorithmType);
      
      let assigned = 0;
      for (const candidate of candidates) {
        if (assigned >= assignmentsNeeded) break;
        
        const employee = this.employees.find(e => e.id === candidate.employee_id);
        if (!employee) continue;

        const shiftHours = this.calculateShiftHours(shift.start_time, shift.end_time);
        const currentHours = employeeHours.get(employee.id) || 0;
        const maxHours = this.preferences.get(employee.id)?.max_weekly_hours || 40;

        if (currentHours + shiftHours <= maxHours) {
          assignments.push({
            shift_id: shift.id,
            employee_id: employee.id,
            confidence_score: candidate.score,
            reasoning: candidate.reasoning
          });

          employeeHours.set(employee.id, currentHours + shiftHours);
          const employeeShiftsList = employeeShifts.get(employee.id) || [];
          employeeShiftsList.push(shift.id);
          employeeShifts.set(employee.id, employeeShiftsList);
          
          assigned++;
        } else {
          conflicts.push({
            shift_id: shift.id,
            issue: `עובד ${employee.first_name} ${employee.last_name} יחרוג ממכסת השעות השבועית`,
            suggestions: [`חפש עובד חלופי`, `צמצם שעות משמרות אחרות`]
          });
        }
      }

      if (assigned < assignmentsNeeded) {
        conflicts.push({
          shift_id: shift.id,
          issue: `לא נמצאו מספיק עובדים זמינים (דרושים ${assignmentsNeeded}, נמצאו ${assigned})`,
          suggestions: [
            'הוסף עובדים נוספים',
            'שנה דרישות המשמרת',
            'פצל המשמרת למספר משמרות קטנות יותר'
          ]
        });
      }
    }

    const statistics = this.calculateStatistics(assignments);
    
    console.log(`✅ אלגוריתם הסתיים: ${assignments.length} שיוכים, ${conflicts.length} קונפליקטים`);
    
    return {
      success: conflicts.length === 0,
      assignments,
      conflicts,
      statistics
    };
  }

  private findBestCandidates(
    shift: ShiftRequirement, 
    employeeHours: Map<string, number>,
    employeeShifts: Map<string, string[]>,
    algorithmType: string
  ) {
    const candidates: Array<{employee_id: string, score: number, reasoning: string}> = [];
    const shiftDayOfWeek = new Date(shift.shift_date).getDay();

    for (const employee of this.employees) {
      const prefs = this.preferences.get(employee.id);
      if (!prefs) continue;

      let score = 0;
      let reasoning: string[] = [];

      // בדיקת זמינות בסיסית
      if (!prefs.available_days.includes(shiftDayOfWeek)) {
        continue; // עובד לא זמין ביום זה
      }

      if (!prefs.shift_types.includes(shift.shift_type)) {
        continue; // עובד לא זמין לסוג משמרת זה
      }

      // ציון בסיס לפי עדיפות עובד
      score += prefs.priority_score * 30;
      reasoning.push(`עדיפות עובד: ${(prefs.priority_score * 100).toFixed(0)}%`);

      // בדיקת התאמת סניף
      if (shift.branch_id && prefs.branch_preferences?.includes(shift.branch_id)) {
        score += 20;
        reasoning.push('מועדף לסניף זה');
      } else if (shift.branch_id && prefs.branch_preferences && !prefs.branch_preferences.includes(shift.branch_id)) {
        score -= 10;
        reasoning.push('לא מועדף לסניף זה');
      }

      // איזון עומס עבודה
      const currentHours = employeeHours.get(employee.id) || 0;
      const averageHours = Array.from(employeeHours.values()).reduce((a, b) => a + b, 0) / employeeHours.size;
      if (currentHours < averageHours) {
        score += 15;
        reasoning.push('עומס עבודה נמוך יחסית');
      } else if (currentHours > averageHours * 1.2) {
        score -= 15;
        reasoning.push('עומס עבודה גבוה יחסית');
      }

      // בדיקת קונפליקטים זמניים
      const employeeShiftsList = employeeShifts.get(employee.id) || [];
      const hasTimeConflict = employeeShiftsList.some(shiftId => {
        const existingShift = this.shifts.find(s => s.id === shiftId);
        return existingShift && this.isTimeConflict(shift, existingShift);
      });

      if (hasTimeConflict) {
        continue; // עובד עסוק באותו זמן
      }

      // בונוס למשמרות מיוחדות עבור עובדים מנוסים
      if (shift.is_special && prefs.priority_score > 0.7) {
        score += 25;
        reasoning.push('מתאים למשמרות מיוחדות');
      }

      // אלגוריתם מתקדם - התחשבות נוספת
      if (algorithmType === 'advanced' || algorithmType === 'ai_optimized') {
        // בדיקת רצף ימי עבודה
        const workDaysThisWeek = this.countWorkDaysInWeek(employee.id, shift.shift_date, employeeShifts);
        if (workDaysThisWeek >= 6) {
          score -= 20;
          reasoning.push('עובד רבות השבוע');
        } else if (workDaysThisWeek <= 2) {
          score += 10;
          reasoning.push('מעט משמרות השבוע');
        }
      }

      if (score > 0) {
        candidates.push({
          employee_id: employee.id,
          score,
          reasoning: reasoning.join(', ')
        });
      }
    }

    // מיון לפי ציון (גבוה לנמוך)
    return candidates.sort((a, b) => b.score - a.score);
  }

  private isTimeConflict(shift1: ShiftRequirement, shift2: ShiftRequirement): boolean {
    if (shift1.shift_date !== shift2.shift_date) return false;
    
    const start1 = this.timeToMinutes(shift1.start_time);
    const end1 = this.timeToMinutes(shift1.end_time);
    const start2 = this.timeToMinutes(shift2.start_time);
    const end2 = this.timeToMinutes(shift2.end_time);
    
    return !(end1 <= start2 || end2 <= start1);
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private calculateShiftHours(startTime: string, endTime: string): number {
    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);
    return (end - start) / 60;
  }

  private countWorkDaysInWeek(employeeId: string, shiftDate: string, employeeShifts: Map<string, string[]>): number {
    const shiftsList = employeeShifts.get(employeeId) || [];
    const weekStart = new Date(shiftDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    
    return shiftsList.filter(shiftId => {
      const shift = this.shifts.find(s => s.id === shiftId);
      if (!shift) return false;
      
      const shiftDateObj = new Date(shift.shift_date);
      const diffDays = Math.floor((shiftDateObj.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays < 7;
    }).length;
  }

  private calculateStatistics(assignments: SchedulingResult['assignments']): SchedulingResult['statistics'] {
    const totalShifts = this.shifts.length;
    const assignedShifts = assignments.length;
    const coveragePercentage = totalShifts > 0 ? (assignedShifts / totalShifts) * 100 : 0;
    
    // חישוב ציון שביעות רצון עובדים (ממוצע ציוני ביטחון)
    const satisfactionScore = assignments.length > 0 
      ? assignments.reduce((sum, a) => sum + a.confidence_score, 0) / assignments.length 
      : 0;

    return {
      total_shifts: totalShifts,
      assigned_shifts: assignedShifts,
      coverage_percentage: Math.round(coveragePercentage),
      employee_satisfaction_score: Math.round(satisfactionScore)
    };
  }

  async saveSchedule(assignments: SchedulingResult['assignments']): Promise<void> {
    console.log('💾 שומר סידור חדש למסד הנתונים...');
    
    const scheduledShifts = assignments.map(assignment => {
      const shift = this.shifts.find(s => s.id === assignment.shift_id);
      const employee = this.employees.find(e => e.id === assignment.employee_id);
      
      return {
        business_id: this.businessId,
        employee_id: assignment.employee_id,
        shift_date: shift?.shift_date,
        start_time: shift?.start_time,
        end_time: shift?.end_time,
        branch_id: shift?.branch_id,
        shift_type: shift?.shift_type,
        notes: `אוטומטי: ${assignment.reasoning}`,
        is_approved: true,
        created_by: null // יעודכן על ידי המערכת
      };
    });

    const { error } = await supabase
      .from('scheduled_shifts')
      .insert(scheduledShifts);

    if (error) {
      console.error('❌ שגיאה בשמירת הסידור:', error);
      throw error;
    }

    console.log(`✅ נשמרו ${scheduledShifts.length} משמרות חדשות`);
  }
}