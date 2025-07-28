import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UserPlus, Clock, MapPin, User, AlertCircle } from 'lucide-react';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { useExistingEmployees } from '@/hooks/useExistingEmployees';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Employee, Branch, ShiftScheduleData } from '../types';

interface UnsubmittedEmployeeAssignmentProps {
  shift: ShiftScheduleData;
  employees: Employee[];
  branches: Branch[];
  onShiftUpdate: (shiftId: string, updates: Partial<ShiftScheduleData>) => void;
  onClose?: () => void;
}

export const UnsubmittedEmployeeAssignment: React.FC<UnsubmittedEmployeeAssignmentProps> = ({
  shift,
  employees,
  branches,
  onShiftUpdate,
  onClose
}) => {
  console.log('🚀 UnsubmittedEmployeeAssignment RENDERING for shift:', shift?.id, 'onShiftUpdate exists:', !!onShiftUpdate);
  
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const { businessId } = useCurrentBusiness();
  const { data: allEmployees = [] } = useExistingEmployees(businessId);

  // Filter employees who haven't been assigned to this shift and are active
  const availableEmployees = allEmployees.filter(emp => 
    emp.id !== shift.employee_id && (emp.is_active !== false) && (emp.is_archived !== true)
  );

  const getEmployeeName = (employeeId: string) => {
    const employee = allEmployees.find(emp => emp.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : '';
  };

  const getBranchName = (branchId: string | null) => {
    if (!branchId) return 'לא משויך';
    const branch = branches.find(br => br.id === branchId);
    return branch ? branch.name : 'לא ידוע';
  };

  const handleAssignEmployee = async () => {
    if (!selectedEmployeeId) {
      toast.error('יש לבחור עובד');
      return;
    }

    setIsAssigning(true);
    
    try {
      // Check for conflicts in the same branch on the same date
      const { data: existingShifts, error: checkError } = await supabase
        .from('scheduled_shifts')
        .select('*')
        .eq('employee_id', selectedEmployeeId)
        .eq('shift_date', shift.shift_date)
        .eq('branch_id', shift.branch_id)
        .neq('id', shift.id);

      if (checkError) {
        throw checkError;
      }

      let shouldProceed = true;
      if (existingShifts && existingShifts.length > 0) {
        const conflictTimes = existingShifts.map(s => `${s.start_time}-${s.end_time}`).join(', ');
        shouldProceed = window.confirm(
          `⚠️ העובד ${getEmployeeName(selectedEmployeeId)} כבר משויך למשמרת באותו יום באותו סניף (${conflictTimes}).\n\n` +
          `האם אתה בטוח שברצונך לשבץ אותו גם למשמרת ${shift.start_time}-${shift.end_time}?`
        );
      }

      if (!shouldProceed) {
        setIsAssigning(false);
        return;
      }

      // Update the shift
      const updates: Partial<ShiftScheduleData> = {
        employee_id: selectedEmployeeId,
        status: 'assigned',
        notes: notes || shift.notes
      };

      await onShiftUpdate(shift.id, updates);
      
      toast.success(`העובד ${getEmployeeName(selectedEmployeeId)} שובץ בהצלחה למשמרת`);
      setShowDialog(false);
      onClose?.();
      
    } catch (error) {
      console.error('Error assigning employee:', error);
      toast.error('שגיאה בשיבוץ העובד');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveEmployee = async () => {
    if (!shift.employee_id) return;

    const shouldProceed = window.confirm(
      `האם אתה בטוח שברצונך לבטל את השיבוץ של ${getEmployeeName(shift.employee_id)} מהמשמרת?`
    );

    if (!shouldProceed) return;

    setIsAssigning(true);
    
    try {
      const updates: Partial<ShiftScheduleData> = {
        employee_id: null,
        status: 'pending'
      };

      await onShiftUpdate(shift.id, updates);
      toast.success('השיבוץ בוטל בהצלחה');
      onClose?.();
      
    } catch (error) {
      console.error('Error removing employee:', error);
      toast.error('שגיאה בביטול השיבוץ');
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button
          variant={shift.employee_id ? "outline" : "default"}
          size="sm"
          className="flex items-center gap-1"
          onClick={() => {
            console.log('🔥 CLICKED UnsubmittedEmployeeAssignment BUTTON for shift:', shift.id);
          }}
        >
          <UserPlus className="h-4 w-4" />
          {shift.employee_id ? 'שנה עובד' : 'שבץ עובד'}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            שיבוץ עובד למשמרת
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Shift details */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">פרטי המשמרת</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-500" />
                {shift.start_time} - {shift.end_time}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-500" />
                {getBranchName(shift.branch_id)}
              </div>
              <div className="text-sm text-gray-600">
                תאריך: {new Date(shift.shift_date).toLocaleDateString('he-IL')}
              </div>
              {shift.employee_id && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-green-600" />
                  עובד נוכחי: {getEmployeeName(shift.employee_id)}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Employee selection */}
          <div className="space-y-2">
            <Label htmlFor="employee-select">בחר עובד</Label>
            <Select
              value={selectedEmployeeId}
              onValueChange={setSelectedEmployeeId}
            >
              <SelectTrigger id="employee-select">
                <SelectValue placeholder="בחר עובד מהרשימה" />
              </SelectTrigger>
              <SelectContent className="max-h-48 overflow-auto">
                {availableEmployees.length === 0 ? (
                  <div className="p-2 text-center text-gray-500">
                    אין עובדים זמינים
                  </div>
                ) : (
                  availableEmployees.map(employee => (
                    <SelectItem key={employee.id} value={employee.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {employee.first_name} {employee.last_name}
                        {employee.employee_id && (
                          <Badge variant="outline" className="text-xs">
                            {employee.employee_id}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">הערות נוספות</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="הערות למשמרת..."
              className="min-h-[80px]"
            />
          </div>

          {/* Warning message */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">שים לב</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              שיבוץ עובד שלא הגיש בקשה דרך המערכת יוצר משמרת ללא אישור מראש.
              וודא שהעובד יכול לבצע את המשמרת לפני השיבוץ.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex justify-between gap-2">
            <div className="flex gap-2">
              <Button
                onClick={handleAssignEmployee}
                disabled={!selectedEmployeeId || isAssigning}
                className="flex items-center gap-1"
              >
                <UserPlus className="h-4 w-4" />
                {isAssigning ? 'משבץ...' : 'שבץ עובד'}
              </Button>
              
              {shift.employee_id && (
                <Button
                  variant="outline"
                  onClick={handleRemoveEmployee}
                  disabled={isAssigning}
                  className="flex items-center gap-1 text-red-600 hover:text-red-700"
                >
                  בטל שיבוץ
                </Button>
              )}
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={isAssigning}
            >
              ביטול
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
