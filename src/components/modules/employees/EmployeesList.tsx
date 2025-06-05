
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Employee {
  id: string;
  employee_id: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  employee_type: string;
  is_active: boolean;
  main_branch?: { name: string } | null;
}

interface EmployeesListProps {
  employees: Employee[];
  onRefetch: () => void;
}

export const EmployeesList: React.FC<EmployeesListProps> = ({ employees, onRefetch }) => {
  const { toast } = useToast();

  const getEmployeeTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      permanent: 'קבוע',
      temporary: 'זמני',
      youth: 'נוער',
      contractor: 'קבלן',
    };
    return types[type] || type;
  };

  const getEmployeeTypeVariant = (type: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      permanent: 'default',
      temporary: 'secondary',
      youth: 'outline',
      contractor: 'destructive',
    };
    return variants[type] || 'default';
  };

  const handleEdit = (employee: Employee) => {
    // TODO: Implement edit functionality
    console.log('Edit employee:', employee);
    toast({
      title: 'עריכה',
      description: 'פונקציונליות עריכה תמומש בקרוב',
    });
  };

  const handleDelete = async (employeeId: string, employeeName: string) => {
    if (!confirm(`האם אתה בטוח שברצונך למחוק את העובד "${employeeName}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', employeeId);

      if (error) {
        console.error('Error deleting employee:', error);
        toast({
          title: 'שגיאה',
          description: 'לא ניתן למחוק את העובד',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'הצלחה',
        description: 'העובד נמחק בהצלחה',
      });

      onRefetch();
    } catch (error) {
      console.error('Error in handleDelete:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בלתי צפויה',
        variant: 'destructive',
      });
    }
  };

  if (employees.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">אין עובדים עדיין</p>
        <p className="text-sm text-gray-400">התחל על ידי הוספת העובד הראשון</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {employees.map((employee) => (
        <div
          key={employee.id}
          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
        >
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-medium text-gray-900">
                {employee.first_name} {employee.last_name}
              </h3>
              <Badge variant={getEmployeeTypeVariant(employee.employee_type)}>
                {getEmployeeTypeLabel(employee.employee_type)}
              </Badge>
              {!employee.is_active && (
                <Badge variant="outline" className="text-red-600 border-red-200">
                  לא פעיל
                </Badge>
              )}
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              {employee.employee_id && (
                <div>מספר עובד: {employee.employee_id}</div>
              )}
              {employee.email && (
                <div>אימייל: {employee.email}</div>
              )}
              {employee.phone && (
                <div>טלפון: {employee.phone}</div>
              )}
              {employee.main_branch && (
                <div>סניף ראשי: {employee.main_branch.name}</div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleEdit(employee)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-red-600 hover:text-red-700"
              onClick={() => handleDelete(employee.id, `${employee.first_name} ${employee.last_name}`)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
