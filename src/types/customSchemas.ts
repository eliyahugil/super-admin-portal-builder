
export type CustomTables = {
  employee_docs: {
    id: string;
    document_type: string;
    file_url: string;
    signed: boolean;
    created_at: string;
  };
  employee_requests: {
    id: string;
    request_type: string;
    status: 'pending' | 'approved' | 'rejected';
    employee_id: string;
    notes?: string;
    created_at: string;
  };
  // הוסף כאן עוד טבלאות בעתיד
};

export type CustomTableKey = keyof CustomTables;
