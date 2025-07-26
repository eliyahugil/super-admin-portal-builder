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

          setEmployeeData(employee);
          // Auto-fill employee data
          setFormData(prev => ({
            ...prev,
            employee_name: `${employee.first_name} ${employee.last_name}`,
            phone: employee.phone || '',
          }));
        } catch (error) {
          console.error('Error loading employee data:', error);
        } finally {
          setEmployeeLoading(false);
        }
      }
    };

    loadEmployeeData();
  }, [tokenData]);

  // Load scheduled shifts for the token's date range
  useEffect(() => {
    const loadScheduledShifts = async () => {
      if (!tokenData?.business_id || !tokenData?.week_start_date || !tokenData?.week_end_date || !employeeData) return;
      
      setShiftsLoading(true);
      try {
        const { data: shifts, error } = await supabase
          .from('scheduled_shifts')
          .select(`
            id,
            shift_date,
            start_time,
            end_time,
            role,
            employee_id,
            branch_id,
            status,
            branch:branches(id, name)
          `)
          .eq('business_id', tokenData.business_id)
          .gte('shift_date', tokenData.week_start_date)
          .lte('shift_date', tokenData.week_end_date)
          .eq('is_archived', false)
          .is('employee_id', null) // Only unassigned shifts
          .order('shift_date', { ascending: true })
          .order('start_time', { ascending: true });

        if (error) {
          console.error('Error loading scheduled shifts:', error);
          return;
        }

        console.log('🕐 Raw shifts from database:', shifts?.map(s => ({
          id: s.id,
          start_time: s.start_time,
          end_time: s.end_time,
          display: `${s.start_time}-${s.end_time}`
        })));

        // Helper function to determine shift type based on start time
        const getShiftTypeFromTime = (startTime: string) => {
          const hour = parseInt(startTime.split(':')[0]);
          if (hour >= 6 && hour < 14) return 'morning';
          if (hour >= 14) return 'evening';  // Evening starts from 14:00
          return 'evening'; // Late shifts also count as evening
        };

        console.log('👤 Employee data:', {
          id: employeeData.id,
          name: `${employeeData.first_name} ${employeeData.last_name}`,
          branchAssignments: employeeData.employee_branch_assignments?.length || 0,
          defaultPreferences: employeeData.employee_default_preferences?.length || 0
        });

        // Filter shifts based on employee's branch assignments and shift type preferences
        let filteredShifts = shifts || [];
        console.log('🔍 Starting with shifts count:', filteredShifts.length);
        
        if (employeeData.employee_branch_assignments && employeeData.employee_branch_assignments.length > 0) {
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
        }
        } else if (employeeData.employee_default_preferences && employeeData.employee_default_preferences.length > 0) {
          console.log('⚙️ Using default preferences:', employeeData.employee_default_preferences[0]);
          
          // Fallback to default preferences if no branch assignments
          const defaultPrefs = employeeData.employee_default_preferences[0];
          if (defaultPrefs.shift_types && defaultPrefs.shift_types.length > 0) {
            const beforeTypeFilter = filteredShifts.length;
            filteredShifts = filteredShifts.filter(shift => {
              const shiftType = getShiftTypeFromTime(shift.start_time);
              let isIncluded = defaultPrefs.shift_types.includes(shiftType);
              
              // Special logic: evening workers should also see afternoon shifts (14:00-18:00)
              if (!isIncluded && defaultPrefs.shift_types.includes('evening')) {
                const hour = parseInt(shift.start_time.split(':')[0]);
                if (hour >= 14) { // Include all shifts from 14:00 onwards for evening workers
                  isIncluded = true;
                }
              }
              
              console.log(`⏰ Default filter - Shift ${shift.id} (${shift.start_time}) → type: ${shiftType}, included: ${isIncluded}`);
              return isIncluded;
            });
            console.log(`⏰ After default shift type filter: ${beforeTypeFilter} → ${filteredShifts.length} shifts`);
          }
        } else {
          console.log('⚠️ No branch assignments or default preferences found - showing all shifts');
        }

         console.log('📊 Loaded scheduled shifts for token:', shifts?.length || 0);
         console.log('📊 All shifts details:', shifts?.map(s => ({
           id: s.id, 
           date: s.shift_date, 
            time: `${s.start_time}-${s.end_time}`,
           status: s.status,
           employee_id: s.employee_id,
           role: s.role,
           branch: s.branch?.name
         })));
         console.log('📊 Filtered shifts for employee:', filteredShifts.length);
         console.log('📊 Final filtered shifts:', filteredShifts);
         
         // Get main branch ID for marking primary branch
         let mainBranchId: string | null = null;
         if (employeeData.employee_branch_assignments && employeeData.employee_branch_assignments.length > 0) {
           const activeAssignments = employeeData.employee_branch_assignments.filter((assignment: any) => assignment.is_active);
           // Sort by priority to get main branch (lowest priority_order number = highest priority)
           const mainAssignment = activeAssignments
             .sort((a: any, b: any) => (a.priority_order || 999) - (b.priority_order || 999))[0];
           mainBranchId = mainAssignment?.branch_id || null;
         }
         
         // Add main branch indicator to filtered shifts and sort properly
         const shiftsWithBranchInfo = filteredShifts.map(shift => ({
           ...shift,
           isMainBranch: mainBranchId === shift.branch_id
         }));
         
         // Enhanced sorting: main branch first, then by date, then by start time
         shiftsWithBranchInfo.sort((a, b) => {
           // Priority 1: Main branch shifts come first
           if (mainBranchId) {
             const aIsMain = a.branch_id === mainBranchId;
             const bIsMain = b.branch_id === mainBranchId;
             if (aIsMain && !bIsMain) return -1;
             if (!aIsMain && bIsMain) return 1;
           }
           
           // Priority 2: Then sort by branch name (for consistent ordering of non-main branches)
           const branchComparison = (a.branch?.name || '').localeCompare(b.branch?.name || '');
           if (branchComparison !== 0) return branchComparison;
           
           // Priority 3: Then sort by date
           if (a.shift_date !== b.shift_date) {
             return a.shift_date.localeCompare(b.shift_date);
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
    };

    loadScheduledShifts();
  }, [tokenData, employeeData]);

  // Helper function to check if shifts overlap and should be auto-selected
  const shiftsOverlap = (selectedShift: any, otherShift: any) => {
    if (selectedShift.shift_date !== otherShift.shift_date) return false;
    
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
      // Main branch shifts come first
      if (mainBranchId) {
        const aIsMain = a.branch_id === mainBranchId;
        const bIsMain = b.branch_id === mainBranchId;
        if (aIsMain && !bIsMain) return -1;
        if (!aIsMain && bIsMain) return 1;
      }
      
      // Then sort by date and time
      if (a.shift_date !== b.shift_date) {
        return a.shift_date.localeCompare(b.shift_date);
      }
      return a.start_time.localeCompare(b.start_time);
    });
    
    // Add main branch indicator
    return specialShifts.map(shift => ({
      ...shift,
      isMainBranch: mainBranchId === shift.branch_id
    }));
  };

  const handleShiftToggle = (shift: any, available: boolean) => {
    console.log(`🎯 Toggling shift ${shift.id}: ${available}`);
    
    setFormData(prev => {
      let newPreferences = prev.preferences.filter(
        (p: any) => p.shift_id !== shift.id
      );

      if (available) {
        // Add the main shift
        const newShift = {
          shift_id: shift.id,
          shift_date: shift.shift_date,
          start_time: shift.start_time,
          end_time: shift.end_time,
          role: shift.role,
          branch_name: shift.branch?.name,
          available: true,
        };
        newPreferences.push(newShift);

        // Find and auto-select shifts that are contained within this shift's time window
        // Only from branches the employee is assigned to
        const employeeAssignedBranches = employeeData?.employee_branch_assignments
          ?.filter((assignment: any) => assignment.is_active)
          ?.map((assignment: any) => assignment.branch_id) || [];
        
        const overlappingShifts = allScheduledShifts.filter(otherShift => 
          otherShift.id !== shift.id && 
          otherShift.shift_date === shift.shift_date && // Same date
          (employeeAssignedBranches.length === 0 || employeeAssignedBranches.includes(otherShift.branch_id)) && // Only assigned branches
          shiftsOverlap(shift, otherShift) &&
          !newPreferences.some((p: any) => p.shift_id === otherShift.id)
        );

        console.log(`🔍 Employee assigned branches:`, employeeAssignedBranches);
        console.log(`🔍 Found ${overlappingShifts.length} overlapping shifts on same date from assigned branches`);

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
    
    if (!tokenData) return;

    if (!formData.employee_name.trim()) {
      toast({
        title: 'שגיאה',
        description: 'יש להזין שם מלא',
        variant: 'destructive',
      });
      return;
    }

    if (formData.preferences.length === 0) {
      toast({
        title: 'שגיאה', 
        description: 'יש לבחור לפחות משמרת אחת',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('🚀 Attempting to submit shifts:', {
        tokenId: tokenData.id,
        formData,
        preferencesCount: formData.preferences.length
      });
      
      await submitShifts.mutateAsync({
        tokenId: tokenData.id,
        formData,
      });

      setSubmitted(true);
      toast({
        title: 'הגשה בוצעה בהצלחה!',
        description: 'המשמרות שלך נשלחו לאישור',
      });
    } catch (error) {
      console.error('Error submitting shifts:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בשליחת המשמרות',
        variant: 'destructive',
      });
    }
  };

  if (tokenLoading || employeeLoading || shiftsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>טוען נתונים...</p>
        </div>
      </div>
    );
  }

  const isTokenValid = tokenData && 
    new Date(tokenData.expires_at) > new Date() &&
    tokenData.is_active;

  if (tokenError || !isTokenValid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center text-center p-6">
            <XCircle className="h-16 w-16 text-red-500 mb-4" />
            <h1 className="text-xl font-bold mb-2">קישור לא תקף</h1>
            <p className="text-gray-600">
              הקישור פג תוקף או אינו תקף. אנא פנה למנהל המשמרות.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center text-center p-6">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h1 className="text-xl font-bold mb-2">ההגשה בוצעה בהצלחה!</h1>
            <p className="text-gray-600">
              המשמרות שלך נשלחו לאישור. תקבל עדכון בהקדם.
            </p>
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
                    {/* Weekly Schedule Grid */}
                    <div className="bg-white border rounded-lg overflow-hidden">
                      {/* Grid Layout for Desktop */}
                      <div className="hidden md:block">
                        {/* Header */}
                        <div className="grid grid-cols-8 bg-blue-50 border-b">
                          <div className="p-3 text-sm font-semibold text-gray-700 text-center border-l">יום</div>
                          <div className="p-3 text-sm font-semibold text-gray-700 text-center border-l col-span-7">משמרות</div>
                        </div>
                        
                        {/* Week Days */}
                        {(() => {
                          const weekStart = new Date(tokenData.week_start_date);
                          const days = [];
                          for (let i = 0; i < 7; i++) {
                            const currentDate = new Date(weekStart);
                            currentDate.setDate(weekStart.getDate() + i);
                            const dateStr = currentDate.toISOString().split('T')[0];
                            const dayShifts = scheduledShifts.filter(shift => shift.shift_date === dateStr);
                            
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

                             days.push(
                               <div key={dateStr} className="border-b-2 border-gray-300 bg-gradient-to-r from-blue-50 to-indigo-50 mb-4 rounded-lg shadow-sm">
                                 {/* Day Header - Full Width */}
                                 <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-4 rounded-t-lg">
                                   <div className="flex items-center justify-center gap-2">
                                     <div className="text-lg font-bold">{getDayName(dateStr)}</div>
                                     <div className="text-sm opacity-90">{getDateDisplay(dateStr)}</div>
                                   </div>
                                 </div>
                                 
                                 {/* Shifts Grid */}
                                 <div className="grid grid-cols-2 gap-4 p-4">
                                
                                   {/* Morning Shifts */}
                                   <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                     <div className="text-sm font-semibold text-orange-700 mb-3 flex items-center gap-2">
                                       🌅 משמרות בוקר וצהריים
                                     </div>
                                     <div className="space-y-2">
                                       {morningShifts.map(shift => {
                                         const currentPreference = formData.preferences.find(
                                           (p: any) => p.shift_id === shift.id
                                         );
                                         const isSelected = currentPreference?.available;
                                         
                                         return (
                                           <div 
                                             key={shift.id}
                                             className={`p-3 rounded-lg border text-sm cursor-pointer transition-all shadow-sm ${
                                               isSelected 
                                                 ? 'bg-green-100 border-green-400 text-green-800 ring-2 ring-green-300' 
                                                 : 'bg-white border-gray-300 hover:bg-blue-50 hover:border-blue-400 hover:shadow-md'
                                             }`}
                                          onClick={() => handleShiftToggle(shift, !isSelected)}
                                        >
                                              <div className="font-semibold">
                                                {(() => {
                                                  // Handle overnight shifts (crossing midnight)
                                                  const start = shift.start_time;
                                                  const end = shift.end_time;
                                                  
                                                  console.log(`🕐 Shift ${shift.id} display data:`, {
                                                    start_time: shift.start_time,
                                                    end_time: shift.end_time,
                                                    branch: shift.branch?.name,
                                                    role: shift.role,
                                                    shift_assignments: shift.shift_assignments,
                                                    allShiftData: shift
                                                  });
                                                  
                                                  // Always display as start-end (FIXED ORDER)
                                                  return `${start.substring(0,5)}-${end.substring(0,5)}`;
                                                })()}
                                              </div>
                                            {shift.branch?.name && (
                                              <div className="text-blue-600 flex items-center gap-1">
                                                📍 {shift.branch.name}
                                                {shift.isMainBranch && (
                                                  <span className="text-orange-600 font-semibold text-xs">(סניף עיקרי)</span>
                                                )}
                                              </div>
                                            )}
                                            {shift.role && (
                                              <div className="text-gray-500 text-xs">תפקיד: {shift.role}</div>
                                            )}
                                           {isSelected && (
                                             <div className="text-green-700 font-bold mt-1">✓ נבחר</div>
                                           )}
                                        </div>
                                      );
                                    })}
                                       {morningShifts.length === 0 && (
                                         <div className="text-sm text-gray-500 p-3 text-center italic">אין משמרות בוקר זמינות</div>
                                       )}
                                     </div>
                                   </div>
                                
                                   {/* Evening Shifts */}
                                   <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                     <div className="text-sm font-semibold text-purple-700 mb-3 flex items-center gap-2">
                                       🌆 משמרות ערב ולילה
                                     </div>
                                     <div className="space-y-2">
                                       {eveningShifts.map(shift => {
                                         const currentPreference = formData.preferences.find(
                                           (p: any) => p.shift_id === shift.id
                                         );
                                         const isSelected = currentPreference?.available;
                                         
                                         return (
                                           <div 
                                             key={shift.id}
                                             className={`p-3 rounded-lg border text-sm cursor-pointer transition-all shadow-sm ${
                                               isSelected
                                               ? 'bg-green-100 border-green-400 text-green-800 ring-2 ring-green-300' 
                                               : 'bg-white border-gray-300 hover:bg-blue-50 hover:border-blue-400 hover:shadow-md'
                                           }`}
                                          onClick={() => handleShiftToggle(shift, !isSelected)}
                                        >
                                             <div className="font-semibold">
                                               {(() => {
                                                 // Handle overnight shifts (crossing midnight)
                                                 const start = shift.start_time;
                                                 const end = shift.end_time;
                                                 
                                                 // Always display as start-end regardless of crossing midnight
                                                 return `${start}-${end}`;
                                               })()}
                                             </div>
                                           {shift.branch?.name && (
                                             <div className="text-blue-600 flex items-center gap-1">
                                               📍 {shift.branch.name}
                                               {shift.isMainBranch && (
                                                 <span className="text-orange-600 font-semibold text-xs">(סניף עיקרי)</span>
                                               )}
                                             </div>
                                           )}
                                           {shift.role && (
                                             <div className="text-gray-500">{shift.role}</div>
                                           )}
                                          {isSelected && (
                                            <div className="text-green-700 font-bold mt-1">✓ נבחר</div>
                                          )}
                                        </div>
                                      );
                                    })}
                                       {eveningShifts.length === 0 && (
                                         <div className="text-sm text-gray-500 p-3 text-center italic">אין משמרות ערב זמינות</div>
                                       )}
                                     </div>
                                   </div>
                                 </div>
                               </div>
                             );
                          }
                          return days;
                        })()}
                      </div>

                      {/* Mobile Layout */}
                      <div className="md:hidden">
                        <div className="bg-blue-50 p-3 border-b">
                          <h3 className="text-sm font-semibold text-gray-700">בחירת משמרות לשבוע</h3>
                        </div>
                        
                        {(() => {
                          const weekStart = new Date(tokenData.week_start_date);
                          const days = [];
                          for (let i = 0; i < 7; i++) {
                            const currentDate = new Date(weekStart);
                            currentDate.setDate(weekStart.getDate() + i);
                            const dateStr = currentDate.toISOString().split('T')[0];
                            const dayShifts = scheduledShifts.filter(shift => shift.shift_date === dateStr);
                            
                            if (dayShifts.length === 0) continue;
                            
                             // Group shifts by type and sort within each group
                             let morningShifts = dayShifts.filter(shift => {
                               const hour = parseInt(shift.start_time.split(':')[0]);
                               return hour >= 6 && hour < 16;
                             });
                             let eveningShifts = dayShifts.filter(shift => {
                               const hour = parseInt(shift.start_time.split(':')[0]);
                               return hour >= 16 && hour < 24;
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

                            days.push(
                              <div key={dateStr} className="border-b last:border-b-0">
                                {/* Day Header */}
                                <div className="bg-gray-50 p-3 border-b">
                                  <div className="flex justify-between items-center">
                                    <h4 className="font-semibold text-gray-900">{getDayName(dateStr)}</h4>
                                    <span className="text-sm text-gray-600">{getDateDisplay(dateStr)}</span>
                                  </div>
                                </div>
                                
                                {/* Shifts */}
                                <div className="p-3 space-y-4">
                                  {/* Morning Shifts */}
                                  {morningShifts.length > 0 && (
                                    <div>
                                      <div className="text-sm font-semibold text-orange-700 mb-2">🌅 משמרות בוקר</div>
                                      <div className="space-y-2">
                                        {morningShifts.map(shift => {
                                          const currentPreference = formData.preferences.find(
                                            (p: any) => p.shift_id === shift.id
                                          );
                                          const isSelected = currentPreference?.available;
                                          
                                          return (
                                            <div 
                                              key={shift.id}
                                              className={`p-3 rounded border cursor-pointer transition-all ${
                                                isSelected 
                                                  ? 'bg-green-100 border-green-300 text-green-800' 
                                                  : 'bg-gray-50 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                                              }`}
                                              onClick={() => handleShiftToggle(shift, !isSelected)}
                                            >
                                              <div className="flex justify-between items-start">
                                                <div>
                                                   <div className="font-semibold text-base">
                                                     {(() => {
                                                       // Handle overnight shifts (crossing midnight)
                                                       const start = shift.start_time;
                                                       const end = shift.end_time;
                                                       const startHour = parseInt(start.split(':')[0]);
                                                       const endHour = parseInt(end.split(':')[0]);
                                                       
                                                       // If shift crosses midnight (start > end), show it correctly
                                                       if (startHour > endHour) {
                                                         return `${start} - ${end} (+1)`;
                                                       }
                                                       return `${start} - ${end}`;
                                                     })()}
                                                   </div>
                                                   {shift.branch?.name && (
                                                     <div className="text-blue-600 text-sm mt-1 flex items-center gap-1">
                                                       📍 {shift.branch.name}
                                                       {shift.isMainBranch && (
                                                         <span className="text-orange-600 font-semibold text-xs">(סניף עיקרי)</span>
                                                       )}
                                                     </div>
                                                   )}
                                                  {shift.role && (
                                                    <div className="text-gray-500 text-sm">{shift.role}</div>
                                                  )}
                                                </div>
                                                {isSelected && (
                                                  <div className="text-green-700 font-bold">✓</div>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Evening Shifts */}
                                  {eveningShifts.length > 0 && (
                                    <div>
                                      <div className="text-sm font-semibold text-purple-700 mb-2">🌆 משמרות ערב</div>
                                      <div className="space-y-2">
                                        {eveningShifts.map(shift => {
                                          const currentPreference = formData.preferences.find(
                                            (p: any) => p.shift_id === shift.id
                                          );
                                          const isSelected = currentPreference?.available;
                                          
                                          return (
                                            <div 
                                              key={shift.id}
                                              className={`p-3 rounded border cursor-pointer transition-all ${
                                                isSelected 
                                                  ? 'bg-green-100 border-green-300 text-green-800' 
                                                  : 'bg-gray-50 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                                              }`}
                                              onClick={() => handleShiftToggle(shift, !isSelected)}
                                            >
                                              <div className="flex justify-between items-start">
                                                <div>
                                                   <div className="font-semibold text-base">
                                                     {(() => {
                                                       // Handle overnight shifts (crossing midnight)
                                                       const start = shift.start_time;
                                                       const end = shift.end_time;
                                                       const startHour = parseInt(start.split(':')[0]);
                                                       const endHour = parseInt(end.split(':')[0]);
                                                       
                                                       // If shift crosses midnight (start > end), show it correctly
                                                       if (startHour > endHour) {
                                                         return `${start} - ${end} (+1)`;
                                                       }
                                                       return `${start} - ${end}`;
                                                     })()}
                                                   </div>
                                                   {shift.branch?.name && (
                                                     <div className="text-blue-600 text-sm mt-1 flex items-center gap-1">
                                                       📍 {shift.branch.name}
                                                       {shift.isMainBranch && (
                                                         <span className="text-orange-600 font-semibold text-xs">(סניף עיקרי)</span>
                                                       )}
                                                     </div>
                                                   )}
                                                  {shift.role && (
                                                    <div className="text-gray-500 text-sm">{shift.role}</div>
                                                  )}
                                                </div>
                                                {isSelected && (
                                                  <div className="text-green-700 font-bold">✓</div>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          }
                          return days;
                        })()}
                      </div>
                    </div>
                    
                    {/* Selected Shifts Summary */}
                    {formData.preferences.length > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                        <h4 className="font-semibold text-green-800 mb-2">משמרות שנבחרו ({formData.preferences.length})</h4>
                        <div className="space-y-1">
                          {formData.preferences.map((pref: any, index) => (
                            <div key={index} className="text-sm text-green-700">
                               ✓ {getDayName(pref.shift_date)} {getDateDisplay(pref.shift_date)} - {(() => {
                                 const startHour = parseInt(pref.start_time.split(':')[0]);
                                 const endHour = parseInt(pref.end_time.split(':')[0]);
                                 if (startHour > endHour) {
                                   return `${pref.start_time}-${pref.end_time} (+1)`;
                                 }
                                 return `${pref.start_time}-${pref.end_time}`;
                               })()}
                              {pref.branch_name && ` | ${pref.branch_name}`}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>אין משמרות זמינות לשבוע זה</p>
                  </div>
                 )}
                
                {/* Special Shifts Section */}
                {showSpecialShifts && getSpecialShifts().length > 0 && (
                  <div className="mt-6 space-y-3">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                        ⚠️ הגשה מיוחדת - משמרות מחוץ להעדפות הרגילות
                      </h4>
                      <p className="text-sm text-yellow-700">
                        המשמרות הבאות אינן בסוג המשמרת הרגיל שלך, אך ניתן להגיש אליהן בבקשה מיוחדת:
                      </p>
                    </div>
                    
                    <div className="bg-white border rounded-lg overflow-hidden border-yellow-300">
                      {/* Special Shifts Grid */}
                      <div className="hidden md:block">
                        {/* Header */}
                        <div className="grid grid-cols-8 bg-yellow-50 border-b">
                          <div className="p-3 text-sm font-semibold text-yellow-800 text-center border-l">יום</div>
                          <div className="p-3 text-sm font-semibold text-yellow-800 text-center border-l col-span-7">משמרות מיוחדות</div>
                        </div>
                        
                        {/* Week Days */}
                        {(() => {
                          const weekStart = new Date(tokenData.week_start_date);
                          const days = [];
                          const specialShifts = getSpecialShifts();
                          
                          for (let i = 0; i < 7; i++) {
                            const currentDate = new Date(weekStart);
                            currentDate.setDate(weekStart.getDate() + i);
                            const dateStr = currentDate.toISOString().split('T')[0];
                            const daySpecialShifts = specialShifts.filter(shift => shift.shift_date === dateStr);
                            
                            days.push(
                              <div key={dateStr} className="grid grid-cols-8 border-b last:border-b-0 min-h-[60px]">
                                {/* Day Column */}
                                <div className="p-3 border-l bg-yellow-50 flex flex-col justify-center items-center">
                                  <div className="text-sm font-semibold text-gray-900">{getDayName(dateStr)}</div>
                                  <div className="text-xs text-gray-600">{getDateDisplay(dateStr)}</div>
                                </div>
                                
                                {/* Special Shifts */}
                                <div className="col-span-7 p-2">
                                  <div className="space-y-1">
                                    {daySpecialShifts.map(shift => {
                                      const currentPreference = formData.preferences.find(
                                        (p: any) => p.shift_id === shift.id
                                      );
                                      const isSelected = currentPreference?.available;
                                      
                                      return (
                                        <div 
                                          key={shift.id}
                                          className={`p-2 rounded border text-xs cursor-pointer transition-all ${
                                            isSelected 
                                              ? 'bg-yellow-100 border-yellow-400 text-yellow-900' 
                                              : 'bg-gray-50 border-yellow-200 hover:bg-yellow-50 hover:border-yellow-300'
                                          }`}
                                          onClick={() => handleShiftToggle(shift, !isSelected)}
                                        >
                                            <div className="font-semibold">
                                              {(() => {
                                                // Handle overnight shifts (crossing midnight)
                                                const start = shift.start_time;
                                                const end = shift.end_time;
                                                const startHour = parseInt(start.split(':')[0]);
                                                const endHour = parseInt(end.split(':')[0]);
                                                
                                                // If shift crosses midnight (start > end), show it correctly
                                                if (startHour > endHour) {
                                                  return `${start} - ${end} (+1)`;
                                                }
                                                return `${start} - ${end}`;
                                              })()}
                                            </div>
                                           {shift.branch?.name && (
                                             <div className="text-blue-600 flex items-center gap-1">
                                               📍 {shift.branch.name}
                                               {shift.isMainBranch && (
                                                 <span className="text-orange-600 font-semibold text-xs">(סניף עיקרי)</span>
                                               )}
                                             </div>
                                           )}
                                           {shift.role && (
                                             <div className="text-gray-500">{shift.role}</div>
                                           )}
                                           <div className="text-yellow-700 text-xs mt-1">⚠️ בקשה מיוחדת</div>
                                          {isSelected && (
                                            <div className="text-yellow-800 font-bold mt-1">✓ נבחר למיוחד</div>
                                          )}
                                        </div>
                                      );
                                    })}
                                    {daySpecialShifts.length === 0 && (
                                      <div className="text-xs text-gray-400 p-2">אין משמרות מיוחדות</div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return days;
                        })()}
                      </div>

                      {/* Mobile Layout for Special Shifts */}
                      <div className="md:hidden">
                        {(() => {
                          const weekStart = new Date(tokenData.week_start_date);
                          const days = [];
                          const specialShifts = getSpecialShifts();
                          
                          for (let i = 0; i < 7; i++) {
                            const currentDate = new Date(weekStart);
                            currentDate.setDate(weekStart.getDate() + i);
                            const dateStr = currentDate.toISOString().split('T')[0];
                            const daySpecialShifts = specialShifts.filter(shift => shift.shift_date === dateStr);
                            
                            if (daySpecialShifts.length === 0) continue;
                            
                            days.push(
                              <div key={dateStr} className="border-b last:border-b-0">
                                {/* Day Header */}
                                <div className="bg-yellow-50 p-3 border-b">
                                  <div className="flex justify-between items-center">
                                    <h4 className="font-semibold text-gray-900">{getDayName(dateStr)}</h4>
                                    <span className="text-sm text-gray-600">{getDateDisplay(dateStr)}</span>
                                  </div>
                                </div>
                                
                                {/* Special Shifts */}
                                <div className="p-3 space-y-2">
                                  {daySpecialShifts.map(shift => {
                                    const currentPreference = formData.preferences.find(
                                      (p: any) => p.shift_id === shift.id
                                    );
                                    const isSelected = currentPreference?.available;
                                    
                                    return (
                                      <div 
                                        key={shift.id}
                                        className={`p-3 rounded border cursor-pointer transition-all ${
                                          isSelected 
                                            ? 'bg-yellow-100 border-yellow-400 text-yellow-900' 
                                            : 'bg-gray-50 border-yellow-200 hover:bg-yellow-50 hover:border-yellow-300'
                                        }`}
                                        onClick={() => handleShiftToggle(shift, !isSelected)}
                                      >
                                        <div className="flex justify-between items-start">
                                          <div>
                                              <div className="font-semibold text-base">
                                                {(() => {
                                                  // Handle overnight shifts (crossing midnight)
                                                  const start = shift.start_time;
                                                  const end = shift.end_time;
                                                  const startHour = parseInt(start.split(':')[0]);
                                                  const endHour = parseInt(end.split(':')[0]);
                                                  
                                                  // If shift crosses midnight (start > end), show it correctly
                                                  if (startHour > endHour) {
                                                    return `${start} - ${end} (+1)`;
                                                  }
                                                  return `${start} - ${end}`;
                                                })()}
                                              </div>
                                             {shift.branch?.name && (
                                               <div className="text-blue-600 text-sm mt-1 flex items-center gap-1">
                                                 📍 {shift.branch.name}
                                                 {shift.isMainBranch && (
                                                   <span className="text-orange-600 font-semibold text-xs">(סניף עיקרי)</span>
                                                 )}
                                               </div>
                                             )}
                                             {shift.role && (
                                               <div className="text-gray-500 text-sm">{shift.role}</div>
                                             )}
                                             <div className="text-yellow-700 text-xs mt-1">⚠️ בקשה מיוחדת</div>
                                          </div>
                                          {isSelected && (
                                            <div className="text-yellow-800 font-bold">✓</div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          }
                          return days;
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="notes">הערות נוספות</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="הערות או בקשות מיוחדות..."
                  rows={3}
                />
              </div>
            </div>

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