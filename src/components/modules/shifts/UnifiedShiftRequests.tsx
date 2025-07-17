import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Clock, 
  User,
  CheckCircle,
  XCircle,
  Search,
  MapPin,
  Eye,
  Calendar as CalendarIcon,
  MessageSquare,
  Edit,
  Trash2,
  Shield,
  Settings
} from 'lucide-react';
import { useBusinessId } from '@/hooks/useBusinessId';
import { useAuth } from '@/components/auth/AuthContext';
import { DeviceIndicator } from '@/components/shared/DeviceIndicator';
import { useDeviceType } from '@/hooks/useDeviceType';
import { format } from 'date-fns';
import { ShiftSubmissionCalendarView } from './ShiftSubmissionCalendarView';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchShiftRequests, 
  updateRequestStatus, 
  deleteRequest, 
  deleteAllRequests, 
  sendWhatsApp, 
  getStatusColor, 
  getStatusLabel,
  ShiftRequest
} from './utils/shiftRequestUtils';

export const UnifiedShiftRequests: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [reviewNotes, setReviewNotes] = useState<{ [id: string]: string }>({});
  const [activeTab, setActiveTab] = useState('view');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string>('');
  const [managerCode, setManagerCode] = useState('');
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [managerCodeAll, setManagerCodeAll] = useState('');

  const businessId = useBusinessId();
  const { user } = useAuth();
  const deviceInfo = useDeviceType();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: requests = [], isLoading, refetch } = useQuery({
    queryKey: ['unified-shift-requests', businessId, statusFilter],
    queryFn: () => fetchShiftRequests(businessId, statusFilter),
    enabled: !!businessId,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ requestId, status, notes }: { requestId: string, status: 'approved' | 'rejected', notes?: string }) => 
      updateRequestStatus(requestId, status, notes, user?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-shift-requests'] });
      toast({ title: 'הצלחה', description: 'הסטטוס עודכן בהצלחה' });
    },
    onError: () => {
      toast({ title: 'שגיאה', description: 'לא הצלחנו לעדכן את הסטטוס', variant: 'destructive' });
    }
  });

  const deleteRequestMutation = useMutation({
    mutationFn: (requestId: string) => deleteRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-shift-requests'] });
      toast({ title: 'הצלחה', description: 'הבקשה נמחקה בהצלחה' });
      setDeleteDialogOpen(false);
      setSelectedRequestId('');
      setManagerCode('');
    },
    onError: () => {
      toast({ title: 'שגיאה', description: 'לא הצלחנו למחוק את הבקשה', variant: 'destructive' });
    }
  });

  const deleteAllRequestsMutation = useMutation({
    mutationFn: () => deleteAllRequests(businessId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-shift-requests'] });
      toast({ title: 'הצלחה', description: 'כל הבקשות נמחקו בהצלחה' });
      setDeleteAllDialogOpen(false);
      setManagerCodeAll('');
    },
    onError: () => {
      toast({ title: 'שגיאה', description: 'לא הצלחנו למחוק את הבקשות', variant: 'destructive' });
    }
  });

  const handleUpdateStatus = (requestId: string, status: 'approved' | 'rejected', notes?: string) => 
    updateStatusMutation.mutate({ requestId, status, notes });

  const handleReviewNotesChange = (requestId: string, notes: string) => 
    setReviewNotes(prev => ({ ...prev, [requestId]: notes }));

  const handleDeleteRequest = (requestId: string) => {
    setSelectedRequestId(requestId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (managerCode !== '130898') {
      toast({ title: 'שגיאה', description: 'קוד מנהל שגוי', variant: 'destructive' });
      return;
    }
    deleteRequestMutation.mutate(selectedRequestId);
  };

  const confirmDeleteAll = () => {
    if (managerCodeAll !== '130898') {
      toast({ title: 'שגיאה', description: 'קוד מנהל שגוי', variant: 'destructive' });
      return;
    }
    deleteAllRequestsMutation.mutate();
  };

  const filteredRequests = requests.filter(request => {
    if (searchTerm && !request.employee_name?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  // קיבוץ בקשות לפי עובדים ולפי משמרות זהות + ספירה נכונה
  const groupedRequests = filteredRequests.reduce((acc, request) => {
    const employeeKey = request.employee_id;
    if (!acc[employeeKey]) {
      acc[employeeKey] = {
        employee_name: request.employee_name || 'לא ידוע',
        employee_id: request.employee_id,
        employee: request.employee,
        shiftGroups: {},
        morning_availability: request.optional_morning_availability
      };
    }
    
    const shiftKey = `${request.start_time}-${request.end_time}-${request.branch_preference || 'ללא'}-${request.role_preference || 'ללא'}`;
    
    if (!acc[employeeKey].shiftGroups[shiftKey]) {
      acc[employeeKey].shiftGroups[shiftKey] = {
        start_time: request.start_time,
        end_time: request.end_time,
        branch_preference: request.branch_preference,
        role_preference: request.role_preference,
        requests: []
      };
    }
    
    acc[employeeKey].shiftGroups[shiftKey].requests.push(request);
    return acc;
  }, {} as Record<string, {
    employee_name: string;
    employee_id: string;
    employee: any;
    morning_availability?: number[];
    shiftGroups: Record<string, {
      start_time: string;
      end_time: string;
      branch_preference?: string;
      role_preference?: string;
      requests: ShiftRequest[];
    }>;
  }>);

  const sortedEmployees = Object.values(groupedRequests).sort((a, b) => 
    a.employee_name.localeCompare(b.employee_name, 'he')
  );

  // חישוב סטטיסטיקות מעודכן - ספירה נכונה של בקשות בודדות
  const allRequests = filteredRequests;
  const pendingCount = allRequests.filter(req => req.status === 'pending').length;
  const approvedCount = allRequests.filter(req => req.status === 'approved').length;
  const rejectedCount = allRequests.filter(req => req.status === 'rejected').length;

  if (isLoading) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="mr-3">טוען נתונים...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      {/* כותרת מצומצמת */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">ניהול בקשות משמרות</h2>
        </div>
        <DeviceIndicator />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="view" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            צפייה כללית
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            לוח שנה
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-4">
          <ShiftSubmissionCalendarView />
        </TabsContent>

        <TabsContent value="view" className="mt-4 space-y-4">
          {/* סטטיסטיקות מצומצמות */}
          <div className="grid grid-cols-3 gap-2" dir="ltr">
            <div className="bg-warning/10 border border-warning/20 rounded p-2 text-center">
              <p className="text-lg font-bold text-warning">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">ממתין</p>
            </div>
            <div className="bg-success/10 border border-success/20 rounded p-2 text-center">
              <p className="text-lg font-bold text-success">{approvedCount}</p>
              <p className="text-xs text-muted-foreground">מאושר</p>
            </div>
            <div className="bg-destructive/10 border border-destructive/20 rounded p-2 text-center">
              <p className="text-lg font-bold text-destructive">{rejectedCount}</p>
              <p className="text-xs text-muted-foreground">נדחה</p>
            </div>
          </div>

          {/* מסננים קומפקטיים */}
          <div className="flex gap-2" dir="rtl">
            <Input
              placeholder="חפש עובד..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 h-8 text-sm"
              dir="rtl"
            />
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-32 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value="all">הכל</SelectItem>
                <SelectItem value="pending">ממתין</SelectItem>
                <SelectItem value="approved">מאושר</SelectItem>
                <SelectItem value="rejected">נדחה</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteAllDialogOpen(true)}
              className="h-8 px-2"
              disabled={sortedEmployees.length === 0}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>

          {/* רשימת עובדים קומפקטית */}
          <div className="space-y-2">
            {sortedEmployees.map(employee => (
              <div key={employee.employee_id} className="bg-card border rounded p-2">
                {/* כותרת עובד מצומצמת */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{employee.employee_name}</span>
                    <Badge variant="outline" className="text-xs h-4">
                      {Object.values(employee.shiftGroups).reduce((total, group) => total + group.requests.length, 0)}
                    </Badge>
                    {/* זמינות בוקר ברמת העובד */}
                    {employee.morning_availability?.length && (
                      <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded text-xs">
                        <Clock className="h-3 w-3 text-blue-600" />
                        <span className="text-blue-800">בוקר:</span>
                        {employee.morning_availability.map(day => (
                          <Badge key={day} variant="outline" className="text-xs h-3 bg-blue-100 text-blue-800">
                            {['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'][day]}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* משמרות העובד */}
                <div className="space-y-1">
                  {Object.entries(employee.shiftGroups).map(([shiftKey, shiftGroup]) => (
                    <div key={shiftKey} className="bg-muted/20 rounded p-2 text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-xs">
                            {shiftGroup.start_time}-{shiftGroup.end_time}
                          </span>
                          {shiftGroup.branch_preference && (
                            <span className="text-xs text-muted-foreground">• {shiftGroup.branch_preference}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge className={`text-xs h-4 ${getStatusColor(shiftGroup.requests[0].status)}`}>
                            {getStatusLabel(shiftGroup.requests[0].status)}
                          </Badge>
                          {shiftGroup.requests.length > 1 && (
                            <Badge variant="outline" className="text-xs h-4">×{shiftGroup.requests.length}</Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* תאריכים */}
                      <div className="flex flex-wrap gap-1 mb-1">
                        {shiftGroup.requests.map(request => (
                          <Badge key={request.id} variant="outline" className="text-xs h-4">
                            {format(new Date(request.shift_date), 'dd/MM')}
                          </Badge>
                        ))}
                      </div>
                      
                      {/* כפתורי פעולה */}
                      {shiftGroup.requests.some(req => req.status === 'pending') && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={() => {
                              shiftGroup.requests.forEach(request => {
                                if (request.status === 'pending') {
                                  handleUpdateStatus(request.id, 'approved');
                                }
                              });
                            }}
                            className="h-6 text-xs bg-success hover:bg-success/90 text-white"
                          >
                            אשר
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              shiftGroup.requests.forEach(request => {
                                if (request.status === 'pending') {
                                  handleUpdateStatus(request.id, 'rejected');
                                }
                              });
                            }}
                            className="h-6 text-xs"
                          >
                            דחה
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {sortedEmployees.length === 0 && (
              <div className="text-center py-8">
                <Eye className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">אין בקשות במערכת</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* דיאלוג מחיקה */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-warning" />
              אישור מחיקת בקשה
            </DialogTitle>
            <DialogDescription>
              פעולה זו תמחק את הבקשה לצמיתות. הזן קוד מנהל לאישור המחיקה.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="הזן קוד מנהל..."
              value={managerCode}
              onChange={(e) => setManagerCode(e.target.value)}
              className="text-center"
            />
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setManagerCode('');
              }}
            >
              ביטול
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteRequestMutation.isPending}
            >
              {deleteRequestMutation.isPending ? 'מוחק...' : 'מחק'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* דיאלוג מחיקה מרובה */}
      <Dialog open={deleteAllDialogOpen} onOpenChange={setDeleteAllDialogOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-destructive" />
              אישור מחיקת כל הבקשות
            </DialogTitle>
            <DialogDescription>
              פעולה זו תמחק את כל הבקשות לצמיתות ({filteredRequests.length} בקשות). הזן קוד מנהל לאישור המחיקה.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="הזן קוד מנהל..."
              value={managerCodeAll}
              onChange={(e) => setManagerCodeAll(e.target.value)}
              className="text-center"
            />
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteAllDialogOpen(false);
                setManagerCodeAll('');
              }}
            >
              ביטול
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteAll}
              disabled={deleteAllRequestsMutation.isPending}
            >
              {deleteAllRequestsMutation.isPending ? 'מוחק הכל...' : 'מחק הכל'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};