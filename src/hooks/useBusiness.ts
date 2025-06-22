
import { useCurrentBusiness } from './useCurrentBusiness';

/**
 * Unified business hook that ensures consistency across the application
 * This replaces any previous useBusiness implementations
 */
export function useBusiness() {
  const { businessId, isSuperAdmin, businessName, loading } = useCurrentBusiness();

  return {
    business: businessId ? { id: businessId, name: businessName } : undefined,
    businessId,
    isSuperAdmin,
    isBusinessOwner: false, // This can be expanded later if needed
    totalOwnedBusinesses: 0, // This can be expanded later if needed
    hasUrlBusiness: false, // This can be expanded later if needed
    loading
  };
}
