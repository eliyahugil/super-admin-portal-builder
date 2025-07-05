
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { ShiftScheduleData, Employee, Branch } from './types';

interface CreateShiftDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (shift: Omit<ShiftScheduleData, 'id' | 'created_at'>) => Promise<void>;
  employees: Employee[];
  branches: Branch[];
}

export const CreateShiftDialog: React.FC<CreateShiftDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  employees,
  branches
}) => {
  const [date, setDate] = useState<Date>();
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [employeeId, setEmployeeId] = useState<string>('');
  const [branchId, setBranchId] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date) {
      alert('אנא בחר תאריך');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        shift_date: format(date, 'yyyy-MM-dd'),
        start_time: startTime,
        end_time: endTime,
        employee_id: employeeId || undefined,
        branch_id: branchId || undefined,
        role: role || undefined,
        notes: notes || undefined,
        status: 'pending'
      });
      
      // Reset form
      setDate(undefined);
      setStartTime('09:00');
      setEndTime('17:00');
      setEmployeeId('');
      setBranchId('');
      setRole('');
      setNotes('');
      onClose();
    } catch (error) {
      console.error('Error creating shift:', error);
      alert('שגיאה ביצירת המשמרת');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>יצירת משמרת חדשה</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date Picker */}
          <div className="space-y-2">
            <Label>תאריך *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon />
                  {date ? format(date, 'dd/MM/yyyy') : <span>בחר תאריך</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>שעת התחלה</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>שעת סיום</Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Employee Selection */}
          <div className="space-y-2">
            <Label>עובד</Label>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger>
                <SelectValue placeholder="בחר עובד (אופציונלי)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">ללא עובד מוקצה</SelectItem>
                {employees.map(employee => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.first_name} {employee.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Branch Selection */}
          <div className="space-y-2">
            <Label>סניף</Label>
            <Select value={branchId} onValueChange={setBranchId}>
              <SelectTrigger>
                <SelectValue placeholder="בחר סניף (אופציונלי)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">ללא סניף</SelectItem>
                {branches.map(branch => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Role Input */}
          <div className="space-y-2">
            <Label>תפקיד</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="בחר תפקיד (אופציונלי)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">ללא תפקיד מוגדר</SelectItem>
                <SelectItem value="cashier">קופאי</SelectItem>
                <SelectItem value="sales">מכירות</SelectItem>
                <SelectItem value="manager">מנהל</SelectItem>
                <SelectItem value="security">אבטחה</SelectItem>
                <SelectItem value="cleaner">ניקיון</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>הערות</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="הערות נוספות..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'יוצר...' : 'צור משמרת'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              ביטול
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
