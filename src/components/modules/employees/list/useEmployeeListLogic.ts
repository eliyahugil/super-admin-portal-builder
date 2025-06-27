import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Employee } from '@/types/employee';
import { useEmployeeListPagination } from './useEmployeeListPagination';
import { useGenericArchive } from '@/hooks/useGenericArchive';

export const useEmployeeListLogic = (employees: Employee[], onRefetch: () => void) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Use pagination hook
  const {
    paginatedEmployees,
    currentPage,
    totalPages,
    totalEmployees,
    pageSize,
    handlePageSizeChange,
    handlePageChange,
  } = useEmployeeListPagination({
    employees,
    searchTerm,
  });

  // Use the generic archive hook
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

  const handleSelectEmployee = (employeeId: string, checked: boolean) => {
    const newSelected = new Set(selectedEmployees);
    if (checked) {
      newSelected.add(employeeId);
    } else {
      newSelected.delete(employeeId);
    }
    setSelectedEmployees(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(paginatedEmployees.map(emp => emp.id));
      setSelectedEmployees(allIds);
    } else {
      setSelectedEmployees(new Set());
    }
  };

  const handleDeleteEmployee = async (employee: Employee) => {
    const employeeName = `${employee.first_name} ${employee.last_name}`;
    
    if (!confirm(`האם אתה בטוח שברצונך להעביר את ${employeeName} לארכיון?`)) {
      return;
    }

    try {
      // Remove from selection immediately
      const newSelected = new Set(selectedEmployees);
      newSelected.delete(employee.id);
      setSelectedEmployees(newSelected);

      // Use the generic archive function
      archiveEntity(employee);
    } catch (error) {
      console.error('Error archiving employee:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן להעביר את העובד לארכיון',
        variant: 'destructive',
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEmployees.size === 0) return;

    const selectedEmployeesList = employees.filter(emp => selectedEmployees.has(emp.id));
    const employeeNames = selectedEmployeesList.map(emp => `${emp.first_name} ${emp.last_name}`).join(', ');

    if (!confirm(`האם אתה בטוח שברצונך להעביר ${selectedEmployees.size} עובדים לארכיון?\n\n${employeeNames}`)) {
      return;
    }

    setLoading(true);
    
    try {
      // Clear selection immediately
      setSelectedEmployees(new Set());

      // Archive each employee using the generic function
      for (const employee of selectedEmployeesList) {
        try {
          archiveEntity(employee);
        } catch (error) {
          console.error('Error archiving employee:', employee.id, error);
        }
      }

      toast({
        title: 'הצלחה',
        description: `מעביר ${selectedEmployees.size} עובדים לארכיון`,
      });

      // Single refetch after all operations
      setTimeout(() => {
        onRefetch();
      }, 1000);

    } catch (error) {
      console.error('Error bulk archiving:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedEmployees,
    paginatedEmployees,
    loading: loading || isArchiving,
    handleSelectEmployee,
    handleSelectAll,
    handleDeleteEmployee,
    handleBulkDelete,
    currentPage,
    totalPages,
    totalEmployees,
    pageSize,
    handlePageSizeChange,
    handlePageChange,
  };
};
