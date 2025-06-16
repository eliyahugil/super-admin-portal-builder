
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Building, UserCheck, Clock } from 'lucide-react';
import { useEmployeesData } from '@/hooks/useEmployeesData';
import { useEmployeeChatGroups } from '@/hooks/useEmployeeChatGroups';
import type { Employee } from '@/types/employee';

interface QuickGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const QuickGroupDialog: React.FC<QuickGroupDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { data: employees = [] } = useEmployeesData();
  const { createGroup, isCreatingGroup } = useEmployeeChatGroups();
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Group employees by different criteria
  const groupByBranch = () => {
    const branches = new Map<string, Employee[]>();
    employees.forEach(emp => {
      if (emp.main_branch_id) {
        const branchKey = emp.main_branch_id;
        if (!branches.has(branchKey)) {
          branches.set(branchKey, []);
        }
        branches.get(branchKey)!.push(emp);
      }
    });
    return Array.from(branches.entries()).map(([branchId, emps]) => ({
      id: branchId,
      name: `סניף ${emps[0]?.main_branch_id?.slice(0, 8) || 'לא ידוע'}`,
      employees: emps,
      type: 'branch' as const
    }));
  };

  const groupByType = () => {
    const types = new Map<string, Employee[]>();
    employees.forEach(emp => {
      const type = emp.employee_type || 'permanent';
      if (!types.has(type)) {
        types.set(type, []);
      }
      types.get(type)!.push(emp);
    });
    
    const typeLabels: Record<string, string> = {
      permanent: 'עובדים קבועים',
      temporary: 'עובדים זמניים',
      contractor: 'קבלנים',
      youth: 'עובדי נוער',
    };

    return Array.from(types.entries()).map(([type, emps]) => ({
      id: type,
      name: typeLabels[type] || type,
      employees: emps,
      type: 'employee_type' as const
    }));
  };

  const groupByStatus = () => {
    const activeEmployees = employees.filter(emp => emp.is_active);
    const inactiveEmployees = employees.filter(emp => !emp.is_active);
    
    return [
      {
        id: 'active',
        name: 'עובדים פעילים',
        employees: activeEmployees,
        type: 'status' as const
      },
      {
        id: 'inactive',
        name: 'עובדים לא פעילים',
        employees: inactiveEmployees,
        type: 'status' as const
      }
    ].filter(group => group.employees.length > 0);
  };

  const handleCreateGroup = async (group: { name: string; employees: Employee[] }) => {
    if (group.employees.length === 0) return;
    
    await createGroup({
      name: group.name,
      description: `קבוצה שנוצרה אוטומטית עבור ${group.name}`,
      employeeIds: group.employees.map(emp => emp.id),
    });
    
    onOpenChange(false);
  };

  const getGroupIcon = (type: string) => {
    switch (type) {
      case 'branch':
        return <Building className="h-4 w-4" />;
      case 'employee_type':
        return <UserCheck className="h-4 w-4" />;
      case 'status':
        return <Clock className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const allGroups = [
    ...groupByBranch(),
    ...groupByType(),
    ...groupByStatus()
  ].filter(group => group.employees.length > 1); // Only show groups with more than 1 employee

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle>יצירת קבוצות מהירה</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            בחר קבוצה להקמה מהירה על בסיס קריטריונים קיימים
          </p>

          <div className="space-y-3">
            {allGroups.map((group) => (
              <div
                key={`${group.type}-${group.id}`}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  {getGroupIcon(group.type)}
                  <div>
                    <p className="font-medium">{group.name}</p>
                    <p className="text-sm text-gray-500">
                      {group.employees.length} עובדים
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {group.type === 'branch' && 'סניף'}
                    {group.type === 'employee_type' && 'תפקיד'}
                    {group.type === 'status' && 'סטטוס'}
                  </Badge>
                  <Button
                    size="sm"
                    onClick={() => handleCreateGroup(group)}
                    disabled={isCreatingGroup}
                  >
                    {isCreatingGroup ? 'יוצר...' : 'צור קבוצה'}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {allGroups.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>לא נמצאו קבוצות זמינות ליצירה</p>
              <p className="text-sm">נדרשים לפחות 2 עובדים לכל קבוצה</p>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              ביטול
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
