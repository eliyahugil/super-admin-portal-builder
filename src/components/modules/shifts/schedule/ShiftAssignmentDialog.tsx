
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { User, Search, Clock, Calendar } from 'lucide-react';
import type { ShiftScheduleData, Employee } from './types';

interface ShiftAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  shift: ShiftScheduleData;
  employees: Employee[];
  onAssign: (shiftId: string, employeeId: string) => Promise<void>;
  onUnassign: (shiftId: string) => Promise<void>;
}

export const ShiftAssignmentDialog: React.FC<ShiftAssignmentDialogProps> = ({
  isOpen,
  onClose,
  shift,
  employees,
  onAssign,
  onUnassign
}) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const currentEmployee = employees.find(emp => emp.id === shift.employee_id);
  
  const filteredEmployees = employees.filter(employee => {
    const fullName = `${employee.first_name} ${employee.last_name}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || 
           employee.employee_id?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleAssign = async () => {
    if (!selectedEmployeeId) {
      alert('אנא בחר עובד');
      return;
    }

    setIsAssigning(true);
    try {
      await onAssign(shift.id, selectedEmployeeId);
      onClose();
    } catch (error) {
      console.error('Error assigning employee:', error);
      alert('שגיאה בהקצאת העובד');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUnassign = async () => {
    if (!confirm('האם להסיר את העובד מהמשמרת?')) {
      return;
    }

    setIsAssigning(true);
    try {
      await onUnassign(shift.id);
      onClose();
    } catch (error) {
      console.error('Error unassigning employee:', error);
      alert('שגיאה בהסרת העובד');
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>הקצאת עובד למשמרת</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Shift Details */}
          <div className="p-3 bg-gray-50 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-600" />
              <span className="font-medium">
                {new Date(shift.shift_date).toLocaleDateString('he-IL', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-600" />
              <span>{shift.start_time} - {shift.end_time}</span>
            </div>
          </div>

          {/* Current Assignment */}
          {currentEmployee && (
            <div className="p-3 border rounded-lg">
              <Label className="text-sm font-medium">עובד נוכחי:</Label>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{currentEmployee.first_name} {currentEmployee.last_name}</span>
                  {currentEmployee.employee_id && (
                    <Badge variant="secondary">{currentEmployee.employee_id}</Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUnassign}
                  disabled={isAssigning}
                >
                  הסר עובד
                </Button>
              </div>
            </div>
          )}

          {/* Employee Search */}
          <div className="space-y-2">
            <Label>חיפוש עובד</Label>
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
              <Input
                placeholder="חפש לפי שם או מספר עובד..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>

          {/* Employee Selection */}
          <div className="space-y-2">
            <Label>בחר עובד חדש</Label>
            <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
              <SelectTrigger>
                <SelectValue placeholder="בחר עובד..." />
              </SelectTrigger>
              <SelectContent>
                {filteredEmployees.length === 0 ? (
                  <SelectItem value="" disabled>
                    לא נמצאו עובדים
                  </SelectItem>
                ) : (
                  filteredEmployees.map(employee => (
                    <SelectItem key={employee.id} value={employee.id}>
                      <div className="flex items-center gap-2">
                        <span>{employee.first_name} {employee.last_name}</span>
                        {employee.employee_id && (
                          <Badge variant="secondary" className="text-xs">
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

          {/* Selected Employee Preview */}
          {selectedEmployeeId && (
            <div className="p-3 bg-green-50 rounded-lg">
              <Label className="text-sm font-medium text-green-800">עובד נבחר:</Label>
              {(() => {
                const employee = employees.find(emp => emp.id === selectedEmployeeId);
                return employee ? (
                  <div className="flex items-center gap-2 mt-1">
                    <User className="h-4 w-4 text-green-600" />
                    <span className="text-green-700">
                      {employee.first_name} {employee.last_name}
                    </span>
                    {employee.employee_id && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {employee.employee_id}
                      </Badge>
                    )}
                  </div>
                ) : null;
              })()}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleAssign} 
              disabled={!selectedEmployeeId || isAssigning}
            >
              {isAssigning ? 'מקצה...' : 'הקצה עובד'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              ביטול
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
