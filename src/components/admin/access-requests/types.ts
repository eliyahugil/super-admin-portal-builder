
export interface AccessRequest {
  id: string;
  user_id: string;
  requested_business_id: string | null;
  requested_role: string;
  request_reason?: string | null;
  status: string;
  created_at: string;
  profiles: {
    email?: string;
    full_name?: string;
  } | null;
  businesses: {
    name?: string;
  } | null;
}

export interface AccessRequestMutationParams {
  requestId: string;
  action: 'approve' | 'reject';
  reviewNotes?: string;
}
