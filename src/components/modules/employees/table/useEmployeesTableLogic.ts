
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/hooks/useBusiness';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Employee {
  id: string;
  employee_id: string | null;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  employee_type: string;
  is_active: boolean;
  hire_date: string | null;
  weekly_hours_required: number | null;
  notes: string | null;
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

export const useEmployeesTableLogic = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { businessId } = useBusiness();
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchEmployees = async () => {
    try {
      console.log('=== FETCHING EMPLOYEES FOR ENHANCED TABLE ===');
      console.log('Business ID:', businessId);
      
      const { data, error } = await supabase
        .from('employees')
        .select(`
          id,
          employee_id,
          first_name,
          last_name,
          phone,
          email,
          employee_type,
          is_active,
          hire_date,
          weekly_hours_required,
          notes,
          main_branch:branches!main_branch_id(name),
          branch_assignments:employee_branch_assignments(
            role_name,
            is_active,
            branch:branches(name)
          ),
          weekly_tokens:employee_weekly_tokens(
            token,
            week_start_date,
            week_end_date,
            is_active
          ),
          employee_notes:employee_notes(
            content,
            note_type,
            created_at
          )
        `)
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching employees:', error);
        toast({
          title: 'שגיאה',
          description: 'לא ניתן לטעון את רשימת העובדים',
          variant: 'destructive',
        });
        return;
      }

      console.log('Enhanced employees fetched:', data?.length);
      setEmployees(data || []);
    } catch (error) {
      console.error('Exception in fetchEmployees:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בטעינת הנתונים',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (businessId) {
      fetchEmployees();
    }
  }, [businessId]);

  const filteredEmployees = employees.filter((emp) => {
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
    fetchEmployees();
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
    refetch: fetchEmployees,
  };
};
