
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { useQueryClient } from '@tanstack/react-query';
import type { Employee } from '@/types/employee';
import { useEmployeeListPagination } from './useEmployeeListPagination';

export const useEmployeeListLogic = (employees: Employee[], onRefetch: () => void) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { logActivity } = useActivityLogger();
  const queryClient = useQueryClient();

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
    
    if (!confirm(`האם אתה בטוח שברצונך למחוק לצמיתות את ${employeeName}? פעולה זו אינה ניתנת לביטול!`)) {
      return;
    }

    setLoading(true);
    try {
      console.log('🗑️ Permanently deleting employee:', employee.id);

      // מחיקה לצמיתות מהמסד נתונים
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', employee.id);

      if (error) {
        console.error('❌ Error deleting employee:', error);
        throw error;
      }

      // רישום פעילות
      logActivity({
        action: 'permanent_delete',
        target_type: 'employee',
        target_id: employee.id,
        details: { 
          employee_name: employeeName,
          employee_id: employee.employee_id || 'לא הוגדר'
        }
      });

      toast({
        title: 'הצלחה',
        description: `העובד ${employeeName} נמחק לצמיתות`,
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
      console.error('💥 Error deleting employee:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן למחוק את העובד. נסה שוב מאוחר יותר.',
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

    if (!confirm(`האם אתה בטוח שברצונך למחוק לצמיתות ${selectedEmployees.size} עובדים?\n\n${employeeNames}\n\nפעולה זו אינה ניתנת לביטול!`)) {
      return;
    }

    setLoading(true);
    try {
      console.log('🗑️ Bulk deleting employees:', Array.from(selectedEmployees));

      // מחיקה לצמיתות של כל העובדים הנבחרים
      const { error } = await supabase
        .from('employees')
        .delete()
        .in('id', Array.from(selectedEmployees));

      if (error) {
        console.error('❌ Error bulk deleting employees:', error);
        throw error;
      }

      // רישום פעילות
      logActivity({
        action: 'bulk_permanent_delete',
        target_type: 'employee',
        target_id: 'multiple',
        details: { 
          deleted_count: selectedEmployees.size,
          employee_ids: Array.from(selectedEmployees),
          employee_names: employeeNames
        }
      });

      toast({
        title: 'הצלחה',
        description: `${selectedEmployees.size} עובדים נמחקו לצמיתות`,
      });

      // איפוס הבחירה
      setSelectedEmployees(new Set());

      // עדכון מיידי של הקאש
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee-stats'] });

      // רענון הנתונים
      onRefetch();

    } catch (error) {
      console.error('💥 Error bulk deleting employees:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן למחוק את העובדים. נסה שוב מאוחר יותר.',
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
