import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, Users, MapPin, User, X } from 'lucide-react';
import type { ShiftScheduleData, Employee, Branch } from './types';

interface BulkEditShiftsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedShifts: ShiftScheduleData[];
  employees: Employee[];
  branches: Branch[];
  onUpdate: (updates: Partial<ShiftScheduleData>) => Promise<void>;
}

interface BulkUpdateFields {
  start_time?: string;
  end_time?: string;
  employee_id?: string;
  branch_id?: string;
  role?: string;
  notes?: string;
  status?: string;
  required_employees?: number;
}

export const BulkEditShiftsDialog: React.FC<BulkEditShiftsDialogProps> = ({
  isOpen,
  onClose,
  selectedShifts,
  employees,
  branches,
  onUpdate
}) => {
  const [fieldsToUpdate, setFieldsToUpdate] = useState<Set<keyof BulkUpdateFields>>(new Set());
  const [updates, setUpdates] = useState<BulkUpdateFields>({});
  const [isUpdating, setIsUpdating] = useState(false);

  const handleFieldToggle = (field: keyof BulkUpdateFields, checked: boolean) => {
    const newFields = new Set(fieldsToUpdate);
    if (checked) {
      newFields.add(field);
    } else {
      newFields.delete(field);
      const newUpdates = { ...updates };
      delete newUpdates[field];
      setUpdates(newUpdates);
    }
    setFieldsToUpdate(newFields);
  };

  const handleUpdateChange = (field: keyof BulkUpdateFields, value: any) => {
    setUpdates(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (fieldsToUpdate.size === 0) {
      return;
    }

    setIsUpdating(true);
    try {
      const updateData: Partial<ShiftScheduleData> = {};
      fieldsToUpdate.forEach(field => {
        if (updates[field] !== undefined) {
          (updateData as any)[field] = updates[field];
        }
      });

      await onUpdate(updateData);
      onClose();
      setFieldsToUpdate(new Set());
      setUpdates({});
    } catch (error) {
      console.error('Error updating shifts:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getUniqueValues = (field: keyof ShiftScheduleData) => {
    const values = selectedShifts.map(shift => (shift as any)[field]).filter(Boolean);
    return [...new Set(values)];
  };

  const formatShiftTime = (shift: ShiftScheduleData) => {
    return `${shift.start_time} - ${shift.end_time}`;
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : 'לא מוקצה';
  };

  const getBranchName = (branchId: string) => {
    const branch = branches.find(br => br.id === branchId);
    return branch ? branch.name : 'ללא סניף';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[800px] max-h-[95vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>עריכה מרובה של משמרות</span>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {selectedShifts.length} משמרות נבחרו
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selected Shifts Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              משמרות נבחרות:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {selectedShifts.map((shift, index) => (
                <div key={shift.id} className="text-sm p-2 bg-white rounded border">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {new Date(shift.shift_date).toLocaleDateString('he-IL')}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {formatShiftTime(shift)}
                    </Badge>
                  </div>
                  <div className="mt-1 text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {shift.employee_id ? getEmployeeName(shift.employee_id) : 'לא מוקצה'}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {shift.branch_id ? getBranchName(shift.branch_id) : 'ללא סניף'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Update Fields */}
          <div className="space-y-4">
            <h4 className="font-medium">בחר שדות לעדכון:</h4>

            {/* Time Fields */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="time"
                  checked={fieldsToUpdate.has('start_time') || fieldsToUpdate.has('end_time')}
                  onCheckedChange={(checked) => {
                    handleFieldToggle('start_time', !!checked);
                    handleFieldToggle('end_time', !!checked);
                  }}
                />
                <Label htmlFor="time" className="text-sm font-medium">
                  <Clock className="inline h-4 w-4 ml-1" />
                  זמני משמרת
                </Label>
              </div>
              
              {(fieldsToUpdate.has('start_time') || fieldsToUpdate.has('end_time')) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mr-6">
                  <div className="space-y-2">
                    <Label className="text-sm">שעת התחלה</Label>
                    <Input
                      type="time"
                      value={updates.start_time || ''}
                      onChange={(e) => handleUpdateChange('start_time', e.target.value)}
                      className="text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">שעת סיום</Label>
                    <Input
                      type="time"
                      value={updates.end_time || ''}
                      onChange={(e) => handleUpdateChange('end_time', e.target.value)}
                      className="text-base"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Employee Field */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="employee"
                  checked={fieldsToUpdate.has('employee_id')}
                  onCheckedChange={(checked) => handleFieldToggle('employee_id', !!checked)}
                />
                <Label htmlFor="employee" className="text-sm font-medium">
                  <User className="inline h-4 w-4 ml-1" />
                  עובד מוקצה
                </Label>
              </div>
              
              {fieldsToUpdate.has('employee_id') && (
                <div className="mr-6">
                  <Select 
                    value={updates.employee_id || 'no_employee'} 
                    onValueChange={(value) => 
                      handleUpdateChange('employee_id', value === 'no_employee' ? '' : value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="בחר עובד..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no_employee">הסר הקצאה</SelectItem>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.first_name} {employee.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Branch Field */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="branch"
                  checked={fieldsToUpdate.has('branch_id')}
                  onCheckedChange={(checked) => handleFieldToggle('branch_id', !!checked)}
                />
                <Label htmlFor="branch" className="text-sm font-medium">
                  <MapPin className="inline h-4 w-4 ml-1" />
                  סניף
                </Label>
              </div>
              
              {fieldsToUpdate.has('branch_id') && (
                <div className="mr-6">
                  <Select 
                    value={updates.branch_id || ''} 
                    onValueChange={(value) => handleUpdateChange('branch_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="בחר סניף..." />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Role Field */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="role"
                  checked={fieldsToUpdate.has('role')}
                  onCheckedChange={(checked) => handleFieldToggle('role', !!checked)}
                />
                <Label htmlFor="role" className="text-sm font-medium">
                  תפקיד/תיאור משמרת
                </Label>
              </div>
              
              {fieldsToUpdate.has('role') && (
                <div className="mr-6">
                  <Input
                    value={updates.role || ''}
                    onChange={(e) => handleUpdateChange('role', e.target.value)}
                    placeholder="הכנס תפקיד או תיאור..."
                  />
                </div>
              )}
            </div>

            {/* Required Employees Field */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="required_employees"
                  checked={fieldsToUpdate.has('required_employees')}
                  onCheckedChange={(checked) => handleFieldToggle('required_employees', !!checked)}
                />
                <Label htmlFor="required_employees" className="text-sm font-medium">
                  כמות עובדים נדרשת
                </Label>
              </div>
              
              {fieldsToUpdate.has('required_employees') && (
                <div className="mr-6">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateChange('required_employees', Math.max(1, (updates.required_employees || 1) - 1))}
                      disabled={(updates.required_employees || 1) <= 1}
                    >
                      -
                    </Button>
                    <div className="px-4 py-2 border rounded text-center min-w-[60px]">
                      {updates.required_employees || 1}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateChange('required_employees', Math.min(20, (updates.required_employees || 1) + 1))}
                      disabled={(updates.required_employees || 1) >= 20}
                    >
                      +
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Status Field */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="status"
                  checked={fieldsToUpdate.has('status')}
                  onCheckedChange={(checked) => handleFieldToggle('status', !!checked)}
                />
                <Label htmlFor="status" className="text-sm font-medium">
                  סטטוס משמרת
                </Label>
              </div>
              
              {fieldsToUpdate.has('status') && (
                <div className="mr-6">
                  <Select 
                    value={updates.status || ''} 
                    onValueChange={(value) => handleUpdateChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="בחר סטטוס..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">ממתין</SelectItem>
                      <SelectItem value="approved">מאושר</SelectItem>
                      <SelectItem value="rejected">נדחה</SelectItem>
                      <SelectItem value="completed">הושלם</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Notes Field */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="notes"
                  checked={fieldsToUpdate.has('notes')}
                  onCheckedChange={(checked) => handleFieldToggle('notes', !!checked)}
                />
                <Label htmlFor="notes" className="text-sm font-medium">
                  הערות
                </Label>
              </div>
              
              {fieldsToUpdate.has('notes') && (
                <div className="mr-6">
                  <Textarea
                    value={updates.notes || ''}
                    onChange={(e) => handleUpdateChange('notes', e.target.value)}
                    placeholder="הכנס הערות..."
                    rows={3}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
            <Button
              onClick={handleSubmit}
              disabled={fieldsToUpdate.size === 0 || isUpdating}
              className="w-full sm:w-auto"
            >
              {isUpdating ? 'מעדכן...' : `עדכן ${selectedShifts.length} משמרות`}
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              ביטול
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};