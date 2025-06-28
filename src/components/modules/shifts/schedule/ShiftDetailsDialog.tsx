
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
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Save } from 'lucide-react';
import type { EmployeeData, BranchData, ShiftScheduleData } from './types';

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
  const [formData, setFormData] = useState({
    employee_id: shift.employee_id,
    shift_date: shift.shift_date,
    start_time: shift.start_time,
    end_time: shift.end_time,
    status: shift.status,
    branch_id: shift.branch_id || '',
    role_preference: shift.role_preference || '',
    notes: shift.notes || ''
  });

  const handleUpdate = () => {
    const branch = branches.find(b => b.id === formData.branch_id);
    
    onUpdate(shift.id, {
      employee_id: formData.employee_id,
      shift_date: formData.shift_date,
      start_time: formData.start_time,
      end_time: formData.end_time,
      status: formData.status,
      branch_id: formData.branch_id,
      branch_name: branch?.name,
      role_preference: formData.role_preference,
      notes: formData.notes
    });
  };

  const handleDelete = () => {
    if (confirm('האם אתה בטוח שברצונך למחוק את המשמרת?')) {
      onDelete(shift.id);
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
      default: return status;
    }
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : 'לא נמצא';
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            פרטי המשמרת
            <Badge className={getStatusColor(shift.status)}>
              {getStatusText(shift.status)}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>עובד</Label>
            <Select value={formData.employee_id} onValueChange={(value) => setFormData({...formData, employee_id: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {employees.map(employee => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.first_name} {employee.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>תאריך</Label>
            <Input
              type="date"
              value={formData.shift_date}
              onChange={(e) => setFormData({...formData, shift_date: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>שעת התחלה</Label>
              <Input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({...formData, start_time: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>שעת סיום</Label>
              <Input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({...formData, end_time: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>סטטוס</Label>
            <Select value={formData.status} onValueChange={(value: any) => setFormData({...formData, status: value})}>
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

          <div className="space-y-2">
            <Label>סניף</Label>
            <Select value={formData.branch_id} onValueChange={(value) => setFormData({...formData, branch_id: value})}>
              <SelectTrigger>
                <SelectValue placeholder="בחר סניף" />
              </SelectTrigger>
              <SelectContent>
                {branches.map(branch => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>תפקיד</Label>
            <Select value={formData.role_preference} onValueChange={(value) => setFormData({...formData, role_preference: value})}>
              <SelectTrigger>
                <SelectValue placeholder="בחר תפקיד" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">ללא תפקيد ספציפי</SelectItem>
                <SelectItem value="cashier">קופאי</SelectItem>
                <SelectItem value="sales">מכירות</SelectItem>
                <SelectItem value="manager">מנהל</SelectItem>
                <SelectItem value="security">אבטחה</SelectItem>
                <SelectItem value="cleaner">ניקיון</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>הערות</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="הערות נוספות..."
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              מחק
            </Button>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                ביטול
              </Button>
              <Button onClick={handleUpdate} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                שמור
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
