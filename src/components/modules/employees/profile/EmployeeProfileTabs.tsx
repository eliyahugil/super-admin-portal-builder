
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, FileText, Calendar, Clock, DollarSign, AlertTriangle, Briefcase } from 'lucide-react';
import { ShiftSubmissionHistory } from '../ShiftSubmissionHistory';
import type { Employee } from '@/types/supabase';

interface EmployeeProfileTabsProps {
  employee: Employee;
  employeeId: string;
}

export const EmployeeProfileTabs: React.FC<EmployeeProfileTabsProps> = ({ employee, employeeId }) => {
  const [activeTab, setActiveTab] = useState('overview');

  console.log('🏷️ EmployeeProfileTabs - Props:', {
    employeeId,
    employeeName: `${employee.first_name} ${employee.last_name}`,
    activeTab
  });

  return (
    <div className="flex-1">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>סקירה</span>
          </TabsTrigger>
          <TabsTrigger value="shifts" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>משמרות</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>מסמכים</span>
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>הערות</span>
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            <span>שיוכים</span>
          </TabsTrigger>
          <TabsTrigger value="salary" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span>שכר</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  פרטים כלליים
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">סוג עובד:</span>
                  <Badge variant="outline" className="mt-1">
                    {employee.employee_type === 'permanent' ? 'קבוע' :
                     employee.employee_type === 'temporary' ? 'זמני' :
                     employee.employee_type === 'youth' ? 'נוער' :
                     employee.employee_type === 'contractor' ? 'קבלן' : employee.employee_type}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm text-gray-500">תאריך תחילת עבודה:</span>
                  <p className="font-medium">
                    {employee.hire_date ? new Date(employee.hire_date).toLocaleDateString('he-IL') : 'לא הוגדר'}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">שעות שבועיות נדרשות:</span>
                  <p className="font-medium">{employee.weekly_hours_required || 'לא הוגדר'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">סטטוס:</span>
                  <Badge variant={employee.is_active ? 'default' : 'destructive'}>
                    {employee.is_active ? 'פעיל' : 'לא פעיל'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {employee.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>הערות כלליות</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{employee.notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="shifts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  הגשות משמרות
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ShiftSubmissionHistory employeeId={employeeId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  מסמכים
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">אין מסמכים</h3>
                  <p className="text-gray-500">לא הועלו מסמכים עבור עובד זה</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  הערות והתראות
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">אין הערות</h3>
                  <p className="text-gray-500">לא נוספו הערות עבור עובד זה</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  שיוכי סניפים
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">אין שיוכים</h3>
                  <p className="text-gray-500">העובד לא משויך לאף סניף</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="salary" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  היסטוריית שכר
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">אין נתוני שכר</h3>
                  <p className="text-gray-500">לא הוגדרו נתוני שכר עבור עובד זה</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
