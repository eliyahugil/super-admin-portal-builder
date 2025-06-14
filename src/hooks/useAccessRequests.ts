
// Re-export from the refactored hook
export { useAccessRequests } from './useAccessRequests/useAccessRequests';
export type { AccessRequestMutationParams } from './useAccessRequests/types';

// Import and re-export the AccessRequest type from the original types file
export type { AccessRequest } from '@/types/access-request';
