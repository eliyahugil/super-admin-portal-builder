
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


import { ShiftTemplatesManagement } from './ShiftTemplatesManagement';
import { DeleteAllShiftsButton } from './DeleteAllShiftsButton';
import { PublicTokenManager } from './PublicTokenManager';

export const ShiftManagementTabs: React.FC = () => {
  return (
    <div className="w-full" dir="rtl">
      {/* Header - רספונסיבי למובייל */}
      <div className="bg-card border-b border-border px-4 py-4 md:px-6 sticky top-0 z-10 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground">ניהול משמרות מתקדם</h1>
            <p className="text-sm md:text-base text-muted-foreground">ניהול טוקנים, הגשות ואישורי משמרות</p>
          </div>
          <div className="flex-shrink-0">
            <DeleteAllShiftsButton />
          </div>
        </div>
      </div>

      {/* Content with tabs */}
      <div className="px-2 sm:px-4 lg:px-6 py-4">
        <Tabs defaultValue="templates" className="w-full">
          {/* טאבים רספונסיביים */}
          <div className="w-full overflow-x-auto scrollbar-hide mb-6">
            <TabsList className="inline-flex w-auto min-w-full sm:w-full grid-cols-1 sm:grid-cols-2 h-auto p-1 bg-muted rounded-lg">
              <TabsTrigger 
                value="templates" 
                className="flex-1 sm:flex-initial text-xs sm:text-sm md:text-base px-3 py-2.5 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                תבניות משמרות
              </TabsTrigger>
              <TabsTrigger 
                value="submissions" 
                className="flex-1 sm:flex-initial text-xs sm:text-sm md:text-base px-3 py-2.5 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                הגשות משמרות וטוקנים
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="templates" className="mt-0">
            <ShiftTemplatesManagement />
          </TabsContent>
          
          <TabsContent value="submissions" className="mt-0">
            <PublicTokenManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
