
import { useState, useEffect } from 'react';
import { useEmployeesData } from '@/hooks/useEmployeesData';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import type { Employee } from '@/types/supabase';

// Extended interface for employees with additional joined data
interface EmployeeWithExtensions extends Employee {
  main_branch?: { name: string } | null;
  branch_assignments?: Array<{
    branch: { name: string };
    role_name: string;
    is_active: boolean;
  }>;
  weekly_tokens?: Array<{
    token: string;
    week_start_date: string;
    week_end_date: string;
    is_active: boolean;
  }>;
  employee_notes?: Array<{
    content: string;
    note_type: string;
    created_at: string;
  }>;
  salary_info?: {
    hourly_rate?: number;
    monthly_salary?: number;
    currency?: string;
  };
}

export const useEmployeesTableLogic = (selectedBusinessId?: string | null) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { businessId, isSuperAdmin } = useCurrentBusiness();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Use the unified employees data hook
  const { data: employees, isLoading: loading, refetch } = useEmployeesData(selectedBusinessId);

  console.log('=== EMPLOYEES TABLE LOGIC ===');
  console.log('Using unified useEmployeesData hook');
  console.log('Business ID:', businessId);
  console.log('Selected Business ID:', selectedBusinessId);
  console.log('Is Super Admin:', isSuperAdmin);
  console.log('Employees count:', employees?.length || 0);

  const filteredEmployees = (employees || []).filter((emp) => {
    const searchTerm = search.toLowerCase();
    const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase();
    const employeeId = emp.employee_id?.toLowerCase() || '';
    const phone = emp.phone?.toLowerCase() || '';
    
    const matchesSearch = fullName.includes(searchTerm) || 
                         employeeId.includes(searchTerm) || 
                         phone.includes(searchTerm);
    
    const matchesType = filterType === 'all' || emp.employee_type === filterType;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && emp.is_active) ||
                         (filterStatus === 'inactive' && !emp.is_active);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateEmployee = () => {
    navigate('/modules/employees/create');
  };

  const handleTokenSent = () => {
    refetch();
  };

  return {
    employees: employees || [],
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
    refetch,
  };
};
