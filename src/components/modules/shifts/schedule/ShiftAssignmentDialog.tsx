
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
  allShifts: ShiftScheduleData[]; // All shifts to check for conflicts
  onAssign: (shiftId: string, employeeId: string) => Promise<void>;
  onUnassign: (shiftId: string) => Promise<void>;
}

export const ShiftAssignmentDialog: React.FC<ShiftAssignmentDialogProps> = ({
  isOpen,
  onClose,
  shift,
  employees,
  allShifts,
  onAssign,
  onUnassign
}) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const currentEmployee = employees.find(emp => emp.id === shift.employee_id);
  
  // Get employees assigned to other branches on the same date
  const getEmployeesAssignedToOtherBranches = () => {
    return allShifts
      .filter(s => 
        s.shift_date === shift.shift_date && 
        s.employee_id && 
        s.branch_id !== shift.branch_id &&
        s.id !== shift.id // Don't count current shift
      )
      .map(s => s.employee_id)
      .filter(Boolean);
  };
  
  const assignedEmployeeIds = getEmployeesAssignedToOtherBranches();
  
  const filteredEmployees = employees.filter(employee => {
    // First check search term
    const fullName = `${employee.first_name} ${employee.last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || 
                         employee.employee_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    return true;
  });

  // Separate available and unavailable employees
  const availableEmployees = filteredEmployees.filter(emp => !assignedEmployeeIds.includes(emp.id));
  const unavailableEmployees = filteredEmployees.filter(emp => assignedEmployeeIds.includes(emp.id));

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
                {availableEmployees.length === 0 && unavailableEmployees.length === 0 ? (
                  <SelectItem value="no_employees" disabled>
                    לא נמצאו עובדים
                  </SelectItem>
                ) : (
                  <>
                    {/* Available employees */}
                    {availableEmployees.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-xs font-medium text-green-700 bg-green-50 border-b">
                          זמינים ({availableEmployees.length})
                        </div>
                        {availableEmployees.map(employee => (
                          <SelectItem key={employee.id} value={employee.id}>
                            <div className="flex items-center gap-2">
                              <span className="text-green-700">✓</span>
                              <span>{employee.first_name} {employee.last_name}</span>
                              {employee.employee_id && (
                                <Badge variant="secondary" className="text-xs">
                                  {employee.employee_id}
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </>
                    )}
                    
                    {/* Unavailable employees */}
                    {unavailableEmployees.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-xs font-medium text-red-700 bg-red-50 border-b">
                          לא זמינים - משויכים לסניף אחר ({unavailableEmployees.length})
                        </div>
                        {unavailableEmployees.map(employee => (
                          <SelectItem key={employee.id} value={employee.id} disabled>
                            <div className="flex items-center gap-2 opacity-60">
                              <span className="text-red-500">✗</span>
                              <span className="line-through">{employee.first_name} {employee.last_name}</span>
                              {employee.employee_id && (
                                <Badge variant="secondary" className="text-xs">
                                  {employee.employee_id}
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Availability Summary */}
          <div className="p-3 bg-gray-50 rounded-lg text-sm">
            <div className="flex justify-between">
              <span className="text-green-700">✓ זמינים: {availableEmployees.length}</span>
              <span className="text-red-700">✗ לא זמינים: {unavailableEmployees.length}</span>
            </div>
            {unavailableEmployees.length > 0 && (
              <p className="text-xs text-gray-600 mt-1">
                עובדים לא זמינים כבר משויכים לסניף אחר באותו תאריך
              </p>
            )}
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
            {currentEmployee && (
              <Button 
                variant="destructive"
                onClick={handleUnassign} 
                disabled={isAssigning}
              >
                {isAssigning ? 'מסיר...' : 'הסר עובד'}
              </Button>
            )}
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
