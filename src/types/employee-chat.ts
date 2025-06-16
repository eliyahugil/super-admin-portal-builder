
export interface EmployeeChatMessage {
  id: string;
  employee_id?: string; // Optional for group messages
  sender_id: string;
  message_content: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  group_id?: string; // New field for group messages
  message_type: 'direct' | 'group'; // New field
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
  };
  sender?: {
    id: string;
    full_name: string;
    email: string;
  };
  group?: EmployeeChatGroup; // Group information if it's a group message
}

export interface EmployeeChatGroup {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  group_type: 'general' | 'custom' | 'department';
  members?: EmployeeChatGroupMember[];
  member_count?: number;
}

export interface EmployeeChatGroupMember {
  id: string;
  group_id: string;
  employee_id: string;
  added_by: string;
  added_at: string;
  is_admin: boolean;
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    employee_type?: string;
  };
}

export interface EmployeeChatSummary {
  employee_id: string;
  employee_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  is_online?: boolean;
}
