
import React, { useState } from 'react';
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
  DollarSign
} from 'lucide-react';
import { EmployeeNotes } from '../EmployeeNotes';
import { EmployeeDocuments } from '../EmployeeDocuments';
import { EmployeeBranchAssignments } from '../EmployeeBranchAssignments';
import { SalaryHistory } from '../SalaryHistory';
import { RecentAttendance } from '../RecentAttendance';
import { ShiftSubmissionHistory } from '../ShiftSubmissionHistory';
import type { Employee } from '@/types/supabase';

interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface EmployeeProfileTabsProps {
  employee: Employee;
  employeeId: string;
}

const getAvailableTabs = (employee: Employee): TabItem[] => {
  return [
    { id: 'overview', label: 'סקירה כללית', icon: User },
    { id: 'notes', label: 'הערות', icon: MessageSquare },
    { id: 'documents', label: 'מסמכים', icon: FileText },
    { id: 'branches', label: 'סניפים ותפקידים', icon: Building },
    { id: 'attendance', label: 'נוכחות', icon: Clock },
    { id: 'shifts', label: 'משמרות', icon: Calendar },
    { id: 'salary', label: 'שכר', icon: DollarSign },
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
        <TabsContent value="salary">
          <SalaryHistory employeeId={employeeId} employeeName={employeeName} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
