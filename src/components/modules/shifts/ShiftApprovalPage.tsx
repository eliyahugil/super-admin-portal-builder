
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Clock, 
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Search,
  MapPin,
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useBusiness } from '@/hooks/useBusiness';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

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

  const { toast } = useToast();
  const { businessId } = useBusiness();
  const queryClient = useQueryClient();

  // Fetch shift requests for approval
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['shift-approval-requests', businessId, statusFilter],
    queryFn: async (): Promise<ShiftRequest[]> => {
      if (!businessId) return [];
      
      let query = supabase
        .from('employee_shift_requests')
        .select(`
          *,
          employee:employees!inner(first_name, last_name, phone, business_id)
        `)
        .eq('employee.business_id', businessId)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching shift requests:', error);
        throw error;
      }

      return (data || []).map(req => ({
        id: req.id,
        employee_id: req.employee_id,
        employee_name: req.employee ? `${req.employee.first_name} ${req.employee.last_name}` : 'לא ידוע',
        shift_date: req.shift_date,
        start_time: req.start_time,
        end_time: req.end_time,
        branch_preference: req.branch_preference,
        role_preference: req.role_preference,
        status: req.status as 'pending' | 'approved' | 'rejected',
        notes: req.notes,
        created_at: req.created_at,
        reviewed_at: req.reviewed_at,
        employee: req.employee
      }));
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
      queryClient.invalidateQueries({ queryKey: ['shift-approval-requests'] });
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'ממתין לאישור';
      case 'approved': return 'מאושר';
      case 'rejected': return 'נדחה';
      default: return status;
    }
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
            <CheckCircle className="h-6 w-6 text-green-600" />
            אישור בקשות משמרות
          </h2>
          <p className="text-gray-600">בדיקה ואישור בקשות משמרות מעובדים</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">ממתין לאישור</p>
                <p className="text-2xl font-bold">{pendingRequests}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">מאושר</p>
                <p className="text-2xl font-bold">{approvedRequests}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">נדחה</p>
                <p className="text-2xl font-bold">{rejectedRequests}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="חפש לפי עובד..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הסטטוסים</SelectItem>
            <SelectItem value="pending">ממתין לאישור</SelectItem>
            <SelectItem value="approved">מאושר</SelectItem>
            <SelectItem value="rejected">נדחה</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map(request => (
          <Card key={request.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold">{request.employee_name}</span>
                </div>
                <Badge className={getStatusColor(request.status)}>
                  {getStatusLabel(request.status)}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <strong>תאריך:</strong>
                  <p>{format(new Date(request.shift_date), 'dd/MM/yyyy')}</p>
                </div>
                <div>
                  <strong>שעות:</strong>
                  <p>{request.start_time} - {request.end_time}</p>
                </div>
                {request.branch_preference && (
                  <div>
                    <strong>סניף מועדף:</strong>
                    <p className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {request.branch_preference}
                    </p>
                  </div>
                )}
                {request.role_preference && (
                  <div>
                    <strong>תפקיד מועדף:</strong>
                    <p>{request.role_preference}</p>
                  </div>
                )}
              </div>

              {request.notes && (
                <div className="mb-4">
                  <strong>הערות העובד:</strong>
                  <p className="text-gray-700">{request.notes}</p>
                </div>
              )}

              <div className="text-sm text-gray-500 mb-3">
                <Calendar className="inline h-4 w-4 mr-1" />
                נוצר: {format(new Date(request.created_at), 'dd/MM/yyyy HH:mm')}
                {request.reviewed_at && (
                  <span className="mr-4">
                    | נבדק: {format(new Date(request.reviewed_at), 'dd/MM/yyyy HH:mm')}
                  </span>
                )}
              </div>

              {request.status === 'pending' && (
                <div className="border-t pt-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">הערת מנהל:</label>
                    <Textarea
                      placeholder="הוסף הערה (אופציונלי)..."
                      value={reviewNotes[request.id] || ''}
                      onChange={(e) => setReviewNotes(prev => ({ ...prev, [request.id]: e.target.value }))}
                      rows={2}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => updateStatusMutation.mutate({ 
                        requestId: request.id, 
                        status: 'approved',
                        notes: reviewNotes[request.id]
                      })}
                      disabled={updateStatusMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      אשר
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => updateStatusMutation.mutate({ 
                        requestId: request.id, 
                        status: 'rejected',
                        notes: reviewNotes[request.id]
                      })}
                      disabled={updateStatusMutation.isPending}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      דחה
                    </Button>
                    
                    {request.employee?.phone && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendWhatsApp(
                          request.employee!.phone!,
                          request.employee_name!,
                          request.status,
                          format(new Date(request.shift_date), 'dd/MM/yyyy'),
                          reviewNotes[request.id]
                        )}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        וואטסאפ
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {request.status !== 'pending' && request.employee?.phone && (
                <div className="border-t pt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => sendWhatsApp(
                      request.employee!.phone!,
                      request.employee_name!,
                      request.status,
                      format(new Date(request.shift_date), 'dd/MM/yyyy')
                    )}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    שלח עדכון בוואטסאפ
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">אין בקשות לאישור</h3>
          <p className="text-gray-600">
            {statusFilter === 'pending' 
              ? 'אין בקשות ממתינות לאישור'
              : 'לא נמצאו בקשות במערכת'
            }
          </p>
        </div>
      )}
    </div>
  );
};
