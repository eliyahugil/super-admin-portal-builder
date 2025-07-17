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

  // קיבוץ בקשות לפי עובדים ואן לפי משמרות זהות + ספירה נכונה
  const groupedRequests = filteredRequests.reduce((acc, request) => {
    const employeeKey = request.employee_id;
    if (!acc[employeeKey]) {
      acc[employeeKey] = {
        employee_name: request.employee_name || 'לא ידוע',
        employee_id: request.employee_id,
        employee: request.employee,
        shiftGroups: {},
        morning_availability: request.optional_morning_availability // שמירת זמינות בוקר ברמת העובד
      };
    }
    
    // קיבוץ משמרות לפי שעות + סניף + תפקיד
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

  // מיון העובדים לפי שם
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
    <div className="space-y-6" dir="rtl">
      {/* כותרת עם מחוון מכשיר */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">
              ניהול בקשות משמרות
            </h2>
            <DeviceIndicator className="mr-auto" />
          </div>
          <p className="text-muted-foreground">
            אישור, דחייה וניהול כל בקשות המשמרות מעובדים • 
            נצפה מ{deviceInfo.label} ({deviceInfo.width}×{deviceInfo.height})
          </p>
        </div>
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

        <TabsContent value="calendar" className="mt-6">
          <ShiftSubmissionCalendarView />
        </TabsContent>

        <TabsContent value="view" className="mt-6 space-y-6">
          {/* סטטיסטיקות עם כיווניות נכונה */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" dir="ltr">
            <Card className="border border-warning/20 bg-warning/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-warning/10 rounded-lg">
                    <Clock className="h-5 w-5 text-warning" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-muted-foreground">ממתינות לאישור</p>
                    <p className="text-2xl font-bold text-warning">{pendingCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-success/20 bg-success/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-success/10 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-muted-foreground">מאושרות</p>
                    <p className="text-2xl font-bold text-success">{approvedCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-destructive/20 bg-destructive/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-destructive/10 rounded-lg">
                    <XCircle className="h-5 w-5 text-destructive" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-muted-foreground">נדחות</p>
                    <p className="text-2xl font-bold text-destructive">{rejectedCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* מסננים וכפתורי פעולות */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center" dir="rtl">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="חפש לפי שם עובד..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 text-right"
                dir="rtl"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-full sm:w-48" dir="rtl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value="all">כל הסטטוסים</SelectItem>
                <SelectItem value="pending">ממתין</SelectItem>
                <SelectItem value="approved">מאושר</SelectItem>
                <SelectItem value="rejected">נדחה</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="destructive"
              onClick={() => setDeleteAllDialogOpen(true)}
              className="flex items-center gap-2"
              disabled={sortedEmployees.length === 0}
            >
              <Trash2 className="h-4 w-4" />
              מחק הכל
            </Button>
          </div>

          {/* תוכן ראשי - מימין לשמאל */}
          <div className="w-full" dir="rtl">
            {/* רשימת בקשות מקובצת לפי עובדים */}
            <div className="w-full space-y-4">
              {sortedEmployees.map(employee => (
                <Card key={employee.employee_id} className="hover-scale animate-fade-in" dir="rtl">
                  <CardContent className="p-6" dir="rtl">
                    {/* כותרת עובד */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b" dir="rtl">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-primary" />
                        <span className="font-bold text-xl">{employee.employee_name}</span>
                        <Badge variant="outline" className="text-xs">
                          {Object.values(employee.shiftGroups).reduce((total, group) => total + group.requests.length, 0)} בקשות
                        </Badge>
                      </div>
                      
                      {/* זמינות בוקר ברמת העובד - פעם אחת בלבד */}
                      {employee.morning_availability?.length && (
                        <div className="flex items-center gap-2 text-sm bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                          <Clock className="h-3 w-3 text-blue-600" />
                          <span className="text-blue-800 font-medium">זמינות בוקר:</span>
                          <div className="flex gap-1">
                            {employee.morning_availability.map(day => (
                              <Badge 
                                key={day} 
                                variant="outline" 
                                className="text-xs bg-blue-100 text-blue-800 border-blue-300"
                              >
                                {['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'][day]}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* רשימת קבוצות משמרות העובד */}
                    <div className="space-y-3" dir="rtl">
                      {Object.entries(employee.shiftGroups).map(([shiftKey, shiftGroup]) => {
                        const hasMultipleDates = shiftGroup.requests.length > 1;
                        const allSameStatus = shiftGroup.requests.every(req => req.status === shiftGroup.requests[0].status);
                        const mainStatus = shiftGroup.requests[0].status;
                        
                        return (
                          <div key={shiftKey} className="bg-muted/30 rounded-lg p-4 border border-muted">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                  {shiftGroup.start_time} - {shiftGroup.end_time}
                                </span>
                                {shiftGroup.branch_preference && (
                                  <>
                                    <span className="text-muted-foreground">•</span>
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-sm">{shiftGroup.branch_preference}</span>
                                    </div>
                                  </>
                                )}
                                {shiftGroup.role_preference && (
                                  <>
                                    <span className="text-muted-foreground">•</span>
                                    <span className="text-sm">{shiftGroup.role_preference}</span>
                                  </>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {hasMultipleDates && (
                                  <Badge variant="secondary" className="text-xs">
                                    {shiftGroup.requests.length} תאריכים
                                  </Badge>
                                )}
                                {allSameStatus ? (
                                  <Badge className={getStatusColor(mainStatus)}>
                                    {getStatusLabel(mainStatus)}
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs">
                                    סטטוס מעורב
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* תאריכים שהוגשו */}
                            <div className="mb-3">
                              <p className="text-sm text-muted-foreground mb-2">תאריכים שהוגשו:</p>
                              <div className="flex flex-wrap gap-1">
                                {shiftGroup.requests.map(request => (
                                  <div key={request.id} className="flex items-center gap-1">
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs ${getStatusColor(request.status)}`}
                                    >
                                      {format(new Date(request.shift_date), 'dd/MM')}
                                    </Badge>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteRequest(request.id)}
                                      className="h-5 w-5 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* הערות אם יש */}
                            {shiftGroup.requests.some(req => req.notes) && (
                              <div className="mb-3 p-2 bg-background rounded text-sm">
                                <p className="text-muted-foreground mb-1">הערות עובד:</p>
                                {shiftGroup.requests.filter(req => req.notes).map(request => (
                                  <div key={request.id} className="mb-1">
                                    <span className="font-medium">{format(new Date(request.shift_date), 'dd/MM')}:</span> {request.notes}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* הערות מנהל */}
                            {shiftGroup.requests.some(req => req.review_notes) && (
                              <div className="mb-3 p-2 bg-primary/5 rounded border border-primary/20 text-sm">
                                <p className="text-muted-foreground mb-1">הערות מנהל:</p>
                                {shiftGroup.requests.filter(req => req.review_notes).map(request => (
                                  <div key={request.id} className="mb-1">
                                    <span className="font-medium">{format(new Date(request.shift_date), 'dd/MM')}:</span> {request.review_notes}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* הסרת זמינות בוקר מכאן כי זה עבר לרמת העובד */}

                            {/* כפתורי פעולה קבוצתיים */}
                            {shiftGroup.requests.some(req => req.status === 'pending') && (
                              <div className="flex gap-2 mt-3 pt-2 border-t border-muted">
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    shiftGroup.requests.forEach(request => {
                                      if (request.status === 'pending') {
                                        handleUpdateStatus(request.id, 'approved', reviewNotes[request.id]);
                                      }
                                    });
                                  }}
                                  disabled={updateStatusMutation.isPending}
                                  className="bg-success hover:bg-success/90 text-white text-xs h-7"
                                >
                                  <CheckCircle className="h-3 w-3 ml-1" />
                                  אשר הכל
                                </Button>
                                
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    shiftGroup.requests.forEach(request => {
                                      if (request.status === 'pending') {
                                        handleUpdateStatus(request.id, 'rejected', reviewNotes[request.id]);
                                      }
                                    });
                                  }}
                                  disabled={updateStatusMutation.isPending}
                                  className="text-xs h-7"
                                >
                                  <XCircle className="h-3 w-3 ml-1" />
                                  דחה הכל
                                </Button>

                                <Textarea
                                  placeholder="הערה לכל המשמרות..."
                                  value={reviewNotes[shiftKey] || ''}
                                  onChange={(e) => {
                                    const notes = e.target.value;
                                    setReviewNotes(prev => {
                                      const updated = { ...prev, [shiftKey]: notes };
                                      // עדכון כל הבקשות בקבוצה
                                      shiftGroup.requests.forEach(request => {
                                        updated[request.id] = notes;
                                      });
                                      return updated;
                                    });
                                  }}
                                  rows={1}
                                  className="text-xs h-7 flex-1"
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {sortedEmployees.length === 0 && (
                <div className="text-center py-12 animate-fade-in">
                  <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">אין בקשות משמרות</h3>
                  <p className="text-muted-foreground">לא נמצאו בקשות במערכת</p>
                </div>
              )}
            </div>

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