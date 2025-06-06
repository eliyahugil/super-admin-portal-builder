
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Users, Copy, Clock } from 'lucide-react';
import { CustomFieldsManager } from '../employees/CustomFieldsManager';
import { BusinessCloningDialog } from '../employees/BusinessCloningDialog';

export const BusinessMultiManagement: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto p-6" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">ניהול עסק מתקדם</h1>
        <p className="text-gray-600 mt-2">הגדרות מתקדמות לניהול עסק וריבוי עסקים</p>
      </div>

      <Tabs defaultValue="custom-fields" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="custom-fields" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            שדות מותאמים אישית
          </TabsTrigger>
          <TabsTrigger value="business-cloning" className="flex items-center gap-2">
            <Copy className="h-4 w-4" />
            שכפול עסק
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            אוטומציות
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="custom-fields" className="mt-0">
            <CustomFieldsManager />
          </TabsContent>

          <TabsContent value="business-cloning" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Copy className="h-5 w-5" />
                  שכפול נתונים לעסק אחר
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600">
                  <p className="mb-4">
                    כאן תוכל לשכפל את כל העובדים והנתונים הרלוונטיים לעסק אחר שבבעלותך.
                    הפעולה תעתיק את כל העובדים הפעילים עם הפרטים שלהם.
                  </p>
                </div>
                
                <div className="flex justify-start">
                  <BusinessCloningDialog />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="automation" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  הגדרות אוטומציה
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">הגדרות אוטומציה יהיו זמינות בקרוב</p>
                  <p className="text-sm text-gray-400">כולל תזמון שליחת הודעות אוטומטיות ותזכורות</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
