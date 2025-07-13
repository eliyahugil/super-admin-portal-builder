export interface Lead {
  id: string;
  business_id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  lead_value?: number;
  probability: number;
  expected_close_date?: string;
  notes?: string;
  assigned_to?: string;
  last_contact_date?: string;
  next_follow_up_date?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface Opportunity {
  id: string;
  business_id: string;
  lead_id?: string;
  customer_id?: string;
  title: string;
  description?: string;
  value: number;
  currency: string;
  stage: 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  probability: number;
  expected_close_date?: string;
  actual_close_date?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  lead?: {
    name: string;
  };
  customer?: {
    name: string;
  };
}

export interface CRMActivity {
  id: string;
  business_id: string;
  lead_id?: string;
  customer_id?: string;
  opportunity_id?: string;
  activity_type: 'call' | 'email' | 'meeting' | 'note' | 'task' | 'follow_up';
  title: string;
  description?: string;
  activity_date: string;
  due_date?: string;
  completed: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CRMStats {
  totalLeads: number;
  activeOpportunities: number;
  monthlyRevenue: number;
  conversionRate: number;
}