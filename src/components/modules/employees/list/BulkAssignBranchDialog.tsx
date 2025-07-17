import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Branch } from '@/types/branch';

interface BulkAssignBranchDialogProps {
  employeeIds: string[];
  branches: Branch[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const BulkAssignBranchDialog: React.FC<BulkAssignBranchDialogProps> = ({
  employeeIds,
  branches,
  open,
  onOpenChange,
  onSuccess
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [roleName, setRoleName] = useState<string>('');
  const [maxWeeklyHours, setMaxWeeklyHours] = useState<number>(40);
  const [priorityOrder, setPriorityOrder] = useState<number>(1);
  const [shiftTypes, setShiftTypes] = useState<string[]>(['morning', 'evening']);
  const [availableDays, setAvailableDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [existingRoles, setExistingRoles] = useState<string[]>([]);

  // Fetch existing roles from the system
  useEffect(() => {
    const fetchExistingRoles = async () => {
      try {
        const { data, error } = await supabase
          .from('employee_branch_assignments')
          .select('role_name')
          .not('role_name', 'is', null);

        if (error) throw error;

        // Extract unique role names and filter out empty/null values
        const uniqueRoles = [...new Set(
          data
            .map(item => item.role_name?.trim())
            .filter(role => role && role.length > 0)
        )];

        console.log('📋 Existing roles found:', uniqueRoles);
        setExistingRoles(uniqueRoles);
      } catch (error) {
        console.error('Error fetching existing roles:', error);
        // Fall back to default roles if fetch fails
        setExistingRoles(['קופאי', 'מכירות', 'מנהל', 'אבטחה', 'ניקיון', 'טבח', 'מלצר', 'נהג']);
      }
    };

    if (open) {
      fetchExistingRoles();
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!selectedBranchId || !roleName) {
      toast({
        title: 'שגיאה',
        description: 'יש למלא את כל השדות הנדרשים',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      // First, remove existing assignments for these employees to the selected branch
      await supabase
        .from('employee_branch_assignments')
        .delete()
        .in('employee_id', employeeIds)
        .eq('branch_id', selectedBranchId);

      // Then create new assignments
      const assignments = employeeIds.map(employeeId => ({
        employee_id: employeeId,
        branch_id: selectedBranchId,
        role_name: roleName,
        max_weekly_hours: maxWeeklyHours,
        priority_order: priorityOrder,
        is_active: true,
        shift_types: shiftTypes,
        available_days: availableDays
      }));

      const { error } = await supabase
        .from('employee_branch_assignments')
        .insert(assignments);

      if (error) throw error;

      toast({
        title: 'הצלחה',
        description: `${employeeIds.length} עובדים שויכו לסניף בהצלחה`,
      });

      onSuccess();
    } catch (error) {
      console.error('Error assigning employees to branch:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בשיוך העובדים לסניף',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle>שיוך עובדים לסניף - {employeeIds.length} עובדים</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="branch">סניף</Label>
            <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
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

          <div>
            <Label htmlFor="role">תפקיד</Label>
            <Select value={roleName} onValueChange={setRoleName}>
              <SelectTrigger>
                <SelectValue placeholder="בחר תפקיד" />
              </SelectTrigger>
              <SelectContent>
                {existingRoles.length > 0 ? (
                  existingRoles.map(role => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))
                ) : (
                  // Fallback roles if no existing roles found
                  <>
                    <SelectItem value="קופאי">קופאי</SelectItem>
                    <SelectItem value="מכירות">מכירות</SelectItem>
                    <SelectItem value="מנהל">מנהל</SelectItem>
                    <SelectItem value="אבטחה">אבטחה</SelectItem>
                    <SelectItem value="ניקיון">ניקיון</SelectItem>
                    <SelectItem value="טבח">טבח</SelectItem>
                    <SelectItem value="מלצר">מלצר</SelectItem>
                    <SelectItem value="נהג">נהג</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="hours">מקסימום שעות שבועיות</Label>
            <Input
              id="hours"
              type="number"
              min="1"
              max="60"
              value={maxWeeklyHours}
              onChange={(e) => setMaxWeeklyHours(parseInt(e.target.value) || 40)}
            />
          </div>

          <div>
            <Label htmlFor="priority">עדיפות</Label>
            <Input
              id="priority"
              type="number"
              min="1"
              max="10"
              value={priorityOrder}
              onChange={(e) => setPriorityOrder(parseInt(e.target.value) || 1)}
            />
            <p className="text-xs text-gray-500 mt-1">
              1 = עדיפות גבוהה, 10 = עדיפות נמוכה
            </p>
          </div>

          <div>
            <Label>סוגי משמרות</Label>
            <div className="flex gap-4 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="bulk-morning"
                  checked={shiftTypes.includes('morning')}
                  onCheckedChange={(checked) => handleShiftTypeChange('morning', checked as boolean)}
                />
                <Label htmlFor="bulk-morning">בוקר</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="bulk-evening"
                  checked={shiftTypes.includes('evening')}
                  onCheckedChange={(checked) => handleShiftTypeChange('evening', checked as boolean)}
                />
                <Label htmlFor="bulk-evening">ערב</Label>
              </div>
            </div>
          </div>

          <div>
            <Label>ימים זמינים</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'].map((day, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`bulk-day-${index}`}
                    checked={availableDays.includes(index)}
                    onCheckedChange={(checked) => handleDayChange(index, checked as boolean)}
                  />
                  <Label htmlFor={`bulk-day-${index}`} className="text-sm">{day}</Label>
                </div>
              ))}
            </div>
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
              disabled={loading || !selectedBranchId || !roleName || shiftTypes.length === 0 || availableDays.length === 0}
            >
              {loading ? 'משייך...' : 'שייך לסניף'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};