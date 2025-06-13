
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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
  Activity,
  Token,
  Settings,
  BarChart3
} from 'lucide-react';
import { EmployeeNotes } from '../EmployeeNotes';
import { EmployeeDocuments } from '../EmployeeDocuments';
import { EmployeeBranchAssignments } from '../EmployeeBranchAssignments';
import { SalaryHistory } from '../SalaryHistory';
import { RecentAttendance } from '../RecentAttendance';
import { ShiftSubmissionHistory } from '../ShiftSubmissionHistory';
import { EmployeeTokenManager } from '../EmployeeTokenManager';
import { EmployeeCustomFields } from '../EmployeeCustomFields';
import type { Employee } from '@/types/supabase';

interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  badge?: string | number;
  description?: string;
}

interface EmployeeProfileTabsProps {
  employee: Employee;
  employeeId: string;
}

const getAvailableTabs = (employee: Employee): TabItem[] => {
  // Calculate badges for each tab
  const notesCount = employee.employee_notes?.length || 0;
  const documentsCount = employee.employee_documents?.length || 0;
  const branchAssignments = employee.branch_assignments?.filter(ba => ba.is_active).length || 0;
  const activeTokens = employee.weekly_tokens?.filter(t => t.is_active).length || 0;

  return [
    { 
      id: 'overview', 
      label: 'סקירה כללית', 
      icon: User,
      description: 'מידע כללי על העובד'
    },
    { 
      id: 'notes', 
      label: 'הערות', 
      icon: MessageSquare,
      badge: notesCount > 0 ? notesCount : undefined,
      description: 'הערות ותיעוד על העובד'
    },
    { 
      id: 'documents', 
      label: 'מסמכים', 
      icon: FileText,
      badge: documentsCount > 0 ? documentsCount : undefined,
      description: 'מסמכים וקבצים של העובד'
    },
    { 
      id: 'branches', 
      label: 'סניפים ותפקידים', 
      icon: Building,
      badge: branchAssignments > 0 ? branchAssignments : undefined,
      description: 'הקצאות סניפים ותפקידים'
    },
    { 
      id: 'attendance', 
      label: 'נוכחות', 
      icon: Clock,
      description: 'היסטוריית נוכחות ושעות עבודה'
    },
    { 
      id: 'shifts', 
      label: 'משמרות', 
      icon: Calendar,
      description: 'הגשות משמרות והיסטוריה'
    },
    { 
      id: 'tokens', 
      label: 'טוקנים', 
      icon: Token as any,
      badge: activeTokens > 0 ? activeTokens : undefined,
      description: 'ניהול טוקני הגשת משמרות'
    },
    { 
      id: 'salary', 
      label: 'שכר', 
      icon: DollarSign,
      description: 'היסטוריית שכר ועדכונים'
    },
    { 
      id: 'custom', 
      label: 'שדות מותאמים', 
      icon: Settings,
      description: 'מידע נוסף ושדות מותאמים אישית'
    },
    { 
      id: 'analytics', 
      label: 'ניתוחים', 
      icon: BarChart3,
      description: 'סטטיסטיקות וניתוחי ביצועים'
    },
  ];
};

export const EmployeeProfileTabs: React.FC<EmployeeProfileTabsProps> = ({ 
  employee, 
  employeeId 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const availableTabs = getAvailableTabs(employee);
  const employeeName = `${employee.first_name} ${employee.last_name}`;

  return (
    <div className="md:w-2/3">
      <Tabs defaultValue={activeTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
          {availableTabs.map((tab) => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id} 
              onClick={() => setActiveTab(tab.id)}
              className="relative"
              title={tab.description}
            >
              <div className="flex items-center space-x-1">
                <tab.icon className="h-4 w-4" />
                <span className="hidden lg:inline">{tab.label}</span>
                {tab.badge && (
                  <Badge variant="secondary" className="h-4 min-w-4 text-xs">
                    {tab.badge}
                  </Badge>
                )}
              </div>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab Contents */}
        <TabsContent value="overview" className="mt-6">
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">סקירה כללית</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">שם מלא:</span>
                    <span>{employeeName}</span>
                  </div>
                  {employee.employee_id && (
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">מזהה עובד:</span>
                      <span>{employee.employee_id}</span>
                    </div>
                  )}
                  {employee.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">טלפון:</span>
                      <span>{employee.phone}</span>
                    </div>
                  )}
                  {employee.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">אימייל:</span>
                      <span>{employee.email}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  {employee.hire_date && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">תאריך התחלה:</span>
                      <span>{new Date(employee.hire_date).toLocaleDateString('he-IL')}</span>
                    </div>
                  )}
                  {employee.weekly_hours_required && (
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">שעות שבועיות:</span>
                      <span>{employee.weekly_hours_required}</span>
                    </div>
                  )}
                  {employee.address && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">כתובת:</span>
                      <span>{employee.address}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {employee.notes && (
                <div className="mt-4 p-4 bg-white rounded border">
                  <div className="text-sm font-semibold mb-2">הערות כלליות:</div>
                  <div className="text-sm text-gray-700">{employee.notes}</div>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {employee.employee_notes?.length || 0}
                </div>
                <div className="text-sm text-blue-600">הערות</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {employee.employee_documents?.length || 0}
                </div>
                <div className="text-sm text-green-600">מסמכים</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {employee.branch_assignments?.filter(ba => ba.is_active).length || 0}
                </div>
                <div className="text-sm text-orange-600">סניפים פעילים</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {employee.weekly_tokens?.filter(t => t.is_active).length || 0}
                </div>
                <div className="text-sm text-purple-600">טוקנים פעילים</div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notes">
          <EmployeeNotes employeeId={employeeId} employeeName={employeeName} />
        </TabsContent>

        <TabsContent value="documents">
          <EmployeeDocuments employeeId={employeeId} employeeName={employeeName} />
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

        <TabsContent value="tokens">
          <EmployeeTokenManager employeeId={employeeId} employeeName={employeeName} />
        </TabsContent>

        <TabsContent value="salary">
          <SalaryHistory employeeId={employeeId} employeeName={employeeName} />
        </TabsContent>

        <TabsContent value="custom">
          <EmployeeCustomFields employeeId={employeeId} />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">ניתוחים וסטטיסטיקות</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded border">
                <h4 className="font-medium mb-2">נוכחות חודשית</h4>
                <div className="text-2xl font-bold text-green-600">95%</div>
                <div className="text-sm text-gray-500">ממוצע 3 חודשים אחרונים</div>
              </div>
              <div className="bg-white p-4 rounded border">
                <h4 className="font-medium mb-2">הגשות בזמן</h4>
                <div className="text-2xl font-bold text-blue-600">87%</div>
                <div className="text-sm text-gray-500">משמרות הוגשו בזמן</div>
              </div>
              <div className="bg-white p-4 rounded border">
                <h4 className="font-medium mb-2">שעות עבודה</h4>
                <div className="text-2xl font-bold text-purple-600">
                  {employee.weekly_hours_required || 0}
                </div>
                <div className="text-sm text-gray-500">שעות שבועיות נדרשות</div>
              </div>
              <div className="bg-white p-4 rounded border">
                <h4 className="font-medium mb-2">משמרות חודשיות</h4>
                <div className="text-2xl font-bold text-orange-600">18</div>
                <div className="text-sm text-gray-500">ממוצע משמרות לחודש</div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
