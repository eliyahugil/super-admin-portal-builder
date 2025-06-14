
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Users, UserCheck, Clock, FileText, Archive } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { useBranchesData } from '@/hooks/useBranchesData';
import { useEmployeesData } from '@/hooks/useEmployeesData';
import { useArchivedEmployees } from '@/hooks/useArchivedEmployees';
import { EmployeesList } from './EmployeesList';
import { ArchivedEmployeesList } from './ArchivedEmployeesList';
import { CreateEmployeeDialog } from './CreateEmployeeDialog';
import { CreateBranchDialog } from './CreateBranchDialog';
import { BranchesList } from './BranchesList';
import { ShiftsList } from './ShiftsList';
import { EmployeeExcelImporter } from './EmployeeExcelImporter';
import { AttendanceManagement } from './AttendanceManagement';
import { ManagementToolsSection } from './ManagementToolsSection';
import { Branch } from '@/types/branch';

export const EmployeeManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('employees');
  const [createEmployeeOpen, setCreateEmployeeOpen] = useState(false);
  const [createBranchOpen, setCreateBranchOpen] = useState(false);
  const { profile } = useAuth();
  const { businessId } = useCurrentBusiness();

  // Only fetch data when we have a business ID
  const { 
    data: employees = [], 
    isLoading: employeesLoading, 
    refetch: refetchEmployees 
  } = useEmployeesData(businessId);

  const { 
    data: archivedEmployees = [], 
    isLoading: archivedLoading 
  } = useArchivedEmployees(businessId);

  const { 
    data: branches = [], 
    isLoading: branchesLoading, 
    refetch: refetchBranches 
  } = useBranchesData(businessId);

  console.log('EmployeeManagement - Current state:', {
    businessId,
    employeesCount: employees.length,
    archivedCount: archivedEmployees.length,
    branchesCount: branches.length,
    activeTab,
    userRole: profile?.role
  });

  const activeEmployees = employees.filter(emp => emp.is_active);
  const inactiveEmployees = employees.filter(emp => !emp.is_active);

  const handleEmployeeCreated = () => {
    refetchEmployees();
    setCreateEmployeeOpen(false);
  };

  const handleBranchCreated = () => {
    refetchBranches();
    setCreateBranchOpen(false);
  };

  const isLoading = employeesLoading || branchesLoading || archivedLoading;

  if (!businessId) {
    return (
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">לא נבחר עסק</h3>
          <p className="text-gray-600">יש לבחור עסק כדי לנהל עובדים</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-8 w-8" />
            ניהול עובדים
          </h1>
          <p className="text-gray-600 mt-2">נהל עובדים, סניפים ומשמרות</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6" dir="rtl">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="mr-4">
                <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
                <p className="text-gray-600">סך הכל עובדים</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-green-600" />
              <div className="mr-4">
                <p className="text-2xl font-bold text-gray-900">{activeEmployees.length}</p>
                <p className="text-gray-600">עובדים פעילים</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="mr-4">
                <p className="text-2xl font-bold text-gray-900">{inactiveEmployees.length}</p>
                <p className="text-gray-600">עובדים לא פעילים</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Archive className="h-8 w-8 text-gray-600" />
              <div className="mr-4">
                <p className="text-2xl font-bold text-gray-900">{archivedEmployees.length}</p>
                <p className="text-gray-600">עובדים בארכיון</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-purple-600" />
              <div className="mr-4">
                <p className="text-2xl font-bold text-gray-900">{branches.length}</p>
                <p className="text-gray-600">סניפים</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Tools */}
      <ManagementToolsSection 
        onCreateEmployee={() => setCreateEmployeeOpen(true)}
        onCreateBranch={() => setCreateBranchOpen(true)}
      />

      {/* Main Content */}
      <Card dir="rtl">
        <CardHeader>
          <CardTitle>ניהול עובדים וסניפים</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
            <TabsList className="grid w-full grid-cols-6" dir="rtl">
              <TabsTrigger value="employees">עובדים</TabsTrigger>
              <TabsTrigger value="archived">ארכיון</TabsTrigger>
              <TabsTrigger value="branches">סניפים</TabsTrigger>
              <TabsTrigger value="shifts">משמרות</TabsTrigger>
              <TabsTrigger value="import">יבוא נתונים</TabsTrigger>
              <TabsTrigger value="attendance">נוכחות</TabsTrigger>
            </TabsList>

            <TabsContent value="employees" className="mt-6">
              <EmployeesList 
                employees={employees} 
                onRefetch={refetchEmployees}
                branches={branches as Branch[]}
              />
            </TabsContent>

            <TabsContent value="archived" className="mt-6">
              <ArchivedEmployeesList />
            </TabsContent>

            <TabsContent value="branches" className="mt-6">
              <div className="space-y-4" dir="rtl">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">רשימת סניפים</h3>
                  <Button onClick={() => setCreateBranchOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    הוסף סניף
                  </Button>
                </div>
                <BranchesList 
                  branches={branches as Branch[]} 
                  onRefetch={refetchBranches} 
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

      {/* Dialogs */}
      <CreateEmployeeDialog
        open={createEmployeeOpen}
        onOpenChange={setCreateEmployeeOpen}
        onSuccess={handleEmployeeCreated}
        branches={branches as Branch[]}
      />

      <CreateBranchDialog
        open={createBranchOpen}
        onOpenChange={setCreateBranchOpen}
        onSuccess={handleBranchCreated}
      />
    </div>
  );
};
