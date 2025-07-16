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
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ShiftSubmissionCalendarView } from './ShiftSubmissionCalendarView';
import { useToast } from '@/hooks/use-toast';

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

  // שליפת בקשות משמרות מטבלת employee_shift_requests ו shift_submissions
  const { data: requests = [], isLoading, refetch } = useQuery({
    queryKey: ['unified-shift-requests', businessId, statusFilter],
    queryFn: async (): Promise<ShiftRequest[]> => {
      if (!businessId) return [];

      console.log('🔄 שליפת בקשות משמרות מאוחדות עבור עסק:', businessId);

      // שליפה מטבלת employee_shift_requests
      const { data: shiftRequests, error: shiftRequestsError } = await supabase
        .from('employee_shift_requests')
        .select(`
          *,
          employee:employees!inner(first_name, last_name, phone, business_id)
        `)
        .eq('employee.business_id', businessId)
        .order('created_at', { ascending: false });

      if (shiftRequestsError) throw shiftRequestsError;

      // שליפה מטבלת shift_submissions
      const { data: submissions, error: submissionsError } = await supabase
        .from('shift_submissions')
        .select(`
          *,
          employee:employees!inner(first_name, last_name, phone, business_id)
        `)
        .eq('employee.business_id', businessId)
        .order('submitted_at', { ascending: false });

      if (submissionsError) throw submissionsError;

      const allRequests: ShiftRequest[] = [];

      // הוספת בקשות מטבלת employee_shift_requests
      (shiftRequests || []).forEach(request => {
        allRequests.push({
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
      });

      // הוספת בקשות מטבלת shift_submissions (ממרות)
      (submissions || []).forEach(submission => {
        if (!submission.shifts) return;
        
        const shifts = typeof submission.shifts === 'string' 
          ? JSON.parse(submission.shifts) 
          : submission.shifts;
          
        shifts.forEach((shift: any, shiftIndex: number) => {
          allRequests.push({
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
            employee: submission.employee
          });
        });
      });

      // מיון לפי תאריך יצירה
      allRequests.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      // סינון לפי סטטוס
      if (statusFilter !== 'all') {
        return allRequests.filter(req => req.status === statusFilter);
      }

      return allRequests;
    },
    enabled: !!businessId,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  // מוטציה לעדכון סטטוס בקשה
  const updateStatusMutation = useMutation({
    mutationFn: async ({ requestId, status, notes }: { requestId: string, status: 'approved' | 'rejected', notes?: string }) => {
      // בדיקה אם זו בקשה מ shift_submissions
      if (requestId.startsWith('submission-')) {
        const submissionId = requestId.split('-')[1];
        const { error } = await supabase
          .from('shift_submissions')
          .update({
            status,
            review_notes: notes,
            reviewed_at: new Date().toISOString(),
            reviewed_by: user?.id
          })
          .eq('id', submissionId);
        
        if (error) throw error;
      } else {
        // בקשה מ employee_shift_requests
        const { error } = await supabase
          .from('employee_shift_requests')
          .update({
            status,
            review_notes: notes,
            reviewed_at: new Date().toISOString(),
            reviewed_by: user?.id
          })
          .eq('id', requestId);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-shift-requests'] });
      toast({
        title: 'הצלחה',
        description: 'הסטטוס עודכן בהצלחה',
      });
    },
    onError: (error) => {
      toast({
        title: 'שגיאה',
        description: 'לא הצלחנו לעדכן את הסטטוס',
        variant: 'destructive',
      });
    }
  });

  // מוטציה למחיקת בקשה
  const deleteRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      console.log('🗑️ מוחק בקשה:', requestId);
      
      if (requestId.startsWith('submission-')) {
        // חילוץ מזהה ההגשה הנכון
        const parts = requestId.split('-');
        const submissionId = parts[1]; // submission-[ID]-[DATE]-[INDEX]
        
        console.log('🗑️ מוחק הגשה מ shift_submissions:', submissionId);
        console.log('🔍 מבצע שאילתת מחיקה עבור submission ID:', submissionId);
        
        const { data: beforeDelete, error: beforeError } = await supabase
          .from('shift_submissions')
          .select('*')
          .eq('id', submissionId);
          
        console.log('📊 נתונים לפני מחיקה:', beforeDelete);
        
        const { error } = await supabase
          .from('shift_submissions')
          .delete()
          .eq('id', submissionId);
        
        if (error) {
          console.error('❌ שגיאה במחיקת הגשה:', error);
          throw error;
        }
        
        const { data: afterDelete, error: afterError } = await supabase
          .from('shift_submissions')
          .select('*')
          .eq('id', submissionId);
          
        console.log('📊 נתונים אחרי מחיקה:', afterDelete);
        console.log('✅ הגשה נמחקה בהצלחה');
      } else {
        console.log('🗑️ מוחק בקשה מ employee_shift_requests:', requestId);
        console.log('🔍 מבצע שאילתת מחיקה עבור request ID:', requestId);
        
        const { data: beforeDelete, error: beforeError } = await supabase
          .from('employee_shift_requests')
          .select('*')
          .eq('id', requestId);
          
        console.log('📊 נתונים לפני מחיקה:', beforeDelete);
        
        const { error } = await supabase
          .from('employee_shift_requests')
          .delete()
          .eq('id', requestId);
        
        if (error) {
          console.error('❌ שגיאה במחיקת בקשה:', error);
          throw error;
        }
        
        const { data: afterDelete, error: afterError } = await supabase
          .from('employee_shift_requests')
          .select('*')
          .eq('id', requestId);
          
        console.log('📊 נתונים אחרי מחיקה:', afterDelete);
        console.log('✅ בקשה נמחקה בהצלחה');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-shift-requests'] });
      toast({
        title: 'הצלחה',
        description: 'הבקשה נמחקה בהצלחה',
      });
      setDeleteDialogOpen(false);
      setSelectedRequestId('');
      setManagerCode('');
    },
    onError: (error) => {
      toast({
        title: 'שגיאה',
        description: 'לא הצלחנו למחוק את הבקשה',
        variant: 'destructive',
      });
    }
  });

  // מוטציה למחיקת כל הבקשות
  const deleteAllRequestsMutation = useMutation({
    mutationFn: async () => {
      console.log('🗑️ מוחק את כל הבקשות');
      
      if (!businessId) throw new Error('No business ID');
      
      // שליפת מזהי עובדים
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('id')
        .eq('business_id', businessId);
        
      if (employeesError) throw employeesError;
      
      const employeeIds = employees?.map(emp => emp.id) || [];
      
      if (employeeIds.length === 0) {
        console.log('❌ לא נמצאו עובדים לעסק זה');
        return;
      }
      
      // מחיקת כל הבקשות מ employee_shift_requests
      const { error: shiftRequestsError } = await supabase
        .from('employee_shift_requests')
        .delete()
        .in('employee_id', employeeIds);
      
      if (shiftRequestsError) {
        console.error('❌ שגיאה במחיקת employee_shift_requests:', shiftRequestsError);
        throw shiftRequestsError;
      }
      
      // מחיקת כל הבקשות מ shift_submissions
      const { error: submissionsError } = await supabase
        .from('shift_submissions')
        .delete()
        .in('employee_id', employeeIds);
      
      if (submissionsError) {
        console.error('❌ שגיאה במחיקת shift_submissions:', submissionsError);
        throw submissionsError;
      }
      
      console.log('✅ כל הבקשות נמחקו בהצלחה');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-shift-requests'] });
      toast({
        title: 'הצלחה',
        description: 'כל הבקשות נמחקו בהצלחה',
      });
      setDeleteAllDialogOpen(false);
      setManagerCodeAll('');
    },
    onError: (error) => {
      toast({
        title: 'שגיאה',
        description: 'לא הצלחנו למחוק את הבקשות',
        variant: 'destructive',
      });
    }
  });

  const handleUpdateStatus = (requestId: string, status: 'approved' | 'rejected', notes?: string) => {
    updateStatusMutation.mutate({ requestId, status, notes });
  };

  const handleReviewNotesChange = (requestId: string, notes: string) => {
    setReviewNotes(prev => ({ ...prev, [requestId]: notes }));
  };

  const handleDeleteRequest = (requestId: string) => {
    setSelectedRequestId(requestId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    console.log('🔍 confirmDelete called - קוד שהוזן:', managerCode);
    console.log('🔍 selectedRequestId:', selectedRequestId);
    
    if (!managerCode || managerCode !== '130898') {
      console.log('❌ קוד מנהל שגוי:', managerCode);
      toast({
        title: 'שגיאה',
        description: 'קוד מנהל שגוי',
        variant: 'destructive',
      });
      return;
    }

    console.log('✅ קוד מנהל נכון, מתחיל מחיקה...');
    deleteRequestMutation.mutate(selectedRequestId);
  };

  const confirmDeleteAll = () => {
    console.log('🔍 confirmDeleteAll called - קוד שהוזן:', managerCodeAll);
    
    if (!managerCodeAll || managerCodeAll !== '130898') {
      console.log('❌ קוד מנהל שגוי:', managerCodeAll);
      toast({
        title: 'שגיאה',
        description: 'קוד מנהל שגוי',
        variant: 'destructive',
      });
      return;
    }

    console.log('✅ קוד מנהל נכון, מתחיל מחיקת הכל...');
    deleteAllRequestsMutation.mutate();
  };

  const sendWhatsApp = (phone: string, employeeName: string, status: string, date: string, notes?: string) => {
    let message = `שלום ${employeeName}! `;
    
    if (status === 'approved') {
      message += `בקשת המשמרת שלך לתאריך ${date} אושרה! ✅`;
    } else if (status === 'rejected') {
      message += `בקשת המשמרת שלך לתאריך ${date} נדחתה. ❌`;
    } else {
      message += `בקשת המשמרת שלך לתאריך ${date} בבדיקה...`;
    }
    
    if (notes) {
      message += `\n\nהערת מנהל: ${notes}`;
    }
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning/10 text-warning border-warning/20';
      case 'approved': return 'bg-success/10 text-success border-success/20';
      case 'rejected': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
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

  const filteredRequests = requests.filter(request => {
    if (searchTerm && !request.employee_name?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  const pendingRequests = filteredRequests.filter(req => req.status === 'pending');
  const approvedRequests = filteredRequests.filter(req => req.status === 'approved');
  const rejectedRequests = filteredRequests.filter(req => req.status === 'rejected');

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
          {/* סטטיסטיקות */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border border-warning/20 bg-warning/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-warning/10 rounded-lg">
                    <Clock className="h-5 w-5 text-warning" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">ממתינות לאישור</p>
                    <p className="text-2xl font-bold text-warning">{pendingRequests.length}</p>
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
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">מאושרות</p>
                    <p className="text-2xl font-bold text-success">{approvedRequests.length}</p>
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
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">נדחות</p>
                    <p className="text-2xl font-bold text-destructive">{rejectedRequests.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* מסננים וכפתורי פעולות */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="חפש לפי שם עובד..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 text-right"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
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
              disabled={filteredRequests.length === 0}
            >
              <Trash2 className="h-4 w-4" />
              מחק הכל
            </Button>
          </div>

          {/* תוכן ראשי - מימין לשמאל */}
          <div className="flex gap-6" dir="rtl">
            {/* רשימת בקשות - צד שמאל */}
            <div className="flex-1 space-y-4">
              {filteredRequests.map(request => (
                <Card key={request.id} className="hover-scale animate-fade-in">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-lg">{request.employee_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRequest(request.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4 ml-1" />
                          מחק
                        </Button>
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusLabel(request.status)}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-right">
                        <p className="font-medium text-sm text-muted-foreground mb-1">תאריך</p>
                        <p className="font-semibold">{format(new Date(request.shift_date), 'dd/MM/yyyy')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm text-muted-foreground mb-1">שעות</p>
                        <p className="font-semibold">{request.start_time} - {request.end_time}</p>
                      </div>
                      {request.branch_preference && (
                        <div className="text-right">
                          <p className="font-medium text-sm text-muted-foreground mb-1">סניף מועדף</p>
                          <p className="flex items-center gap-1 justify-end">
                            <span>{request.branch_preference}</span>
                            <MapPin className="h-3 w-3" />
                          </p>
                        </div>
                      )}
                      {request.role_preference && (
                        <div className="text-right">
                          <p className="font-medium text-sm text-muted-foreground mb-1">תפקיד מועדף</p>
                          <p className="font-semibold">{request.role_preference}</p>
                        </div>
                      )}
                    </div>

                    {request.notes && (
                      <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                        <p className="font-medium text-sm text-muted-foreground mb-1">הערות העובד</p>
                        <p className="text-sm">{request.notes}</p>
                      </div>
                    )}

                    {request.review_notes && (
                      <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <p className="font-medium text-sm text-muted-foreground mb-1">הערת מנהל</p>
                        <p className="text-sm">{request.review_notes}</p>
                      </div>
                    )}

                    <div className="text-sm text-muted-foreground border-t pt-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          <span>נוצר: {format(new Date(request.created_at), 'dd/MM/yyyy HH:mm')}</span>
                        </div>
                        {request.reviewed_at && (
                          <div className="flex items-center gap-1">
                            <span>נבדק: {format(new Date(request.reviewed_at), 'dd/MM/yyyy HH:mm')}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {request.status !== 'pending' && request.employee?.phone && (
                      <div className="border-t pt-3 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => sendWhatsApp(
                            request.employee!.phone!,
                            request.employee_name!,
                            request.status,
                            format(new Date(request.shift_date), 'dd/MM/yyyy'),
                            request.review_notes
                          )}
                        >
                          <MessageSquare className="h-4 w-4 ml-1" />
                          שלח עדכון בוואטסאפ
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {filteredRequests.length === 0 && (
                <div className="text-center py-12 animate-fade-in">
                  <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">אין בקשות משמרות</h3>
                  <p className="text-muted-foreground">לא נמצאו בקשות במערכת</p>
                </div>
              )}
            </div>

            {/* פאנל אישור - צד ימין */}
            {pendingRequests.length > 0 && (
              <div className="w-80 space-y-4 animate-slide-in-right">
                <Card className="sticky top-4 border-warning/20 bg-warning/5">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle className="h-5 w-5 text-warning" />
                      <h3 className="text-lg font-semibold">אישור בקשות</h3>
                    </div>
                    
                    <div className="space-y-4">
                      {pendingRequests.slice(0, 3).map(request => (
                        <Card key={`approval-${request.id}`} className="border-warning/30">
                          <CardContent className="p-4">
                            <div className="text-right mb-3">
                              <p className="font-medium">{request.employee_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(request.shift_date), 'dd/MM/yyyy')} • 
                                {request.start_time} - {request.end_time}
                              </p>
                            </div>

                            <div className="space-y-3">
                              <Textarea
                                placeholder="הערת מנהל (אופציונלי)..."
                                value={reviewNotes[request.id] || ''}
                                onChange={(e) => handleReviewNotesChange(request.id, e.target.value)}
                                rows={2}
                                className="text-right text-sm"
                              />
                              
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateStatus(request.id, 'approved', reviewNotes[request.id])}
                                  disabled={updateStatusMutation.isPending}
                                  className="flex-1 bg-success hover:bg-success/90 text-white"
                                >
                                  <CheckCircle className="h-4 w-4 ml-1" />
                                  אשר
                                </Button>
                                
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleUpdateStatus(request.id, 'rejected', reviewNotes[request.id])}
                                  disabled={updateStatusMutation.isPending}
                                  className="flex-1"
                                >
                                  <XCircle className="h-4 w-4 ml-1" />
                                  דחה
                                </Button>
                              </div>

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
                                  className="w-full"
                                >
                                  <MessageSquare className="h-4 w-4 ml-1" />
                                  וואטסאפ
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      {pendingRequests.length > 3 && (
                        <p className="text-sm text-muted-foreground text-center">
                          ועוד {pendingRequests.length - 3} בקשות...
                        </p>
                      )}

                      {pendingRequests.length === 0 && (
                        <div className="text-center py-8">
                          <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">אין בקשות לאישור</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
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