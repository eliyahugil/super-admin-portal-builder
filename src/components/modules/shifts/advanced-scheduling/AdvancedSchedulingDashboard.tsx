import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SchedulingRulesManager } from './SchedulingRulesManager';
import { AutoSchedulingSettings } from './AutoSchedulingSettings';
import { SchedulingTemplates } from './SchedulingTemplates';
import { ShiftSwapManager } from './ShiftSwapManager';
import { Settings, Calendar, RefreshCw, ArrowRightLeft } from 'lucide-react';

export const AdvancedSchedulingDashboard: React.FC = () => {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 p-3 sm:p-6 border-b">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">מערכת סידור מתקדמת</h1>
          <p className="text-sm sm:text-base text-muted-foreground">ניהול חכם ואוטומטי של משמרות עבודה</p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-3 sm:p-6">
        <Tabs defaultValue="auto-scheduling" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 flex-shrink-0 mb-4">
            <TabsTrigger value="auto-scheduling" className="flex items-center gap-1 text-xs sm:text-sm">
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">סידור אוטומטי</span>
              <span className="sm:hidden">אוטומטי</span>
            </TabsTrigger>
            <TabsTrigger value="rules" className="flex items-center gap-1 text-xs sm:text-sm">
              <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">כללי סידור</span>
              <span className="sm:hidden">כללים</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-1 text-xs sm:text-sm">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">תבניות סידור</span>
              <span className="sm:hidden">תבניות</span>
            </TabsTrigger>
            <TabsTrigger value="swaps" className="flex items-center gap-1 text-xs sm:text-sm">
              <ArrowRightLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">החלפת משמרות</span>
              <span className="sm:hidden">החלפות</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="auto-scheduling" className="flex-1 overflow-auto">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>הגדרות סידור אוטומטי</CardTitle>
                <CardDescription>
                  קביעת פרמטרים לסידור אוטומטי של משמרות על בסיס אלגוריתמים חכמים
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-auto">
                <AutoSchedulingSettings />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rules" className="flex-1 overflow-auto">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>כללי סידור עסקיים</CardTitle>
                <CardDescription>
                  הגדרת כללים וחוקים לסידור המשמרות בעסק
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-auto">
                <SchedulingRulesManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="flex-1 overflow-auto">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>תבניות סידור</CardTitle>
                <CardDescription>
                  יצירה ושימוש בתבניות סידור מוכנות לשבועות, חודשים ועונות
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-auto">
                <SchedulingTemplates />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="swaps" className="flex-1 overflow-auto">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>בקשות החלפת משמרות</CardTitle>
                <CardDescription>
                  ניהול בקשות של עובדים להחלפת משמרות והחלפות אוטומטיות
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-auto">
                <ShiftSwapManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};