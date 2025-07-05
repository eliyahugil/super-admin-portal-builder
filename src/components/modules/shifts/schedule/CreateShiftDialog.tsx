
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
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import type { EmployeeData, BranchData, ShiftScheduleData } from './types';

interface CreateShiftDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (shift: Omit<ShiftScheduleData, 'id' | 'created_at'>) => void;
  employees: EmployeeData[];
  branches: BranchData[];
  defaultDate?: string;
}

export const CreateShiftDialog: React.FC<CreateShiftDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  employees,
  branches,
  defaultDate
}) => {
  const [formData, setFormData] = useState({
    shift_date: defaultDate || new Date().toISOString().split('T')[0],
    start_time: '09:00',
    end_time: '17:00',
    employee_id: '', // Optional - can be empty for unassigned shifts
    branch_id: branches[0]?.id || '',
    branch_name: branches[0]?.name || '',
    role_preference: '',
    notes: '',
    status: 'pending' as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.shift_date || !formData.start_time || !formData.end_time) {
      return;
    }

    const selectedBranch = branches.find(b => b.id === formData.branch_id);
    
    onSubmit({
      ...formData,
      branch_name: selectedBranch?.name || formData.branch_name,
      employee_id: formData.employee_id || '', // Allow empty for unassigned shifts
    });

    // Reset form
    setFormData({
      shift_date: defaultDate || new Date().toISOString().split('T')[0],
      start_time: '09:00',
      end_time: '17:00',
      employee_id: '',
      branch_id: branches[0]?.id || '',
      branch_name: branches[0]?.name || '',
      role_preference: '',
      notes: '',
      status: 'pending'
    });
    
    onClose();
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            יצירת משמרת חדשה
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shift_date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              תאריך משמרת
            </Label>
            <Input
              id="shift_date"
              type="date"
              value={formData.shift_date}
              onChange={(e) => updateField('shift_date', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                שעת התחלה
              </Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => updateField('start_time', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                שעת סיום
              </Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) => updateField('end_time', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              סניף
            </Label>
            <Select
              value={formData.branch_id}
              onValueChange={(value) => {
                const selectedBranch = branches.find(b => b.id === value);
                updateField('branch_id', value);
                updateField('branch_name', selectedBranch?.name || '');
              }}
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
            <Label htmlFor="employee" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              עובד (אופציונלי)
            </Label>
            <Select
              value={formData.employee_id}
              onValueChange={(value) => updateField('employee_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר עובד או השאר ריק" />
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
            <Label htmlFor="role">תפקיד (אופציונלי)</Label>
            <Select
              value={formData.role_preference}
              onValueChange={(value) => updateField('role_preference', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר תפקיד" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">כל התפקידים</SelectItem>
                <SelectItem value="cashier">קופאי</SelectItem>
                <SelectItem value="sales">מכירות</SelectItem>
                <SelectItem value="manager">מנהל</SelectItem>
                <SelectItem value="security">אבטחה</SelectItem>
                <SelectItem value="cleaner">ניקיון</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">הערות</Label>
            <Textarea
              id="notes"
              placeholder="הערות למשמרת..."
              value={formData.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              rows={2}
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
