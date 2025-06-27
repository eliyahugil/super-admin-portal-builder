
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useGenericArchive } from '@/hooks/useGenericArchive';
import type { Employee } from '@/types/employee';

export const useEmployeeActions = (onRefetch: () => void, selectedEmployees: Set<string>, clearSelectedEmployees: () => void) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { archiveEntity, isArchiving } = useGenericArchive({
    tableName: 'employees',
    entityName: 'העובד',
    queryKey: ['employees'],
    getEntityDisplayName: (emp: Employee) => `${emp.first_name} ${emp.last_name}`,
    onSuccess: () => {
      console.log('🔄 Archive success callback - triggering refetch');
      onRefetch();
    }
  });

  const handleDeleteEmployee = async (employee: Employee) => {
    const employeeName = `${employee.first_name} ${employee.last_name}`;
    
    if (!confirm(`האם אתה בטוח שברצונך להעביר את ${employeeName} לארכיון?`)) {
      return;
    }

    try {
      await archiveEntity(employee);
    } catch (error) {
      console.error('Error archiving employee:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן להעביר את העובד לארכיון',
        variant: 'destructive',
      });
    }
  };

  const handleBulkDelete = async (allEmployees: Employee[]) => {
    if (selectedEmployees.size === 0) return;

    const selectedEmployeesList = allEmployees.filter(emp => selectedEmployees.has(emp.id));
    const employeeNames = selectedEmployeesList.map(emp => `${emp.first_name} ${emp.last_name}`).join(', ');

    if (!confirm(`האם אתה בטוח שברצונך להעביר ${selectedEmployees.size} עובדים לארכיון?\n\n${employeeNames}`)) {
      return;
    }

    setLoading(true);
    
    try {
      clearSelectedEmployees();

      for (const employee of selectedEmployeesList) {
        try {
          await archiveEntity(employee);
        } catch (error) {
          console.error('Error archiving employee:', employee.id, error);
        }
      }

      toast({
        title: 'הצלחה',
        description: `הועברו ${selectedEmployees.size} עובדים לארכיון`,
      });

    } catch (error) {
      console.error('Error bulk archiving:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    handleDeleteEmployee,
    handleBulkDelete,
    loading: loading || isArchiving,
  };
};
