
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, User, MapPin, Trash2, Save, X } from 'lucide-react';
import type { ShiftScheduleData, EmployeeData, BranchData } from './types';

interface ShiftDetailsDialogProps {
  shift: ShiftScheduleData;
  employees: EmployeeData[];
  branches: BranchData[];
  onClose: () => void;
  onUpdate: (shiftId: string, updates: Partial<ShiftScheduleData>) => void;
  onDelete: (shiftId: string) => void;
}

export const ShiftDetailsDialog: React.FC<ShiftDetailsDialogProps> = ({
  shift,
  employees,
  branches,
  onClose,
  onUpdate,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    employee_id: shift.employee_id,
    shift_date: shift.shift_date,
    start_time: shift.start_time,
    end_time: shift.end_time,
    status: shift.status,
    branch_id: shift.branch_id || '',
    role_preference: shift.role_preference || '',
    notes: shift.notes || ''
  });

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : 'לא משוייך';
  };

  const getBranchName = (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    return branch?.name || 'לא משוייך';
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'מאושר';
      case 'pending': return 'ממתין';
      case 'rejected': return 'נדחה';
      case 'completed': return 'הושלם';
      default: return status;
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

  const calculateDuration = () => {
    const start = new Date(`2000-01-01T${shift.start_time}`);
    const end = new Date(`2000-01-01T${shift.end_time}`);
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return duration.toFixed(1);
  };

  const handleSave = () => {
    onUpdate(shift.id, editData);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm('האם אתה בטוח שברצונך למחוק את המשמרת?')) {
      onDelete(shift.id);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>פרטי משמרת</span>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    עריכה
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    שמור
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                    <X className="mr-2 h-4 w-4" />
                    ביטול
                  </Button>
                </>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>עובד</Label>
              {isEditing ? (
                <Select value={editData.employee_id} onValueChange={(value) => setEditData({...editData, employee_id: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.first_name} {employee.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>{getEmployeeName(shift.employee_id)}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>סטטוס</Label>
              {isEditing ? (
                <Select value={editData.status} onValueChange={(value) => setEditData({...editData, status: value as any})}>
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
              ) : (
                <Badge className={getStatusColor(shift.status)} variant="secondary">
                  {getStatusText(shift.status)}
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Time & Date */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>תאריך</Label>
              {isEditing ? (
                <Input
                  type="date"
                  value={editData.shift_date}
                  onChange={(e) => setEditData({...editData, shift_date: e.target.value})}
                />
              ) : (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{new Date(shift.shift_date).toLocaleDateString('he-IL')}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>שעת התחלה</Label>
              {isEditing ? (
                <Input
                  type="time"
                  value={editData.start_time}
                  onChange={(e) => setEditData({...editData, start_time: e.target.value})}
                />
              ) : (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{shift.start_time.slice(0, 5)}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>שעת סיום</Label>
              {isEditing ? (
                <Input
                  type="time"
                  value={editData.end_time}
                  onChange={(e) => setEditData({...editData, end_time: e.target.value})}
                />
              ) : (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{shift.end_time.slice(0, 5)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Duration */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="font-medium">משך המשמרת: {calculateDuration()} שעות</span>
            </div>
          </div>

          <Separator />

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>סניף</Label>
              {isEditing ? (
                <Select value={editData.branch_id} onValueChange={(value) => setEditData({...editData, branch_id: value})}>
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
              ) : (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{shift.branch_name || 'לא משוייך'}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>תפקיד</Label>
              {isEditing ? (
                <Select value={editData.role_preference} onValueChange={(value) => setEditData({...editData, role_preference: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר תפקיד" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cashier">קופאי</SelectItem>
                    <SelectItem value="sales">מכירות</SelectItem>
                    <SelectItem value="manager">מנהל</SelectItem>
                    <SelectItem value="security">אבטחה</SelectItem>
                    <SelectItem value="cleaner">ניקיון</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-2 bg-gray-50 rounded">
                  <span>{shift.role_preference || 'לא צוין'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>הערות</Label>
            {isEditing ? (
              <Textarea
                value={editData.notes}
                onChange={(e) => setEditData({...editData, notes: e.target.value})}
                placeholder="הערות נוספות..."
                rows={3}
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded min-h-20">
                {shift.notes || 'אין הערות'}
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div className="text-sm text-gray-500 pt-4 border-t">
            <p>נוצר: {new Date(shift.created_at).toLocaleString('he-IL')}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
