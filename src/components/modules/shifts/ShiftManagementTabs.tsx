
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShiftTokenManagement } from './ShiftTokenManagement';
import { WeeklyTokenManagement } from './WeeklyTokenManagement';
import { ShiftSubmissionsDashboard } from './ShiftSubmissionsDashboard';
import { ShiftApprovalDashboard } from './ShiftApprovalDashboard';
import { ShiftTemplatesManagement } from './ShiftTemplatesManagement';
import { DeleteAllShiftsButton } from './DeleteAllShiftsButton';

export const ShiftManagementTabs: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">ניהול משמרות מתקדם</h1>
            <p className="text-gray-600">ניהול טוקנים, הגשות ואישורי משמרות</p>
          </div>
          <DeleteAllShiftsButton />
        </div>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1">
          <TabsTrigger value="templates" className="text-xs sm:text-sm">תבניות משמרות</TabsTrigger>
          <TabsTrigger value="submissions" className="text-xs sm:text-sm">הגשות משמרות</TabsTrigger>
          <TabsTrigger value="weekly-tokens" className="text-xs sm:text-sm">טוקנים שבועיים</TabsTrigger>
          <TabsTrigger value="single-tokens" className="text-xs sm:text-sm">טוקנים יחידים</TabsTrigger>
          <TabsTrigger value="approvals" className="text-xs sm:text-sm">אישור בקשות</TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates" className="mt-6">
          <ShiftTemplatesManagement />
        </TabsContent>
        
        <TabsContent value="submissions" className="mt-6">
          <ShiftSubmissionsDashboard />
        </TabsContent>
        
        <TabsContent value="weekly-tokens" className="mt-6">
          <WeeklyTokenManagement />
        </TabsContent>
        
        <TabsContent value="single-tokens" className="mt-6">
          <ShiftTokenManagement />
        </TabsContent>
        
        <TabsContent value="approvals" className="mt-6">
          <ShiftApprovalDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};
