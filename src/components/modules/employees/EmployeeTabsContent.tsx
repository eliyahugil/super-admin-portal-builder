
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { EmployeesList } from './EmployeesList';
import { ArchivedEmployeesList } from './ArchivedEmployeesList';
import { BranchesList } from './BranchesList';
import { ShiftsList } from './ShiftsList';
import { EmployeeExcelImporter } from './EmployeeExcelImporter';
import { AttendanceManagement } from './AttendanceManagement';
import { ArchiveManagement } from '@/components/shared/ArchiveManagement';
import type { Employee } from '@/types/employee';
import type { Branch } from '@/types/branch';

interface EmployeeTabsContentProps {
  activeTab: string;
  onActiveTabChange: (tab: string) => void;
  employees: Employee[];
  archivedEmployees: Employee[];
  branches: Branch[];
  onRefetchEmployees: () => void;
  onRefetchBranches: () => void;
  onCreateBranch: () => void;
}

export const EmployeeTabsContent: React.FC<EmployeeTabsContentProps> = ({
  activeTab,
  onActiveTabChange,
  employees,
  archivedEmployees,
  branches,
  onRefetchEmployees,
  onRefetchBranches,
  onCreateBranch
}) => {
  return (
    <Card dir="rtl">
      <CardHeader>
        <CardTitle>ניהול עובדים וסניפים</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={onActiveTabChange} dir="rtl">
          <TabsList className="grid w-full grid-cols-6" dir="rtl">
            <TabsTrigger value="employees">עובדים</TabsTrigger>
            <TabsTrigger value="archived">ארכיון</TabsTrigger>
            <TabsTrigger value="branches">סניפים</TabsTrigger>
            <TabsTrigger value="shifts">משמרות</TabsTrigger>
            <TabsTrigger value="import">יבוא נתונים</TabsTrigger>
            <TabsTrigger value="attendance">נוכחות</TabsTrigger>
          </TabsList>

          <TabsContent value="employees" className="mt-6">
            <ArchiveManagement
              title="ניהול עובדים"
              activeContent={
                <EmployeesList 
                  employees={employees} 
                  onRefetch={onRefetchEmployees}
                  branches={branches}
                />
              }
              archivedContent={<ArchivedEmployeesList />}
              activeCount={employees.length}
              archivedCount={archivedEmployees.length}
              entityNamePlural="עובדים"
            />
          </TabsContent>

          <TabsContent value="archived" className="mt-6">
            <ArchivedEmployeesList />
          </TabsContent>

          <TabsContent value="branches" className="mt-6">
            <div className="space-y-4" dir="rtl">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">רשימת סניפים</h3>
                <Button onClick={onCreateBranch}>
                  <Plus className="h-4 w-4 mr-2" />
                  הוסף סניף
                </Button>
              </div>
              <BranchesList 
                branches={branches} 
                onRefetch={onRefetchBranches} 
              />
            </div>
          </TabsContent>

          <TabsContent value="shifts" className="mt-6">
            <ShiftsList />
          </TabsContent>

          <TabsContent value="import" className="mt-6">
            <EmployeeExcelImporter />
          </TabsContent>

          <TabsContent value="attendance" className="mt-6">
            <AttendanceManagement />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
