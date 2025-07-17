
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
  branch_id: string;
  employee_id: string;
  branch?: {
    name: string;
  };
  role_name: string;
  priority_order: number;
  max_weekly_hours?: number;
  is_active: boolean;
  created_at: string;
  shift_types?: string[];
  available_days?: number[];
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
  is_active?: boolean; // Made consistently optional
  is_archived?: boolean; // New field for archiving
  main_branch_id?: string | null;
  preferred_shift_type?: 'morning' | 'afternoon' | 'evening' | 'night' | 'full_day' | null;
  weekly_hours_required?: number | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;

  // --- שדות מערכת משתמש ---
  username?: string | null;
  password_hash?: string | null;
  is_system_user?: boolean;

  // --- שדות הגשת משמרות ---
  shift_submission_quota?: number | null;
  preferred_shift_time?: 'morning' | 'evening' | 'night' | 'any' | null;
  can_choose_unassigned_shifts?: boolean | null;
  submission_notes?: string | null;

  // Extended properties from joins - Updated to include id
  main_branch?: { id: string; name: string; address?: string } | null;
  employee_notes?: EmployeeNote[];
  employee_documents?: Array<{
    id: string;
    document_name: string;
    document_type: string;
    file_url: string;
    created_at: string;
  }>;
  employee_files?: Array<{
    id: string;
    file_name: string;
    file_type: string;
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

// Helper function to normalize Supabase employee data to our type
export const normalizeEmployee = (data: any): Employee => {
  return {
    id: data.id,
    business_id: data.business_id,
    employee_id: data.employee_id || null,
    first_name: data.first_name || '',
    last_name: data.last_name || '',
    email: data.email || null,
    phone: data.phone || null,
    address: data.address || null,
    id_number: data.id_number || null,
    employee_type: mapEmployeeType(data.employee_type || 'permanent'),
    hire_date: data.hire_date || null,
    termination_date: data.termination_date || null,
    is_active: data.is_active ?? true,
    is_archived: data.is_archived ?? false,
    main_branch_id: data.main_branch_id || null,
    preferred_shift_type: data.preferred_shift_type || null,
    weekly_hours_required: data.weekly_hours_required || null,
    notes: data.notes || null,
    created_at: data.created_at,
    updated_at: data.updated_at,

    // New fields
    username: data.username || null,
    password_hash: data.password_hash || null,
    is_system_user: data.is_system_user ?? false,

    // Extended properties - Updated to include id
    main_branch: data.main_branch || null,
    employee_notes: data.employee_notes || [],
    employee_documents: data.employee_documents || [],
    employee_files: data.employee_files || [],
    branch_assignments: data.employee_branch_assignments || data.branch_assignments || [],
    weekly_tokens: data.weekly_tokens || []
  };
};
