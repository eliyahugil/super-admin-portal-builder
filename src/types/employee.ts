
// Employee types with proper extensions for joined data

export type EmployeeType = 'permanent' | 'temporary' | 'youth' | 'contractor';

// Base employee note type
export interface EmployeeNote {
  id: string;
  content: string;
  note_type: string;
  created_at: string;
  is_warning?: boolean;
}

// Base branch assignment type
export interface BranchAssignment {
  id: string;
  branch: {
    name: string;
  };
  role_name: string;
  is_active: boolean;
}

// Base weekly token type
export interface WeeklyToken {
  id: string;
  token: string;
  week_start_date: string;
  week_end_date: string;
  is_active: boolean;
}

// Extended Employee type that matches what we get from Supabase queries
export interface Employee {
  id: string;
  business_id: string;
  employee_id?: string | null;
  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  id_number?: string | null;
  employee_type: EmployeeType;
  hire_date?: string | null;
  termination_date?: string | null;
  is_active?: boolean;
  main_branch_id?: string | null;
  preferred_shift_type?: 'morning' | 'afternoon' | 'evening' | 'night' | 'full_day' | null;
  weekly_hours_required?: number | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  
  // Extended properties from joins
  main_branch?: { name: string } | null;
  employee_notes?: EmployeeNote[];
  employee_documents?: Array<{
    id: string;
    document_name: string;
    document_type: string;
    file_url: string;
    created_at: string;
  }>;
  branch_assignments?: BranchAssignment[];
  weekly_tokens?: WeeklyToken[];
}

// Helper function to safely map employee types from strings
export const mapEmployeeType = (type: string): EmployeeType => {
  const validTypes: EmployeeType[] = ['permanent', 'temporary', 'youth', 'contractor'];
  return validTypes.includes(type as EmployeeType) ? (type as EmployeeType) : 'permanent';
};
