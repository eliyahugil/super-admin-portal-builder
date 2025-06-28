
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import type { EmployeeData, BranchData, ShiftScheduleData } from './types';

interface CreateShiftDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (shiftData: Omit<ShiftScheduleData, 'id' | 'created_at'>) => void;
  employees: EmployeeData[];
  branches: BranchData[];
}

export const CreateShiftDialog: React.FC<CreateShiftDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  employees,
  branches
}) => {
  const [formData, setFormData] = useState({
    employee_id: '',
    shift_date: '',
    start_time: '',
    end_time: '',
    status: 'pending' as const,
    branch_id: '',
    role_preference: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.employee_id) {
      newErrors.employee_id = 'יש לבחור עובד';
    }
    if (!formData.shift_date) {
      newErrors.shift_date = 'יש לבחור תאריך';
    }
    if (!formData.start_time) {
      newErrors.start_time = 'יש לבחור שעת התחלה';
    }
    if (!formData.end_time) {
      newErrors.end_time = 'יש לבחור שעת סיום';
    }
    if (formData.start_time && formData.end_time && formData.start_time >= formData.end_time) {
      newErrors.end_time = 'שעת הסיום חייבת להיות אחרי שעת ההתחלה';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const branch = branches.find(b => b.id === formData.branch_id);
    
    onSubmit({
      ...formData,
      branch_name: branch?.name
    });
    
    // Reset form
    setFormData({
      employee_id: '',
      shift_date: '',
      start_time: '',
      end_time: '',
      status: 'pending',
      branch_id: '',
      role_preference: '',
      notes: ''
    });
    setErrors({});
    onClose();
  };

  const handleClose = () => {
    setFormData({
      employee_id: '',
      shift_date: '',
      start_time: '',
      end_time: '',
      status: 'pending',
      branch_id: '',
      role_preference: '',
      notes: ''
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            יצירת משמרת חדשה
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employee">עובד *</Label>
              <Select
                value={formData.employee_id}
                onValueChange={(value) => setFormData({...formData, employee_id: value})}
              >
                <SelectTrigger className={errors.employee_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder="בחר עובד" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.first_name} {employee.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.employee_id && (
                <p className="text-sm text-red-500">{errors.employee_id}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">סטטוס</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({...formData, status: value as any})}
              >
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
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">תאריך *</Label>
              <Input
                id="date"
                type="date"
                value={formData.shift_date}
                onChange={(e) => setFormData({...formData, shift_date: e.target.value})}
                className={errors.shift_date ? 'border-red-500' : ''}
              />
              {errors.shift_date && (
                <p className="text-sm text-red-500">{errors.shift_date}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_time">שעת התחלה *</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                className={errors.start_time ? 'border-red-500' : ''}
              />
              {errors.start_time && (
                <p className="text-sm text-red-500">{errors.start_time}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_time">שעת סיום *</Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                className={errors.end_time ? 'border-red-500' : ''}
              />
              {errors.end_time && (
                <p className="text-sm text-red-500">{errors.end_time}</p>
              )}
            </div>
          </div>

          {/* Branch & Role */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="branch">סניף</Label>
              <Select
                value={formData.branch_id}
                onValueChange={(value) => setFormData({...formData, branch_id: value})}
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
              <Label htmlFor="role">תפקיד</Label>
              <Select
                value={formData.role_preference}
                onValueChange={(value) => setFormData({...formData, role_preference: value})}
              >
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
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">הערות</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="הערות נוספות..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6">
            <Button type="button" variant="outline" onClick={handleClose}>
              <X className="mr-2 h-4 w-4" />
              ביטול
            </Button>
            <Button type="submit">
              <Plus className="mr-2 h-4 w-4" />
              יצור משמרת
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
