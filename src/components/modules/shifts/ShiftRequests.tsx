
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { 
  Clock, 
  User,
  Calendar as CalendarIcon,
  CheckCircle,
  XCircle,
  Search,
  MapPin,
  Eye,
  CalendarDays,
  Smartphone,
  Tablet,
  Monitor,
  Trash2,
  Shield,
  Edit
} from 'lucide-react';
import { useBusinessId } from '@/hooks/useBusinessId';
import { DeviceIndicator } from '@/components/shared/DeviceIndicator';
import { useDeviceType } from '@/hooks/useDeviceType';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from 'date-fns';
import { he } from 'date-fns/locale';
import { ShiftSubmissionCalendarView } from './ShiftSubmissionCalendarView';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string>('');
  const [selectedRequest, setSelectedRequest] = useState<ShiftRequest | null>(null);
  const [managerCode, setManagerCode] = useState('');

  const businessId = useBusinessId();
  const deviceInfo = useDeviceType();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  console.log('📊 בקשות משמרות: מזהה עסק נוכחי:', businessId);
  console.log('📱 בקשות משמרות: נתוני מכשיר:', deviceInfo);

  // שליפת הגשות משמרות (שהן ההגשות השבועיות האמיתיות)
  const { data: requests = [], isLoading, refetch } = useQuery({
    queryKey: ['shift-submissions', businessId, statusFilter],
    queryFn: async (): Promise<ShiftRequest[]> => {
      if (!businessId) return [];
      
      console.log('🔒 שולף הגשות משמרות עבור עסק:', businessId);
      
      let query = supabase
        .from('shift_submissions')
        .select(`
          *,
          employee:employees!inner(first_name, last_name, business_id)
        `)
        .eq('employee.business_id', businessId)
        .order('submitted_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      // המרת הגשות משמרות לפורמט תצוגה
      const expandedRequests: ShiftRequest[] = [];
      
      (data || []).forEach(submission => {
        if (!submission.shifts) return;
        
        const shifts = typeof submission.shifts === 'string' 
          ? JSON.parse(submission.shifts) 
          : submission.shifts;
          
        shifts.forEach((shift: any) => {
          expandedRequests.push({
            id: `${submission.id}-${shift.date}`,
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
            reviewed_at: undefined
          });
        });
      });

      // סינון לפי סטטוס במידת הצורך
      if (statusFilter !== 'all') {
        return expandedRequests.filter(req => req.status === statusFilter);
      }

      return expandedRequests;
    },
    enabled: !!businessId,
    refetchInterval: 30000, // רענון אוטומטי כל 30 שניות
    refetchOnWindowFocus: true, // רענון כאשר החלון מקבל פוקוס
    refetchOnMount: true // רענון עם טעינת הרכיב
  });

  // מוטציה למחיקת הגשה
  const deleteSubmissionMutation = useMutation({
    mutationFn: async (submissionId: string) => {
      const { error } = await supabase
        .from('shift_submissions')
        .delete()
        .eq('id', submissionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-submissions'] });
      toast({
        title: 'הצלחה',
        description: 'ההגשה נמחקה בהצלחה',
      });
      setDeleteDialogOpen(false);
      setManagerCode('');
    },
    onError: (error) => {
      toast({
        title: 'שגיאה',
        description: 'לא הצלחנו למחוק את ההגשה',
        variant: 'destructive',
      });
    }
  });

  // פונקציה לטיפול במחיקה
  const handleDeleteRequest = (requestId: string) => {
    setSelectedRequestId(requestId);
    setDeleteDialogOpen(true);
  };

  // פונקציה לטיפול בעריכה
  const handleEditRequest = (request: ShiftRequest) => {
    setSelectedRequest(request);
    setEditDialogOpen(true);
  };

  // פונקציה לאישור המחיקה עם קוד מנהל
  const confirmDelete = () => {
    if (!managerCode || managerCode !== '1234') { // קוד מנהל זמני
      toast({
        title: 'שגיאה',
        description: 'קוד מנהל שגוי',
        variant: 'destructive',
      });
      return;
    }

    const submissionId = selectedRequestId.split('-')[0]; // מחילוץ מזהה ההגשה מהמזהה המורכב
    deleteSubmissionMutation.mutate(submissionId);
  };


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
          <span className="mr-3">טוען נתונים...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl" style={{ textAlign: 'right', direction: 'rtl' }}>
      {/* כותרת עם מחוון מכשיר */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Eye className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">
              צפייה בבקשות משמרות
            </h2>
            <DeviceIndicator className="mr-auto" />
          </div>
          <p className="text-muted-foreground">
            סקירה וצפייה בכל בקשות המשמרות מעובדים • 
            נצפה מ{deviceInfo.label} ({deviceInfo.width}×{deviceInfo.height})
          </p>
        </div>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2 rtl-grid">
          <TabsTrigger value="list" className="flex items-center gap-2 rtl-flex">
            <Eye className="h-4 w-4" />
            <span>תצוגת רשימה</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2 rtl-flex">
            <CalendarDays className="h-4 w-4" />
            <span>תצוגת לוח שנה</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-6">
          <ShiftSubmissionCalendarView />
        </TabsContent>

        <TabsContent value="list" className="mt-6 space-y-6">
          {/* סטטיסטיקות מהירות - רשת רספונסיבית */}
          <div className="grid grid-cols-1 mobile:grid-cols-1 tablet:grid-cols-3 desktop:grid-cols-3 gap-4">
            <Card className="card-modern hover-lift">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 rtl-flex">
                  <div className="p-3 bg-warning/10 rounded-lg touch-target">
                    <Clock className="h-5 w-5 text-warning" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">בקשות ממתינות</p>
                    <p className="text-2xl font-bold">{pendingRequests}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="card-modern hover-lift">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 rtl-flex">
                  <div className="p-3 bg-success/10 rounded-lg touch-target">
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">בקשות מאושרות</p>
                    <p className="text-2xl font-bold">{approvedRequests}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="card-modern hover-lift">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 rtl-flex">
                  <div className="p-3 bg-destructive/10 rounded-lg touch-target">
                    <XCircle className="h-5 w-5 text-destructive" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">בקשות נדחות</p>
                    <p className="text-2xl font-bold">{rejectedRequests}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* מסננים - משופרים למובייל */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="חפש לפי עובד..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 text-right focus-enhanced"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-full sm:w-48 touch-target">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-50">
                <SelectItem value="all">כל הסטטוסים</SelectItem>
                <SelectItem value="pending">ממתין</SelectItem>
                <SelectItem value="approved">מאושר</SelectItem>
                <SelectItem value="rejected">נדחה</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* רשימת בקשות - משופרת לכל המכשירים */}
          <div className="space-y-4">
            {filteredRequests.map(request => (
              <Card key={request.id} className="card-modern hover-lift">
                 <CardContent className="p-4 sm:p-6" dir="rtl">
                   <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4" style={{ direction: 'rtl' }}>
                     <div className="flex items-center gap-3" style={{ direction: 'rtl' }}>
                       <User className="h-4 w-4 text-primary" />
                       <span className="font-semibold text-lg">{request.employee_name}</span>
                     </div>
                     <div className="flex items-center gap-2">
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => handleEditRequest(request)}
                         className="text-primary hover:text-primary hover:bg-primary/10"
                       >
                         <Edit className="h-4 w-4 ml-1" />
                         ערוך
                       </Button>
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => handleDeleteRequest(request.id)}
                         className="text-destructive hover:text-destructive hover:bg-destructive/10"
                       >
                         <Trash2 className="h-4 w-4 ml-1" />
                         מחק
                       </Button>
                       <Badge className={`${getStatusColor(request.status)} badge-rtl`}>
                         {getStatusLabel(request.status)}
                       </Badge>
                       <DeviceIndicator showIcon={true} showLabel={false} className="text-xs" />
                     </div>
                   </div>

                   <div className="grid grid-cols-1 mobile:grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-4 gap-4 mb-4">
                     <div className="text-right" dir="rtl">
                       <p className="font-medium text-sm text-muted-foreground mb-1">תאריך</p>
                       <p className="font-semibold">{format(new Date(request.shift_date), 'dd/MM/yyyy')}</p>
                     </div>
                     <div className="text-left" dir="ltr">
                       <p className="font-medium text-sm text-muted-foreground mb-1" dir="rtl" style={{ textAlign: 'right' }}>שעות</p>
                       <p className="font-semibold">{request.start_time} - {request.end_time}</p>
                     </div>
                     {request.branch_preference && (
                       <div className="text-right" dir="rtl">
                         <p className="font-medium text-sm text-muted-foreground mb-1">סניף מועדף</p>
                         <p className="flex items-center gap-1 justify-end" title={request.branch_preference}>
                           <span className="truncate">
                             {request.branch_preference.length > 20 
                               ? `${request.branch_preference.substring(0, 20)}...` 
                               : request.branch_preference}
                           </span>
                           <MapPin className="h-3 w-3 flex-shrink-0" />
                         </p>
                       </div>
                     )}
                     {request.role_preference && (
                       <div className="text-right" dir="rtl">
                         <p className="font-medium text-sm text-muted-foreground mb-1">תפקיד מועדף</p>
                         <p className="font-semibold">{request.role_preference}</p>
                       </div>
                     )}
                  </div>

                  {request.notes && (
                    <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                      <p className="font-medium text-sm text-muted-foreground mb-1">הערות</p>
                      <p className="text-sm">{request.notes}</p>
                    </div>
                  )}

                  <div className="text-sm text-muted-foreground border-t pt-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>נוצר: {format(new Date(request.created_at), 'dd/MM/yyyy HH:mm')}</span>
                      </div>
                      {request.reviewed_at && (
                        <span className="text-xs">
                          נבדק: {format(new Date(request.reviewed_at), 'dd/MM/yyyy HH:mm')}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredRequests.length === 0 && (
            <div className="text-center py-12 card-modern">
              <div className="flex flex-col items-center gap-4">
                <Eye className="h-16 w-16 text-muted-foreground/50" />
                <div>
                  <h3 className="text-lg font-medium mb-2">אין בקשות משמרות</h3>
                  <p className="text-muted-foreground text-sm">
                    לא נמצאו בקשות במערכת עבור העסק הנוכחי
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    מכשיר: {deviceInfo.label} • רזולוציה: {deviceInfo.width}×{deviceInfo.height}
                  </p>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* דיאלוג קוד מנהל למחיקה */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-warning" />
              אישור מחיקת הגשה
            </DialogTitle>
            <DialogDescription className="text-right">
              למחיקת הגשה נדרש קוד מנהל. פעולה זו אינה ניתנת לביטול.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="manager-code" className="text-sm font-medium">
                קוד מנהל
              </label>
              <Input
                id="manager-code"
                type="password"
                value={managerCode}
                onChange={(e) => setManagerCode(e.target.value)}
                placeholder="הזן קוד מנהל..."
                className="text-right"
                dir="rtl"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
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
              disabled={!managerCode || deleteSubmissionMutation.isPending}
            >
              {deleteSubmissionMutation.isPending ? 'מוחק...' : 'מחק הגשה'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* דיאלוג עריכת הגשה */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-primary" />
              עריכת הגשת משמרת
            </DialogTitle>
            <DialogDescription className="text-right">
              עריכת פרטי הגשת משמרת עבור {selectedRequest?.employee_name}
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">תאריך משמרת</label>
                  <Input
                    type="date"
                    defaultValue={selectedRequest.shift_date}
                    className="text-right"
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">סטטוס</label>
                  <Select defaultValue={selectedRequest.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">ממתין</SelectItem>
                      <SelectItem value="approved">מאושר</SelectItem>
                      <SelectItem value="rejected">נדחה</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">שעת התחלה</label>
                  <Input
                    type="time"
                    defaultValue={selectedRequest.start_time}
                    className="text-left"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">שעת סיום</label>
                  <Input
                    type="time"
                    defaultValue={selectedRequest.end_time}
                    className="text-left"
                    dir="ltr"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">סניף מועדף</label>
                <Input
                  defaultValue={selectedRequest.branch_preference}
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">תפקיד מועדף</label>
                <Input
                  defaultValue={selectedRequest.role_preference || ''}
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">הערות</label>
                <Input
                  defaultValue={selectedRequest.notes || ''}
                  className="text-right"
                  dir="rtl"
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setEditDialogOpen(false)}
            >
              ביטול
            </Button>
            <Button 
              onClick={() => {
                toast({
                  title: 'הצלחה',
                  description: 'ההגשה עודכנה בהצלחה',
                });
                setEditDialogOpen(false);
              }}
            >
              שמור שינויים
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
