
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import type { Employee } from '@/types/employee';
import { useEmployeeListPagination } from './useEmployeeListPagination';
import { useEmployeeArchive } from '@/hooks/useEmployeeArchive';

export const useEmployeeListLogic = (employees: Employee[], onRefetch: () => void) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { archiveEntity } = useEmployeeArchive();

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

    setLoading(true);
    try {
      archiveEntity(employee, {
        onSuccess: () => {
          // Remove from selection
          const newSelected = new Set(selectedEmployees);
          newSelected.delete(employee.id);
          setSelectedEmployees(newSelected);
          
          // Trigger parent refetch
          setTimeout(() => {
            onRefetch();
            setLoading(false);
          }, 500);
        },
        onError: () => {
          setLoading(false);
        }
      });
    } catch (error) {
      setLoading(false);
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
    let successCount = 0;
    
    try {
      for (const employee of selectedEmployeesList) {
        try {
          await new Promise<void>((resolve, reject) => {
            archiveEntity(employee, {
              onSuccess: () => {
                successCount++;
                resolve();
              },
              onError: (error: any) => reject(error)
            });
          });
        } catch (error) {
          console.error('Error archiving employee:', employee.id, error);
        }
      }

      toast({
        title: 'הצלחה',
        description: `${successCount} עובדים הועברו לארכיון`,
      });

      setSelectedEmployees(new Set());
      
      // Trigger parent refetch
      setTimeout(() => {
        onRefetch();
        setLoading(false);
      }, 500);

    } catch (error) {
      console.error('Error bulk archiving:', error);
      setLoading(false);
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedEmployees,
    paginatedEmployees,
    loading,
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
