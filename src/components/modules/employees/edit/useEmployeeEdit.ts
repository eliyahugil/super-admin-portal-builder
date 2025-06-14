
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Employee, EmployeeType } from '@/types/supabase';

// Helper for client-side hashing (quick demo; use server-side hashing in production!)
async function hashPassword(password: string): Promise<string> {
  // Use built-in subtle crypto if available
  if ('crypto' in window && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
  } else {
    // fallback: clear text (UNSAFE)
    return password;
  }
}

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
  username?: string;
  password?: string; // for updating
  is_system_user?: boolean;
  termination_date?: string | null;
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
    username: employee.username || '',
    password: '',
    is_system_user: employee.is_system_user || false,
    termination_date: employee.termination_date || '',
  });
  const { toast } = useToast();

  const handleSubmit = async () => {
    setLoading(true);

    try {
      let password_hash: string | undefined = undefined;
      if (formData.password && formData.password.length > 0) {
        password_hash = await hashPassword(formData.password);
      }

      // Archive logic: if termination date is set and in past, set is_archived
      let is_archived = employee.is_archived || false;
      if (formData.termination_date) {
        const term = new Date(formData.termination_date);
        const today = new Date();
        today.setHours(0,0,0,0);
        if (term < today) {
          is_archived = true;
        }
      }

      const updateData: any = {
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
        username: formData.username || null,
        is_system_user: !!formData.is_system_user,
        termination_date: formData.termination_date || null,
        is_archived,
      };

      if (password_hash) updateData.password_hash = password_hash;

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
