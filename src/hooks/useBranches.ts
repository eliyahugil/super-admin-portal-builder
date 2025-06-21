
import { useBranchesData } from '@/hooks/useBranchesData';

export const useBranches = (selectedBusinessId?: string | null) => {
  return useBranchesData(selectedBusinessId);
};
