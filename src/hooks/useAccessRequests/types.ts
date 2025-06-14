
export interface AccessRequestMutationParams {
  requestId: string;
  action: 'approve' | 'reject';
  reviewNotes?: string;
  businessId?: string;
  assignmentData?: {
    type: 'existing_business' | 'new_business' | 'customer' | 'employee' | 'other';
    businessId?: string;
    newBusinessData?: {
      name: string;
      description: string;
      contactEmail: string;
      contactPhone: string;
    };
    customUserType?: string;
    reviewNotes?: string;
  };
}

export interface AccessRequestEnriched {
  id: string;
  user_id: string;
  requested_business_id: string | null;
  requested_role: 'super_admin' | 'business_admin' | 'business_user';
  request_reason?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  review_notes?: string | null;
  created_at: string;
  profiles?: {
    email?: string;
    full_name?: string;
  } | null;
  businesses?: {
    name?: string;
  } | null;
}
