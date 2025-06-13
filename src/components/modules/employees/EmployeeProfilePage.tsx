import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useBusiness } from '@/hooks/useBusiness';
import { useBusinessModuleEnabled } from '@/hooks/useBusinessModuleEnabled';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Building, 
  Calendar, 
  Edit, 
  MessageCircle, 
  FileText, 
  Clock,
  ArrowRight,
  StickyNote,
  DollarSign,
  History,
  Users
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ShiftSubmissionHistory } from './ShiftSubmissionHistory';
import { EmployeeDocuments } from './EmployeeDocuments';
import { EmployeeNotes } from './EmployeeNotes';
import { SalaryHistory } from './SalaryHistory';
import { WeeklyTokenButton } from './WeeklyTokenButton';
import { EmployeeEditProfileButton } from './edit/EmployeeEditProfileButton';
import { EmployeeBranchAssignments } from './EmployeeBranchAssignments';
import { EmployeeContacts } from './EmployeeContacts';
import { RecentAttendance } from './RecentAttendance';
import { CloneEmployeeDialog } from './CloneEmployeeDialog';
import { useEmployeeAttendance } from '@/hooks/useEmployeeAttendance';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import type { EmployeeType } from '@/types/supabase';

interface Employee {
  id: string;
  business_id: string;
  employee_id: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  employee_type: EmployeeType;
  is_active: boolean;
  hire_date: string | null;
  weekly_hours_required: number | null;
  notes: string | null;
  main_branch_id: string | null;
  main_branch?: { name: string } | null;
}

