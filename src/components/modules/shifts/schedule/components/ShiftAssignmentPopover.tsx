import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { UserPlus, User, Search, X } from 'lucide-react';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { useExistingEmployees } from '@/hooks/useExistingEmployees';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Employee, Branch, ShiftScheduleData } from '../types';

interface ShiftAssignmentPopoverProps {
  shift: ShiftScheduleData;
  employees: Employee[];
  branches: Branch[];
  pendingSubmissions?: any[];
  onShiftUpdate: (shiftId: string, updates: Partial<ShiftScheduleData>) => void;
}

export const ShiftAssignmentPopover: React.FC<ShiftAssignmentPopoverProps> = ({
  shift,
  employees,
  branches,
  pendingSubmissions = [],
  onShiftUpdate
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const { businessId } = useCurrentBusiness();
  const { data: allEmployees = [] } = useExistingEmployees(businessId);

  // Get submitted employees for this shift
  const getSubmittedEmployeesForShift = (shift: ShiftScheduleData) => {
    if (!pendingSubmissions || pendingSubmissions.length === 0) return [];
    
    const submittedEmployeeIds = [];
    
    pendingSubmissions.forEach(submission => {
      const shiftBranch = branches.find(b => b.id === shift.branch_id);
      
      if (submission.shifts && Array.isArray(submission.shifts)) {
        const hasMatchingShift = submission.shifts.some(submittedShift => {
          const dateMatch = submittedShift.date === shift.shift_date;
          const startTimeMatch = submittedShift.start_time === shift.start_time;
          const endTimeMatch = submittedShift.end_time === shift.end_time;
          const branchMatch = submittedShift.branch_preference === shiftBranch?.name;
          
          return dateMatch && startTimeMatch && endTimeMatch && branchMatch;
        });
        
        if (hasMatchingShift) {
          submittedEmployeeIds.push(submission.employee_id);
        }
      }
    });
    
    return submittedEmployeeIds;
  };

  const submittedEmployeeIds = getSubmittedEmployeesForShift(shift);
  const submittedEmployees = allEmployees.filter(emp => submittedEmployeeIds.includes(emp.id));
  const filteredEmployees = allEmployees.filter(emp => 
    !submittedEmployeeIds.includes(emp.id) && 
    emp.id !== shift.employee_id &&
    (emp.is_active !== false) && 
    (emp.is_archived !== true) &&
    (emp.first_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     emp.last_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAssignEmployee = async (employeeId: string) => {
    setIsAssigning(true);
    
    try {
      // Check for conflicts
      const { data: existingShifts, error: checkError } = await supabase
        .from('scheduled_shifts')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('shift_date', shift.shift_date)
        .eq('branch_id', shift.branch_id)
        .neq('id', shift.id);

      if (checkError) throw checkError;

      if (existingShifts && existingShifts.length > 0) {
        const employee = allEmployees.find(emp => emp.id === employeeId);
        const employeeName = employee ? `${employee.first_name} ${employee.last_name}` : '';
        const conflictTimes = existingShifts.map(s => `${s.start_time}-${s.end_time}`).join(', ');
        
        const shouldProceed = window.confirm(
          `⚠️ העובד ${employeeName} כבר משויך למשמרת באותו יום באותו סניף (${conflictTimes}).\n\n` +
          `האם אתה בטוח שברצונך לשבץ אותו גם למשמרת ${shift.start_time}-${shift.end_time}?`
        );

        if (!shouldProceed) {
          setIsAssigning(false);
          return;
        }
      }

      const updates: Partial<ShiftScheduleData> = {
        employee_id: employeeId,
        status: 'assigned'
      };

      await onShiftUpdate(shift.id, updates);
      
      const employee = allEmployees.find(emp => emp.id === employeeId);
      const employeeName = employee ? `${employee.first_name} ${employee.last_name}` : '';
      toast.success(`העובד ${employeeName} שובץ בהצלחה למשמרת`);
      setIsOpen(false);
      setSearchTerm('');
      
    } catch (error) {
      console.error('Error assigning employee:', error);
      toast.error('שגיאה בשיבוץ העובד');
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={shift.employee_id ? "outline" : "default"}
          size="sm"
          className="flex items-center gap-1"
          onClick={(e) => {
            console.log('🔥 CLICKED ShiftAssignmentPopover BUTTON for shift:', shift.id);
            e.stopPropagation();
          }}
        >
          <UserPlus className="h-4 w-4" />
          {shift.employee_id ? 'שנה עובד' : 'שבץ עובד'}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-80 p-0" 
        dir="rtl" 
        side="left" 
        align="start"
        style={{ zIndex: 9999 }}
      >
        <div className="bg-background border rounded-lg shadow-lg">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">שיבוץ עובד למשמרת</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Submitted employees section */}
            {submittedEmployees.length > 0 && (
              <div>
                <div className="text-sm font-medium text-green-700 mb-2 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  עובדים שהגישו ({submittedEmployees.length})
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {submittedEmployees.map(employee => (
                    <div
                      key={employee.id}
                      className="flex items-center justify-between p-2 bg-green-50 rounded hover:bg-green-100 transition-colors"
                    >
                      <span className="text-green-800 font-medium text-sm">
                        {employee.first_name} {employee.last_name}
                      </span>
                      <Button
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => handleAssignEmployee(employee.id)}
                        disabled={isAssigning}
                      >
                        {isAssigning ? '...' : 'שבץ'}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search other employees */}
            <div>
              <div className="text-sm font-medium mb-2 flex items-center gap-1">
                <Search className="h-3 w-3" />
                חיפוש עובדים
              </div>
              <Input
                placeholder="הקלד שם עובד..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-sm"
              />
              
              <div className="mt-2 max-h-32 overflow-y-auto">
                {searchTerm === '' ? (
                  <div className="text-xs text-muted-foreground text-center py-2">
                    הקלד כדי לחפש עובדים
                  </div>
                ) : filteredEmployees.length === 0 ? (
                  <div className="text-xs text-muted-foreground text-center py-2">
                    לא נמצאו עובדים התואמים לחיפוש
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredEmployees.slice(0, 10).map(employee => (
                      <div
                        key={employee.id}
                        className="flex items-center justify-between p-2 bg-muted/30 rounded hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => handleAssignEmployee(employee.id)}
                      >
                        <span className="text-sm">{employee.first_name} {employee.last_name}</span>
                        <User className="h-3 w-3 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};