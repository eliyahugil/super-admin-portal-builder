
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Employee, EmployeeType } from '@/types/supabase';

interface EmployeeFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  employee_type: EmployeeType;
  is_active: boolean;
  hire_date: string;
  weekly_hours_required: number;
  notes: string;
  main_branch_id: string;
}

export const useEmployeeEdit = (employee: Employee, onSuccess: () => void) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<EmployeeFormData>({
    first_name: employee.first_name,
    last_name: employee.last_name,
    email: employee.email || '',
    phone: employee.phone || '',
    address: employee.address || '',
    employee_type: employee.employee_type as EmployeeType,
    is_active: employee.is_active ?? true,
    hire_date: employee.hire_date || '',
    weekly_hours_required: employee.weekly_hours_required || 0,
    notes: employee.notes || '',
    main_branch_id: employee.main_branch_id || '',
  });
  const { toast } = useToast();

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const updateData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
        employee_type: formData.employee_type,
        is_active: formData.is_active,
        hire_date: formData.hire_date || null,
        weekly_hours_required: formData.weekly_hours_required || null,
        notes: formData.notes || null,
        main_branch_id: formData.main_branch_id || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('employees')
        .update(updateData)
        .eq('id', employee.id);

      if (error) throw error;

      toast({
        title: 'הצלחה',
        description: 'פרטי העובד עודכנו בהצלחה',
      });

      onSuccess();
    } catch (error) {
      console.error('Error updating employee:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לעדכן את פרטי העובד',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    loading,
    handleSubmit,
  };
};
