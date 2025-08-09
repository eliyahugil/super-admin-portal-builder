import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useBusinessId } from '@/hooks/useBusinessId';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { useEmployeeBranchSync } from './useEmployeeBranchSync';

export type EmployeeUpsertInput = {
  id?: string;
  first_name: string;
  last_name: string;
  phone: string;
  email?: string | null;
  employee_id?: string | null; // מספר עובד
  id_number?: string | null;   // ת.ז
  employee_type: 'permanent' | 'temporary' | 'contractor' | 'youth';
  is_active: boolean;
  notes?: string | null;
  main_branch_id?: string | null;
  branchIds?: string[]; // בחירה מרובה של סניפים
};

export function useUpsertEmployee(onSuccess?: () => void) {
  const businessId = useBusinessId();
  const qc = useQueryClient();
  const { syncEmployeeBranches } = useEmployeeBranchSync();

  return useMutation({
    mutationFn: async (payload: EmployeeUpsertInput) => {
      if (!businessId) throw new Error('אין מזהה עסק פעיל');

      const now = new Date().toISOString();
      const base = {
        business_id: businessId,
        first_name: payload.first_name,
        last_name: payload.last_name,
        phone: payload.phone,
        email: payload.email ?? null,
        employee_id: payload.employee_id ?? null,
        id_number: payload.id_number ?? null,
        employee_type: payload.employee_type,
        is_active: payload.is_active,
        notes: payload.notes ?? null,
        main_branch_id: payload.main_branch_id ?? null,
        updated_at: now,
      };

      let employeeId: string | undefined = payload.id;

      if (payload.id) {
        const { data, error } = await supabase
          .from('employees')
          .update(base)
          .eq('id', payload.id)
          .select('id')
          .maybeSingle();
        if (error) throw error;
        employeeId = data?.id ?? payload.id;
      } else {
        const insertData = { ...base, created_at: now };
        const { data, error } = await supabase
          .from('employees')
          .insert(insertData)
          .select('id')
          .maybeSingle();
        if (error) throw error;
        employeeId = data?.id;
      }

      if (payload.branchIds && employeeId) {
        await syncEmployeeBranches(employeeId, payload.branchIds);
      }

      return { id: employeeId };
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: QUERY_KEYS.employees(businessId) });
      onSuccess?.();
    },
  });
}
