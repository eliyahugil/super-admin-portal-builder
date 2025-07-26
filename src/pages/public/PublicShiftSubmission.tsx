import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { usePublicShifts } from '@/hooks/usePublicShifts';
import { PublicShiftForm, ShiftPreference } from '@/types/publicShift';
import { format, startOfWeek, addDays } from 'date-fns';
import { he } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Calendar, Clock, User } from 'lucide-react';

const PublicShiftSubmission: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const { useToken, submitShifts } = usePublicShifts();
  const { data: tokenData, isLoading: tokenLoading, error: tokenError } = useToken(token || '');
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [scheduledShifts, setScheduledShifts] = useState<any[]>([]);
  const [allScheduledShifts, setAllScheduledShifts] = useState<any[]>([]);
  const [shiftsLoading, setShiftsLoading] = useState(false);
  const [showSpecialShifts, setShowSpecialShifts] = useState<boolean>(false);

  const [formData, setFormData] = useState<PublicShiftForm>({
    employee_name: '',
    phone: '',
    preferences: [],
    notes: '',
  });

  const [submitted, setSubmitted] = useState(false);

  // Load employee data when token data is available
  useEffect(() => {
    const loadEmployeeData = async () => {
      if (tokenData?.employee_id) {
        setEmployeeLoading(true);
        try {
          const { data: employee, error } = await supabase
            .from('employees')
            .select('*, employee_branch_assignments(*), employee_default_preferences(*)')
            .eq('id', tokenData.employee_id)
            .single();

          if (error) {
            console.error('Error loading employee data:', error);
            return;
          }

          if (employee) {
            console.log('👤 Loaded employee data:', employee);
            setEmployeeData(employee);
            
            // Pre-fill form with employee data
            setFormData(prev => ({
              ...prev,
              employee_name: `${employee.first_name} ${employee.last_name}`,
              phone: employee.phone || '',
            }));
          }
        } catch (error) {
          console.error('Error in loadEmployeeData:', error);
        } finally {
          setEmployeeLoading(false);
        }
      }
    };

    loadEmployeeData();
  }, [tokenData?.employee_id]);

  // Load scheduled shifts
  useEffect(() => {
    const loadScheduledShifts = async () => {
      if (tokenData) {
        setShiftsLoading(true);
        try {
          console.log('🔍 Loading shifts for token:', tokenData);
          
          const { data: shifts, error } = await supabase
            .from('scheduled_shifts')
            .select(`
              *,
              branch:branches(name),
              shift_assignments
            `)
            .eq('business_id', tokenData.business_id)
            .gte('shift_date', tokenData.week_start_date)
            .lte('shift_date', tokenData.week_end_date)
            .order('shift_date')
            .order('start_time');

          if (error) {
            console.error('Error loading shifts:', error);
            return;
          }

          console.log('📅 Raw shifts loaded:', shifts?.length || 0);

        console.log('👤 Employee data:', {
          id: employeeData?.id,
          name: `${employeeData?.first_name} ${employeeData?.last_name}`,
          branchAssignments: employeeData?.employee_branch_assignments?.length || 0,
          defaultPreferences: employeeData?.employee_default_preferences?.length || 0
        });

        // Filter shifts based on employee's branch assignments and shift type preferences
        let filteredShifts = shifts || [];
        console.log('🔍 Starting with shifts count:', filteredShifts.length);
        
        if (employeeData?.employee_branch_assignments && employeeData.employee_branch_assignments.length > 0) {
          console.log('📍 Employee has branch assignments:', employeeData.employee_branch_assignments);
          
          // Get employee's assigned branch IDs
          const assignedBranchIds = employeeData.employee_branch_assignments
            .filter(assignment => assignment.is_active)
            .map(assignment => assignment.branch_id);
          
          console.log('📍 Active assigned branch IDs:', assignedBranchIds);
          
          // Get employee's preferred shift types from assignments
          const preferredShiftTypes = employeeData.employee_branch_assignments
            .filter(assignment => assignment.is_active && assignment.shift_types)
            .flatMap(assignment => assignment.shift_types || []);
          
          console.log('⏰ Preferred shift types from assignments:', preferredShiftTypes);
          
          // Filter shifts by assigned branches
          if (assignedBranchIds.length > 0) {
            const beforeBranchFilter = filteredShifts.length;
            filteredShifts = filteredShifts.filter(shift => 
              assignedBranchIds.includes(shift.branch_id)
            );
            console.log(`📍 After branch filter: ${beforeBranchFilter} → ${filteredShifts.length} shifts`);
            console.log('📍 Remaining shifts after branch filter:', filteredShifts.map(s => ({
              id: s.id,
              branch_id: s.branch_id,
              branch_name: s.branch?.name,
              role: s.role
            })));
          }
          
        // Filter shifts by preferred shift types if available
        if (preferredShiftTypes.length > 0) {
          const beforeTypeFilter = filteredShifts.length;
          filteredShifts = filteredShifts.filter(shift => {
            const shiftType = getShiftTypeFromTime(shift.start_time);
            let isIncluded = preferredShiftTypes.includes(shiftType);
            
            // Special logic: evening workers should also see afternoon shifts (14:00-18:00)
            if (!isIncluded && preferredShiftTypes.includes('evening')) {
              const hour = parseInt(shift.start_time.split(':')[0]);
              if (hour >= 14) { // Include all shifts from 14:00 onwards for evening workers
                isIncluded = true;
              }
            }
            
            console.log(`⏰ Shift ${shift.id} (${shift.start_time}) → type: ${shiftType}, included: ${isIncluded}`);
            return isIncluded;
          });
          console.log(`⏰ After shift type filter: ${beforeTypeFilter} → ${filteredShifts.length} shifts`);
          console.log('⏰ Final filtered shifts:', filteredShifts.map(s => ({
            id: s.id,
            start_time: s.start_time,
            type: getShiftTypeFromTime(s.start_time),
            branch_name: s.branch?.name
          })));
        }
        } else if (employeeData?.employee_default_preferences && employeeData.employee_default_preferences.length > 0) {
          // Use default preferences if no branch assignments
          const defaultPrefs = employeeData.employee_default_preferences[0];
          const preferredShiftTypes = defaultPrefs.shift_types || [];
          
          console.log('⏰ Using default preferences, preferred shift types:', preferredShiftTypes);
          
          if (preferredShiftTypes.length > 0) {
            const beforeTypeFilter = filteredShifts.length;
            filteredShifts = filteredShifts.filter(shift => {
              const shiftType = getShiftTypeFromTime(shift.start_time);
              let isIncluded = preferredShiftTypes.includes(shiftType);
              
              // Special logic: evening workers should also see afternoon shifts (14:00-18:00)
              if (!isIncluded && preferredShiftTypes.includes('evening')) {
                const hour = parseInt(shift.start_time.split(':')[0]);
                if (hour >= 14) { // Include all shifts from 14:00 onwards for evening workers
                  isIncluded = true;
                }
              }
              
              console.log(`⏰ Shift ${shift.id} (${shift.start_time}) → type: ${shiftType}, included: ${isIncluded}`);
              return isIncluded;
            });
            console.log(`⏰ After default shift type filter: ${beforeTypeFilter} → ${filteredShifts.length} shifts`);
          }
        }
        
        // Add branch info and sort shifts with enhanced prioritization
        const shiftsWithBranchInfo = filteredShifts.map(shift => {
          // Determine if this is the employee's main branch
          let isMainBranch = false;
          if (employeeData?.employee_branch_assignments && employeeData.employee_branch_assignments.length > 0) {
            const activeAssignments = employeeData.employee_branch_assignments.filter(assignment => assignment.is_active);
            if (activeAssignments.length > 0) {
              // Find main branch (highest priority - lowest priority_order number)
              const mainAssignment = activeAssignments
                .sort((a, b) => a.priority_order - b.priority_order)[0];
              isMainBranch = shift.branch_id === mainAssignment.branch_id;
            }
          }
          
          return {
            ...shift,
            isMainBranch
          };
        }).sort((a, b) => {
          // Priority 1: Main branch shifts first
          if (a.isMainBranch && !b.isMainBranch) return -1;
          if (!a.isMainBranch && b.isMainBranch) return 1;
          
          // Priority 2: Sort by date
          if (a.shift_date !== b.shift_date) {
            return a.shift_date.localeCompare(b.shift_date);
          }
          
          // Priority 3: Sort by shift type priority (morning first, then evening)
          const getShiftTypeOrder = (startTime: string) => {
            const hour = parseInt(startTime.split(':')[0]);
            if (hour >= 6 && hour < 14) return 1; // Morning
            if (hour >= 14) return 2; // Evening
            return 3; // Night
          };
          
          const aOrder = getShiftTypeOrder(a.start_time);
          const bOrder = getShiftTypeOrder(b.start_time);
          if (aOrder !== bOrder) {
            return aOrder - bOrder;
          }
          
          // Priority 4: Finally sort by start time
          return a.start_time.localeCompare(b.start_time);
        });
        
        // Store all shifts and filtered shifts separately
        setAllScheduledShifts(shifts || []);
        setScheduledShifts(shiftsWithBranchInfo);
        } catch (error) {
          console.error('Error loading scheduled shifts:', error);
        } finally {
          setShiftsLoading(false);
        }
      }
    };

    if (tokenData && employeeData) {
      loadScheduledShifts();
    }
  }, [tokenData, employeeData]);

  const getShiftTypeFromTime = (startTime: string) => {
    const hour = parseInt(startTime.split(':')[0]);
    if (hour >= 6 && hour < 14) return 'morning';
    if (hour >= 14) return 'evening';  // Evening starts from 14:00
    return 'evening'; // Late shifts also count as evening
  };

  // Check if two shifts overlap (same start time for automatic selection)
  const shiftsOverlap = (selectedShift: any, otherShift: any) => {
    const timeToMinutes = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const selectedStart = timeToMinutes(selectedShift.start_time);
    const otherStart = timeToMinutes(otherShift.start_time);
    
    console.log(`🔍 Checking if ${otherShift.start_time} starts at same time as ${selectedShift.start_time}`);
    
    // Auto-select if shifts start at exactly the same time (overlapping shifts)
    const hasSameStartTime = selectedStart === otherStart;
    
    console.log(`🔍 Selected start: ${selectedStart}, Other start: ${otherStart}, Same start time: ${hasSameStartTime}`);
    
    return hasSameStartTime;
  };

  // Get shifts that are not normally available to this employee
  const getSpecialShifts = () => {
    if (!employeeData || !allScheduledShifts.length) return [];
    
    // Get employee's assigned branch IDs
    let assignedBranchIds: string[] = [];
    let mainBranchId: string | null = null;
    
    if (employeeData.employee_branch_assignments && employeeData.employee_branch_assignments.length > 0) {
      const activeAssignments = employeeData.employee_branch_assignments.filter((assignment: any) => assignment.is_active);
      assignedBranchIds = activeAssignments.map((assignment: any) => assignment.branch_id);
      
      // Find main branch (highest priority - lowest priority_order number)
      const mainAssignment = activeAssignments
        .sort((a: any, b: any) => a.priority_order - b.priority_order)[0];
      mainBranchId = mainAssignment?.branch_id || null;
    }
    
    // Get employee's preferred shift types
    let preferredTypes: string[] = [];
    
    if (employeeData.employee_branch_assignments && employeeData.employee_branch_assignments.length > 0) {
      preferredTypes = employeeData.employee_branch_assignments
        .filter((assignment: any) => assignment.is_active && assignment.shift_types)
        .flatMap((assignment: any) => assignment.shift_types || []);
    } else if (employeeData.employee_default_preferences && employeeData.employee_default_preferences.length > 0) {
      preferredTypes = employeeData.employee_default_preferences[0].shift_types || [];
    }
    
    console.log('🎯 Employee preferred types:', preferredTypes);
    console.log('🎯 Employee assigned branches:', assignedBranchIds);
    console.log('🎯 Employee main branch:', mainBranchId);
    
    const getShiftTypeFromTime = (startTime: string) => {
      const hour = parseInt(startTime.split(':')[0]);
      if (hour >= 6 && hour < 14) return 'morning';
      if (hour >= 14) return 'evening';  // Evening starts from 14:00
      return 'evening'; // Late shifts also count as evening
    };
    
    // Filter shifts that are NOT in the employee's preferred types AND are in assigned branches
    let specialShifts = allScheduledShifts.filter(shift => {
      const shiftType = getShiftTypeFromTime(shift.start_time);
      const isSpecialType = !preferredTypes.includes(shiftType);
      const isAssignedBranch = assignedBranchIds.length === 0 || assignedBranchIds.includes(shift.branch_id);
      
      console.log(`🎯 Shift ${shift.id} (${shift.start_time}) type ${shiftType} - Special type: ${isSpecialType}, Assigned branch: ${isAssignedBranch}`);
      return isSpecialType && isAssignedBranch;
    });
    
    // Sort by main branch first, then by time
    specialShifts.sort((a, b) => {
      // Main branch first
      if (a.branch_id === mainBranchId && b.branch_id !== mainBranchId) return -1;
      if (a.branch_id !== mainBranchId && b.branch_id === mainBranchId) return 1;
      
      // Then by date
      if (a.shift_date !== b.shift_date) {
        return a.shift_date.localeCompare(b.shift_date);
      }
      
      // Finally by time
      return a.start_time.localeCompare(b.start_time);
    });
    
    console.log('🎯 Special shifts found:', specialShifts.length);
    return specialShifts;
  };

  const handleShiftToggle = (shift: any, isSelected: boolean) => {
    setFormData(prev => {
      let newPreferences = [...prev.preferences];
      
      if (isSelected) {
        console.log(`🎯 Toggling shift:`, { shift, currentAvailable: !isSelected });
        
        // Find and auto-select shifts that overlap with this shift (same start time)
        // Only when selecting a shift (not when deselecting)
        console.log(`🎯 Looking for overlapping shifts for selected shift: ${shift.start_time} on ${shift.shift_date}`);
        
        console.log(`🔍 All shifts on same date:`, allScheduledShifts.filter(s => s.shift_date === shift.shift_date).map(s => ({ id: s.id, start_time: s.start_time, branch_id: s.branch_id, branch_name: s.branch?.name })));
        
        const overlappingShifts = allScheduledShifts.filter(otherShift => {
          const isNotSameShift = otherShift.id !== shift.id;
          const isSameDate = otherShift.shift_date === shift.shift_date;
          const doesOverlap = shiftsOverlap(shift, otherShift);
          const isNotAlreadySelected = !newPreferences.some((p: any) => p.shift_id === otherShift.id);
          
          console.log(`🔍 Checking shift ${otherShift.id} (${otherShift.start_time}) in branch ${otherShift.branch?.name}:`, {
            isNotSameShift,
            isSameDate,
            doesOverlap,
            isNotAlreadySelected
          });
          
          return isNotSameShift && isSameDate && doesOverlap && isNotAlreadySelected;
        });

        console.log(`🔍 Found ${overlappingShifts.length} overlapping shifts on same date`);

        // Add the main shift
        const newShift: ShiftPreference = {
          shift_id: shift.id,
          shift_date: shift.shift_date,
          start_time: shift.start_time,
          end_time: shift.end_time,
          role: shift.role,
          branch_name: shift.branch?.name,
          available: true,
        };
        newPreferences.push(newShift);

        // Add overlapping shifts
        overlappingShifts.forEach(overlappingShift => {
          const overlappingPref = {
            shift_id: overlappingShift.id,
            shift_date: overlappingShift.shift_date,
            start_time: overlappingShift.start_time,
            end_time: overlappingShift.end_time,
            role: overlappingShift.role,
            branch_name: overlappingShift.branch?.name,
            available: true,
          };
          newPreferences.push(overlappingPref);
        });

        // Show toast if overlapping shifts were auto-selected
        if (overlappingShifts.length > 0) {
          toast({
            title: 'משמרות חופפות נבחרו אוטומטית! 🎯',
            description: `נבחרו ${overlappingShifts.length} משמרות נוספות באותו זמן התחלה (${shift.start_time}) בסניפים שונים`,
          });
        }
      } else {
        // Remove shift from preferences
        newPreferences = newPreferences.filter((p: any) => p.shift_id !== shift.id);
      }

      return { ...prev, preferences: newPreferences };
    });
  };

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    return days[date.getDay()];
  };

  const getDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.preferences.length === 0) {
      toast({
        title: 'שגיאה',
        description: 'אנא בחר לפחות משמרת אחת',
        variant: 'destructive',
      });
      return;
    }

    try {
      await submitShifts.mutateAsync({
        tokenId: token!,
        formData
      });
      
      setSubmitted(true);
      toast({
        title: 'הגשה בוצעה בהצלחה! ✅',
        description: 'המשמרות שלך נשלחו למערכת',
      });
    } catch (error) {
      console.error('Error submitting shifts:', error);
      toast({
        title: 'שגיאה בהגשה',
        description: 'אירעה שגיאה בעת שליחת המשמרות. אנא נסה שוב.',
        variant: 'destructive',
      });
    }
  };

  if (tokenLoading || employeeLoading || shiftsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">טוען נתונים...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (tokenError || !tokenData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600 flex items-center justify-center gap-2">
              <XCircle className="h-5 w-5" />
              טוקן לא תקין
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600">
              הטוקן שסופק אינו תקין או שפג תוקפו. אנא פנה למנהל המערכת לקבלת טוקן חדש.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-green-600 flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5" />
              הגשה בוצעה בהצלחה!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600 mb-4">
              המשמרות שלך נשלחו בהצלחה למערכת. תודה על ההגשה!
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">המשמרות שנבחרו:</h3>
              <div className="space-y-2">
                {formData.preferences.map((pref, index) => (
                  <div key={index} className="text-sm text-blue-800">
                    📅 {getDayName(pref.shift_date)} {getDateDisplay(pref.shift_date)} - 
                    🕐 {pref.start_time.substring(0,5)}-{pref.end_time.substring(0,5)}
                    {pref.branch_name && ` 📍 ${pref.branch_name}`}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">הגשת משמרות אישית</h1>
            {employeeData && (
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h2 className="text-lg font-semibold text-blue-900">
                  שלום {employeeData.first_name} {employeeData.last_name}!
                </h2>
                <p className="text-sm text-blue-700">
                  סוג עובד: {employeeData.employee_type || 'עובד כללי'}
                </p>
                <p className="text-sm text-blue-600">
                  שבוע {format(new Date(tokenData.week_start_date), 'd/M')} - {format(new Date(tokenData.week_end_date), 'd/M')}
                </p>
              </div>
            )}
            <p className="text-gray-600">
              אנא בחר את המשמרות המתאימות לך לשבוע זה
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="employee_name">שם מלא</Label>
                <Input
                  id="employee_name"
                  value={formData.employee_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, employee_name: e.target.value }))}
                  placeholder="הכנס את שמך המלא"
                  required
                  disabled={!!employeeData} // Disable if loaded from employee data
                />
              </div>

              <div>
                <Label htmlFor="phone">מספר טלפון</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="הכנס מספר טלפון"
                  disabled={!!employeeData} // Disable if loaded from employee data
                />
              </div>

              <div>
                <Label>בחירת משמרות</Label>
                
                {/* Special Shifts Checkbox */}
                {getSpecialShifts().length > 0 && (
                  <div className="flex items-center space-x-2 justify-center mt-3 mb-4 bg-yellow-50 p-4 rounded-lg border border-yellow-300">
                    <Checkbox 
                      id="special-shifts"
                      checked={showSpecialShifts}
                      onCheckedChange={(checked) => setShowSpecialShifts(checked as boolean)}
                    />
                    <label htmlFor="special-shifts" className="text-sm font-semibold text-yellow-800 cursor-pointer">
                      ⭐ הצג משמרות מיוחדות ({getSpecialShifts().length} זמינות)
                    </label>
                    <div className="text-xs text-yellow-700">
                      משמרות שאינן בסוג המשמרת הרגיל שלך
                    </div>
                  </div>
                )}
                
                {scheduledShifts.length > 0 ? (
                  <div className="space-y-3 mt-2">
                    <p className="text-sm text-gray-600">
                      המשמרות הבאות זמינות להגשה עבור השבוע שנבחר. אנא בחר את המשמרות שאתה מעוניין לעבוד:
                    </p>
                    
                    {/* Desktop Layout */}
                    <div className="hidden md:block">
                      <div className="space-y-6">
                        {(() => {
                          const weekStart = new Date(tokenData.week_start_date);
                          return Array.from({ length: 7 }, (_, i) => {
                            const currentDate = new Date(weekStart);
                            currentDate.setDate(weekStart.getDate() + i);
                            const dateStr = currentDate.toISOString().split('T')[0];
                            const dayShifts = scheduledShifts.filter(shift => shift.shift_date === dateStr);
                            
                            if (dayShifts.length === 0) return null;
                            
                            // Group shifts by type (morning/evening) and sort within each group
                            let morningShifts = dayShifts.filter(shift => {
                              const hour = parseInt(shift.start_time.split(':')[0]);
                              return hour >= 6 && hour < 14;
                            });
                            let eveningShifts = dayShifts.filter(shift => {
                              const hour = parseInt(shift.start_time.split(':')[0]);
                              return hour >= 14; // All shifts from 14:00 onwards are evening
                            });
                            
                            // Sort each group: main branch first, then by time
                            const sortShifts = (shifts: any[]) => {
                              return shifts.sort((a, b) => {
                                // Main branch first
                                if (a.isMainBranch && !b.isMainBranch) return -1;
                                if (!a.isMainBranch && b.isMainBranch) return 1;
                                // Then by time
                                return a.start_time.localeCompare(b.start_time);
                              });
                            };
                            
                            morningShifts = sortShifts(morningShifts);
                            eveningShifts = sortShifts(eveningShifts);

                            return (
                              <div key={dateStr} className="border-2 border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md">
                                {/* Day Header */}
                                <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-4 rounded-t-lg">
                                  <div className="flex items-center justify-center gap-2">
                                    <div className="text-xl font-bold">{getDayName(dateStr)}</div>
                                    <div className="text-base opacity-90">{getDateDisplay(dateStr)}</div>
                                  </div>
                                </div>
                                
                                {/* Shifts Grid */}
                                <div className="grid grid-cols-2 gap-4 p-6">
                                  {/* Morning Shifts */}
                                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                    <div className="text-base font-semibold text-orange-700 mb-4 flex items-center gap-2">
                                      🌅 משמרות בוקר וצהריים
                                    </div>
                                    <div className="space-y-3">
                                      {morningShifts.map(shift => {
                                        const currentPreference = formData.preferences.find(
                                          (p: any) => p.shift_id === shift.id
                                        );
                                        const isSelected = currentPreference?.available;
                                        
                                        return (
                                          <div 
                                            key={shift.id}
                                            className={`p-4 rounded-lg border text-sm cursor-pointer transition-all shadow-sm ${
                                              isSelected 
                                                ? 'bg-green-100 border-green-400 text-green-800 ring-2 ring-green-300' 
                                                : 'bg-white border-gray-300 hover:bg-blue-50 hover:border-blue-400 hover:shadow-md'
                                            }`}
                                         onClick={() => handleShiftToggle(shift, !isSelected)}
                                       >
                                             <div className="font-semibold text-base">
                                               {shift.start_time.substring(0,5)}-{shift.end_time.substring(0,5)}
                                             </div>
                                           {shift.branch?.name && (
                                             <div className="text-blue-600 flex items-center gap-1 mt-1">
                                               📍 {shift.branch.name}
                                               {shift.isMainBranch && (
                                                 <span className="text-orange-600 font-semibold text-xs">(סניף עיקרי)</span>
                                               )}
                                             </div>
                                           )}
                                           {shift.role && (
                                             <div className="text-gray-500 text-xs mt-1">תפקיד: {shift.role}</div>
                                           )}
                                          {isSelected && (
                                            <div className="text-green-700 font-bold mt-2">✓ נבחר</div>
                                          )}
                                       </div>
                                     );
                                   })}
                                      {morningShifts.length === 0 && (
                                        <div className="text-sm text-gray-500 p-4 text-center italic">אין משמרות בוקר זמינות</div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Evening Shifts */}
                                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                    <div className="text-base font-semibold text-purple-700 mb-4 flex items-center gap-2">
                                      🌆 משמרות ערב ולילה
                                    </div>
                                    <div className="space-y-3">
                                      {eveningShifts.map(shift => {
                                        const currentPreference = formData.preferences.find(
                                          (p: any) => p.shift_id === shift.id
                                        );
                                        const isSelected = currentPreference?.available;
                                        
                                        return (
                                          <div 
                                            key={shift.id}
                                            className={`p-4 rounded-lg border text-sm cursor-pointer transition-all shadow-sm ${
                                              isSelected 
                                                ? 'bg-green-100 border-green-400 text-green-800 ring-2 ring-green-300' 
                                                : 'bg-white border-gray-300 hover:bg-blue-50 hover:border-blue-400 hover:shadow-md'
                                            }`}
                                         onClick={() => handleShiftToggle(shift, !isSelected)}
                                       >
                                             <div className="font-semibold text-base">
                                               {shift.start_time.substring(0,5)}-{shift.end_time.substring(0,5)}
                                             </div>
                                           {shift.branch?.name && (
                                             <div className="text-blue-600 flex items-center gap-1 mt-1">
                                               📍 {shift.branch.name}
                                               {shift.isMainBranch && (
                                                 <span className="text-orange-600 font-semibold text-xs">(סניף עיקרי)</span>
                                               )}
                                             </div>
                                           )}
                                           {shift.role && (
                                             <div className="text-gray-500 text-xs mt-1">תפקיד: {shift.role}</div>
                                           )}
                                          {isSelected && (
                                            <div className="text-green-700 font-bold mt-2">✓ נבחר</div>
                                          )}
                                       </div>
                                     );
                                   })}
                                      {eveningShifts.length === 0 && (
                                        <div className="text-sm text-gray-500 p-4 text-center italic">אין משמרות ערב זמינות</div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          }).filter(Boolean);
                        })()}
                      </div>
                    </div>

                    {/* Mobile Layout */}
                    <div className="md:hidden">
                      <div className="space-y-4">
                        {scheduledShifts.map(shift => {
                          const currentPreference = formData.preferences.find(
                            (p: any) => p.shift_id === shift.id
                          );
                          const isSelected = currentPreference?.available;
                          
                          return (
                            <div 
                              key={shift.id}
                              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                isSelected 
                                  ? 'bg-green-100 border-green-400 text-green-800' 
                                  : 'bg-white border-gray-300 hover:bg-blue-50'
                              }`}
                              onClick={() => handleShiftToggle(shift, !isSelected)}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-semibold">
                                    {getDayName(shift.shift_date)} {getDateDisplay(shift.shift_date)}
                                  </div>
                                  <div className="text-sm">
                                    {shift.start_time.substring(0,5)}-{shift.end_time.substring(0,5)}
                                  </div>
                                  {shift.branch?.name && (
                                    <div className="text-xs text-blue-600">📍 {shift.branch.name}</div>
                                  )}
                                  {shift.role && (
                                    <div className="text-xs text-gray-500">תפקיד: {shift.role}</div>
                                  )}
                                </div>
                                {isSelected && (
                                  <div className="text-green-600 font-bold">✓</div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>אין משמרות זמינות עבור השבוע הזה</p>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="notes">הערות נוספות (אופציונלי)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="הכנס הערות או בקשות מיוחדות"
                  rows={3}
                />
              </div>
            </div>

            {formData.preferences.length > 0 && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-900 mb-2">
                  המשמרות שנבחרו ({formData.preferences.length}):
                </h3>
                <div className="space-y-2">
                  {formData.preferences.map((pref, index) => (
                    <div key={index} className="text-sm text-green-800 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      📅 {getDayName(pref.shift_date)} {getDateDisplay(pref.shift_date)} - 
                      🕐 {pref.start_time.substring(0,5)}-{pref.end_time.substring(0,5)}
                      {pref.branch_name && ` 📍 ${pref.branch_name}`}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button 
              type="submit"
              className="w-full"
              disabled={submitShifts.isPending || formData.preferences.length === 0}
            >
              {submitShifts.isPending ? 'שולח...' : 'שלח הגשת משמרות'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PublicShiftSubmission;