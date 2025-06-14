
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { useEmployeesData } from '@/hooks/useEmployeesData';
import { useBranchesData } from '@/hooks/useBranchesData';
import { CreateEmployeeDialog } from './CreateEmployeeDialog';
import { CreateBranchDialog } from './CreateBranchDialog';
import { EmployeesList } from './EmployeesList';
import { BranchesList } from './BranchesList';
import { EmployeeExcelImporter } from './EmployeeExcelImporter';
import { BusinessFilterSelector } from './BusinessFilterSelector';
import { EmployeesTableAdvanced } from './table/EmployeesTableAdvanced';
import { EmployeesTable } from './EmployeesTable';

export const EmployeeManagement = () => {
  const [createEmployeeOpen, setCreateEmployeeOpen] = useState(false);
  const [createBranchOpen, setCreateBranchOpen] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'simple' | 'advanced' | 'enhanced'>('enhanced');
  const { toast } = useToast();
  const { businessId, isSuperAdmin, loading: businessLoading } = useCurrentBusiness();

  // Use unified hooks for consistent data fetching with the selected business filter
  const { data: employees, refetch: refetchEmployees } = useEmployeesData(selectedBusinessId);
  const { data: branches, refetch: refetchBranches } = useBranchesData(selectedBusinessId);

  // For super admin, use selectedBusinessId, for regular users use their businessId
  const effectiveBusinessId = isSuperAdmin ? selectedBusinessId : businessId;

  console.log('🔍 EmployeeManagement state:', {
    businessId,
    isSuperAdmin,
    selectedBusinessId,
    effectiveBusinessId,
    businessLoading,
    viewMode,
    employeesCount: employees?.length || 0,
    branchesCount: branches?.length || 0
  });

  // Listen for successful imports and refresh the employees list
  useEffect(() => {
    const handleEmployeesImported = () => {
      console.log('👂 Received employeesImported event, refreshing employees list...');
      refetchEmployees();
      toast({
        title: 'רשימת העובדים עודכנה',
        description: 'הנתונים החדשים מוצגים ברשימה',
      });
    };

    window.addEventListener('employeesImported', handleEmployeesImported);
    
    return () => {
      window.removeEventListener('employeesImported', handleEmployeesImported);
    };
  }, [refetchEmployees, toast]);

  const handleEmployeeCreated = () => {
    refetchEmployees();
    toast({
      title: 'הצלחה',
      description: 'העובד נוצר בהצלחה',
    });
  };

  const handleBranchCreated = () => {
    refetchBranches();
    toast({
      title: 'הצלחה',
      description: 'הסניף נוצר בהצלחה',
    });
  };

  // Show loading state
  if (businessLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">טוען...</div>
      </div>
    );
  }

  const getDisplayTitle = () => {
    if (isSuperAdmin) {
      if (effectiveBusinessId) {
        return `ניהול עובדים וסניפים - עסק נבחר`;
      }
      return 'ניהול עובדים וסניפים - כל העסקים';
    }
    return 'ניהול עובדים וסניפים';
  };

  const getDisplayDescription = () => {
    if (isSuperAdmin) {
      if (effectiveBusinessId) {
        return `מציג עובדים וסניפים מהעסק הנבחר (${employees?.length || 0} עובדים)`;
      }
      return `מציג עובדים וסניפים מכל העסקים (${employees?.length || 0} עובדים)`;
    }
    return 'נהל את העובדים והסניפים של העסק';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{getDisplayTitle()}</h1>
            <p className="text-gray-600">{getDisplayDescription()}</p>
          </div>
          
          {/* View Mode Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">תצוגה:</span>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as 'simple' | 'advanced' | 'enhanced')}
              className="border border-gray-300 rounded px-3 py-1"
            >
              <option value="simple">פשוטה</option>
              <option value="advanced">מתקדמת</option>
              <option value="enhanced">משופרת</option>
            </select>
          </div>
        </div>
      </div>

      {/* Business Filter for Super Admins */}
      <BusinessFilterSelector
        selectedBusinessId={selectedBusinessId}
        onBusinessChange={setSelectedBusinessId}
      />

      {/* Alert for super admin when no business selected */}
      {isSuperAdmin && !effectiveBusinessId && (
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            אתה מחובר כמנהל מערכת וצופה בכל העסקים. 
            בחר עסק ספציפי למעלה כדי לנהל עובדים או לבצע פעולות ניהול.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="employees" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="employees">עובדים</TabsTrigger>
          <TabsTrigger value="branches">סניפים</TabsTrigger>
        </TabsList>

        <TabsContent value="employees">
          {/* Render different table views based on mode */}
          {viewMode === 'simple' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>רשימת עובדים</CardTitle>
                <div className="flex gap-2">
                  {/* Only show import/add buttons when business is selected */}
                  {(effectiveBusinessId || (!isSuperAdmin && businessId)) && (
                    <>
                      <EmployeeExcelImporter />
                      <Button 
                        onClick={() => setCreateEmployeeOpen(true)}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        הוסף עובד
                      </Button>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <EmployeesList employees={employees || []} onRefetch={refetchEmployees} />
              </CardContent>
            </Card>
          )}

          {viewMode === 'advanced' && <EmployeesTableAdvanced selectedBusinessId={selectedBusinessId} />}
          
          {viewMode === 'enhanced' && <EmployeesTable selectedBusinessId={selectedBusinessId} />}
        </TabsContent>

        <TabsContent value="branches">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>רשימת סניפים</CardTitle>
              {/* Only show add button when business is selected */}
              {(effectiveBusinessId || (!isSuperAdmin && businessId)) && (
                <Button 
                  onClick={() => setCreateBranchOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  הוסף סניף
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <BranchesList branches={branches || []} onRefetch={refetchBranches} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreateEmployeeDialog
        open={createEmployeeOpen}
        onOpenChange={setCreateEmployeeOpen}
        onSuccess={handleEmployeeCreated}
        branches={branches || []}
      />

      <CreateBranchDialog
        open={createBranchOpen}
        onOpenChange={setCreateBranchOpen}
        onSuccess={handleBranchCreated}
      />
    </div>
  );
};
