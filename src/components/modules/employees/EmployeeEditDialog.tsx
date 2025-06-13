
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Employee, EmployeeType } from '@/types/supabase';

interface EmployeeEditDialogProps {
  employee: Employee;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const EmployeeEditDialog: React.FC<EmployeeEditDialogProps> = ({ 
  employee, 
  open, 
  onOpenChange, 
  onSuccess 
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: employee.first_name,
    last_name: employee.last_name,
    email: employee.email || '',
    phone: employee.phone || '',
    address: employee.address || '',
    employee_type: employee.employee_type as EmployeeType,
    is_active: employee.is_active ?? true,
    hire_date: employee.hire_date || '',
    weekly_hours_required: employee.weekly_hours_required || 0,
    notes: employee.notes || '',
    main_branch_id: employee.main_branch_id || '',
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
        employee_type: formData.employee_type,
        is_active: formData.is_active,
        hire_date: formData.hire_date || null,
        weekly_hours_required: formData.weekly_hours_required || null,
        notes: formData.notes || null,
        main_branch_id: formData.main_branch_id || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('employees')
        .update(updateData)
        .eq('id', employee.id);

      if (error) throw error;

      toast({
        title: 'הצלחה',
        description: 'פרטי העובד עודכנו בהצלחה',
      });

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error updating employee:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לעדכן את פרטי העובד',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>עריכת פרטי העובד</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">שם פרטי</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="last_name">שם משפחה</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">אימייל</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="phone">טלפון</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">כתובת</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employee_type">סוג עובד</Label>
              <Select
                value={formData.employee_type}
                onValueChange={(value: EmployeeType) => setFormData({ ...formData, employee_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="permanent">קבוע</SelectItem>
                  <SelectItem value="temporary">זמני</SelectItem>
                  <SelectItem value="youth">נוער</SelectItem>
                  <SelectItem value="contractor">קבלן</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="hire_date">תאריך התחלה</Label>
              <Input
                id="hire_date"
                type="date"
                value={formData.hire_date}
                onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="weekly_hours_required">שעות שבועיות נדרשות</Label>
            <Input
              id="weekly_hours_required"
              type="number"
              value={formData.weekly_hours_required}
              onChange={(e) => setFormData({ ...formData, weekly_hours_required: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div>
            <Label htmlFor="notes">הערות</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="is_active">עובד פעיל</Label>
            <input
              id="is_active"
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              ביטול
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'שומר...' : 'שמור שינויים'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
