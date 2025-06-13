import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/hooks/useBusiness';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Clock, 
  Building, 
  FileText, 
  MessageSquare, 
  DollarSign, 
  ArrowLeft, 
  Edit,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { EmployeeEditButton } from './edit/EmployeeEditButton';
import { EmployeeNotes } from './EmployeeNotes';
import { EmployeeDocuments } from './EmployeeDocuments';
import { EmployeeBranchAssignments } from './EmployeeBranchAssignments';
import { SalaryHistory } from './SalaryHistory';
import { RecentAttendance } from './RecentAttendance';
import { ShiftSubmissionHistory } from './ShiftSubmissionHistory';
import type { Employee, EmployeeType } from '@/types/supabase';

interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const getAvailableTabs = (employee: Employee) => {
  const tabs = [
    { id: 'overview', label: 'סקירה כללית', icon: User },
    { id: 'notes', label: 'הערות', icon: MessageSquare },
    { id: 'documents', label: 'מסמכים', icon: FileText },
    { id: 'branches', label: 'סניפים ותפקידים', icon: Building },
    { id: 'attendance', label: 'נוכחות', icon: Clock },
    { id: 'shifts', label: 'משמרות', icon: Calendar },
    { id: 'salary', label: 'שכר', icon: DollarSign },
  ];
  return tabs;
};

export const EmployeeProfilePage: React.FC = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const { businessId } = useBusiness();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (businessId && employeeId) {
      fetchEmployee();
    }
  }, [businessId, employeeId]);

  const fetchEmployee = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', employeeId)
        .eq('business_id', businessId)
        .single();

      if (error) {
        console.error('Error fetching employee:', error);
        toast({
          title: 'שגיאה',
          description: 'Failed to load employee data.',
          variant: 'destructive',
        });
        return;
      }

      setEmployee(data);
    } catch (error) {
      console.error('Error fetching employee:', error);
      toast({
        title: 'שגיאה',
        description: 'Failed to load employee data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate('/modules/employees');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>טוען פרופיל עובד...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!employee) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>פרופיל עובד לא נמצא</CardTitle>
        </CardHeader>
        <CardContent>
          <p>העובד המבוקש לא נמצא.</p>
        </CardContent>
      </Card>
    );
  }

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

  const availableTabs = getAvailableTabs(employee!);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5 cursor-pointer" onClick={handleGoBack} />
            פרופיל עובד
          </CardTitle>
          <EmployeeEditButton employee={employee} onSuccess={fetchEmployee} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="md:flex gap-4">
          <div className="md:w-1/3">
            <div className="bg-gray-100 rounded-md p-4">
              <div className="text-lg font-semibold">{employee.first_name} {employee.last_name}</div>
              <div className="text-sm text-gray-500">
                {employee.is_active ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    פעיל
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    לא פעיל
                  </Badge>
                )}
              </div>
              {employee.employee_id && (
                <div className="flex items-center gap-2 mt-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>{employee.employee_id}</span>
                </div>
              )}
              {employee.phone && (
                <div className="flex items-center gap-2 mt-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{employee.phone}</span>
                </div>
              )}
              {employee.email && (
                <div className="flex items-center gap-2 mt-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{employee.email}</span>
                </div>
              )}
              {employee.address && (
                <div className="flex items-center gap-2 mt-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{employee.address}</span>
                </div>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>
                  {employee.hire_date ? `התחיל ב- ${new Date(employee.hire_date).toLocaleDateString('he-IL')}` : 'לא הוגדר תאריך התחלה'}
                </span>
              </div>
              <Badge variant={getEmployeeTypeVariant(employee.employee_type)} className="mt-4">
                {getEmployeeTypeLabel(employee.employee_type)}
              </Badge>
            </div>
          </div>

          <div className="md:w-2/3">
            <Tabs defaultValue={activeTab} className="w-full">
              <TabsList>
                {availableTabs.map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id} onClick={() => setActiveTab(tab.id)}>
                    <tab.icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value="overview">
                <div className="space-y-4">
                  <p>סקירה כללית של פרטי העובד.</p>
                  {employee.notes && (
                    <div>
                      <div className="text-sm font-semibold">הערות:</div>
                      <div className="text-sm">{employee.notes}</div>
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="notes">
                <EmployeeNotes employeeId={employeeId} />
              </TabsContent>
              <TabsContent value="documents">
                <EmployeeDocuments employeeId={employeeId} />
              </TabsContent>
              <TabsContent value="branches">
                <EmployeeBranchAssignments employeeId={employeeId} />
              </TabsContent>
              <TabsContent value="attendance">
                <RecentAttendance employeeId={employeeId} />
              </TabsContent>
              <TabsContent value="shifts">
                <ShiftSubmissionHistory employeeId={employeeId} />
              </TabsContent>
              <TabsContent value="salary">
                <SalaryHistory employeeId={employeeId} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
