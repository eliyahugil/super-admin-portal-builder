import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Trash2, 
  Save,
  UserPlus
} from 'lucide-react';
import type { ShiftScheduleData, Employee, Branch } from './types';

interface ShiftDetailsDialogProps {
  shift: ShiftScheduleData;
  employees: Employee[];
  branches: Branch[];
  onClose: () => void;
  onUpdate: (shiftId: string, updates: Partial<ShiftScheduleData>) => void;
  onDelete: (shiftId: string) => void;
  onAssignEmployee?: (shift: ShiftScheduleData) => void;
}

export const ShiftDetailsDialog: React.FC<ShiftDetailsDialogProps> = ({
  shift,
  employees,
  branches,
  onClose,
  onUpdate,
  onDelete,
  onAssignEmployee
}) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    shift_date: shift.shift_date,
    start_time: shift.start_time,
    end_time: shift.end_time,
    employee_id: shift.employee_id || '',
    branch_id: shift.branch_id || '',
    status: shift.status,
    role_preference: shift.role_preference || '',
    notes: shift.notes || ''
  });

  const assignedEmployee = employees.find(emp => emp.id === shift.employee_id);
  const assignedBranch = branches.find(branch => branch.id === shift.branch_id);

  const handleSave = () => {
    const selectedBranch = branches.find(b => b.id === formData.branch_id);
    
    onUpdate(shift.id, {
      ...formData,
      branch_name: selectedBranch?.name
    });
    setEditMode(false);
  };

  const handleDelete = () => {
    if (confirm('האם אתה בטוח שברצונך למחוק את המשמרת?')) {
      onDelete(shift.id);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'אושרה';
      case 'rejected': return 'נדחתה';
      case 'completed': return 'הושלמה';
      default: return 'בהמתנה';
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              פרטי משמרת
            </span>
            <Badge className={getStatusColor(shift.status || 'pending')}>
              {getStatusText(shift.status || 'pending')}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {editMode ? (
            // Edit mode
            <>
              <div className="space-y-2">
                <Label htmlFor="shift_date">תאריך</Label>
                <Input
                  id="shift_date"
                  type="date"
                  value={formData.shift_date}
                  onChange={(e) => updateField('shift_date', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time">שעת התחלה</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => updateField('start_time', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_time">שעת סיום</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => updateField('end_time', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="branch">סניף</Label>
                <Select
                  value={formData.branch_id}
                  onValueChange={(value) => updateField('branch_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר סניף" />
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

              <div className="space-y-2">
                <Label htmlFor="employee">עובד</Label>
                <Select
                  value={formData.employee_id}
                  onValueChange={(value) => updateField('employee_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר עובד" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">ללא הקצאה</SelectItem>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.first_name} {employee.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">סטטוס</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => updateField('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">בהמתנה</SelectItem>
                    <SelectItem value="approved">אושרה</SelectItem>
                    <SelectItem value="rejected">נדחתה</SelectItem>
                    <SelectItem value="completed">הושלמה</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">תפקיד</Label>
                <Input
                  id="role"
                  placeholder="תפקיד..."
                  value={formData.role_preference}
                  onChange={(e) => updateField('role_preference', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">הערות</Label>
                <Textarea
                  id="notes"
                  placeholder="הערות..."
                  value={formData.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  rows={3}
                />
              </div>
            </>
          ) : (
            // View mode
            <>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(shift.shift_date).toLocaleDateString('he-IL')}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{shift.start_time} - {shift.end_time}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{assignedBranch?.name || 'לא צוין'}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <User className="h-4 w-4" />
                  <span>
                    {assignedEmployee 
                      ? `${assignedEmployee.first_name} ${assignedEmployee.last_name}`
                      : 'לא מוקצה'
                    }
                  </span>
                  {onAssignEmployee && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAssignEmployee(shift)}
                      className="mr-2"
                    >
                      <UserPlus className="h-3 w-3 mr-1" />
                      {assignedEmployee ? 'שנה' : 'הקצה'}
                    </Button>
                  )}
                </div>

                {shift.role_preference && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">תפקיד:</span>
                    <Badge variant="outline">{shift.role_preference}</Badge>
                  </div>
                )}

                {shift.notes && (
                  <div className="space-y-1">
                    <span className="text-sm text-gray-600">הערות:</span>
                    <p className="text-sm bg-gray-50 p-2 rounded">{shift.notes}</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            {editMode ? (
              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  שמור
                </Button>
                <Button variant="outline" onClick={() => setEditMode(false)}>
                  ביטול
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button onClick={() => setEditMode(true)}>
                  עריכה
                </Button>
                <Button variant="outline" onClick={onClose}>
                  סגור
                </Button>
              </div>
            )}
            
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              className="flex items-center gap-1"
            >
              <Trash2 className="h-4 w-4" />
              מחק
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
