
export interface Customer {
  id: string;
  business_id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
  contact_person?: string;
  customer_type: 'individual' | 'business';
  tax_id?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerAgreement {
  id: string;
  business_id: string;
  customer_id: string;
  title: string;
  content: string;
  type: 'service' | 'purchase' | 'rental' | 'other';
  status: 'draft' | 'active' | 'signed' | 'expired';
  valid_from?: string;
  valid_until?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  customer?: {
    name: string;
  };
}
