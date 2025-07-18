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
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

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
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [availableShifts, setAvailableShifts] = useState<AvailableShift[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [files, setFiles] = useState<EmployeeFile[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingShift, setSubmittingShift] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const { toast } = useToast();

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

        // Fetch available shifts for next week (shifts that employee can apply for)
        const nextWeekStart = new Date();
        nextWeekStart.setDate(nextWeekStart.getDate() + 1);
        const nextWeekEnd = new Date();
        nextWeekEnd.setDate(nextWeekEnd.getDate() + 7);

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

        // Fetch documents
        const { data: docsData } = await supabase
          .from('employee_documents')
          .select('*')
          .eq('employee_id', employeeId)
          .order('created_at', { ascending: false })
          .limit(20);

        if (docsData) {
          setDocuments(docsData);
        }

        // Fetch files
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
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 gap-1">
            <TabsTrigger value="profile" className="text-xs sm:text-sm">פרטים אישיים</TabsTrigger>
            <TabsTrigger value="shifts" className="text-xs sm:text-sm">המשמרות שלי</TabsTrigger>
            <TabsTrigger value="available" className="text-xs sm:text-sm">משמרות פתוחות</TabsTrigger>
            <TabsTrigger value="documents" className="text-xs sm:text-sm">מסמכים</TabsTrigger>
            <TabsTrigger value="files" className="text-xs sm:text-sm">קבצים</TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs sm:text-sm">התראות</TabsTrigger>
          </TabsList>

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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-right">
                  <Send className="h-5 w-5" />
                  משמרות פתוחות להגשה ({availableShifts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {availableShifts.length === 0 ? (
                  <div className="text-center py-8">
                    <Send className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">אין משמרות פתוחות כרגע</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      משמרות פתוחות יופיעו כאן כשיהיו זמינות
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {availableShifts.map((shift) => (
                      <div key={shift.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-right flex-1">
                            <h4 className="font-medium text-lg">{shift.shift_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              יום {getDayName(shift.day_of_week)} • {shift.start_time} - {shift.end_time}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3 inline ml-1" />
                              {shift.branch_name}
                            </p>
                          </div>
                          <div className="text-left">
                            <Badge variant="outline">
                              {shift.current_assignments}/{shift.required_employees} עובדים
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            סוג משמרת: {shift.shift_type}
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => handleShiftApplication(shift.id)}
                            disabled={submittingShift === shift.id}
                            className="mr-2"
                          >
                            {submittingShift === shift.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                                מגיש...
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
                <CardTitle className="flex items-center gap-2 text-right">
                  <FileText className="h-5 w-5" />
                  מסמכים ({documents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">אין מסמכים זמינים</p>
                  </div>
                ) : (
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
        </Tabs>
      </div>
    </div>
  );
};