
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Clock, User, MapPin, Send, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { HolidayIndicator } from './HolidayIndicator';
import { ShabbatIndicator } from './components/ShabbatIndicator';
import { useIsMobile } from '@/hooks/use-mobile';
import type { ShiftScheduleViewProps } from './types';
import { SubmissionApprovalDialog } from './components/SubmissionApprovalDialog';
import { ShiftDetailsDialog } from './ShiftDetailsDialog';
import { ActivityLogViewer } from './ActivityLogViewer';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const WeeklyScheduleView: React.FC<ShiftScheduleViewProps> = ({
  shifts,
  employees,
  branches,
  currentDate,
  holidays,
  shabbatTimes,
  calendarEvents,
  pendingSubmissions = [],
  businessId,
  onShiftClick,
  onShiftUpdate,
  onAddShift
}) => {
  const isMobile = useIsMobile();
  const [showSubmissionDialog, setShowSubmissionDialog] = useState(false);
  const [selectedDateForSubmissions, setSelectedDateForSubmissions] = useState<Date | null>(null);
  const [showShiftDetailsDialog, setShowShiftDetailsDialog] = useState(false);
  const [selectedShift, setSelectedShift] = useState<any>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  
  // Generate week days starting from Sunday
  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push(date);
    }
    return days;
  }, [currentDate]);

  const getShiftsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return shifts.filter(shift => shift.shift_date === dateStr);
  };

  const getHolidaysForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return holidays.filter(holiday => holiday.date === dateStr);
  };

  const getShabbatForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return shabbatTimes.find(shabbat => shabbat.date === dateStr) || null;
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : 'לא מוקצה';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get pending submissions for a specific date
  const getPendingSubmissionsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return pendingSubmissions.filter(submission => {
      const shifts = typeof submission.shifts === 'string' 
        ? JSON.parse(submission.shifts) 
        : submission.shifts || [];
      return shifts.some((shift: any) => shift.date === dateStr);
    });
  };

  // Get detailed submission and assignment data for a specific date
  const getDetailedDataForDate = (date: Date) => {
    const submissions = getPendingSubmissionsForDate(date);
    const dayShifts = getShiftsForDate(date);
    
    // Group submissions by branch and assignment status
    const submissionsByBranch: Record<string, { assigned: any[], unassigned: any[] }> = {};
    
    submissions.forEach(submission => {
      const shifts = typeof submission.shifts === 'string' 
        ? JSON.parse(submission.shifts) 
        : submission.shifts || [];
      
      const dateStr = date.toISOString().split('T')[0];
      const relevantShifts = shifts.filter((shift: any) => shift.date === dateStr);
      
      relevantShifts.forEach((shift: any) => {
        const branchName = shift.branch_preference || 'ללא סניף';
        
        if (!submissionsByBranch[branchName]) {
          submissionsByBranch[branchName] = { assigned: [], unassigned: [] };
        }
        
        const submissionData = {
          employeeName: getEmployeeName(submission.employee_id),
          role: shift.role_preference || 'ללא תפקיד',
          startTime: shift.start_time,
          endTime: shift.end_time,
          isAssigned: dayShifts.some(s => s.employee_id === submission.employee_id && 
                                          s.branch_name === shift.branch_preference)
        };
        
        if (submissionData.isAssigned) {
          submissionsByBranch[branchName].assigned.push(submissionData);
        } else {
          submissionsByBranch[branchName].unassigned.push(submissionData);
        }
      });
    });
    
    return submissionsByBranch;
  };

  const handleViewSubmissions = (date: Date) => {
    setSelectedDateForSubmissions(date);
    setShowSubmissionDialog(true);
  };

  const handleSubmissionApprovalComplete = () => {
    setShowSubmissionDialog(false);
    setSelectedDateForSubmissions(null);
    // Refresh the data
    window.location.reload();
  };

  // Check for shift conflicts for a specific employee
  const checkShiftConflicts = (employeeId: string, shiftDate: string, startTime: string, endTime: string, excludeShiftId?: string) => {
    const employeeShifts = shifts.filter(shift => 
      shift.employee_id === employeeId &&
      shift.shift_date === shiftDate &&
      shift.status === 'approved' &&
      shift.id !== excludeShiftId
    );

    return employeeShifts.filter(shift => {
      const shiftStart = new Date(`${shiftDate}T${shift.start_time}`);
      const shiftEnd = new Date(`${shiftDate}T${shift.end_time}`);
      const newStart = new Date(`${shiftDate}T${startTime}`);
      const newEnd = new Date(`${shiftDate}T${endTime}`);

      // Check for time overlap
      return (newStart < shiftEnd && newEnd > shiftStart);
    });
  };

  // Check if a shift has conflicts with employee's other shifts
  const hasShiftConflict = (shift: any) => {
    if (!shift.employee_id) return false;
    
    const conflicts = checkShiftConflicts(
      shift.employee_id, 
      shift.shift_date, 
      shift.start_time, 
      shift.end_time, 
      shift.id
    );
    
    return conflicts.length > 0;
  };

  const publishSchedule = async () => {
    setIsPublishing(true);
    try {
      // Get all assigned shifts for the current week
      const assignedShifts = shifts.filter(shift => 
        shift.employee_id && 
        shift.status !== 'approved' && 
        !shift.is_archived
      );
      
      if (assignedShifts.length === 0) {
        toast.error('אין משמרות מוקצות לפרסום');
        return;
      }

      // Call the edge function to publish the schedule
      const { data, error } = await supabase.functions.invoke('publish-schedule', {
        body: {
          weekStart: weekDays[0].toISOString().split('T')[0],
          weekEnd: weekDays[6].toISOString().split('T')[0],
          shiftIds: assignedShifts.map(shift => shift.id)
        }
      });

      if (error) {
        console.error('Error publishing schedule:', error);
        toast.error('שגיאה בפרסום הסידור');
        return;
      }

      toast.success(`הסידור פורסם בהצלחה! נשלחו הודעות ל-${data.employeeCount} עובדים`);
      
      // Refresh the data
      window.location.reload();
    } catch (error) {
      console.error('Error publishing schedule:', error);
      toast.error('שגיאה בפרסום הסידור');
    } finally {
      setIsPublishing(false);
    }
  };

  // Hebrew day names - ordered from Sunday to Saturday for RTL display
  const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

  // Mobile layout - vertical scrolling list
  if (isMobile) {
    return (
      <div className="h-full flex flex-col space-y-3 p-2" dir="rtl">
        {weekDays.map((date, index) => {
          const dayShifts = getShiftsForDate(date);
          const dayHolidays = getHolidaysForDate(date);
          const dayShabbat = getShabbatForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();
          const isWeekend = index === 5 || index === 6;

          return (
            <Card key={date.toISOString()} className={`${isToday ? 'ring-2 ring-blue-500' : ''}`}>
              <CardHeader className="pb-3">
                <CardTitle className={`text-lg font-medium text-center ${isWeekend ? 'text-blue-600' : ''}`}>
                  <div className="flex items-center justify-between">
                    <span>{dayNames[index]}</span>
                    <span className={`text-xl ${isToday ? 'font-bold text-blue-600' : ''}`}>
                      {date.getDate()}/{date.getMonth() + 1}
                    </span>
                  </div>
                </CardTitle>
                
                {/* Holidays and Shabbat indicators */}
                {(dayHolidays.length > 0 || dayShabbat) && (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {dayHolidays.length > 0 && (
                      <HolidayIndicator holidays={dayHolidays} variant="badge" />
                    )}
                    {dayShabbat && (
                      <ShabbatIndicator 
                        shabbatTimes={dayShabbat}
                        date={date}
                        variant="badge"
                      />
                    )}
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="space-y-3">
                {dayShifts.length > 0 ? (
                  <div className="space-y-2">
                     {dayShifts.map((shift) => {
                       const hasConflict = hasShiftConflict(shift);
                       
                       return (
                         <div
                           key={shift.id}
                           className={`p-3 bg-white border rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow ${
                             hasConflict ? 'border-red-300 bg-red-50' : ''
                           }`}
                           onClick={() => {
                             setSelectedShift(shift);
                             setShowShiftDetailsDialog(true);
                           }}
                         >
                           <div className="space-y-2">
                             {/* סניף - ראשון ובולט */}
                             {shift.branch_name && (
                               <div className="flex items-center justify-center">
                                 <Badge className="bg-blue-600 text-white font-medium px-3 py-1">
                                   <MapPin className="h-3 w-3 ml-1" />
                                   {shift.branch_name}
                                 </Badge>
                               </div>
                             )}
                             
                             {/* שעות משמרת - שני */}
                             <div className="flex items-center justify-center">
                               <Badge variant="outline" className="bg-gray-50 border-2 font-medium px-3 py-1">
                                 <Clock className="h-3 w-3 ml-1" />
                                 {shift.start_time} - {shift.end_time}
                               </Badge>
                             </div>
                             
                             {/* עובד מוקצה או לא מוקצה - שלישי */}
                             <div className="flex items-center justify-center">
                               {shift.employee_id ? (
                                 <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
                                   <User className="h-3 w-3 ml-1" />
                                   {getEmployeeName(shift.employee_id)}
                                 </Badge>
                               ) : (
                                 <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 px-3 py-1">
                                   <User className="h-3 w-3 ml-1" />
                                   לא מוקצה
                                 </Badge>
                               )}
                             </div>
                           </div>
                           
                           {/* סטטוס וקונפליקטים - רביעי במטה */}
                           <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                             <Badge variant="secondary" className={`${getStatusColor(shift.status || 'pending')} text-xs`}>
                               {shift.status === 'approved' ? 'מאושר' : 
                                shift.status === 'pending' ? 'ממתין' :
                                shift.status === 'rejected' ? 'נדחה' : 'הושלם'}
                             </Badge>
                             {hasConflict && (
                               <div className="flex items-center gap-1">
                                 <AlertTriangle className="h-3 w-3 text-red-500" />
                                 <span className="text-xs text-red-500">התנגשות</span>
                               </div>
                             )}
                           </div>
                         </div>
                       );
                     })}
                   </div>
                ) : (
                  <div 
                    className="text-center py-4 text-gray-500 cursor-pointer hover:bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors"
                    onClick={() => onAddShift(date)}
                  >
                    <Plus className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">לחץ להוספת משמרת</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  // Desktop layout - grid view with RTL ordering (Sunday on right, Saturday on left)
  return (
    <div className="h-full flex flex-col" dir="rtl">
      {/* Action Bar */}
      <div className="flex justify-between items-center mb-4 p-4 bg-white rounded-lg shadow-sm border">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">
            סידור שבועי - {weekDays[0].getDate()}/{weekDays[0].getMonth() + 1} עד {weekDays[6].getDate()}/{weekDays[6].getMonth() + 1}
          </h2>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Publish Schedule Button */}
          <Button
            onClick={publishSchedule}
            disabled={isPublishing}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            {isPublishing ? 'מפרסם...' : 'פרסם סידור'}
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2 flex-1" style={{ direction: 'rtl' }}>
        {weekDays.map((date, index) => {
          const dayShifts = getShiftsForDate(date);
          const dayHolidays = getHolidaysForDate(date);
          const dayShabbat = getShabbatForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();
          const isWeekend = index === 5 || index === 6;

          return (
            <Card key={date.toISOString()} className={`flex flex-col min-h-0 ${isToday ? 'ring-2 ring-blue-500' : ''}`}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-sm font-medium text-center ${isWeekend ? 'text-blue-600' : ''}`}>
                  <div className="flex flex-col items-center">
                    <span>{dayNames[index]}</span>
                    <span className={`text-lg ${isToday ? 'font-bold text-blue-600' : ''}`}>
                      {date.getDate()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {date.toLocaleDateString('he-IL', { month: 'short' })}
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 p-2 space-y-2">
                {/* Holidays */}
                {dayHolidays.length > 0 && (
                  <HolidayIndicator holidays={dayHolidays} variant="badge" />
                )}
                
                {/* Shabbat times */}
                {dayShabbat && (
                  <ShabbatIndicator 
                    shabbatTimes={dayShabbat}
                    date={date}
                    variant="badge"
                  />
                )}
                
                {/* Shifts */}
                <div className="space-y-1">
                  {dayShifts.map((shift) => {
                    // Get submissions for this specific shift
                    const getSubmissionsForShift = () => {
                      const dateStr = date.toISOString().split('T')[0];
                      return pendingSubmissions.filter(submission => {
                        const shifts = typeof submission.shifts === 'string' 
                          ? JSON.parse(submission.shifts) 
                          : submission.shifts || [];
                        return shifts.some((s: any) => 
                          s.date === dateStr && 
                          s.start_time === shift.start_time && 
                          s.end_time === shift.end_time &&
                          s.branch_preference === shift.branch_name
                        );
                      }).map(submission => {
                        const shifts = typeof submission.shifts === 'string' 
                          ? JSON.parse(submission.shifts) 
                          : submission.shifts || [];
                        const relevantShift = shifts.find((s: any) => 
                          s.date === dateStr && 
                          s.start_time === shift.start_time && 
                          s.end_time === shift.end_time &&
                          s.branch_preference === shift.branch_name
                        );
                        return {
                          ...submission,
                          employeeName: getEmployeeName(submission.employee_id),
                          role: relevantShift?.role_preference || 'ללא תפקיד',
                          isCurrentlyAssigned: shift.employee_id === submission.employee_id
                        };
                      });
                    };

                    const shiftSubmissions = getSubmissionsForShift();
                    const hasConflict = hasShiftConflict(shift);

                    return (
                      <TooltipProvider key={shift.id}>
                        <Tooltip>
                           <TooltipTrigger asChild>
                             <div
                               className={`p-2 bg-white border rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow ${
                                 hasConflict ? 'border-red-300 bg-red-50' : ''
                               }`}
                               onClick={() => {
                                 setSelectedShift(shift);
                                 setShowShiftDetailsDialog(true);
                               }}
                             >
                               <div className={`space-y-1 text-xs ${hasConflict ? 'line-through opacity-60' : ''}`}>
                                 {/* סניף - ראשון ובולט */}
                                 {shift.branch_name && (
                                   <div className="text-center">
                                     <Badge className="bg-blue-600 text-white text-xs px-2 py-0.5">
                                       {shift.branch_name}
                                     </Badge>
                                   </div>
                                 )}
                                 
                                 {/* שעות משמרת - שני */}
                                 <div className="text-center">
                                   <Badge variant="outline" className="text-xs font-medium border-gray-300">
                                     {shift.start_time}-{shift.end_time}
                                   </Badge>
                                 </div>
                                 
                                 {/* עובד מוקצה או לא מוקצה */}
                                 <div className="text-center">
                                   {shift.employee_id ? (
                                     <Badge variant="secondary" className="bg-green-50 text-green-700 text-xs px-2 py-0.5">
                                       {getEmployeeName(shift.employee_id).split(' ')[0]}
                                     </Badge>
                                   ) : (
                                     <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs px-2 py-0.5">
                                       לא מוקצה
                                     </Badge>
                                   )}
                                 </div>
                               </div>
                               
                               {/* סטטוס וקונפליקטים ובקשות - במטה */}
                               <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-100">
                                 <div className="flex items-center gap-1">
                                   <Badge variant="secondary" className={`text-xs ${getStatusColor(shift.status || 'pending')}`}>
                                     {shift.status === 'approved' ? 'מאושר' : 
                                      shift.status === 'pending' ? 'ממתין' :
                                      shift.status === 'rejected' ? 'נדחה' : 'הושלם'}
                                   </Badge>
                                    {hasConflict && (
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <AlertTriangle className="h-3 w-3 text-red-500" />
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            התנגשות עם משמרת אחרת
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    )}
                                 </div>
                                 {shiftSubmissions.length > 0 && (
                                   <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                     {shiftSubmissions.length} בקשות
                                   </Badge>
                                 )}
                               </div>
                            </div>
                          </TooltipTrigger>
                          
                          {shiftSubmissions.length > 0 && (
                            <TooltipContent side="top" className="max-w-sm p-4">
                              <div className="text-right space-y-3">
                                <div className="border-b pb-2">
                                  <h4 className="font-medium text-sm">בקשות למשמרת:</h4>
                                  <p className="text-xs text-gray-600">
                                    {shift.start_time} - {shift.end_time} | {shift.branch_name}
                                  </p>
                                </div>
                                
                                <div className="space-y-2">
                                  {shiftSubmissions.map((submission, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                                      <div className="flex-1">
                                        <div className="font-medium">
                                          {submission.employeeName}
                                          {submission.isCurrentlyAssigned && (
                                            <span className="text-green-600 mr-1">✓</span>
                                          )}
                                        </div>
                                        <div className="text-gray-600">{submission.role}</div>
                                      </div>
                                      
                                      <div className="flex gap-1">
                                        {!submission.isCurrentlyAssigned && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-6 px-2 text-xs"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (onShiftUpdate) {
                                                onShiftUpdate(shift.id, {
                                                  ...shift,
                                                  employee_id: submission.employee_id
                                                });
                                              }
                                            }}
                                          >
                                            שייך
                                          </Button>
                                        )}
                                        
                                        <Button
                                          size="sm"
                                          variant="outline" 
                                          className="h-6 px-2 text-xs"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            // Add functionality to move employee to different shift
                                            console.log('Move employee to different shift:', submission.employee_id);
                                          }}
                                        >
                                          העבר
                                        </Button>
                                        
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="h-6 px-2 text-xs"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            // Add functionality to change branch
                                            console.log('Change branch for employee:', submission.employee_id);
                                          }}
                                        >
                                          סניף
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                
                                {shift.employee_id && (
                                  <div className="border-t pt-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="w-full text-xs"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (onShiftUpdate) {
                                          onShiftUpdate(shift.id, {
                                            ...shift,
                                            employee_id: null
                                          });
                                        }
                                      }}
                                    >
                                      בטל שיוך נוכחי
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
                
                {/* Pending submissions */}
                {getPendingSubmissionsForDate(date).length > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className="w-full text-xs bg-yellow-50 border border-yellow-200 text-yellow-800 hover:bg-yellow-100 px-3 py-2 rounded cursor-help transition-colors text-center"
                        >
                          הגשות ממתינות ({getPendingSubmissionsForDate(date).length})
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-md">
                        <div className="text-right space-y-3">
                          <p className="font-medium text-sm">סטטוס הגשות לתאריך {date.getDate()}/{date.getMonth() + 1}:</p>
                          
                          {(() => {
                            const detailedData = getDetailedDataForDate(date);
                            const branches = Object.keys(detailedData);
                            
                            return branches.length > 0 ? (
                              branches.map((branchName, branchIndex) => (
                                <div key={branchIndex} className="border-b border-gray-200 pb-2 last:border-b-0 last:pb-0">
                                  <p className="font-medium text-xs text-blue-700 mb-1">
                                    📍 {branchName}
                                  </p>
                                  
                                  {/* Assigned shifts */}
                                  {detailedData[branchName].assigned.length > 0 && (
                                    <div className="mb-2">
                                      <p className="text-xs text-green-700 font-medium mb-1">✅ הוקצו:</p>
                                      <ul className="text-xs space-y-1 mr-4">
                                        {detailedData[branchName].assigned.map((item, index) => (
                                          <li key={index} className="text-green-600">
                                            • {item.employeeName} - {item.role} ({item.startTime}-{item.endTime})
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  
                                  {/* Unassigned shifts */}
                                  {detailedData[branchName].unassigned.length > 0 && (
                                    <div>
                                      <p className="text-xs text-orange-700 font-medium mb-1">⏳ לא הוקצו:</p>
                                      <ul className="text-xs space-y-1 mr-4">
                                        {detailedData[branchName].unassigned.map((item, index) => (
                                          <li key={index} className="text-orange-600">
                                            • {item.employeeName} - {item.role} ({item.startTime}-{item.endTime})
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-gray-500">אין נתונים להצגה</p>
                            );
                          })()}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                
                {/* Add shift area */}
                {dayShifts.length === 0 && (
                  <div 
                    className="text-center py-2 text-gray-400 cursor-pointer hover:bg-gray-50 rounded border border-dashed border-gray-200 hover:border-blue-300 transition-colors"
                    onClick={() => onAddShift(date)}
                  >
                    <Plus className="h-4 w-4 mx-auto mb-1" />
                    <p className="text-xs">הוסף משמרת</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Submission Approval Dialog */}
      {showSubmissionDialog && selectedDateForSubmissions && (
        <SubmissionApprovalDialog
          isOpen={showSubmissionDialog}
          onClose={() => setShowSubmissionDialog(false)}
          submissions={pendingSubmissions}
          selectedDate={selectedDateForSubmissions}
          employees={employees}
          onApprovalComplete={handleSubmissionApprovalComplete}
        />
      )}

      {/* Shift Details Dialog */}
      {showShiftDetailsDialog && selectedShift && (
        <ShiftDetailsDialog
          shift={selectedShift}
          employees={employees}
          branches={branches}
          shifts={shifts} // Pass all shifts for conflict checking
          pendingSubmissions={pendingSubmissions}
          onClose={() => {
            setShowShiftDetailsDialog(false);
            setSelectedShift(null);
          }}
          onUpdate={onShiftUpdate}
          onDelete={async (shiftId: string) => {
            // This would need to be implemented in the parent component
            console.log('Delete shift:', shiftId);
          }}
          onAssignEmployee={(shift) => {
            // This would need to be implemented in the parent component
            console.log('Assign employee to shift:', shift);
          }}
          onSubmissionUpdate={() => {
            // Refresh submissions
            handleSubmissionApprovalComplete();
          }}
        />
      )}

      {/* Activity Log - Only show if businessId is available */}
      {businessId && (
        <div className="mt-6">
          <ActivityLogViewer businessId={businessId} maxEntries={20} />
        </div>
      )}
    </div>
  );
};
