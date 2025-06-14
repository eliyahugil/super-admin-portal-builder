
import React, { useState } from 'react';
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
  const [showCreateBranch, setShowCreateBranch] = useState(false);

  return (
    <Card dir="rtl" className="w-full rounded-2xl shadow">
      <CardHeader>
        <CardTitle>ניהול עובדים וסניפים</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={onActiveTabChange} dir="rtl">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-1 sm:gap-2" dir="rtl">
            <TabsTrigger value="employees">עובדים</TabsTrigger>
            <TabsTrigger value="archived">ארכיון</TabsTrigger>
            <TabsTrigger value="branches">סניפים</TabsTrigger>
            <TabsTrigger value="shifts">משמרות</TabsTrigger>
            <TabsTrigger value="import">יבוא נתונים</TabsTrigger>
            <TabsTrigger value="attendance">נוכחות</TabsTrigger>
          </TabsList>

          <TabsContent value="employees" className="mt-4 sm:mt-6">
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

          <TabsContent value="archived" className="mt-4 sm:mt-6">
            <ArchivedEmployeesList />
          </TabsContent>

          <TabsContent value="branches" className="mt-4 sm:mt-6">
            <div className="space-y-4" dir="rtl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <h3 className="text-lg font-semibold">רשימת סניפים</h3>
                <Button onClick={() => setShowCreateBranch(true)} className="self-stretch sm:self-auto w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  הוסף סניף
                </Button>
              </div>
              <BranchesList 
                branches={branches} 
                onRefetch={onRefetchBranches} 
              />
              {showCreateBranch && (
                <div className="fixed z-50 inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                  <div className="bg-white rounded-xl shadow-xl p-8 min-w-[80vw] max-w-xs w-full">
                    <h3 className="font-semibold mb-4">יצירת סניף חדש</h3>
                    {/* הפעלת הפונקציית onCreateBranch */}
                    <Button variant="ghost" className="mt-4 w-full" onClick={() => setShowCreateBranch(false)}>
                      ביטול
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="shifts" className="mt-4 sm:mt-6">
            <ShiftsList />
          </TabsContent>

          <TabsContent value="import" className="mt-4 sm:mt-6">
            <EmployeeExcelImporter />
          </TabsContent>

          <TabsContent value="attendance" className="mt-4 sm:mt-6">
            <AttendanceManagement />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

