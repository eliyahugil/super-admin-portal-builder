
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useEmployeesData } from '@/hooks/useRealData';
import { useBusiness } from '@/hooks/useBusiness';
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
  ArrowRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Employee {
  id: string;
  employee_id: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  employee_type: string;
  is_active: boolean;
  hire_date: string | null;
  weekly_hours_required: number | null;
  notes: string | null;
  main_branch?: { name: string } | null;
}

export const EmployeeProfilePage: React.FC = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { businessId } = useBusiness();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentDocuments, setRecentDocuments] = useState<any[]>([]);
  const [recentAttendance, setRecentAttendance] = useState<any[]>([]);

  useEffect(() => {
    if (employeeId && businessId) {
      fetchEmployeeDetails();
      fetchRecentDocuments();
      fetchRecentAttendance();
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

  const fetchRecentDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('employee_documents')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false })
        .limit(3);

      if (!error && data) {
        setRecentDocuments(data);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const fetchRecentAttendance = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('employee_id', employeeId)
        .order('recorded_at', { ascending: false })
        .limit(5);

      if (!error && data) {
        setRecentAttendance(data);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const getEmployeeTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      permanent: 'קבוע',
      temporary: 'זמני',
      youth: 'נוער',
      contractor: 'קבלן',
    };
    return types[type] || type;
  };

  const getEmployeeTypeVariant = (type: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      permanent: 'default',
      temporary: 'secondary',
      youth: 'outline',
      contractor: 'destructive',
    };
    return variants[type] || 'default';
  };

  const handleWhatsApp = () => {
    if (employee?.phone) {
      const message = encodeURIComponent(`שלום ${employee.first_name}, מערכת ניהול העובדים`);
      const phoneNumber = employee.phone.replace(/[^\d]/g, '');
      window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
    }
  };

  const handleEdit = () => {
    toast({
      title: 'עריכה',
      description: 'פונקציונליות עריכה תמומש בקרוב',
    });
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
            {employee.first_name} {employee.last_name}
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
        <Button onClick={handleEdit} className="flex items-center gap-2">
          <Edit className="h-4 w-4" />
          ערוך פרטים
        </Button>
        {employee.phone && (
          <Button
            onClick={handleWhatsApp}
            variant="outline"
            className="flex items-center gap-2 text-green-600 border-green-200 hover:bg-green-50"
          >
            <MessageCircle className="h-4 w-4" />
            שלח וואטסאפ
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                פרטים אישיים
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div className="flex items-center gap-3 md:col-span-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500">כתובת</div>
                      <div className="font-medium">{employee.address}</div>
                    </div>
                  </div>
                )}
              </div>
              
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
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="space-y-6">
          {/* Recent Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                מסמכים אחרונים
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentDocuments.length > 0 ? (
                <div className="space-y-3">
                  {recentDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{doc.document_name}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(doc.created_at).toLocaleDateString('he-IL')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 text-sm">
                  אין מסמכים
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Attendance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                נוכחות אחרונה
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentAttendance.length > 0 ? (
                <div className="space-y-3">
                  {recentAttendance.map((attendance) => (
                    <div key={attendance.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{attendance.action}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(attendance.recorded_at).toLocaleString('he-IL')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 text-sm">
                  אין רישומי נוכחות
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
