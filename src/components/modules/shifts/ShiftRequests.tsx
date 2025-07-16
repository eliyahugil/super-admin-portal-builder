
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Eye,
  CalendarDays,
  Smartphone,
  Tablet,
  Monitor
} from 'lucide-react';
import { useBusinessId } from '@/hooks/useBusinessId';
import { DeviceIndicator } from '@/components/shared/DeviceIndicator';
import { useDeviceType } from '@/hooks/useDeviceType';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ShiftSubmissionCalendarView } from './ShiftSubmissionCalendarView';

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

  const businessId = useBusinessId();
  const deviceInfo = useDeviceType();
  
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
                      <Badge className={`${getStatusColor(request.status)} badge-rtl`}>
                        {getStatusLabel(request.status)}
                      </Badge>
                      <DeviceIndicator showIcon={true} showLabel={false} className="text-xs" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 mobile:grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-4 gap-4 mb-4">
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
                      <div className="text-right">
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
    </div>
  );
};
