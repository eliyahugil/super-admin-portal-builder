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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Employee } from '@/types/employee';
import type { Branch } from '@/types/branch';

interface BulkEditEmployeesDialogProps {
  employees: Employee[];
  branches: Branch[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface BulkUpdateFields {
  main_branch_id?: string;
  employee_type?: string;
  weekly_hours_required?: number;
  is_active?: boolean;
}

export const BulkEditEmployeesDialog: React.FC<BulkEditEmployeesDialogProps> = ({
  employees,
  branches,
  open,
  onOpenChange,
  onSuccess
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fieldsToUpdate, setFieldsToUpdate] = useState<Set<keyof BulkUpdateFields>>(new Set());
  const [updateData, setUpdateData] = useState<BulkUpdateFields>({});

  const handleFieldToggle = (field: keyof BulkUpdateFields, checked: boolean) => {
    const newFields = new Set(fieldsToUpdate);
    if (checked) {
      newFields.add(field);
    } else {
      newFields.delete(field);
      const newData = { ...updateData };
      delete newData[field];
      setUpdateData(newData);
    }
    setFieldsToUpdate(newFields);
  };

  const handleUpdateChange = (field: keyof BulkUpdateFields, value: any) => {
    setUpdateData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (fieldsToUpdate.size === 0) {
      toast({
        title: 'שגיאה',
        description: 'יש לבחור לפחות שדה אחד לעדכון',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const employeeIds = employees.map(emp => emp.id);
      
      // בנה את האובייקט לעדכון רק עם השדות שנבחרו
      const updateObject: any = {};
      fieldsToUpdate.forEach(field => {
        if (updateData[field] !== undefined) {
          updateObject[field] = updateData[field];
        }
      });

      const { error } = await supabase
        .from('employees')
        .update(updateObject)
        .in('id', employeeIds);

      if (error) throw error;

      toast({
        title: 'הצלחה',
        description: `${employees.length} עובדים עודכנו בהצלחה`,
      });

      onSuccess();
    } catch (error) {
      console.error('Error updating employees:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בעדכון העובדים',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle>עריכה גורפת - {employees.length} עובדים</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">
              עובדים נבחרים: {employees.map(emp => `${emp.first_name} ${emp.last_name}`).join(', ')}
            </p>
          </div>

          <div className="space-y-4">
            {/* Main Branch */}
            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id="main_branch"
                checked={fieldsToUpdate.has('main_branch_id')}
                onCheckedChange={(checked) => handleFieldToggle('main_branch_id', !!checked)}
              />
              <Label htmlFor="main_branch" className="text-sm font-medium">
                סניף ראשי
              </Label>
            </div>
            {fieldsToUpdate.has('main_branch_id') && (
              <Select
                value={updateData.main_branch_id || ''}
                onValueChange={(value) => handleUpdateChange('main_branch_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר סניף ראשי" />
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
            )}

            <Separator />

            {/* Employee Type */}
            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id="employee_type"
                checked={fieldsToUpdate.has('employee_type')}
                onCheckedChange={(checked) => handleFieldToggle('employee_type', !!checked)}
              />
              <Label htmlFor="employee_type" className="text-sm font-medium">
                סוג עובד
              </Label>
            </div>
            {fieldsToUpdate.has('employee_type') && (
              <Select
                value={updateData.employee_type || ''}
                onValueChange={(value) => handleUpdateChange('employee_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר סוג עובד" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">משרה מלאה</SelectItem>
                  <SelectItem value="part_time">משרה חלקית</SelectItem>
                  <SelectItem value="contractor">קבלן</SelectItem>
                  <SelectItem value="intern">מתמחה</SelectItem>
                </SelectContent>
              </Select>
            )}

            <Separator />

            {/* Weekly Hours */}
            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id="weekly_hours"
                checked={fieldsToUpdate.has('weekly_hours_required')}
                onCheckedChange={(checked) => handleFieldToggle('weekly_hours_required', !!checked)}
              />
              <Label htmlFor="weekly_hours" className="text-sm font-medium">
                שעות שבועיות נדרשות
              </Label>
            </div>
            {fieldsToUpdate.has('weekly_hours_required') && (
              <Input
                type="number"
                min="0"
                max="60"
                value={updateData.weekly_hours_required || ''}
                onChange={(e) => handleUpdateChange('weekly_hours_required', parseInt(e.target.value) || 0)}
                placeholder="שעות שבועיות"
              />
            )}

            <Separator />

            {/* Active Status */}
            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id="is_active"
                checked={fieldsToUpdate.has('is_active')}
                onCheckedChange={(checked) => handleFieldToggle('is_active', !!checked)}
              />
              <Label htmlFor="is_active" className="text-sm font-medium">
                סטטוס פעילות
              </Label>
            </div>
            {fieldsToUpdate.has('is_active') && (
              <Select
                value={updateData.is_active?.toString() || ''}
                onValueChange={(value) => handleUpdateChange('is_active', value === 'true')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר סטטוס" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">פעיל</SelectItem>
                  <SelectItem value="false">לא פעיל</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              ביטול
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || fieldsToUpdate.size === 0}
            >
              {loading ? 'מעדכן...' : 'עדכן עובדים'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};