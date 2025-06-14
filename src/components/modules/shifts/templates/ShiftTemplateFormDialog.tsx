
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

type ShiftType = 'morning' | 'afternoon' | 'evening' | 'night';

interface FormData {
  name: string;
  start_time: string;
  end_time: string;
  shift_type: ShiftType;
  required_employees: number;
  branch_id: string;
}

interface ShiftTemplateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: FormData;
  setFormData: (data: FormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  branches: any[];
  triggerButton?: React.ReactNode;
}

export const ShiftTemplateFormDialog: React.FC<ShiftTemplateFormDialogProps> = ({
  open,
  onOpenChange,
  formData,
  setFormData,
  onSubmit,
  branches,
  triggerButton
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {triggerButton && (
        <DialogTrigger asChild>
          {triggerButton}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>תבנית משמרת חדשה</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">שם התבנית *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="למשל: משמרת בוקר"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="branch">סניף *</Label>
            <Select value={formData.branch_id} onValueChange={(value) => setFormData({ ...formData, branch_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="בחר סניף" />
              </SelectTrigger>
              <SelectContent>
                {branches?.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_time">שעת התחלה *</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="end_time">שעת סיום *</Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="shift_type">סוג משמרת</Label>
            <Select value={formData.shift_type} onValueChange={(value: ShiftType) => setFormData({ ...formData, shift_type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">בוקר</SelectItem>
                <SelectItem value="afternoon">צהריים</SelectItem>
                <SelectItem value="evening">ערב</SelectItem>
                <SelectItem value="night">לילה</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="required_employees">מספר עובדים נדרש</Label>
            <Input
              id="required_employees"
              type="number"
              min="1"
              value={formData.required_employees}
              onChange={(e) => setFormData({ ...formData, required_employees: parseInt(e.target.value) || 1 })}
            />
          </div>

          <Button type="submit" className="w-full">
            צור תבנית
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
