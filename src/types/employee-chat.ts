
export interface EmployeeChatMessage {
  id: string;
  employee_id: string;
  sender_id: string;
  message_content: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
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
}

export interface EmployeeChatSummary {
  employee_id: string;
  employee_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  is_online?: boolean;
}
