
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, User, MapPin, Edit, Trash2, UserPlus } from 'lucide-react';
import type { ShiftScheduleData, Employee, Branch } from './types';

interface ShiftDetailsDialogProps {
  shift: ShiftScheduleData;
  employees: Employee[];
  branches: Branch[];
  onClose: () => void;
  onUpdate: (shiftId: string, updates: Partial<ShiftScheduleData>) => Promise<void>;
  onDelete: (shiftId: string) => Promise<void>;
  onAssignEmployee: (shift: ShiftScheduleData) => void;
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
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    start_time: shift.start_time,
    end_time: shift.end_time,
    notes: shift.notes || '',
    status: shift.status || 'pending'
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const employee = employees.find(emp => emp.id === shift.employee_id);
  const branch = branches.find(br => br.id === shift.branch_id);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await onUpdate(shift.id, editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating shift:', error);
      alert('שגיאה בעדכון המשמרת');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('האם אתה בטוח שברצונך למחוק את המשמרת?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(shift.id);
      onClose();
    } catch (error) {
      console.error('Error deleting shift:', error);
      alert('שגיאה במחיקת המשמרת');
    } finally {
      setIsDeleting(false);
    }
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'מאושר';
      case 'pending': return 'ממתין';
      case 'rejected': return 'נדחה';
      case 'completed': return 'הושלם';
      default: return 'לא ידוע';
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>פרטי משמרת</span>
            <Badge className={getStatusColor(shift.status || 'pending')}>
              {getStatusText(shift.status || 'pending')}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Shift Date */}
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <Clock className="h-4 w-4 text-gray-600" />
            <div>
              <div className="font-medium">
                {new Date(shift.shift_date).toLocaleDateString('he-IL', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              {/* Edit Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>שעת התחלה</Label>
                  <Input
                    type="time"
                    value={editData.start_time}
                    onChange={(e) => setEditData(prev => ({ ...prev, start_time: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>שעת סיום</Label>
                  <Input
                    type="time"
                    value={editData.end_time}
                    onChange={(e) => setEditData(prev => ({ ...prev, end_time: e.target.value }))}
                  />
                </div>
              </div>

              {/* Edit Status */}
              <div className="space-y-2">
                <Label>סטטוס</Label>
                <Select value={editData.status} onValueChange={(value) => setEditData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">ממתין</SelectItem>
                    <SelectItem value="approved">מאושר</SelectItem>
                    <SelectItem value="rejected">נדחה</SelectItem>
                    <SelectItem value="completed">הושלם</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Edit Notes */}
              <div className="space-y-2">
                <Label>הערות</Label>
                <Textarea
                  value={editData.notes}
                  onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="הערות נוספות..."
                  rows={3}
                />
              </div>

              {/* Edit Actions */}
              <div className="flex gap-2">
                <Button onClick={handleUpdate} disabled={isUpdating}>
                  {isUpdating ? 'שומר...' : 'שמור שינויים'}
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  ביטול
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Time Display */}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-600" />
                <span>{shift.start_time} - {shift.end_time}</span>
              </div>

              {/* Employee Display */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <span>
                    {employee ? `${employee.first_name} ${employee.last_name}` : 'לא מוקצה עובד'}
                  </span>
                </div>
                {!employee && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAssignEmployee(shift)}
                  >
                    <UserPlus className="h-3 w-3 mr-1" />
                    הקצה עובד
                  </Button>
                )}
              </div>

              {/* Branch Display */}
              {branch && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-600" />
                  <span>{branch.name}</span>
                </div>
              )}

              {/* Role Display */}
              {shift.role && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{shift.role}</Badge>
                </div>
              )}

              {/* Notes Display */}
              {shift.notes && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <Label className="text-sm font-medium">הערות:</Label>
                  <p className="text-sm text-gray-700 mt-1">{shift.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  ערוך
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  {isDeleting ? 'מוחק...' : 'מחק'}
                </Button>
                <Button variant="outline" onClick={onClose}>
                  סגור
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
