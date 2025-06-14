
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { EmployeeType } from '@/types/employee';

interface EmployeeFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  employee_type: EmployeeType;
  is_active: boolean;
  hire_date: string;
  weekly_hours_required: number;
  notes: string;
  main_branch_id: string;
}

interface EmployeeEditFormProps {
  formData: EmployeeFormData;
  setFormData: (data: EmployeeFormData) => void;
}

export const EmployeeEditForm: React.FC<EmployeeEditFormProps> = ({
  formData,
  setFormData,
}) => {
  return (
    <div className="space-y-4" dir="rtl">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="first_name">שם פרטי</Label>
          <Input
            id="first_name"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            required
            className="text-right"
          />
        </div>
        <div>
          <Label htmlFor="last_name">שם משפחה</Label>
          <Input
            id="last_name"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            required
            className="text-right"
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
            className="text-right"
          />
        </div>
        <div>
          <Label htmlFor="phone">טלפון</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="text-right"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address">כתובת</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="text-right"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="employee_type">סוג עובד</Label>
          <Select
            value={formData.employee_type || "permanent"}
            onValueChange={(value: EmployeeType) => setFormData({ ...formData, employee_type: value })}
          >
            <SelectTrigger className="text-right">
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
            className="text-right"
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
          className="text-right"
        />
      </div>

      <div>
        <Label htmlFor="notes">הערות</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          className="text-right"
        />
      </div>

      <div className="flex items-center gap-2 justify-end">
        <Label htmlFor="is_active">עובד פעיל</Label>
        <input
          id="is_active"
          type="checkbox"
          checked={formData.is_active}
          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
        />
      </div>
    </div>
  );
};
