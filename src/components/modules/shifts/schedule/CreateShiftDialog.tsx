
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { EmployeeData, BranchData, ShiftScheduleData } from './types';

interface CreateShiftDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (shift: Omit<ShiftScheduleData, 'id' | 'created_at'>) => void;
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
    start_time: '09:00',
    end_time: '17:00',
    branch_id: '',
    role_preference: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const branch = branches.find(b => b.id === formData.branch_id);
    
    onSubmit({
      employee_id: formData.employee_id,
      shift_date: formData.shift_date,
      start_time: formData.start_time,
      end_time: formData.end_time,
      status: 'pending',
      branch_id: formData.branch_id,
      branch_name: branch?.name,
      role_preference: formData.role_preference,
      notes: formData.notes
    });
    
    // Reset form
    setFormData({
      employee_id: '',
      shift_date: '',
      start_time: '09:00',
      end_time: '17:00',
      branch_id: '',
      role_preference: '',
      notes: ''
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>יצירת משמרת חדשה</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>עובד</Label>
            <Select value={formData.employee_id} onValueChange={(value) => setFormData({...formData, employee_id: value})}>
              <SelectTrigger>
                <SelectValue placeholder="בחר עובד" />
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
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>שעת התחלה</Label>
              <Input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>שעת סיום</Label>
              <Input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                required
              />
            </div>
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

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              ביטול
            </Button>
            <Button type="submit">
              צור משמרת
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
