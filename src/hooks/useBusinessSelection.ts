
import { useState, useEffect } from 'react';
import { useCurrentBusiness } from './useCurrentBusiness';

interface UseBusinessSelectionResult {
  selectedBusinessId: string | null;
  setSelectedBusinessId: (businessId: string | null) => void;
  isLoading: boolean;
  isSuperAdmin: boolean;
}

export function useBusinessSelection(): UseBusinessSelectionResult {
  const { businessId, isSuperAdmin, loading } = useCurrentBusiness();
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);

  useEffect(() => {
    // For super admin, initialize with null (no business selected)
    // For regular users, use their business ID
    if (!loading) {
      if (isSuperAdmin) {
        setSelectedBusinessId(null);
      } else {
        setSelectedBusinessId(businessId);
      }
    }
  }, [businessId, isSuperAdmin, loading]);

  return {
    selectedBusinessId,
    setSelectedBusinessId,
    isLoading: loading,
    isSuperAdmin
  };
}
