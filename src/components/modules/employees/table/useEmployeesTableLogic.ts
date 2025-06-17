
import { useState, useMemo } from 'react';
import { useEmployeesData } from '@/hooks/useEmployeesData';
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
  const { businessId, isSuperAdmin } = useCurrentBusiness();
  const { toast } = useToast();
  
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  console.log('🔄 useEmployeesTableLogic - Security parameters:', {
    selectedBusinessId,
    contextBusinessId: businessId,
    isSuperAdmin,
    finalBusinessId: selectedBusinessId || businessId
  });

  // Use the employees data hook with proper business isolation
  const { 
    data: employees = [], 
    isLoading: loading, 
    error 
  } = useEmployeesData(selectedBusinessId);

  if (error) {
    console.error('❌ Critical error loading employees:', error);
    toast({
      title: 'שגיאת אבטחה',
      description: 'לא ניתן לטעון נתוני עובדים. אנא פנה למנהל המערכת.',
      variant: 'destructive',
    });
  }

  const filteredEmployees = useMemo(() => {
    console.log('🔍 Filtering employees:', {
      totalEmployees: employees.length,
      businessContext: businessId,
      selectedBusiness: selectedBusinessId
    });

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

    console.log('✅ Filtered employees result:', {
      original: employees.length,
      filtered: filtered.length
    });

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
