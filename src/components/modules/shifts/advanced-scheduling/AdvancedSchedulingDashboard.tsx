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
    <div className="w-full h-full flex flex-col overflow-hidden" dir="rtl">
      <div className="flex-shrink-0 px-3 py-2 sm:px-6 sm:py-3 border-b bg-white">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">מערכת סידור מתקדמת</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">ניהול חכם ואוטומטי של משמרות עבודה</p>
        </div>
      </div>

      <div className="flex-1 w-full overflow-hidden bg-gray-50">
        <Tabs defaultValue="auto-scheduling" className="w-full h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 flex-shrink-0 bg-white shadow-sm">
            <TabsTrigger value="auto-scheduling" className="flex items-center gap-1 text-xs sm:text-sm data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">סידור אוטומטי</span>
              <span className="sm:hidden">אוטומטי</span>
            </TabsTrigger>
            <TabsTrigger value="rules" className="flex items-center gap-1 text-xs sm:text-sm data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">כללי סידור</span>
              <span className="sm:hidden">כללים</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-1 text-xs sm:text-sm data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">תבניות סידור</span>
              <span className="sm:hidden">תבניות</span>
            </TabsTrigger>
            <TabsTrigger value="swaps" className="flex items-center gap-1 text-xs sm:text-sm data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <ArrowRightLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">החלפת משמרות</span>
              <span className="sm:hidden">החלפות</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="auto-scheduling" className="flex-1 overflow-auto">
            <Card className="h-full bg-white shadow-sm border">
              <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <RefreshCw className="h-5 w-5" />
                  הגדרות סידור אוטומטי
                </CardTitle>
                <CardDescription className="text-blue-700">
                  קביעת פרמטרים לסידור אוטומטי של משמרות על בסיס אלגוריתמים חכמים
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-auto p-6">
                <AutoSchedulingSettings />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rules" className="flex-1 overflow-auto">
            <Card className="h-full bg-white shadow-sm border">
              <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <Settings className="h-5 w-5" />
                  כללי סידור עסקיים
                </CardTitle>
                <CardDescription className="text-green-700">
                  הגדרת כללים וחוקים לסידור המשמרות בעסק
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-auto p-6">
                <SchedulingRulesManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="flex-1 overflow-auto">
            <Card className="h-full bg-white shadow-sm border">
              <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-violet-50">
                <CardTitle className="flex items-center gap-2 text-purple-900">
                  <Calendar className="h-5 w-5" />
                  תבניות סידור
                </CardTitle>
                <CardDescription className="text-purple-700">
                  יצירה ושימוש בתבניות סידור מוכנות לשבועות, חודשים ועונות
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-auto p-6">
                <SchedulingTemplates />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="swaps" className="flex-1 overflow-auto">
            <Card className="h-full bg-white shadow-sm border">
              <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-red-50">
                <CardTitle className="flex items-center gap-2 text-orange-900">
                  <ArrowRightLeft className="h-5 w-5" />
                  בקשות החלפת משמרות
                </CardTitle>
                <CardDescription className="text-orange-700">
                  ניהול בקשות של עובדים להחלפת משמרות והחלפות אוטומטיות
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-auto p-6">
                <ShiftSwapManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};