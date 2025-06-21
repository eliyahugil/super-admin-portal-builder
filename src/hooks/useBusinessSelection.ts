
import { useCurrentBusiness } from './useCurrentBusiness';

interface UseBusinessSelectionResult {
  selectedBusinessId: string | null;
  setSelectedBusinessId: (businessId: string | null) => void;
  isLoading: boolean;
  isSuperAdmin: boolean;
}

/**
 * @deprecated Use useCurrentBusiness directly instead
 * This hook is kept for backward compatibility
 */
export function useBusinessSelection(): UseBusinessSelectionResult {
  const { businessId, setSelectedBusinessId, loading, isSuperAdmin } = useCurrentBusiness();

  return {
    selectedBusinessId: businessId,
    setSelectedBusinessId,
    isLoading: loading,
    isSuperAdmin
  };
}
