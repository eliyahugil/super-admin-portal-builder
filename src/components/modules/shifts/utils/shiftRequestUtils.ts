import { supabase } from '@/integrations/supabase/client';

export interface ShiftRequest {
  id: string;
  employee_id: string;
  employee_name?: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  branch_preference?: string;
  role_preference?: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  created_at: string;
  reviewed_at?: string;
  review_notes?: string;
  employee?: {
    first_name: string;
    last_name: string;
    phone?: string;
  };
  optional_morning_availability?: number[];
}

export const fetchShiftRequests = async (
  businessId: string | null, 
  statusFilter: 'all' | 'pending' | 'approved' | 'rejected'
): Promise<ShiftRequest[]> => {
  if (!businessId) return [];

  console.log('🔄 שליפת בקשות משמרות מאוחדות עבור עסק:', businessId);

  // שליפה מטבלת employee_shift_requests
  const { data: shiftRequests, error: shiftRequestsError } = await supabase
    .from('employee_shift_requests')
    .select(`*, employee:employees!inner(first_name, last_name, phone, business_id, is_active)`)
    .eq('employee.business_id', businessId)
    .eq('employee.is_active', true)
    .order('created_at', { ascending: false });

  if (shiftRequestsError) throw shiftRequestsError;

  // שליפה מטבלת shift_submissions
  const { data: submissions, error: submissionsError } = await supabase
    .from('shift_submissions')
    .select(`*, employee:employees!inner(first_name, last_name, phone, business_id, is_active)`)
    .eq('employee.business_id', businessId)
    .eq('employee.is_active', true)
    .order('submitted_at', { ascending: false });

  if (submissionsError) throw submissionsError;

  const allRequests: ShiftRequest[] = [];

  // הוספת בקשות מטבלת employee_shift_requests
  (shiftRequests || []).forEach(request => {
    allRequests.push(createShiftRequestFromRequest(request));
  });

  // הוספת בקשות מטבלת shift_submissions
  (submissions || []).forEach(submission => {
    if (!submission.shifts) return;
    
    const shifts = typeof submission.shifts === 'string' 
      ? JSON.parse(submission.shifts) 
      : submission.shifts;
      
    shifts.forEach((shift: any, shiftIndex: number) => {
      allRequests.push(createShiftRequestFromSubmission(submission, shift, shiftIndex));
    });
  });

  // מיון וסינון
  const sortedRequests = allRequests.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return statusFilter !== 'all' 
    ? sortedRequests.filter(req => req.status === statusFilter)
    : sortedRequests;
};

const createShiftRequestFromRequest = (request: any): ShiftRequest => ({
  id: request.id,
  employee_id: request.employee_id,
  employee_name: request.employee 
    ? `${request.employee.first_name} ${request.employee.last_name}` 
    : 'לא ידוע',
  shift_date: request.shift_date,
  start_time: request.start_time,
  end_time: request.end_time,
  branch_preference: request.branch_preference,
  role_preference: request.role_preference,
  status: request.status as 'pending' | 'approved' | 'rejected',
  notes: request.notes,
  created_at: request.created_at,
  reviewed_at: request.reviewed_at,
  review_notes: request.review_notes,
  employee: request.employee
});

const createShiftRequestFromSubmission = (submission: any, shift: any, shiftIndex: number): ShiftRequest => ({
  id: `submission-${submission.id}-${shift.date}-${shiftIndex}`,
  employee_id: submission.employee_id,
  employee_name: submission.employee 
    ? `${submission.employee.first_name} ${submission.employee.last_name}` 
    : 'לא ידוע',
  shift_date: shift.date,
  start_time: shift.start_time,
  end_time: shift.end_time,
  branch_preference: shift.branch_preference || 'לא צוין',
  role_preference: shift.role_preference,
  status: submission.status as 'pending' | 'approved' | 'rejected',
  notes: shift.notes,
  created_at: submission.submitted_at,
  reviewed_at: submission.updated_at,
  review_notes: submission.notes,
  employee: submission.employee,
  optional_morning_availability: submission.optional_morning_availability
});

export const updateRequestStatus = async (
  requestId: string, 
  status: 'approved' | 'rejected', 
  notes?: string, 
  userId?: string
) => {
  const updateData = {
    status,
    review_notes: notes,
    reviewed_at: new Date().toISOString(),
    reviewed_by: userId
  };

  if (requestId.startsWith('submission-')) {
    const submissionId = requestId.split('-')[1];
    const { error } = await supabase
      .from('shift_submissions')
      .update(updateData)
      .eq('id', submissionId);
    
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('employee_shift_requests')
      .update(updateData)
      .eq('id', requestId);
    
    if (error) throw error;
  }
};

export const deleteRequest = async (requestId: string) => {
  console.log('🗑️ מוחק בקשה:', requestId);
  
  if (requestId.startsWith('submission-')) {
    const submissionId = requestId.split('-')[1];
    const { error } = await supabase
      .from('shift_submissions')
      .delete()
      .eq('id', submissionId);
    
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('employee_shift_requests')
      .delete()
      .eq('id', requestId);
    
    if (error) throw error;
  }
};

export const deleteAllRequests = async (businessId: string | null) => {
  if (!businessId) throw new Error('No business ID');
  
  const { data: employees, error: employeesError } = await supabase
    .from('employees')
    .select('id')
    .eq('business_id', businessId)
    .eq('is_active', true);
    
  if (employeesError) throw employeesError;
  
  const employeeIds = employees?.map(emp => emp.id) || [];
  
  if (employeeIds.length === 0) return;
  
  // מחיקת כל הבקשות
  const [shiftRequestsResult, submissionsResult] = await Promise.all([
    supabase.from('employee_shift_requests').delete().in('employee_id', employeeIds),
    supabase.from('shift_submissions').delete().in('employee_id', employeeIds)
  ]);
  
  if (shiftRequestsResult.error) throw shiftRequestsResult.error;
  if (submissionsResult.error) throw submissionsResult.error;
};

export const sendWhatsApp = (phone: string, employeeName: string, status: string, date: string, notes?: string) => {
  const statusMessages = {
    approved: `בקשת המשמרת שלך לתאריך ${date} אושרה! ✅`,
    rejected: `בקשת המשמרת שלך לתאריך ${date} נדחתה. ❌`,
    general: `בקשת המשמרת שלך לתאריך ${date} בבדיקה...`
  };
  
  let message = `שלום ${employeeName}! ${statusMessages[status as keyof typeof statusMessages] || statusMessages.general}`;
  
  if (notes) {
    message += `\n\nהערת מנהל: ${notes}`;
  }
  
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
  window.open(whatsappUrl, '_blank');
};

export const getStatusColor = (status: string) => {
  const colors = {
    pending: 'bg-warning/10 text-warning border-warning/20',
    approved: 'bg-success/10 text-success border-success/20',
    rejected: 'bg-destructive/10 text-destructive border-destructive/20'
  };
  return colors[status as keyof typeof colors] || 'bg-muted/10 text-muted-foreground border-muted/20';
};

export const getStatusLabel = (status: string) => {
  const labels = {
    pending: 'ממתין לאישור',
    approved: 'מאושר',
    rejected: 'נדחה'
  };
  return labels[status as keyof typeof labels] || status;
};