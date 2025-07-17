import React, { useState } from 'react';
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
        is_active: true
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
                <SelectItem value="cashier">קופאי</SelectItem>
                <SelectItem value="sales">מכירות</SelectItem>
                <SelectItem value="manager">מנהל</SelectItem>
                <SelectItem value="security">אבטחה</SelectItem>
                <SelectItem value="cleaner">ניקיון</SelectItem>
                <SelectItem value="cook">טבח</SelectItem>
                <SelectItem value="waiter">מלצר</SelectItem>
                <SelectItem value="driver">נהג</SelectItem>
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
              disabled={loading || !selectedBranchId || !roleName}
            >
              {loading ? 'משייך...' : 'שייך לסניף'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};