import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Clock, User, MapPin, Trash2, AlertTriangle, UserCheck, FileText, Lightbulb } from 'lucide-react';
import { EmployeeRecommendationEngine } from '../../recommendations/EmployeeRecommendationEngine';
import type { ShiftScheduleData } from '../types';

interface ShiftDisplayCardProps {
  shift: ShiftScheduleData;
  hasConflict: boolean;
  isSelectionMode: boolean;
  isSelected: boolean;
  onShiftClick: (shift: ShiftScheduleData) => void;
  onShiftSelection?: (shift: ShiftScheduleData, selected: boolean, event?: React.MouseEvent) => void;
  onDeleteShift: (shiftId: string, event: React.MouseEvent) => void;
  getEmployeeName: (employeeId: string) => string;
  getStatusColor: (status: string) => string;
  shiftType: 'morning' | 'evening' | 'night';
  hasSubmissions?: boolean;
  submissionsCount?: number;
  weekStartDate?: string;
  onAssignEmployee?: (employeeId: string, shiftId: string) => void;
  employees?: Array<{ id: string; first_name: string; last_name: string; }>;
  onOpenPendingSubmissions?: () => void;
}

export const ShiftDisplayCard: React.FC<ShiftDisplayCardProps> = ({
  shift,
  hasConflict,
  isSelectionMode,
  isSelected,
  onShiftClick,
  onShiftSelection,
  onDeleteShift,
  getEmployeeName,
  getStatusColor,
  shiftType,
  hasSubmissions = false,
  submissionsCount = 0,
  weekStartDate,
  onAssignEmployee,
  employees = [],
  onOpenPendingSubmissions
}) => {
  // פונקציה לבדיקה אם יש הקצאות שלא מולאו
  const getUnassignedCount = () => {
    const requiredEmployees = shift.required_employees || 1;
    const shiftAssignments = (shift as any).shift_assignments || [];
    
    // ספירת הקצאות שלא מולאו (ללא employee_id)
    const unassignedCount = shiftAssignments.filter((assignment: any) => !assignment.employee_id).length;
    
    // אם יש פחות הקצאות מהנדרש, זה אומר שחסרות הקצאות
    const missingAssignments = Math.max(0, requiredEmployees - shiftAssignments.length);
    
    return unassignedCount + missingAssignments;
  };

  // פונקציה לבדיקה אם יש עובד מוקצה
  const hasAssignedEmployee = () => {
    const shiftAssignments = (shift as any).shift_assignments || [];
    return shift.employee_id || shiftAssignments.some((assignment: any) => assignment.employee_id);
  };
  // Debug logs for assignments - עם alert כדי שנראה בוודאות
  const assignmentsData = (shift as any).shift_assignments;
  
  if (shift.id === 'f2ee861e-7a60-423a-a59b-a046880680a3') {
    alert('בדיקת הקצאות למשמרת: ' + JSON.stringify({
      shiftId: shift.id,
      employeeId: shift.employee_id,
      requiredEmployees: shift.required_employees,
      assignmentsData: assignmentsData,
      assignmentsType: typeof assignmentsData,
      assignmentsLength: Array.isArray(assignmentsData) ? assignmentsData.length : 'לא מערך'
    }, null, 2));
  }
  
  console.log('🔍 ShiftDisplayCard assignments debug:', {
    shiftId: shift.id,
    startTime: shift.start_time,
    endTime: shift.end_time,
    employeeId: shift.employee_id,
    shiftAssignments: assignmentsData,
    shiftAssignmentsLength: Array.isArray(assignmentsData) ? assignmentsData.length : 'לא מערך',
    requiredEmployees: shift.required_employees,
    employeesAvailable: employees.length,
    employeesList: employees.map(emp => ({ id: emp.id, name: `${emp.first_name} ${emp.last_name}` })),
    rawShiftData: shift
  });
  const handleShiftCardClick = (e: React.MouseEvent) => {
    console.log('👆 Shift card clicked:', { shiftId: shift.id, isSelectionMode, isSelected });
    if (isSelectionMode && onShiftSelection) {
      e.preventDefault();
      e.stopPropagation();
      console.log('📋 Toggling selection for shift:', shift.id);
      onShiftSelection(shift, !isSelected, e);
    } else {
      console.log('🔓 Opening shift details for:', shift.id);
      onShiftClick(shift);
    }
  };

  const handleShiftSelectionChange = (checked: boolean) => {
    console.log('☑️ Checkbox changed:', { shiftId: shift.id, checked });
    if (onShiftSelection) {
      const mockEvent = {
        preventDefault: () => {},
        stopPropagation: () => {}
      } as React.MouseEvent;
      onShiftSelection(shift, !!checked, mockEvent);
    }
  };

  const getShiftTypeColor = () => {
    // אם המשמרת מאוישת ומאושרת, החזר רקע ירוק מלא
    if (shift.employee_id && shift.status === 'approved') {
      return 'border-l-4 border-l-green-600 bg-green-100 hover:bg-green-150 border-green-400';
    }
    
    // אם המשמרת מאוישת אבל לא מאושרת, החזר רקע צהוב מלא
    if (shift.employee_id) {
      return 'border-l-4 border-l-yellow-600 bg-yellow-100 hover:bg-yellow-150 border-yellow-400';
    }
    
    // אם המשמרת לא מאוישת, השתמש בצבעים לפי סוג המשמרת
    switch (shiftType) {
      case 'morning':
        return 'border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50 via-amber-25 to-white hover:from-amber-100';
      case 'evening':
        return 'border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50 via-orange-25 to-white hover:from-orange-100';
      case 'night':
        return 'border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 via-purple-25 to-white hover:from-purple-100';
      default:
        return 'border-l-4 border-l-gray-400 bg-gradient-to-r from-gray-50 to-white';
    }
  };

  const getShiftTypeLabel = () => {
    switch (shiftType) {
      case 'morning':
        return 'בוקר';
      case 'evening':
        return 'ערב';
      case 'night':
        return 'לילה';
      default:
        return '';
    }
  };

  // פונקציה להצגת השעות בסדר הנכון
  const getFormattedTimeRange = () => {
    const startTime = shift.start_time;
    const endTime = shift.end_time;
    
    // ודא שהשעות מוצגות בסדר הנכון: התחלה - סיום
    return `${startTime} - ${endTime}`;
  };

  const getShiftTooltipContent = () => {
    return (
      <div className="space-y-2 max-w-xs" dir="rtl">
         <div className="flex items-center gap-2">
           <Clock className="h-4 w-4" />
           <span className="font-medium">זמנים:</span>
           <span>{getFormattedTimeRange()}</span>
         </div>
        
        {shift.branch_name && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="font-medium">סניף:</span>
            <span>{shift.branch_name}</span>
          </div>
        )}
        
        <div className={`flex items-center gap-2 ${
          shift.employee_id 
            ? shift.status === 'approved'
              ? 'p-2 bg-green-50 rounded border border-green-200'
              : 'p-2 bg-yellow-50 rounded border border-yellow-200'
            : ''
        }`}>
          <User className={`h-4 w-4 ${
            shift.employee_id 
              ? shift.status === 'approved' 
                ? 'text-green-700' 
                : 'text-yellow-700'
              : ''
          }`} />
          <span className={`font-medium ${
            shift.employee_id 
              ? shift.status === 'approved' 
                ? 'text-green-800' 
                : 'text-yellow-800'
              : ''
          }`}>עובד:</span>
          <span className={
            shift.employee_id 
              ? shift.status === 'approved' 
                ? 'text-green-800 font-semibold' 
                : 'text-yellow-800 font-semibold'
              : ''
          }>
            {shift.employee_id ? getEmployeeName(shift.employee_id) : 'לא מוקצה'}
          </span>
          {shift.employee_id && (
            <Badge className={
              shift.status === 'approved' 
                ? 'bg-green-600 text-white text-xs' 
                : 'bg-yellow-600 text-white text-xs'
            }>
              {shift.status === 'approved' ? '✓ מאושר' : '⏳ ממתין לאישור'}
            </Badge>
          )}
        </div>
        
        {shift.role && (
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            <span className="font-medium">תפקיד:</span>
            <span>{shift.role}</span>
          </div>
        )}
        
        {hasSubmissions && (
          <div className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-200">
            <FileText className="h-4 w-4 text-green-600" />
            <span className="font-medium text-green-700">הגשות משמרות:</span>
            <Badge className="bg-green-100 text-green-800 border-green-300">
              {submissionsCount} הגשות
            </Badge>
          </div>
        )}
        
        <div className="border-t pt-2">
          <div className="flex items-center gap-2">
            <span className="font-medium">סטטוס:</span>
            <Badge variant="secondary" className={`${getStatusColor(shift.status || 'pending')} text-xs`}>
              {shift.status === 'approved' ? 'מאושר' : 
               shift.status === 'pending' ? 'ממתין לאישור' :
               shift.status === 'rejected' ? 'נדחה' : 'הושלם'}
            </Badge>
          </div>
        </div>
        
        {hasConflict && (
          <div className="flex items-center gap-2 p-2 bg-red-50 rounded border border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-red-600 font-medium">זוהתה התנגשות בזמנים!</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`relative group p-3 border rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 ${
              getShiftTypeColor()
            } ${hasConflict ? 'border-red-300 bg-red-50' : ''} ${
              isSelectionMode && isSelected ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-300 scale-105' : ''
            } ${isSelectionMode ? 'transform hover:scale-102' : ''} ${
              hasSubmissions ? 'ring-2 ring-green-400 bg-green-50 border-green-300' : ''
            }`}
            onClick={handleShiftCardClick}
          >
      {/* סוג משמרת - קטן ובפינה */}
      <div className="absolute top-1 left-1">
        <Badge 
          variant="outline" 
          className={`text-[10px] px-1 py-0 h-4 ${
            shiftType === 'morning' ? 'bg-amber-100 text-amber-700 border-amber-300' :
            shiftType === 'evening' ? 'bg-orange-100 text-orange-700 border-orange-300' :
            'bg-purple-100 text-purple-700 border-purple-300'
          }`}
        >
          {getShiftTypeLabel()}
        </Badge>
      </div>

      {/* Selection checkbox - appears in selection mode */}
      {isSelectionMode && (
        <div className="absolute top-2 right-2 z-20 animate-fade-in" onClick={(e) => e.stopPropagation()}>
          <div className={`p-1 rounded-full ${isSelected ? 'bg-blue-600' : 'bg-white shadow-md border-2 border-blue-300'} transition-all duration-200`}>
            <Checkbox
              checked={isSelected}
              onCheckedChange={handleShiftSelectionChange}
              className="h-5 w-5 border-0 data-[state=checked]:bg-transparent data-[state=checked]:text-white"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
      
      {/* Delete button - appears on hover when not in selection mode */}
      {!isSelectionMode && (
        <Button
          size="sm"
          variant="destructive"
          className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          onClick={(e) => onDeleteShift(shift.id, e)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}
      
      <div className="space-y-2 mt-4">
        {/* סניף - ראשון ובולט */}
        {shift.branch_name && (
          <div className="flex items-center justify-center">
            <Badge className="bg-blue-600 text-white font-medium px-3 py-1 shadow-sm">
              <MapPin className="h-3 w-3 ml-1" />
              {shift.branch_name}
            </Badge>
          </div>
        )}
        
        {/* שעות משמרת - שני */}
         <div className="flex items-center justify-center">
           <Badge variant="outline" className="bg-white border-2 font-medium px-3 py-1 shadow-sm">
             <Clock className="h-3 w-3 ml-1" />
             {getFormattedTimeRange()}
           </Badge>
         </div>
        
      {/* הקצאות עובדים - תצוגה מרוכזת ויפה */}
        <div className="flex flex-col items-center gap-2 w-full">
          {hasAssignedEmployee() ? (
            <div className="w-full space-y-2">
              {/* עובד ראשי מוקצה */}
              {shift.employee_id && (
                <div className="flex justify-center">
                  <div className={`px-3 py-2 rounded-lg font-medium text-sm shadow-sm border-2 ${
                    shift.status === 'approved' 
                      ? 'bg-green-100 text-green-800 border-green-300' 
                      : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                  }`}>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {getEmployeeName(shift.employee_id)}
                    </div>
                  </div>
                </div>
              )}
              
              {/* הקצאות נוספות במקרה של מספר עובדים */}
              {(() => {
                const additionalAssignments = ((shift as any).shift_assignments || [])
                  .filter((assignment: any) => assignment.employee_id && assignment.employee_id !== shift.employee_id);
                
                console.log('🔍 Additional assignments debug:', {
                  shiftId: shift.id,
                  shiftEmployeeId: shift.employee_id,
                  allAssignments: (shift as any).shift_assignments,
                  filteredAssignments: additionalAssignments,
                  additionalCount: additionalAssignments.length
                });
                
                return additionalAssignments.map((assignment: any, index: number) => {
                  const assignedEmployee = employees.find(emp => emp.id === assignment.employee_id);
                  console.log('👤 Rendering additional assignment:', {
                    assignmentId: assignment.id,
                    employeeId: assignment.employee_id,
                    foundEmployee: assignedEmployee,
                    assignmentType: assignment.type
                  });
                  
                  return (
                    <div key={assignment.id || index} className="flex justify-center">
                      <div className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs">
                        <User className="h-3 w-3 inline ml-1" />
                        {assignedEmployee ? `${assignedEmployee.first_name} ${assignedEmployee.last_name}` : "לא ידוע"}
                        {assignment.type && <span className="mr-1">({assignment.type})</span>}
                      </div>
                    </div>
                  );
                });
              })()}
              
              {/* הקצאות ללא עובד מוקצה */}
              {((shift as any).shift_assignments || [])
                .filter((assignment: any) => !assignment.employee_id)
                .map((assignment: any, index: number) => (
                  <div key={`unassigned-${assignment.id || index}`} className="flex justify-center">
                    <div className="px-2 py-1 bg-orange-50 text-orange-700 border border-orange-200 rounded text-xs">
                      <User className="h-3 w-3 inline ml-1" />
                      לא מוקצה {assignment.type && `(${assignment.type})`}
                    </div>
                  </div>
                ))}
              
              {/* מצב הקצאה */}
              <div className="flex justify-center">
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  shift.status === 'approved' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-yellow-500 text-white'
                }`}>
                  {shift.status === 'approved' ? 'מאושר' : 'ממתין לאישור'}
                </div>
              </div>
              
              {/* הקצאות חסרות */}
              {(() => {
                const requiredEmployees = shift.required_employees || 1;
                const assignedCount = (shift.employee_id ? 1 : 0) + 
                  ((shift as any).shift_assignments || []).filter((a: any) => a.employee_id).length;
                const unassignedCount = ((shift as any).shift_assignments || []).filter((a: any) => !a.employee_id).length;
                const missingCount = Math.max(0, requiredEmployees - assignedCount - unassignedCount);
                
                if (missingCount > 0) {
                  return (
                    <div className="flex justify-center">
                      <div className="px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded text-xs">
                        <User className="h-3 w-3 inline ml-1" />
                        {missingCount} עמדות חסרות
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          ) : (
            <div className="w-full space-y-2">
              {/* משמרת ללא עובדים מוקצים */}
              <div className="flex justify-center">
                <div className="px-3 py-2 bg-gray-100 text-gray-600 border-2 border-gray-200 rounded-lg text-sm font-medium">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    אינה מאוישת
                  </div>
                </div>
              </div>
              
              {/* סטטוס ממתין */}
              <div className="flex justify-center">
                <div className="px-2 py-1 bg-yellow-500 text-white rounded text-xs font-medium">
                  ממתין לאישור הקצאה
                </div>
              </div>
              
              {/* מספר עמדות נדרשות */}
              <div className="flex justify-center">
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300 text-xs">
                  {shift.required_employees || 1} עמדות נדרשות
                </Badge>
              </div>
              
              {/* כפתור המלצות למשמרות ריקות */}
              {weekStartDate && onAssignEmployee && (
                <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                  <EmployeeRecommendationEngine
                    shiftId={shift.id}
                    shiftTime={getFormattedTimeRange()}
                    shiftDate={shift.shift_date}
                    weekStartDate={weekStartDate}
                    onEmployeeSelected={onAssignEmployee}
                  >
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 text-xs px-2 py-1"
                    >
                      <Lightbulb className="h-3 w-3" />
                      שיוך מהיר
                    </Button>
                  </EmployeeRecommendationEngine>
                </div>
              )}
            </div>
          )}
        </div>

        {/* אינדיקטור הגשות משמרות - לחיץ */}
        {hasSubmissions && (
          <div className="flex items-center justify-center">
            <Badge 
              className="bg-green-600 text-white px-2 py-1 text-xs shadow-sm animate-pulse cursor-pointer hover:bg-green-700 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenPendingSubmissions) {
                  onOpenPendingSubmissions();
                } else {
                  // Fallback - call global function if it exists
                  const event = new CustomEvent('openPendingSubmissions');
                  window.dispatchEvent(event);
                }
              }}
            >
              <FileText className="h-3 w-3 ml-1" />
              {submissionsCount} הגשות
            </Badge>
          </div>
        )}

        {/* תפקיד - אם קיים */}
        {shift.role && (
          <div className="flex items-center justify-center">
            <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 px-2 py-1 text-xs">
              {shift.role}
            </Badge>
          </div>
        )}
      </div>
      
      {/* סטטוס וקונפליקטים - רביעי במטה */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
        <Badge variant="secondary" className={`${getStatusColor(shift.status || 'pending')} text-xs shadow-sm`}>
          {shift.status === 'approved' ? 'מאושר' : 
           shift.status === 'pending' ? 'ממתין' :
           shift.status === 'rejected' ? 'נדחה' : 'הושלם'}
        </Badge>
        {hasConflict && (
          <div className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-red-500" />
            <span className="text-xs text-red-500 font-medium">התנגשות</span>
          </div>
        )}
      </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-white border shadow-lg max-w-sm">
          {getShiftTooltipContent()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};