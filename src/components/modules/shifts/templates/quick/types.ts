
export type ShiftType = 'morning' | 'afternoon' | 'evening' | 'night';

export interface QuickTemplateData {
  name: string;
  start_time: string;
  end_time: string;
  shift_type: ShiftType;
  branch_id: string;
  required_employees: number;
  role_name?: string;
}

export interface QuickShiftTemplateCreatorProps {
  onTemplateCreated?: () => void;
}

export interface QuickTemplate {
  name: string;
  start_time: string;
  end_time: string;
  shift_type: ShiftType;
}
