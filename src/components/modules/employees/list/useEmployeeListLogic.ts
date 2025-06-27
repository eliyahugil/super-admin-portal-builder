
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { useQueryClient } from '@tanstack/react-query';
import type { Employee } from '@/types/employee';
import { useEmployeeListPagination } from './useEmployeeListPagination';
import { useEmployeeArchive } from '@/hooks/useEmployeeArchive';

export const useEmployeeListLogic = (employees: Employee[], onRefetch: () => void) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { logActivity } = useActivityLogger();
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
    console.log('📝 Employee selection changed:', { employeeId, checked, totalSelected: newSelected.size });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(paginatedEmployees.map(emp => emp.id));
      setSelectedEmployees(allIds);
      console.log('✅ Selected all employees on current page:', allIds.size);
    } else {
      setSelectedEmployees(new Set());
      console.log('❌ Deselected all employees');
    }
  };

  const refreshAllData = async () => {
    console.log('🔄 Refreshing all employee data...');
    
    // Get business ID from first employee
    const businessId = employees[0]?.business_id;
    
    // Invalidate all relevant queries
    await queryClient.invalidateQueries({ queryKey: ['employees'] });
    await queryClient.invalidateQueries({ queryKey: ['employee-stats'] });
    
    if (businessId) {
      await queryClient.invalidateQueries({ queryKey: ['employees', businessId] });
      await queryClient.invalidateQueries({ queryKey: ['employee-stats', businessId] });
    }
    
    // Wait for cache invalidation
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Trigger refetch
    onRefetch();
    
    console.log('✅ All data refreshed');
  };

  const handleDeleteEmployee = async (employee: Employee) => {
    const employeeName = `${employee.first_name} ${employee.last_name}`;
    
    if (!confirm(`האם אתה בטוח שברצונך להעביר את ${employeeName} לארכיון?`)) {
      return;
    }

    setLoading(true);
    try {
      console.log('📁 Archiving employee:', employee.id);

      // Use the archive function with proper callback
      await new Promise<void>((resolve, reject) => {
        archiveEntity(employee, {
          onSuccess: () => {
            console.log('✅ Employee archived successfully');
            resolve();
          },
          onError: (error: any) => {
            console.error('❌ Failed to archive employee:', error);
            reject(error);
          }
        });
      });

      // Remove from selection if selected
      const newSelected = new Set(selectedEmployees);
      newSelected.delete(employee.id);
      setSelectedEmployees(newSelected);

      // Refresh all data
      await refreshAllData();

    } catch (error) {
      console.error('💥 Error archiving employee:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן להעביר את העובד לארכיון. נסה שוב מאוחר יותר.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEmployees.size === 0) return;

    const employeeNames = employees
      .filter(emp => selectedEmployees.has(emp.id))
      .map(emp => `${emp.first_name} ${emp.last_name}`)
      .join(', ');

    if (!confirm(`האם אתה בטוח שברצונך להעביר ${selectedEmployees.size} עובדים לארכיון?\n\n${employeeNames}`)) {
      return;
    }

    setLoading(true);
    try {
      console.log('📁 Bulk archiving employees:', Array.from(selectedEmployees));

      const selectedEmployeesList = employees.filter(emp => selectedEmployees.has(emp.id));
      
      // Archive employees one by one
      for (const employee of selectedEmployeesList) {
        await new Promise<void>((resolve, reject) => {
          archiveEntity(employee, {
            onSuccess: () => resolve(),
            onError: (error: any) => reject(error)
          });
        });
      }

      // Log activity
      logActivity({
        action: 'bulk_archive',
        target_type: 'employee',
        target_id: 'multiple',
        details: { 
          archived_count: selectedEmployees.size,
          employee_ids: Array.from(selectedEmployees),
          employee_names: employeeNames
        }
      });

      toast({
        title: 'הצלחה',
        description: `${selectedEmployees.size} עובדים הועברו לארכיון`,
      });

      // Reset selection
      setSelectedEmployees(new Set());

      // Refresh all data
      await refreshAllData();

    } catch (error) {
      console.error('💥 Error bulk archiving employees:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן להעביר את העובדים לארכיון. נסה שוב מאוחר יותר.',
        variant: 'destructive',
      });
    } finally {
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
    // Pagination props
    currentPage,
    totalPages,
    totalEmployees,
    pageSize,
    handlePageSizeChange,
    handlePageChange,
  };
};
