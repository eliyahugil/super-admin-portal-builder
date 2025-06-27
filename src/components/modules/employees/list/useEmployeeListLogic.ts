
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

  const handleDeleteEmployee = async (employee: Employee) => {
    const employeeName = `${employee.first_name} ${employee.last_name}`;
    
    if (!confirm(`האם אתה בטוח שברצונך להעביר את ${employeeName} לארכיון?`)) {
      return;
    }

    setLoading(true);
    try {
      console.log('📁 Archiving employee:', employee.id);

      // השתמש בפונקציה המוכנה לארכיון
      await new Promise((resolve, reject) => {
        archiveEntity(employee, {
          onSuccess: () => {
            console.log('✅ Employee archived successfully');
            resolve(true);
          },
          onError: (error: any) => {
            console.error('❌ Failed to archive employee:', error);
            reject(error);
          }
        });
      });

      // הסרה מהבחירה אם נבחר
      const newSelected = new Set(selectedEmployees);
      newSelected.delete(employee.id);
      setSelectedEmployees(newSelected);

      // עדכון מיידי של הקאש
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee-stats'] });

      // רענון הנתונים
      onRefetch();

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

      // העברה לארכיון של כל העובדים הנבחרים
      const selectedEmployeesList = employees.filter(emp => selectedEmployees.has(emp.id));
      
      for (const employee of selectedEmployeesList) {
        await new Promise((resolve, reject) => {
          archiveEntity(employee, {
            onSuccess: resolve,
            onError: reject
          });
        });
      }

      // רישום פעילות
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

      // איפוס הבחירה
      setSelectedEmployees(new Set());

      // עדכון מיידי של הקאש
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee-stats'] });

      // רענון הנתונים
      onRefetch();

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
