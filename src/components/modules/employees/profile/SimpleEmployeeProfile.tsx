import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  Building, 
  Calendar, 
  Clock,
  FileText,
  FolderOpen,
  Bell,
  MapPin,
  Briefcase,
  CreditCard,
  Home,
  Baby,
  Send,
  CheckCircle,
  Upload
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { usePublicShifts } from '@/hooks/usePublicShifts';
import { EmployeeScheduleView } from './schedule/EmployeeScheduleView';
import { useEmployeeDocuments } from '@/components/modules/employees/hooks/useEmployeeDocuments';
import { useEmployeeDocumentUpload } from '@/components/modules/employees/hooks/useEmployeeDocumentUpload';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  employee_type: string;
  hire_date?: string;
  business_id: string;
  employee_id?: string;
  birth_date?: string;
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  id_number?: string;
  bank_account?: string;
  weekly_hours_required?: number;
  hourly_rate?: number;
  notes?: string;
}

interface Shift {
  id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  shift_type: string;
  status: string;
  branch_name?: string;
  notes?: string;
}

interface AvailableShift {
  id: string;
  shift_name: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  shift_type: string;
  branch_name?: string;
  required_employees: number;
  current_assignments: number;
  day_of_week: number;
}

interface Document {
  id: string;
  document_name: string;
  document_type: string;
  status: string;
  created_at: string;
  file_url?: string;
}

interface EmployeeFile {
  id: string;
  file_name: string;
  file_type: string;
  created_at: string;
  file_path: string;
  is_visible_to_employee: boolean;
  approval_status: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

export const SimpleEmployeeProfile: React.FC = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const { toast } = useToast();
  const { useEmployeeActiveToken, useTokenAvailableShifts } = usePublicShifts();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [availableShifts, setAvailableShifts] = useState<AvailableShift[]>([]);
  const [activeTokens, setActiveTokens] = useState<any[]>([]);
  // Use the proper hooks for documents
  const { documents, isLoading: documentsLoading, refetch } = useEmployeeDocuments(employeeId || '');
  const { uploading, handleFileUpload: handleDocumentUpload } = useEmployeeDocumentUpload(
    employeeId,
    ['employee-documents', employeeId],
    refetch
  );
  const [files, setFiles] = useState<EmployeeFile[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingShift, setSubmittingShift] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Get active token for this employee
  const { data: activeToken } = useEmployeeActiveToken(employeeId || '');
  
  // Get available shifts for the active token
  const { data: tokenAvailableShifts = [] } = useTokenAvailableShifts(activeToken?.id || '');

