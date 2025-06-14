
import { useState, useMemo } from 'react';
import { useBusinessData } from '@/hooks/useBusinessData';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { useToast } from '@/hooks/use-toast';
import type { Employee } from '@/types/employee';

interface UseEmployeesTableLogicReturn {
  employees: Employee[];
  filteredEmployees: Employee[];
  loading: boolean;
  search: string;
  setSearch: (search: string) => void;
  filterType: string;
  setFilterType: (type: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  handleCreateEmployee: () => void;
  handleTokenSent: () => void;
}

export const useEmployeesTableLogic = (selectedBusinessId?: string | null): UseEmployeesTableLogicReturn => {
  const { businessId } = useCurrentBusiness();
  const { toast } = useToast();
  
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  console.log('🔄 useEmployeesTableLogic hook called with:', {
    selectedBusinessId,
    contextBusinessId: businessId
  });

  // Use the new unified hook for active employees
  const { 
    data: employees = [], 
    isLoading: loading, 
    error 
  } = useBusinessData<Employee>({
    tableName: 'employees',
    queryKey: ['employees'],
    filter: 'active',
    selectedBusinessId: selectedBusinessId || businessId,
    select: `
      *,
      main_branch:main_branch_id(id, name),
      employee_branch_assignments!inner(
        branch:branch_id(id, name),
        role_name,
        is_active
      )
    `
  });

  if (error) {
    console.error('❌ Error loading employees:', error);
  }

  const filteredEmployees = useMemo(() => {
    let filtered = employees;

    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(employee =>
        employee.first_name?.toLowerCase().includes(searchLower) ||
        employee.last_name?.toLowerCase().includes(searchLower) ||
        employee.email?.toLowerCase().includes(searchLower) ||
        employee.phone?.includes(search) ||
        employee.employee_id?.toLowerCase().includes(searchLower)
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(employee => employee.employee_type === filterType);
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'active') {
        filtered = filtered.filter(employee => employee.is_active);
      } else if (filterStatus === 'inactive') {
        filtered = filtered.filter(employee => !employee.is_active);
      }
    }

    return filtered;
  }, [employees, search, filterType, filterStatus]);

  const handleCreateEmployee = () => {
    console.log('🆕 Create employee clicked');
    toast({
      title: 'יצירת עובד חדש',
      description: 'פונקציונליות בפיתוח...',
    });
  };

  const handleTokenSent = () => {
    console.log('🔄 Token sent, refreshing data...');
    toast({
      title: 'הטוקן נשלח בהצלחה',
      description: 'העובד יקבל הודעה עם קישור להגשת המשמרות',
    });
  };

  return {
    employees,
    filteredEmployees,
    loading,
    search,
    setSearch,
    filterType,
    setFilterType,
    filterStatus,
    setFilterStatus,
    handleCreateEmployee,
    handleTokenSent,
  };
};

