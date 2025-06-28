
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  CalendarDays, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Clock,
  User,
  Search 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useBusiness } from '@/hooks/useBusiness';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface VacationRequest {
  id: string;
  employee_id: string;
  employee_name?: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  request_type: 'vacation' | 'sick' | 'personal' | 'military';
  notes?: string;
  created_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
}

export const VacationRequestSystem: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [reason, setReason] = useState('');
  const [requestType, setRequestType] = useState<'vacation' | 'sick' | 'personal' | 'military'>('vacation');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  
  const { toast } = useToast();
  const { businessId } = useBusiness();
  const queryClient = useQueryClient();

  // Fetch employees
  const { data: employees = [] } = useQuery({
    queryKey: ['employees', businessId],
    queryFn: async () => {
      if (!businessId) return [];
      
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, employee_id')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('first_name');

      if (error) throw error;
      return data || [];
    },
    enabled: !!businessId
  });

  // Fetch vacation requests
  const { data: requests = [] } = useQuery({
    queryKey: ['vacation-requests', businessId, statusFilter],
    queryFn: async (): Promise<VacationRequest[]> => {
      if (!businessId) return [];
      
      let query = supabase
        .from('employee_requests')
        .select(`
          *,
          employee:employees(first_name, last_name)
        `)
        .eq('request_type', 'vacation')
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
        start_date: (req.request_data as any)?.start_date || '',
        end_date: (req.request_data as any)?.end_date || '',
        reason: req.description || '',
        status: req.status,
        request_type: (req.request_data as any)?.request_type || 'vacation',
        notes: (req.request_data as any)?.notes || '',
        created_at: req.created_at,
        reviewed_by: req.reviewed_by,
        reviewed_at: req.reviewed_at
      }));
    },
    enabled: !!businessId
  });

  // Create vacation request mutation
  const createRequestMutation = useMutation({
    mutationFn: async (requestData: {
      employee_id: string;
      start_date: string;
      end_date: string;
      reason: string;
      request_type: string;
    }) => {
      const { error } = await supabase
        .from('employee_requests')
        .insert({
          employee_id: requestData.employee_id,
          request_type: 'vacation',
          subject: `בקשת ${getRequestTypeLabel(requestData.request_type as any)}`,
          description: requestData.reason,
          request_data: {
            start_date: requestData.start_date,
            end_date: requestData.end_date,
            request_type: requestData.request_type
          }
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacation-requests'] });
      toast({
        title: 'הצלחה',
        description: 'בקשת החופש נוצרה בהצלחה'
      });
      resetForm();
    },
    onError: (error) => {
      console.error('Error creating vacation request:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן ליצור את בקשת החופש',
        variant: 'destructive'
      });
    }
  });

  // Update request status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: 'approved' | 'rejected' }) => {
      const { error } = await supabase
        .from('employee_requests')
        .update({
          status,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacation-requests'] });
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

  const getRequestTypeLabel = (type: string) => {
    switch (type) {
      case 'vacation': return 'חופשה';
      case 'sick': return 'מחלה';
      case 'personal': return 'אישי';
      case 'military': return 'מילואים';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return 'מאושר';
      case 'rejected': return 'נדחה';
      case 'pending': return 'ממתין לאישור';
      default: return status;
    }
  };

  const resetForm = () => {
    setSelectedEmployee('');
    setStartDate(undefined);
    setEndDate(undefined);
    setReason('');
    setRequestType('vacation');
    setShowCreateForm(false);
  };

  const handleSubmit = () => {
    if (!selectedEmployee || !startDate || !endDate || !reason) {
      toast({
        title: 'שגיאה',
        description: 'יש למלא את כל השדות הנדרשים',
        variant: 'destructive'
      });
      return;
    }

    if (endDate <= startDate) {
      toast({
        title: 'שגיאה',
        description: 'תאריך הסיום חייב להיות אחרי תאריך ההתחלה',
        variant: 'destructive'
      });
      return;
    }

    createRequestMutation.mutate({
      employee_id: selectedEmployee,
      start_date: format(startDate, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd'),
      reason,
      request_type: requestType
    });
  };

  const filteredRequests = requests.filter(request => {
    if (searchTerm && !request.employee_name?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-blue-600" />
            מערכת בקשות חופש
          </h2>
          <p className="text-gray-600">ניהול בקשות חופש, מחלה ויעדרויות</p>
        </div>
        
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          בקשה חדשה
        </Button>
      </div>

      {/* Create Request Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>יצירת בקשת חופש חדשה</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>בחר עובד</Label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר עובד..." />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(employee => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.first_name} {employee.last_name} ({employee.employee_id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>סוג הבקשה</Label>
                <Select value={requestType} onValueChange={(value: any) => setRequestType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vacation">חופשה</SelectItem>
                    <SelectItem value="sick">מחלה</SelectItem>
                    <SelectItem value="personal">אישי</SelectItem>
                    <SelectItem value="military">מילואים</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>תאריך התחלה</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'dd/MM/yyyy', { locale: he }) : "בחר תאריך"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>תאריך סיום</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'dd/MM/yyyy', { locale: he }) : "בחר תאריך"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label>סיבה</Label>
              <Textarea
                placeholder="פרט את הסיבה לבקשה..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={resetForm}>
                ביטול
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={createRequestMutation.isPending}
              >
                {createRequestMutation.isPending ? 'יוצר...' : 'צור בקשה'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="חפש לפי שם עובד..."
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredRequests.map(request => (
          <Card key={request.id}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold">{request.employee_name}</span>
                  </div>
                  <Badge className={getStatusColor(request.status)}>
                    {getStatusLabel(request.status)}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <strong>סוג:</strong> {getRequestTypeLabel(request.request_type)}
                  </div>
                  <div>
                    <strong>תאריכים:</strong> {format(new Date(request.start_date), 'dd/MM/yyyy')} - {format(new Date(request.end_date), 'dd/MM/yyyy')}
                  </div>
                  <div>
                    <strong>סיבה:</strong> {request.reason}
                  </div>
                  <div className="text-gray-500">
                    <strong>נוצר:</strong> {format(new Date(request.created_at), 'dd/MM/yyyy HH:mm')}
                  </div>
                </div>

                {request.status === 'pending' && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => updateStatusMutation.mutate({ requestId: request.id, status: 'approved' })}
                      disabled={updateStatusMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      אשר
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => updateStatusMutation.mutate({ requestId: request.id, status: 'rejected' })}
                      disabled={updateStatusMutation.isPending}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      דחה
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">אין בקשות חופש</h3>
          <p className="text-gray-600">לא נמצאו בקשות חופש במערכת</p>
        </div>
      )}
    </div>
  );
};
