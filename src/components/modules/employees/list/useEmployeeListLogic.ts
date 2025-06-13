
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import type { Employee } from '@/types/supabase';

interface EmployeeWithBranch extends Omit<Employee, 'employee_id'> {
  employee_id?: string;
  main_branch?: { name: string } | null;
}

export const useEmployeeListLogic = (employees: EmployeeWithBranch[], onRefetch: () => void) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { logActivity } = useActivityLogger();

  // Filter employees based on search term
  const filteredEmployees = employees.filter((employee) => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${employee.first_name} ${employee.last_name}`.toLowerCase();
    const employeeId = employee.employee_id?.toLowerCase() || '';
    const phone = employee.phone?.toLowerCase() || '';
    const email = employee.email?.toLowerCase() || '';

    return (
      fullName.includes(searchLower) ||
      employeeId.includes(searchLower) ||
      phone.includes(searchLower) ||
      email.includes(searchLower)
    );
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
      const allIds = new Set(filteredEmployees.map(emp => emp.id));
      setSelectedEmployees(allIds);
      console.log('✅ Selected all employees:', allIds.size);
    } else {
      setSelectedEmployees(new Set());
      console.log('❌ Deselected all employees');
    }
  };

  const handleDeleteEmployee = async (employee: EmployeeWithBranch) => {
    if (!confirm(`האם אתה בטוח שברצונך למחוק את ${employee.first_name} ${employee.last_name}?`)) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', employee.id);

      if (error) throw error;

      logActivity({
        action: 'delete',
        target_type: 'employee',
        target_id: employee.id,
        details: { 
          employee_name: `${employee.first_name} ${employee.last_name}`,
          employee_id: employee.employee_id || 'לא הוגדר'
        }
      });

      toast({
        title: 'הצלחה',
        description: 'העובד נמחק בהצלחה',
      });

      // Remove from selected if it was selected
      const newSelected = new Set(selectedEmployees);
      newSelected.delete(employee.id);
      setSelectedEmployees(newSelected);

      onRefetch();
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן למחוק את העובד',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEmployees.size === 0) return;

    if (!confirm(`האם אתה בטוח שברצונך למחוק ${selectedEmployees.size} עובדים?`)) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .in('id', Array.from(selectedEmployees));

      if (error) throw error;

      logActivity({
        action: 'bulk_delete',
        target_type: 'employee',
        target_id: 'multiple',
        details: { 
          deleted_count: selectedEmployees.size,
          employee_ids: Array.from(selectedEmployees)
        }
      });

      toast({
        title: 'הצלחה',
        description: `${selectedEmployees.size} עובדים נמחקו בהצלחה`,
      });

      setSelectedEmployees(new Set());
      onRefetch();
    } catch (error) {
      console.error('Error bulk deleting employees:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן למחוק את העובדים',
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
    filteredEmployees,
    loading,
    handleSelectEmployee,
    handleSelectAll,
    handleDeleteEmployee,
    handleBulkDelete,
  };
};
