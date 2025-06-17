
import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Building, UserCheck, Clock, Calendar, Star } from 'lucide-react';
import { useEmployeesData } from '@/hooks/useEmployeesData';
import { useEmployeeChatGroups } from '@/hooks/useEmployeeChatGroups';
import type { Employee } from '@/types/employee';

interface QuickGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface GroupOption {
  id: string;
  name: string;
  employees: Employee[];
  type: 'branch' | 'employee_type' | 'status' | 'hire_period' | 'priority';
  description?: string;
}

export const QuickGroupDialog: React.FC<QuickGroupDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { data: employees = [] } = useEmployeesData();
  const { createGroup, isCreatingGroup } = useEmployeeChatGroups();

  // Group employees by different criteria
  const groupOptions = useMemo((): GroupOption[] => {
    const options: GroupOption[] = [];

    // Group by branch with proper Hebrew names
    const branchGroups = new Map<string, { name: string; employees: Employee[] }>();
    employees.forEach(emp => {
      if (emp.main_branch?.name && emp.main_branch?.id) {
        const branchId = emp.main_branch.id;
        const branchName = emp.main_branch.name;
        
        if (!branchGroups.has(branchId)) {
          branchGroups.set(branchId, { name: branchName, employees: [] });
        }
        branchGroups.get(branchId)!.employees.push(emp);
      }
    });

    branchGroups.forEach(({ name, employees: branchEmployees }, branchId) => {
      if (branchEmployees.length > 1) {
        options.push({
          id: branchId,
          name: `סניף ${name}`,
          employees: branchEmployees,
          type: 'branch',
          description: `${branchEmployees.length} עובדים בסניף`
        });
      }
    });

    // Group by employee type
    const typeGroups = new Map<string, Employee[]>();
    employees.forEach(emp => {
      const type = emp.employee_type || 'permanent';
      if (!typeGroups.has(type)) {
        typeGroups.set(type, []);
      }
      typeGroups.get(type)!.push(emp);
    });
    
    const typeLabels: Record<string, string> = {
      permanent: 'עובדים קבועים',
      temporary: 'עובדים זמניים',
      contractor: 'קבלנים',
      youth: 'עובדי נוער',
    };

    typeGroups.forEach((typeEmployees, type) => {
      if (typeEmployees.length > 1) {
        options.push({
          id: type,
          name: typeLabels[type] || type,
          employees: typeEmployees,
          type: 'employee_type',
          description: `${typeEmployees.length} עובדים מסוג זה`
        });
      }
    });

    // Group by status
    const activeEmployees = employees.filter(emp => emp.is_active);
    const inactiveEmployees = employees.filter(emp => !emp.is_active);
    
    if (activeEmployees.length > 1) {
      options.push({
        id: 'active',
        name: 'עובדים פעילים',
        employees: activeEmployees,
        type: 'status',
        description: `${activeEmployees.length} עובדים פעילים`
      });
    }

    if (inactiveEmployees.length > 1) {
      options.push({
        id: 'inactive',
        name: 'עובדים לא פעילים',
        employees: inactiveEmployees,
        type: 'status',
        description: `${inactiveEmployees.length} עובדים לא פעילים`
      });
    }

    // Group by hire period (recent vs veteran)
    const now = new Date();
    const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6));
    
    const recentHires = employees.filter(emp => 
      emp.hire_date && new Date(emp.hire_date) >= sixMonthsAgo
    );
    const veteranEmployees = employees.filter(emp => 
      emp.hire_date && new Date(emp.hire_date) < sixMonthsAgo
    );

    if (recentHires.length > 1) {
      options.push({
        id: 'recent',
        name: 'עובדים חדשים (6 חודשים אחרונים)',
        employees: recentHires,
        type: 'hire_period',
        description: `${recentHires.length} עובדים שהתקבלו לאחרונה`
      });
    }

    if (veteranEmployees.length > 1) {
      options.push({
        id: 'veteran',
        name: 'עובדים ותיקים (מעל 6 חודשים)',
        employees: veteranEmployees,
        type: 'hire_period',
        description: `${veteranEmployees.length} עובדים ותיקים`
      });
    }

    // Group by weekly hours (part-time vs full-time)
    const partTimeEmployees = employees.filter(emp => 
      emp.weekly_hours_required && emp.weekly_hours_required < 40
    );
    const fullTimeEmployees = employees.filter(emp => 
      emp.weekly_hours_required && emp.weekly_hours_required >= 40
    );

    if (partTimeEmployees.length > 1) {
      options.push({
        id: 'part_time',
        name: 'עובדים במשרה חלקית',
        employees: partTimeEmployees,
        type: 'priority',
        description: `${partTimeEmployees.length} עובדים במשרה חלקית`
      });
    }

    if (fullTimeEmployees.length > 1) {
      options.push({
        id: 'full_time',
        name: 'עובדים במשרה מלאה',
        employees: fullTimeEmployees,
        type: 'priority',
        description: `${fullTimeEmployees.length} עובדים במשרה מלאה`
      });
    }

    return options;
  }, [employees]);

  const handleCreateGroup = async (group: GroupOption) => {
    if (group.employees.length === 0) return;
    
    await createGroup({
      name: group.name,
      description: group.description || `קבוצה שנוצרה אוטומטית עבור ${group.name}`,
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
      case 'hire_period':
        return <Calendar className="h-4 w-4" />;
      case 'priority':
        return <Star className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'branch':
        return 'סניף';
      case 'employee_type':
        return 'סוג עובד';
      case 'status':
        return 'סטטוס';
      case 'hire_period':
        return 'תקופת קבלה';
      case 'priority':
        return 'היקף משרה';
      default:
        return 'כללי';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>יצירת קבוצות מהירה</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            בחר קבוצה להקמה מהירה על בסיס קריטריונים קיימים
          </p>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {groupOptions.map((group) => (
              <div
                key={`${group.type}-${group.id}`}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  {getGroupIcon(group.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900">{group.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {getTypeLabel(group.type)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      {group.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {group.employees.slice(0, 3).map(emp => (
                        <span key={emp.id} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {emp.first_name} {emp.last_name}
                        </span>
                      ))}
                      {group.employees.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{group.employees.length - 3} נוספים
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mr-4">
                  <Button
                    size="sm"
                    onClick={() => handleCreateGroup(group)}
                    disabled={isCreatingGroup}
                    className="whitespace-nowrap"
                  >
                    {isCreatingGroup ? 'יוצר...' : 'צור קבוצה'}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {groupOptions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>לא נמצאו קבוצות זמינות ליצירה</p>
              <p className="text-sm">נדרשים לפחות 2 עובדים לכל קבוצה</p>
            </div>
          )}

          <div className="flex gap-2 pt-4 border-t">
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