  useEffect(() => {
    const fetchAllData = async () => {
      if (!employeeId) return;

      try {
        // Fetch employee data
        const { data: employeeData, error: empError } = await supabase
          .from('employees')
          .select('*')
          .eq('id', employeeId)
          .eq('is_active', true)
          .single();

        if (empError) {
          console.error('Error fetching employee:', empError);
          setEmployee(null);
          setLoading(false);
          return;
        }

        setEmployee(employeeData);

        // Fetch upcoming shifts
        const { data: shiftsData } = await supabase
          .from('scheduled_shifts')
          .select(`
            *,
            branch:branches(name)
          `)
          .eq('employee_id', employeeId)
          .gte('shift_date', new Date().toISOString().split('T')[0])
          .order('shift_date', { ascending: true })
          .limit(10);

        if (shiftsData) {
          const mappedShifts: Shift[] = shiftsData.map(shift => ({
            id: shift.id,
            shift_date: shift.shift_date,
            start_time: shift.start_time,
            end_time: shift.end_time,
            shift_type: shift.priority || 'רגיל',
            status: shift.status || 'מתוזמן',
            branch_name: shift.branch?.name || 'לא הוגדר',
            notes: shift.notes
          }));
          setShifts(mappedShifts);
        }

        // Fetch available shifts for current and next weeks (shifts that employee can apply for)
        const currentDate = new Date();
        const nextWeekStart = new Date();
        nextWeekStart.setDate(currentDate.getDate() - 1); // Start from yesterday to include today
        const nextWeekEnd = new Date();
        nextWeekEnd.setDate(currentDate.getDate() + 14); // Look ahead 2 weeks

        const { data: availableShiftsData } = await supabase
          .from('available_shifts')
          .select(`
            *,
            branch:branches(name)
          `)
          .eq('business_id', employeeData.business_id)
          .eq('is_open_for_unassigned', true)
          .gte('week_start_date', nextWeekStart.toISOString().split('T')[0])
          .lte('week_end_date', nextWeekEnd.toISOString().split('T')[0])
          .order('week_start_date', { ascending: true });

        if (availableShiftsData) {
          const mappedAvailableShifts: AvailableShift[] = availableShiftsData.map(shift => ({
            id: shift.id,
            shift_name: shift.shift_name,
            shift_date: shift.week_start_date, // We'll need to calculate the actual date
            start_time: shift.start_time,
            end_time: shift.end_time,
            shift_type: shift.shift_type,
            branch_name: shift.branch?.name || 'לא הוגדר',
            required_employees: shift.required_employees || 1,
            current_assignments: shift.current_assignments || 0,
            day_of_week: shift.day_of_week
          }));
          setAvailableShifts(mappedAvailableShifts);
        }

        // Fetch files (keeping employee_files for personal files)
        const { data: filesData } = await supabase
          .from('employee_files')
          .select('*')
          .eq('employee_id', employeeId)
          .eq('is_visible_to_employee', true)
          .order('created_at', { ascending: false })
          .limit(20);

        if (filesData) {
          setFiles(filesData);
        }

        // Fetch notifications
        const { data: notificationsData } = await supabase
          .from('employee_notifications')
          .select('*')
          .eq('employee_id', employeeId)
          .order('created_at', { ascending: false })
          .limit(20);

        if (notificationsData) {
          setNotifications(notificationsData);
        }

        // Fetch active tokens for this employee
        const { data: tokensData } = await supabase
          .from('shift_submission_tokens')
          .select('*')
          .eq('business_id', employeeData.business_id)
          .eq('is_active', true)
          .gt('expires_at', new Date().toISOString())
          .or(`employee_id.is.null,employee_id.eq.${employeeId}`)
          .order('created_at', { ascending: false });

        if (tokensData) {
          setActiveTokens(tokensData);
        }

      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [employeeId]);

  const handleShiftApplication = async (shiftId: string) => {
    if (!employee) return;
    
    setSubmittingShift(shiftId);
    
    try {
      // Create shift choice/application
      const { error } = await supabase
        .from('employee_shift_choices')
        .insert({
          employee_id: employee.id,
          available_shift_id: shiftId,
          choice_type: 'request',
          preference_level: 1,
          week_start_date: new Date().toISOString().split('T')[0],
          notes: 'הגשה עצמאית מהפרופיל האישי'
        });

      if (error) {
        throw error;
      }

      toast({
        title: 'הגשה בוצעה בהצלחה',
        description: 'הבקשה שלך למשמרת נשלחה לאישור המנהל',
      });

      // Remove the shift from available shifts list
      setAvailableShifts(prev => prev.filter(shift => shift.id !== shiftId));

    } catch (error) {
      console.error('Error submitting shift application:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן להגיש בקשה למשמרת. נסה שוב מאוחר יותר.',
        variant: 'destructive',
      });
    } finally {
      setSubmittingShift(null);
    }
  };


  const handleLogout = () => {
    localStorage.removeItem('employee_session');
    window.location.href = '/employee-login';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'מאושר':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'ממתין':
        return 'bg-yellow-100 text-yellow-800';
      case 'signed':
      case 'חתום':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    return days[dayOfWeek] || 'לא ידוע';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6" dir="rtl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <h3 className="text-lg font-medium text-foreground mt-4 mb-2">טוען פרטי עובד</h3>
              <p className="text-base text-muted-foreground">אנא המתן...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6" dir="rtl">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <h3 className="text-lg font-medium text-foreground mb-2">העובד לא נמצא</h3>
                <p className="text-base text-muted-foreground mb-4">
                  העובד המבוקש לא נמצא במערכת.
                </p>
                <Button onClick={handleLogout} variant="outline">
                  חזרה להתחברות
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-right">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {employee.first_name} {employee.last_name}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              פרופיל עובד אישי • {employee.employee_type}
            </p>
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm">
            התנתק
          </Button>
        </div>

        {/* Main Content with Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" dir="rtl">
          {/* Mobile: Large buttons with icons */}
          <div className="block sm:hidden mb-4">
            <div className="relative">
              {/* Left fade indicator */}
              <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
              
              {/* Right fade indicator */}
              <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>
              
              {/* Scroll arrows */}
              <div className="absolute left-1 top-1/2 transform -translate-y-1/2 z-20 pointer-events-none">
                <svg className="w-4 h-4 text-muted-foreground opacity-50" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                </svg>
              </div>
              <div className="absolute right-1 top-1/2 transform -translate-y-1/2 z-20 pointer-events-none">
                <svg className="w-4 h-4 text-muted-foreground opacity-50" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                </svg>
              </div>
              
              <div className="w-full overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <div className="flex gap-2 px-6" style={{ minWidth: 'max-content' }}>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex flex-col items-center gap-1 px-4 py-3 rounded-lg border text-xs font-medium whitespace-nowrap min-w-[80px] ${
                    activeTab === 'profile' 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-background text-foreground border-border hover:bg-muted'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                  <span>פרטים</span>
                </button>
                <button
                  onClick={() => setActiveTab('shifts')}
                  className={`flex flex-col items-center gap-1 px-4 py-3 rounded-lg border text-xs font-medium whitespace-nowrap min-w-[80px] ${
                    activeTab === 'shifts' 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-background text-foreground border-border hover:bg-muted'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2-7h-1V2h-2v2H8V2H6v2H5c-1.1 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/></svg>
                  <span>משמרות</span>
                </button>
                <button
                  onClick={() => setActiveTab('schedule')}
                  className={`flex flex-col items-center gap-1 px-4 py-3 rounded-lg border text-xs font-medium whitespace-nowrap min-w-[80px] ${
                    activeTab === 'schedule' 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-background text-foreground border-border hover:bg-muted'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>
                  <span>סידור</span>
                </button>
                <button
                  onClick={() => setActiveTab('available')}
                  className={`flex flex-col items-center gap-1 px-4 py-3 rounded-lg border text-xs font-medium whitespace-nowrap min-w-[80px] ${
                    activeTab === 'available' 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-background text-foreground border-border hover:bg-muted'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                  <span>פתוחות</span>
                </button>
                <button
                  onClick={() => setActiveTab('tokens')}
                  className={`flex flex-col items-center gap-1 px-4 py-3 rounded-lg border text-xs font-medium whitespace-nowrap min-w-[80px] ${
                    activeTab === 'tokens' 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-background text-foreground border-border hover:bg-muted'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>
                  <span>טוקנים</span>
                </button>
                <button
                  onClick={() => setActiveTab('documents')}
                  className={`flex flex-col items-center gap-1 px-4 py-3 rounded-lg border text-xs font-medium whitespace-nowrap min-w-[80px] ${
                    activeTab === 'documents' 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-background text-foreground border-border hover:bg-muted'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/></svg>
                  <span>מסמכים</span>
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`flex flex-col items-center gap-1 px-4 py-3 rounded-lg border text-xs font-medium whitespace-nowrap min-w-[80px] ${
                    activeTab === 'notifications' 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-background text-foreground border-border hover:bg-muted'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12,2C13.05,2 14,2.95 14,4C14,5.05 13.05,6 12,6C10.95,6 10,5.05 10,4C10,2.95 10.95,2 12,2M21,6V8H3V6H21M6,19H18A2,2 0 0,0 20,17V10H4V17A2,2 0 0,0 6,19Z"/></svg>
                  <span>התראות</span>
                </button>
              </div>
            </div>
          </div>
        </div>

          {/* Desktop: Regular tabs */}
          <div className="hidden sm:block">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 gap-1">
              <TabsTrigger value="profile" className="text-xs sm:text-sm">פרטים אישיים</TabsTrigger>
              <TabsTrigger value="schedule" className="text-xs sm:text-sm">סידור שבועי</TabsTrigger>
              <TabsTrigger value="shifts" className="text-xs sm:text-sm">המשמרות שלי</TabsTrigger>
              <TabsTrigger value="available" className="text-xs sm:text-sm">משמרות פתוחות</TabsTrigger>
              <TabsTrigger value="tokens" className="text-xs sm:text-sm">טוקנים פעילים</TabsTrigger>
              <TabsTrigger value="documents" className="text-xs sm:text-sm">מסמכים</TabsTrigger>
              <TabsTrigger value="files" className="text-xs sm:text-sm">קבצים</TabsTrigger>
              <TabsTrigger value="notifications" className="text-xs sm:text-sm">התראות</TabsTrigger>
            </TabsList>
          </div>

          {/* Personal Details Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-right">
                    <User className="h-5 w-5" />
                    פרטים בסיסיים
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <User className="h-5 w-5 text-primary flex-shrink-0" />
                    <div className="text-right flex-1">
                      <p className="text-sm text-muted-foreground">שם מלא</p>
                      <p className="font-medium">{employee.first_name} {employee.last_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                    <div className="text-right flex-1">
                      <p className="text-sm text-muted-foreground">טלפון</p>
                      <p className="font-medium" dir="ltr">{employee.phone}</p>
                    </div>
                  </div>

                  {employee.email && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                      <div className="text-right flex-1">
                        <p className="text-sm text-muted-foreground">דוא״ל</p>
                        <p className="font-medium" dir="ltr">{employee.email}</p>
                      </div>
                    </div>
                  )}

                  {employee.id_number && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <CreditCard className="h-5 w-5 text-primary flex-shrink-0" />
                      <div className="text-right flex-1">
                        <p className="text-sm text-muted-foreground">תעודת זהות</p>
                        <p className="font-medium" dir="ltr">{employee.id_number}</p>
                      </div>
                    </div>
                  )}

                  {employee.birth_date && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Baby className="h-5 w-5 text-primary flex-shrink-0" />
                      <div className="text-right flex-1">
                        <p className="text-sm text-muted-foreground">תאריך לידה</p>
                        <p className="font-medium">{format(new Date(employee.birth_date), 'dd/MM/yyyy', { locale: he })}</p>
                      </div>
                    </div>
                  )}

                  {employee.address && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Home className="h-5 w-5 text-primary flex-shrink-0" />
                      <div className="text-right flex-1">
                        <p className="text-sm text-muted-foreground">כתובת</p>
                        <p className="font-medium">{employee.address}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Work Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-right">
                    <Briefcase className="h-5 w-5" />
                    פרטי עבודה
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Building className="h-5 w-5 text-primary flex-shrink-0" />
                    <div className="text-right flex-1">
                      <p className="text-sm text-muted-foreground">סוג עובד</p>
                      <p className="font-medium">{employee.employee_type}</p>
                    </div>
                  </div>

                  {employee.employee_id && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Briefcase className="h-5 w-5 text-primary flex-shrink-0" />
                      <div className="text-right flex-1">
                        <p className="text-sm text-muted-foreground">מספר עובד</p>
                        <p className="font-medium">{employee.employee_id}</p>
                      </div>
                    </div>
                  )}

                  {employee.hire_date && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
                      <div className="text-right flex-1">
                        <p className="text-sm text-muted-foreground">תאריך התחלת עבודה</p>
                        <p className="font-medium">{format(new Date(employee.hire_date), 'dd/MM/yyyy', { locale: he })}</p>
                      </div>
                    </div>
                  )}

                  {employee.weekly_hours_required && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Clock className="h-5 w-5 text-primary flex-shrink-0" />
                      <div className="text-right flex-1">
                        <p className="text-sm text-muted-foreground">שעות שבועיות נדרשות</p>
                        <p className="font-medium">{employee.weekly_hours_required} שעות</p>
                      </div>
                    </div>
                  )}

                  {employee.hourly_rate && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <CreditCard className="h-5 w-5 text-primary flex-shrink-0" />
                      <div className="text-right flex-1">
                        <p className="text-sm text-muted-foreground">שכר לשעה</p>
                        <p className="font-medium">₪{employee.hourly_rate}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Emergency Contact */}
              {(employee.emergency_contact || employee.emergency_phone) && (
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-right">
                      <Phone className="h-5 w-5" />
                      איש קשר לחירום
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {employee.emergency_contact && (
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <User className="h-5 w-5 text-primary flex-shrink-0" />
                        <div className="text-right flex-1">
                          <p className="text-sm text-muted-foreground">שם איש קשר</p>
                          <p className="font-medium">{employee.emergency_contact}</p>
                        </div>
                      </div>
                    )}

                    {employee.emergency_phone && (
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                        <div className="text-right flex-1">
                          <p className="text-sm text-muted-foreground">טלפון חירום</p>
                          <p className="font-medium" dir="ltr">{employee.emergency_phone}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Weekly Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <EmployeeScheduleView employee={employee} />
          </TabsContent>

          {/* My Shifts Tab */}
          <TabsContent value="shifts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-right">
                  <Clock className="h-5 w-5" />
                  המשמרות שלי ({shifts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {shifts.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">אין משמרות קרובות</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {shifts.map((shift) => (
                      <div key={shift.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-primary">
                              {format(new Date(shift.shift_date), 'dd')}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(shift.shift_date), 'MMM', { locale: he })}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{shift.start_time} - {shift.end_time}</p>
                            <p className="text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3 inline ml-1" />
                              {shift.branch_name}
                            </p>
                            {shift.notes && (
                              <p className="text-xs text-muted-foreground mt-1">{shift.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(shift.status)}>
                            {shift.status}
                          </Badge>
                          <Badge variant="outline">
                            {shift.shift_type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Available Shifts Tab */}
          <TabsContent value="available" className="space-y-6">
            {activeToken && (
              <Card className="border-blue-200 bg-blue-50 mb-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-right text-blue-800">
                    <CheckCircle className="h-5 w-5" />
                    יש לך טוקן פעיל להגשת משמרות!
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-right space-y-2">
                    <p className="text-sm text-blue-700">
                      טוקן פעיל לתקופה: {format(new Date(activeToken.week_start_date), 'dd/MM/yyyy')} - {format(new Date(activeToken.week_end_date), 'dd/MM/yyyy')}
                    </p>
                    <p className="text-sm text-blue-700">
                      תוקף הטוקן עד: {format(new Date(activeToken.expires_at), 'dd/MM/yyyy HH:mm')}
                    </p>
                    <div className="pt-2">
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => {
                          window.open(`/public/shift-submission/${activeToken.token}`, '_blank');
                        }}
                      >
                        <Send className="h-4 w-4 ml-2" />
                        כניסה לטופס הגשת משמרות
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-right">
                  <Send className="h-5 w-5" />
                  משמרות פתוחות להגשה ({tokenAvailableShifts.length || availableShifts.length})
                </CardTitle>
                {activeToken && (
                  <p className="text-sm text-muted-foreground text-right">
                    המשמרות להלן זמינות להגשה באמצעות הטוקן הפעיל שלך
                  </p>
                )}
              </CardHeader>
              <CardContent>
                {(tokenAvailableShifts.length > 0 ? tokenAvailableShifts : availableShifts).length === 0 ? (
                  <div className="text-center py-8">
                    <Send className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {activeToken ? 'אין משמרות זמינות לטוקן הפעיל' : 'אין משמרות פתוחות כרגע'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {activeToken ? 'משמרות יופיעו כאן כשיהיו זמינות לתקופת הטוקן' : 'משמרות פתוחות יופיעו כאן כשיהיו זמינות'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(tokenAvailableShifts.length > 0 ? tokenAvailableShifts : availableShifts).map((shift) => (
                      <div key={shift.id} className={`p-4 border rounded-lg ${activeToken ? 'border-blue-200 bg-blue-50/30' : ''}`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-right flex-1">
                            <h4 className="font-medium text-lg">{shift.shift_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              יום {getDayName(shift.day_of_week)} • {shift.start_time} - {shift.end_time}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3 inline ml-1" />
                              {shift.branches?.name || shift.branch_name}
                            </p>
                          </div>
                          <div className="text-left">
                            <Badge variant="outline">
                              {shift.current_assignments}/{shift.required_employees} עובדים
                             </Badge>
                             {activeToken && (
                               <Badge className="bg-blue-100 text-blue-800 mr-2">
                                 זמין לטוקן
                               </Badge>
                             )}
                           </div>
                         </div>
                         
                         {/* Add shift selection for active token */}
                         <div className="text-sm text-muted-foreground space-y-1">
                           <p><strong>סוג משמרת:</strong> {shift.shift_type}</p>
                           <p><strong>דרוש:</strong> {shift.required_employees} עובדים</p>
                           {shift.notes && <p><strong>הערות:</strong> {shift.notes}</p>}
                           {activeToken && (
                             <div className="mt-3 p-2 bg-blue-100 rounded text-blue-800">
                               <p className="text-xs">
                                 ⭐ משמרת זו זמינה להגשה באמצעות הטוקן הפעיל שלך
                               </p>
                             </div>
                           )}
                         </div>
                         
                         <div className="flex items-center justify-between mt-3">
                           <Button 
                             size="sm" 
                             onClick={() => handleShiftApplication(shift.id)}
                             disabled={submittingShift === shift.id || !!activeToken}
                             className="mr-2"
                             variant={activeToken ? "outline" : "default"}
                           >
                             {submittingShift === shift.id ? (
                               <>
                                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                                 מגיש...
                               </>
                             ) : activeToken ? (
                               <>
                                 <Send className="h-4 w-4 ml-2" />
                                 השתמש בטוקן
                               </>
                             ) : (
                               <>
                                 <Send className="h-4 w-4 ml-2" />
                                 הגש בקשה
                               </>
                             )}
                           </Button>
                         </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    מסמכים ({documents.length})
                  </div>
                  <label htmlFor="fileUploadPersonal" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm">
                      <Upload className="h-4 w-4" />
                      העלה קובץ אישי
                    </div>
                    <input
                      id="fileUploadPersonal"
                      type="file"
                      className="hidden"
                      accept="*/*"
                      onChange={(e) => {
                        handleDocumentUpload(e, false);
                      }}
                    />
                  </label>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {documents.length === 0 && files.filter(f => f.approval_status === 'pending').length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">אין מסמכים זמינים</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Show pending files */}
                    {files.filter(f => f.approval_status === 'pending').length > 0 && (
                      <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                        <h4 className="font-medium text-yellow-800 mb-3 text-right">קבצים ממתינים לאישור ({files.filter(f => f.approval_status === 'pending').length})</h4>
                        <div className="space-y-2">
                          {files.filter(f => f.approval_status === 'pending').map((file) => (
                            <div key={file.id} className="flex items-center justify-between p-3 bg-white rounded border">
                              <div className="flex items-center gap-3">
                                <Upload className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                                <div className="text-right">
                                  <p className="font-medium">{file.file_name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    הועלה ב-{format(new Date(file.created_at), 'dd/MM/yyyy HH:mm')}
                                  </p>
                                </div>
                              </div>
                              <Badge className="bg-yellow-100 text-yellow-800">
                                ממתין לאישור
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Show approved documents */}
                    {documents.length > 0 && (
                      <div className="space-y-3">
                        {documents.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                              <div className="text-right">
                                <p className="font-medium">{doc.document_name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {doc.document_type} • {format(new Date(doc.created_at), 'dd/MM/yyyy')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(doc.status)}>
                                {doc.status}
                              </Badge>
                              {doc.file_url && (
                                <Button size="sm" variant="outline" asChild>
                                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                                    צפייה
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                   </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-right">
                  <FolderOpen className="h-5 w-5" />
                  קבצים אישיים ({files.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {files.length === 0 ? (
                  <div className="text-center py-8">
                    <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">אין קבצים זמינים</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FolderOpen className="h-5 w-5 text-primary flex-shrink-0" />
                          <div className="text-right">
                            <p className="font-medium">{file.file_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {file.file_type} • {format(new Date(file.created_at), 'dd/MM/yyyy')}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <a href={file.file_path} target="_blank" rel="noopener noreferrer">
                            הורדה
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-right">
                  <Bell className="h-5 w-5" />
                  התראות ({notifications.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">אין התראות חדשות</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`p-4 border rounded-lg ${
                          notification.is_read ? 'bg-background' : 'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <div className="text-right">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{notification.title}</h4>
                              {!notification.is_read && (
                                <Badge variant="default" className="text-xs">
                                  חדש
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(notification.created_at), 'dd/MM/yyyy HH:mm')}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {notification.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Active Tokens Tab */}
          <TabsContent value="tokens" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-right">
                  <CheckCircle className="h-5 w-5" />
                  טוקנים פעילים ({activeTokens.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeTokens.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">אין טוקנים פעילים כרגע</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      טוקנים לשליחת משמרות יופיעו כאן כשיהיו זמינים
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeTokens.map((token) => (
                      <div key={token.id} className="p-4 border rounded-lg bg-green-50 border-green-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-right flex-1">
                            <h4 className="font-medium text-lg">טוקן הגשת משמרות</h4>
                            <p className="text-sm text-muted-foreground">
                              תקף מ-{format(new Date(token.week_start_date), 'dd/MM/yyyy')} 
                              {' '}עד{' '}
                              {format(new Date(token.week_end_date), 'dd/MM/yyyy')}
                            </p>
                          </div>
                          <div className="text-left">
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              פעיל
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">תוקף עד:</span>
                            <span className="font-medium">
                              {format(new Date(token.expires_at), 'dd/MM/yyyy HH:mm')}
                            </span>
                          </div>
                          
                          {token.max_submissions && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">מגבלת הגשות:</span>
                              <span className="font-medium">
                                {token.current_submissions || 0}/{token.max_submissions}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">סוג טוקן:</span>
                            <span className="font-medium">
                              {token.employee_id ? 'אישי' : 'כללי'}
                            </span>
                          </div>
                          
                          <div className="pt-2 border-t">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm text-muted-foreground">קוד טוקן:</span>
                              <div className="flex items-center gap-2">
                                <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                                  {token.token}
                                </code>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    navigator.clipboard.writeText(token.token);
                                    toast({
                                      title: 'הועתק!',
                                      description: 'קוד הטוקן הועתק ללוח',
                                    });
                                  }}
                                >
                                  העתק
                                </Button>
                              </div>
                            </div>
                            
                            <div className="flex justify-center">
                              <Button 
                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => {
                                  window.open(`/public/shift-submission/${token.token}`, '_blank');
                                }}
                              >
                                <Send className="h-4 w-4 ml-2" />
                                כניסה לטופס הגשת משמרות
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};