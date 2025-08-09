import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useBusinessId } from '@/hooks/useBusinessId';
import { QUERY_KEYS } from '@/constants/queryKeys';

export function useEmployeeBranchSync() {
  const qc = useQueryClient();
  const businessId = useBusinessId();

  const syncEmployeeBranches = useCallback(async (employeeId: string, nextBranchIds: string[]) => {
    if (!businessId) throw new Error('אין מזהה עסק פעיל');

    // Current assignments
    const { data: current, error: selErr } = await supabase
      .from('employee_branch_assignments')
      .select('id, branch_id')
      .eq('employee_id', employeeId)
      .eq('business_id', businessId);
    if (selErr) throw selErr;

    const currentSet = new Set((current ?? []).map((r) => r.branch_id));
    const nextSet = new Set(nextBranchIds);

    const toAdd = [...nextSet].filter((id) => !currentSet.has(id));
    const toRemove = (current ?? [])
      .filter((r) => !nextSet.has(r.branch_id))
      .map((r) => r.id);

    if (toAdd.length) {
      const rows = toAdd.map((branchId) => ({
        employee_id: employeeId,
        branch_id: branchId,
        business_id: businessId,
        is_active: true,
      }));
      const { error: insErr } = await supabase.from('employee_branch_assignments').insert(rows);
      if (insErr) throw insErr;
    }

    if (toRemove.length) {
      const { error: delErr } = await supabase
        .from('employee_branch_assignments')
        .delete()
        .in('id', toRemove);
      if (delErr) throw delErr;
    }

    await qc.invalidateQueries({ queryKey: QUERY_KEYS.employees(businessId) as any });
    return { added: toAdd.length, removed: toRemove.length };
  }, [businessId, qc]);

  return { syncEmployeeBranches };
}
