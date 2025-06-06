
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShiftTokenManagement } from './ShiftTokenManagement';
import { WeeklyTokenManagement } from './WeeklyTokenManagement';
import { ShiftSubmissionsDashboard } from './ShiftSubmissionsDashboard';
import { ShiftApprovalDashboard } from './ShiftApprovalDashboard';

export const ShiftManagementTabs: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ניהול משמרות מתקדם</h1>
        <p className="text-gray-600">ניהול טוקנים, הגשות ואישורי משמרות</p>
      </div>

      <Tabs defaultValue="submissions" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="submissions">הגשות משמרות</TabsTrigger>
          <TabsTrigger value="weekly-tokens">טוקנים שבועיים</TabsTrigger>
          <TabsTrigger value="single-tokens">טוקנים יחידים</TabsTrigger>
          <TabsTrigger value="approvals">אישור בקשות</TabsTrigger>
        </TabsList>
        
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
