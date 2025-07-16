
import { useCurrentBusiness } from './useCurrentBusiness';

/**
 * Hook to get the current business ID with proper security isolation
 * Returns null for super admins when no specific business is selected
 * 
 * ⚠️ IMPORTANT: All components that need business data MUST use this hook
 * to ensure they automatically update when the business selection changes!
 */
export function useBusinessId(): string | null {
  const { businessId } = useCurrentBusiness();
  
  console.log('🏢 useBusinessId: Current business ID:', businessId);
  
  return businessId;
}

/**
 * Hook to get business ID with validation - throws error if no business ID is available
 * Use this when business ID is required for the operation
 */
export function useRequiredBusinessId(): string {
  const businessId = useBusinessId();
  
  if (!businessId) {
    throw new Error('Business ID is required for this operation');
  }
  
  return businessId;
}
