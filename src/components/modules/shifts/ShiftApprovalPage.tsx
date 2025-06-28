
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useBusiness } from '@/hooks/useBusiness';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ShiftApprovalStats } from './approval/ShiftApprovalStats';
import { ShiftApprovalFilters } from './approval/ShiftApprovalFilters';
import { ShiftApprovalTabs } from './approval/ShiftApprovalTabs';

interface ShiftRequest {
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
}

export const ShiftApprovalPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [reviewNotes, setReviewNotes] = useState<{ [id: string]: string }>({});
  const [activeTab, setActiveTab] = useState('approval');

  const { toast } = useToast();
  const { businessId } = useBusiness();
  const queryClient = useQueryClient();

  // Fetch shift requests
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['shift-requests', businessId, statusFilter],
    queryFn: async (): Promise<ShiftRequest[]> => {
      if (!businessId) return [];
      
      console.log('Fetching shift requests for business:', businessId);
      
      let requestsQuery = supabase
        .from('employee_shift_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        requestsQuery = requestsQuery.eq('status', statusFilter);
      }

      const { data: requestsData, error: requestsError } = await requestsQuery;
      
      if (requestsError) {
        console.error('Error fetching shift requests:', requestsError);
        throw requestsError;
      }

      if (!requestsData || requestsData.length === 0) {
        return [];
      }

      const employeeIds = requestsData.map(req => req.employee_id);
      
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('id, first_name, last_name, phone, business_id')
        .eq('business_id', businessId)
        .in('id', employeeIds);

      if (employeesError) {
        console.error('Error fetching employees:', employeesError);
        throw employeesError;
      }

      return requestsData.map(req => {
        const employee = employeesData?.find(emp => emp.id === req.employee_id);
        return {
          id: req.id,
          employee_id: req.employee_id,
          employee_name: employee ? `${employee.first_name} ${employee.last_name}` : 'לא ידוע',
          shift_date: req.shift_date,
          start_time: req.start_time,
          end_time: req.end_time,
          branch_preference: req.branch_preference,
          role_preference: req.role_preference,
          status: req.status as 'pending' | 'approved' | 'rejected',
          notes: req.notes,
          created_at: req.created_at,
          reviewed_at: req.reviewed_at,
          review_notes: req.review_notes,
          employee: employee ? {
            first_name: employee.first_name,
            last_name: employee.last_name,
            phone: employee.phone
          } : undefined
        };
      });
    },
    enabled: !!businessId
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ requestId, status, notes }: { requestId: string; status: 'approved' | 'rejected'; notes?: string }) => {
      const updateData: any = { 
        status,
        reviewed_at: new Date().toISOString()
      };
      
      if (notes) {
        updateData.review_notes = notes;
      }

      const { error } = await supabase
        .from('employee_shift_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-requests'] });
      toast({
        title: 'הצלחה',
        description: 'סטטוס הבקשה עודכן בהצלחה'
      });
      setReviewNotes({});
    },
    onError: (error) => {
      console.error('Error updating request status:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לעדכן את סטטוס הבקשה',
        variant: 'destructive'
      });
    }
  });

  const handleUpdateStatus = (requestId: string, status: 'approved' | 'rejected', notes?: string) => {
    updateStatusMutation.mutate({ requestId, status, notes });
  };

  const handleReviewNotesChange = (requestId: string, notes: string) => {
    setReviewNotes(prev => ({ ...prev, [requestId]: notes }));
  };

  const sendWhatsApp = (phone: string, employeeName: string, status: string, date: string, notes?: string) => {
    if (!phone) return;
    
    const statusText = status === 'approved' ? 'אושרה' : 'נדחתה';
    const message = `שלום ${employeeName}, הבקשה שלך למשמרת בתאריך ${date} ${statusText}.${notes ? `\nהערה: ${notes}` : ''}`;
    
    const cleanPhone = phone.replace(/[^\d]/g, '');
    const whatsappPhone = cleanPhone.startsWith('0') ? '972' + cleanPhone.slice(1) : cleanPhone;
    const url = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;
    
    window.open(url, '_blank');
  };

  const filteredRequests = requests.filter(request => {
    if (searchTerm && !request.employee_name?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  const pendingRequests = requests.filter(req => req.status === 'pending').length;
  const approvedRequests = requests.filter(req => req.status === 'approved').length;
  const rejectedRequests = requests.filter(req => req.status === 'rejected').length;

  if (isLoading) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6 text-blue-600" />
            ניהול בקשות משמרות
          </h2>
          <p className="text-gray-600">אישור וצפייה בבקשות משמרות מעובדים</p>
        </div>
      </div>

      <ShiftApprovalStats
        pendingRequests={pendingRequests}
        approvedRequests={approvedRequests}
        rejectedRequests={rejectedRequests}
      />

      <ShiftApprovalFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <ShiftApprovalTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        filteredRequests={filteredRequests}
        reviewNotes={reviewNotes}
        onReviewNotesChange={handleReviewNotesChange}
        onUpdateStatus={handleUpdateStatus}
        onSendWhatsApp={sendWhatsApp}
        isUpdating={updateStatusMutation.isPending}
      />
    </div>
  );
};
