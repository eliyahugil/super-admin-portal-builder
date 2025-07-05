
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, Calendar, Clock, MapPin } from 'lucide-react';
import type { EmployeeData, ShiftScheduleData } from './types';

interface ShiftAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  shift: ShiftScheduleData;
  employees: EmployeeData[];
  onAssign: (shiftId: string, employeeId: string) => void;
  onUnassign: (shiftId: string) => void;
}

export const ShiftAssignmentDialog: React.FC<ShiftAssignmentDialogProps> = ({
  isOpen,
  onClose,
  shift,
  employees,
  onAssign,
  onUnassign
}) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(shift.employee_id || '');
  
  const currentEmployee = employees.find(emp => emp.id === shift.employee_id);
  const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeId);

  const handleAssign = () => {
    if (selectedEmployeeId && selectedEmployeeId !== shift.employee_id) {
      onAssign(shift.id, selectedEmployeeId);
    }
    onClose();
  };

  const handleUnassign = () => {
    onUnassign(shift.id);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            הקצאת עובד למשמרת
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Shift Info */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>{new Date(shift.shift_date).toLocaleDateString('he-IL')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{shift.start_time} - {shift.end_time}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{shift.branch_name}</span>
            </div>
            {shift.role_preference && (
              <Badge variant="outline" className="mt-2">
                {shift.role_preference}
              </Badge>
            )}
          </div>

          {/* Current Assignment */}
          <div className="space-y-2">
            <label className="text-sm font-medium">עובד נוכחי:</label>
            {currentEmployee ? (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <span className="font-medium text-green-800">
                  {currentEmployee.first_name} {currentEmployee.last_name}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUnassign}
                  className="text-red-600 hover:bg-red-50"
                >
                  בטל הקצאה
                </Button>
              </div>
            ) : (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <span className="text-yellow-800">לא מוקצה עובד</span>
              </div>
            )}
          </div>

          {/* Employee Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">בחירת עובד חדש:</label>
            <Select
              value={selectedEmployeeId}
              onValueChange={setSelectedEmployeeId}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר עובד" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">ללא הקצאה</SelectItem>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    <div className="flex items-center gap-2">
                      <span>{employee.first_name} {employee.last_name}</span>
                      {employee.phone && (
                        <span className="text-xs text-gray-500">({employee.phone})</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview */}
          {selectedEmployee && selectedEmployeeId !== shift.employee_id && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-800">
                <strong>תצוגה מקדימה:</strong> המשמרת תוקצה ל{selectedEmployee.first_name} {selectedEmployee.last_name}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              ביטול
            </Button>
            <Button 
              onClick={handleAssign}
              disabled={selectedEmployeeId === shift.employee_id}
            >
              עדכן הקצאה
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