export const EmployeeProfilePage: React.FC = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { businessId } = useBusiness();
  const { isModuleEnabled } = useBusinessModuleEnabled();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: attendanceLogs, loading: attendanceLoading } = useEmployeeAttendance(employee?.id || '');

  useEffect(() => {
    if (employeeId && businessId) {
      fetchEmployeeDetails();
    }
  }, [employeeId, businessId]);

  const fetchEmployeeDetails = async () => {
    try {
      console.log('=== FETCHING EMPLOYEE DETAILS ===');
      console.log('Employee ID:', employeeId);
      console.log('Business ID:', businessId);
      
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          main_branch:branches(name)
        `)
        .eq('id', employeeId)
        .single();

      if (error) {
        console.error('Error fetching employee:', error);
        toast({
          title: 'שגיאה',
          description: 'לא ניתן לטעון את פרטי העובד',
          variant: 'destructive',
        });
        return;
      }

      console.log('Employee data fetched:', data);
      setEmployee(data);
    } catch (error) {
      console.error('Exception in fetchEmployeeDetails:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeTypeLabel = (type: EmployeeType) => {
    const types: Record<EmployeeType, string> = {
      permanent: 'קבוע',
      temporary: 'זמני',
      youth: 'נוער',
      contractor: 'קבלן',
    };
    return types[type] || type;
  };

  const getEmployeeTypeVariant = (type: EmployeeType) => {
    const variants: Record<EmployeeType, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      permanent: 'default',
      temporary: 'secondary',
      youth: 'outline',
      contractor: 'destructive',
    };
    return variants[type] || 'default';
  };

  const handleWhatsApp = async () => {
    if (!employee?.phone) {
      toast({
        title: 'שגיאה',
        description: 'לא נמצא מספר טלפון',
        variant: 'destructive',
      });
      return;
    }

    try {
      const message = `שלום ${employee.first_name}, מערכת ניהול העובדים`;
      const cleanedPhone = employee.phone.replace(/[^0-9]/g, "");
      const formattedPhone = cleanedPhone.startsWith('972') ? cleanedPhone : `972${cleanedPhone.startsWith('0') ? cleanedPhone.slice(1) : cleanedPhone}`;
      const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
      
      window.open(url, '_blank');
      
      toast({
        title: 'נפתח WhatsApp',
        description: `הודעה מוכנה ל-${employee.first_name}`,
      });
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לפתוח WhatsApp',
        variant: 'destructive',
      });
    }
  };

  // Dynamic tab configuration based on enabled modules
  const getAvailableTabs = () => {
    const tabs = [
      { id: 'shifts', label: 'משמרות', icon: History, component: 'shifts' },
      { id: 'attendance', label: 'נוכחות', icon: Clock, component: 'attendance' },
    ];

    // Add conditional tabs based on module enablement
    if (isModuleEnabled('employee_contacts')) {
      tabs.push({ id: 'contacts', label: 'פניות', icon: Users, component: 'contacts' });
    }

    if (isModuleEnabled('employee_documents')) {
      tabs.push({ id: 'documents', label: 'מסמכים', icon: FileText, component: 'documents' });
    }

    if (isModuleEnabled('employee_notes')) {
      tabs.push({ id: 'notes', label: 'הערות', icon: StickyNote, component: 'notes' });
    }

    if (isModuleEnabled('salary_management')) {
      tabs.push({ id: 'salary', label: 'שכר', icon: DollarSign, component: 'salary' });
    }

    return tabs;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <div className="text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">לא נמצא עובד</h3>
          <p className="text-gray-600 mb-4">העובד המבוקש לא נמצא במערכת</p>
          <Button onClick={() => navigate('/modules/employees')}>
            <ArrowRight className="h-4 w-4 ml-2" />
            חזור לרשימת עובדים
          </Button>
        </div>
      </div>
    );
  }

  const employeeName = `${employee.first_name} ${employee.last_name}`;
  const availableTabs = getAvailableTabs();

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Button
            variant="outline"
            onClick={() => navigate('/modules/employees')}
            className="mb-4"
          >
            <ArrowRight className="h-4 w-4 ml-2" />
            חזור לרשימת עובדים
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            {employeeName}
          </h1>
          <p className="text-gray-600">
            {employee.employee_id && `מספר עובד: ${employee.employee_id}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={getEmployeeTypeVariant(employee.employee_type)}>
            {getEmployeeTypeLabel(employee.employee_type)}
          </Badge>
          {!employee.is_active && (
            <Badge variant="outline" className="text-red-600 border-red-200">
              לא פעיל
            </Badge>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <EmployeeEditProfileButton employee={employee} onUpdate={fetchEmployeeDetails} />
        <CloneEmployeeDialog employee={employee} />
        {employee.phone && (
          <>
            <Button
              onClick={handleWhatsApp}
              variant="outline"
              className="flex items-center gap-2 text-green-600 border-green-200 hover:bg-green-50"
            >
              <MessageCircle className="h-4 w-4" />
              שלח הודעה
            </Button>
            <WeeklyTokenButton
              phone={employee.phone}
              employeeName={employeeName}
              employeeId={employee.id}
              compact={true}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                פרטים אישיים
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {employee.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500">טלפון</div>
                    <div className="font-medium">{employee.phone}</div>
                  </div>
                </div>
              )}
              
              {employee.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500">אימייל</div>
                    <div className="font-medium">{employee.email}</div>
                  </div>
                </div>
              )}
              
              {employee.main_branch && (
                <div className="flex items-center gap-3">
                  <Building className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500">סניף ראשי</div>
                    <div className="font-medium">{employee.main_branch.name}</div>
                  </div>
                </div>
              )}
              
              {employee.hire_date && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500">תאריך התחלה</div>
                    <div className="font-medium">
                      {new Date(employee.hire_date).toLocaleDateString('he-IL')}
                    </div>
                  </div>
                </div>
              )}
              
              {employee.address && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500">כתובת</div>
                    <div className="font-medium">{employee.address}</div>
                  </div>
                </div>
              )}
              
              {employee.weekly_hours_required && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-600 font-medium">
                    שעות שבועיות נדרשות: {employee.weekly_hours_required}
                  </div>
                </div>
              )}
              
              {employee.notes && (
                <div className="mt-4">
                  <div className="text-sm text-gray-500 mb-2">הערות</div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    {employee.notes}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Branch Assignments Section */}
          <div className="mt-6">
            <EmployeeBranchAssignments employeeId={employee.id} />
          </div>

          {/* Weekly Token Section */}
          {employee.phone && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  הגשת משמרות שבועית
                </CardTitle>
              </CardHeader>
              <CardContent>
                <WeeklyTokenButton
                  phone={employee.phone}
                  employeeName={employeeName}
                  employeeId={employee.id}
                />
              </CardContent>
            </Card>
          )}

          {/* Recent Attendance */}
          <div className="mt-6">
            <RecentAttendance employeeId={employee.id} />
          </div>
        </div>

        {/* Main Content with Dynamic Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="shifts" className="w-full">
            <TabsList className={`grid w-full grid-cols-${Math.min(availableTabs.length, 6)}`}>
              {availableTabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <div className="mt-6">
              <TabsContent value="shifts" className="mt-0">
                <ShiftSubmissionHistory employeeId={employee.id} />
              </TabsContent>
              
              <TabsContent value="attendance" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      היסטוריית נוכחות
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {attendanceLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : attendanceLogs.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-right p-2">תאריך</th>
                              <th className="text-right p-2">פעולה</th>
                              <th className="text-right p-2">שעה</th>
                              <th className="text-right p-2">סניף</th>
                              <th className="text-right p-2">הערות</th>
                            </tr>
                          </thead>
                          <tbody>
                            {attendanceLogs.map((log) => (
                              <tr key={log.id} className="border-b hover:bg-gray-50">
                                <td className="p-2">
                                  {format(new Date(log.recorded_at), 'dd/MM/yyyy', { locale: he })}
                                </td>
                                <td className="p-2">
                                  <span className={`px-2 py-1 rounded text-xs ${
                                    log.action === 'check_in' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {log.action === 'check_in' ? 'כניסה' : 'יציאה'}
                                  </span>
                                </td>
                                <td className="p-2">
                                  {format(new Date(log.recorded_at), 'HH:mm', { locale: he })}
                                </td>
                                <td className="p-2">
                                  {log.branch_id || 'לא צוין'}
                                </td>
                                <td className="p-2">
                                  {log.notes || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">אין רישומי נוכחות</h3>
                        <p className="text-gray-600">לא נמצאו רישומי נוכחות עבור העובד</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {isModuleEnabled('employee_contacts') && (
                <TabsContent value="contacts" className="mt-0">
                  <EmployeeContacts 
                    employeeId={employee.id} 
                    employeeName={employeeName}
                  />
                </TabsContent>
              )}
              
              {isModuleEnabled('employee_documents') && (
                <TabsContent value="documents" className="mt-0">
                  <EmployeeDocuments 
                    employeeId={employee.id} 
                    employeeName={employeeName}
                  />
                </TabsContent>
              )}
              
              {isModuleEnabled('employee_notes') && (
                <TabsContent value="notes" className="mt-0">
                  <EmployeeNotes 
                    employeeId={employee.id} 
                    employeeName={employeeName}
                  />
                </TabsContent>
              )}
              
              {isModuleEnabled('salary_management') && (
                <TabsContent value="salary" className="mt-0">
                  <SalaryHistory 
                    employeeId={employee.id} 
                    employeeName={employeeName}
                  />
                </TabsContent>
              )}
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
