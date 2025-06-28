
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
import { 
  Zap, 
  Clock, 
  User,
  Calendar,
  MessageSquare,
  Plus,
  Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useBusiness } from '@/hooks/useBusiness';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface QuickRequest {
  id: string;
  employee_id: string;
  employee_name?: string;
  request_type: 'shift_change' | 'overtime' | 'absence' | 'schedule_conflict' | 'other';
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'resolved' | 'cancelled';
  created_at: string;
  resolved_at?: string;
}

const requestTypes = [
  { value: 'shift_change', label: 'שינוי משמרת', icon: '🔄' },
  { value: 'overtime', label: 'שעות נוספות', icon: '⏰' },
  { value: 'absence', label: 'היעדרות', icon: '🏠' },
  { value: 'schedule_conflict', label: 'קונפליקט בלוח זמנים', icon: '⚠️' },
  { value: 'other', label: 'אחר', icon: '📝' }
];

const priorityLevels = [
  { value: 'low', label: 'נמוך', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'בינוני', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'גבוה', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'דחוף', color: 'bg-red-100 text-red-800' }
];

export const QuickRequestRegistration: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [requestType, setRequestType] = useState<'shift_change' | 'overtime' | 'absence' | 'schedule_conflict' | 'other'>('shift_change');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'resolved'>('all');

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

  // Fetch quick requests
  const { data: requests = [] } = useQuery({
    queryKey: ['quick-requests', businessId, statusFilter],
    queryFn: async (): Promise<QuickRequest[]> => {
      if (!businessId) return [];
      
      let query = supabase
        .from('employee_requests')
        .select(`
          *,
          employee:employees(first_name, last_name)
        `)
        .in('request_type', ['shift_change', 'overtime', 'absence', 'schedule_conflict', 'other'])
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter === 'in_progress' ? 'pending' : statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(req => ({
        id: req.id,
        employee_id: req.employee_id,
        employee_name: req.employee ? `${req.employee.first_name} ${req.employee.last_name}` : 'לא ידוע',
        request_type: req.request_type as any,
        subject: req.subject,
        description: req.description || '',
        priority: (req.request_data as any)?.priority || 'medium',
        status: req.status === 'pending' ? 'pending' : req.status,
        created_at: req.created_at,
        resolved_at: req.reviewed_at
      }));
    },
    enabled: !!businessId
  });

  // Create request mutation
  const createRequestMutation = useMutation({
    mutationFn: async (requestData: {
      employee_id: string;
      request_type: string;
      subject: string;
      description: string;
      priority: string;
    }) => {
      const { error } = await supabase
        .from('employee_requests')
        .insert({
          employee_id: requestData.employee_id,
          request_type: requestData.request_type,
          subject: requestData.subject,
          description: requestData.description,
          request_data: {
            priority: requestData.priority,
            submitted_via: 'quick_registration'
          }
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quick-requests'] });
      toast({
        title: 'הצלחה',
        description: 'הבקשה המהירה נרשמה בהצלחה'
      });
      resetForm();
    },
    onError: (error) => {
      console.error('Error creating quick request:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לרשום את הבקשה המהירה',
        variant: 'destructive'
      });
    }
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: 'in_progress' | 'resolved' | 'cancelled' }) => {
      const updateData: any = { status };
      
      if (status === 'resolved') {
        updateData.reviewed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('employee_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quick-requests'] });
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

  const resetForm = () => {
    setSelectedEmployee('');
    setRequestType('shift_change');
    setSubject('');
    setDescription('');
    setPriority('medium');
    setShowForm(false);
  };

  const handleSubmit = () => {
    if (!selectedEmployee || !subject) {
      toast({
        title: 'שגיאה',
        description: 'יש למלא את השדות הנדרשים',
        variant: 'destructive'
      });
      return;
    }

    createRequestMutation.mutate({
      employee_id: selectedEmployee,
      request_type: requestType,
      subject,
      description,
      priority
    });
  };

  const getRequestTypeInfo = (type: string) => {
    return requestTypes.find(t => t.value === type) || requestTypes[0];
  };

  const getPriorityInfo = (priority: string) => {
    return priorityLevels.find(p => p.value === priority) || priorityLevels[1];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'ממתין';
      case 'in_progress': return 'בטיפול';
      case 'resolved': return 'נפתר';
      case 'cancelled': return 'בוטל';
      default: return status;
    }
  };

  const filteredRequests = requests.filter(request => {
    if (searchTerm && !request.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !request.subject.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  const pendingRequests = requests.filter(req => req.status === 'pending').length;
  const urgentRequests = requests.filter(req => req.priority === 'urgent' && req.status === 'pending').length;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-yellow-600" />
            רישום מהיר של בקשות
          </h2>
          <p className="text-gray-600">רישום וטיפול מהיר בבקשות עובדים</p>
        </div>
        
        <div className="flex items-center gap-4">
          {urgentRequests > 0 && (
            <Badge className="bg-red-100 text-red-800">
              {urgentRequests} בקשות דחופות
            </Badge>
          )}
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            בקשה מהירה
          </Button>
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
              <div className="p-2 bg-red-100 rounded-lg">
                <Zap className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">בקשות דחופות</p>
                <p className="text-2xl font-bold">{urgentRequests}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">סה"כ בקשות</p>
                <p className="text-2xl font-bold">{requests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Request Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>רישום בקשה מהירה</CardTitle>
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
                    {requestTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>עדיפות</Label>
                <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityLevels.map(level => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>נושא *</Label>
                <Input
                  placeholder="נושא הבקשה..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>פירוט</Label>
              <Textarea
                placeholder="פרט את הבקשה..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
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
                {createRequestMutation.isPending ? 'רושם...' : 'רשום בקשה'}
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
            placeholder="חפש לפי עובד או נושא..."
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
            <SelectItem value="in_progress">בטיפול</SelectItem>
            <SelectItem value="resolved">נפתר</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map(request => {
          const typeInfo = getRequestTypeInfo(request.request_type);
          const priorityInfo = getPriorityInfo(request.priority);
          
          return (
            <Card key={request.id} className={request.priority === 'urgent' ? 'border-red-200 bg-red-50' : ''}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold">{request.employee_name}</span>
                    <span className="text-sm text-gray-500">
                      {typeInfo.icon} {typeInfo.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={priorityInfo.color}>
                      {priorityInfo.label}
                    </Badge>
                    <Badge className={getStatusColor(request.status)}>
                      {getStatusLabel(request.status)}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <strong>נושא:</strong> {request.subject}
                  </div>
                  {request.description && (
                    <div>
                      <strong>פירוט:</strong> {request.description}
                    </div>
                  )}
                  <div className="text-sm text-gray-500">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    נוצר: {format(new Date(request.created_at), 'dd/MM/yyyy HH:mm')}
                  </div>
                </div>

                {request.status === 'pending' && (
                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatusMutation.mutate({ requestId: request.id, status: 'in_progress' })}
                      disabled={updateStatusMutation.isPending}
                    >
                      התחל טיפול
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => updateStatusMutation.mutate({ requestId: request.id, status: 'resolved' })}
                      disabled={updateStatusMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      סגור כנפתר
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => updateStatusMutation.mutate({ requestId: request.id, status: 'cancelled' })}
                      disabled={updateStatusMutation.isPending}
                    >
                      בטל
                    </Button>
                  </div>
                )}

                {request.status === 'in_progress' && (
                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    <Button
                      size="sm"
                      onClick={() => updateStatusMutation.mutate({ requestId: request.id, status: 'resolved' })}
                      disabled={updateStatusMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      סגור כנפתר
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">אין בקשות מהירות</h3>
          <p className="text-gray-600">לא נמצאו בקשות במערכת</p>
        </div>
      )}
    </div>
  );
};
