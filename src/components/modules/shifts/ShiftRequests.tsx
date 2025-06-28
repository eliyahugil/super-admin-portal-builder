
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  MapPin
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
  reviewed_by?: string;
}

export const ShiftRequests: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { toast } = useToast();
  const { businessId } = useBusiness();
  const queryClient = useQueryClient();

  // Fetch shift requests
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['shift-requests', businessId, statusFilter],
    queryFn: async (): Promise<ShiftRequest[]> => {
      if (!businessId) return [];
      
      let query = supabase
        .from('employee_shift_requests')
        .select(`
          *,
          employee:employees(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

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
        reviewed_at: req.reviewed_at
      }));
    },
    enabled: !!businessId
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ requestId, status, reviewNotes }: { requestId: string; status: 'approved' | 'rejected'; reviewNotes?: string }) => {
      const updateData: any = { 
        status,
        reviewed_at: new Date().toISOString()
      };
      
      if (reviewNotes) {
        updateData.review_notes = reviewNotes;
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
      case 'pending': return 'ממתין';
      case 'approved': return 'מאושר';
      case 'rejected': return 'נדחה';
      default: return status;
    }
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
            <Calendar className="h-6 w-6 text-blue-600" />
            בקשות משמרות עובדים
          </h2>
          <p className="text-gray-600">ניהול ואישור בקשות משמרות מעובדים</p>
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
                <p className="text-sm text-gray-600">בקשות ממתינות</p>
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
                <p className="text-sm text-gray-600">בקשות מאושרות</p>
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
                <p className="text-sm text-gray-600">בקשות נדחות</p>
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
            <SelectItem value="pending">ממתין</SelectItem>
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
                  <strong>הערות:</strong>
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
                <div className="flex gap-2 pt-3 border-t">
                  <Button
                    size="sm"
                    onClick={() => updateStatusMutation.mutate({ requestId: request.id, status: 'approved' })}
                    disabled={updateStatusMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    אשר
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => updateStatusMutation.mutate({ requestId: request.id, status: 'rejected' })}
                    disabled={updateStatusMutation.isPending}
                  >
                    דחה
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">אין בקשות משמרות</h3>
          <p className="text-gray-600">לא נמצאו בקשות במערכת</p>
        </div>
      )}
    </div>
  );
};
