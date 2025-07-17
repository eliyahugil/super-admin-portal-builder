
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Employee } from '@/types/employee';

interface BulkShiftTypesDialogProps {
  employees: Employee[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const BulkShiftTypesDialog: React.FC<BulkShiftTypesDialogProps> = ({
  employees,
  open,
  onOpenChange,
  onSuccess
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [shiftTypes, setShiftTypes] = useState<string[]>(['morning', 'evening']);
  const [availableDays, setAvailableDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);

  const handleShiftTypeChange = (shiftType: string, checked: boolean) => {
    if (checked) {
      setShiftTypes([...shiftTypes, shiftType]);
    } else {
      setShiftTypes(shiftTypes.filter(type => type !== shiftType));
    }
  };

  const handleDayChange = (day: number, checked: boolean) => {
    if (checked) {
      setAvailableDays([...availableDays, day].sort());
    } else {
      setAvailableDays(availableDays.filter(d => d !== day));
    }
  };

  const handleSubmit = async () => {
    if (shiftTypes.length === 0 || availableDays.length === 0) {
      toast({
        title: 'שגיאה',
        description: 'יש לבחור לפחות סוג משמרת אחד ויום זמין אחד',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      // Update all selected employees
      const updates = employees.map(async (employee) => {
        // First, update existing branch assignments
        const { data: existingAssignments } = await supabase
          .from('employee_branch_assignments')
          .select('*')
          .eq('employee_id', employee.id);

        if (existingAssignments && existingAssignments.length > 0) {
          // Update existing assignments
          await Promise.all(
            existingAssignments.map(assignment =>
              supabase
                .from('employee_branch_assignments')
                .update({
                  shift_types: shiftTypes,
                  available_days: availableDays
                })
                .eq('id', assignment.id)
            )
          );
        } else if (employee.main_branch_id) {
          // Create new assignment if employee has a main branch
          await supabase
            .from('employee_branch_assignments')
            .insert({
              employee_id: employee.id,
              branch_id: employee.main_branch_id,
              role_name: 'עובד',
              priority_order: 1,
              is_active: true,
              shift_types: shiftTypes,
              available_days: availableDays
            });
        }
      });

      await Promise.all(updates);

      toast({
        title: 'הצלחה',
        description: `עודכנו סוגי משמרות וימים זמינים עבור ${employees.length} עובדים`,
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating shift types and available days:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בעדכון סוגי המשמרות והימים הזמינים',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-md">
        <DialogHeader>
          <DialogTitle>עדכון סוגי משמרות וימים זמינים - {employees.length} עובדים</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label className="text-base font-medium mb-3 block">סוגי משמרות</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="bulk-morning"
                  checked={shiftTypes.includes('morning')}
                  onCheckedChange={(checked) => handleShiftTypeChange('morning', checked as boolean)}
                />
                <Label htmlFor="bulk-morning" className="cursor-pointer">בוקר</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="bulk-evening"
                  checked={shiftTypes.includes('evening')}
                  onCheckedChange={(checked) => handleShiftTypeChange('evening', checked as boolean)}
                />
                <Label htmlFor="bulk-evening" className="cursor-pointer">ערב</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="bulk-night"
                  checked={shiftTypes.includes('night')}
                  onCheckedChange={(checked) => handleShiftTypeChange('night', checked as boolean)}
                />
                <Label htmlFor="bulk-night" className="cursor-pointer">לילה</Label>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-base font-medium mb-3 block">ימים זמינים</Label>
            <div className="grid grid-cols-2 gap-3">
              {['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'].map((day, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`bulk-day-${index}`}
                    checked={availableDays.includes(index)}
                    onCheckedChange={(checked) => handleDayChange(index, checked as boolean)}
                  />
                  <Label htmlFor={`bulk-day-${index}`} className="text-sm cursor-pointer">{day}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              ביטול
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || shiftTypes.length === 0 || availableDays.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? 'מעדכן...' : 'עדכן'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
