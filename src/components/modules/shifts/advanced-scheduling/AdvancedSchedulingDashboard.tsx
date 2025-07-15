import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SchedulingRulesManager } from './SchedulingRulesManager';
import { EmployeeConstraintsManager } from './EmployeeConstraintsManager';
import { AutoSchedulingSettings } from './AutoSchedulingSettings';
import { SchedulingTemplates } from './SchedulingTemplates';
import { ShiftSwapManager } from './ShiftSwapManager';
import { SchedulingAnalytics } from './SchedulingAnalytics';
import { Settings, Users, Calendar, RefreshCw, BarChart3, ArrowRightLeft } from 'lucide-react';

export const AdvancedSchedulingDashboard: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">מערכת סידור מתקדמת</h1>
          <p className="text-muted-foreground">ניהול חכם ואוטומטי של משמרות עבודה</p>
        </div>
      </div>

      <Tabs defaultValue="auto-scheduling" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="auto-scheduling" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            סידור אוטומטי
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            כללי סידור
          </TabsTrigger>
          <TabsTrigger value="constraints" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            אילוצי עובדים
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            תבניות סידור
          </TabsTrigger>
          <TabsTrigger value="swaps" className="flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4" />
            החלפת משמרות
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            דוחות וניתוח
          </TabsTrigger>
        </TabsList>

        <TabsContent value="auto-scheduling">
          <Card>
            <CardHeader>
              <CardTitle>הגדרות סידור אוטומטי</CardTitle>
              <CardDescription>
                קביעת פרמטרים לסידור אוטומטי של משמרות על בסיס אלגוריתמים חכמים
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AutoSchedulingSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <CardTitle>כללי סידור עסקיים</CardTitle>
              <CardDescription>
                הגדרת כללים וחוקים לסידור המשמרות בעסק
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SchedulingRulesManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="constraints">
          <Card>
            <CardHeader>
              <CardTitle>אילוצים ועדיפויות עובדים</CardTitle>
              <CardDescription>
                ניהול זמינות, חופשות והעדיפויות של העובדים
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmployeeConstraintsManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>תבניות סידור</CardTitle>
              <CardDescription>
                יצירה ושימוש בתבניות סידור מוכנות לשבועות, חודשים ועונות
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SchedulingTemplates />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="swaps">
          <Card>
            <CardHeader>
              <CardTitle>בקשות החלפת משמרות</CardTitle>
              <CardDescription>
                ניהול בקשות של עובדים להחלפת משמרות והחלפות אוטומטיות
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ShiftSwapManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>דוחות וניתוחים</CardTitle>
              <CardDescription>
                ניתוח ביצועי הסידור, עמידה ביעדים ואופטימיזציה
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SchedulingAnalytics />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};