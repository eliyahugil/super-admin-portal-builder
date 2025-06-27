
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Users, AlertTriangle } from 'lucide-react';
import { DuplicateEmployeeMerger } from './DuplicateEmployeeMerger';

export const EmployeeDuplicateManager: React.FC = () => {
  return (
    <div className="space-y-6" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            ניהול עובדים כפולים
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            כלי לזיהוי ומיזוג עובדים כפולים במערכת. המערכת מחפשת עובדים עם נתונים דומים או זהים.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">הערה חשובה:</p>
                <p className="text-yellow-700 mt-1">
                  פעולת המיזוג הינה בלתי הפיכה. העובדים הכפולים יועברו לארכיון והנתונים יומזגו לעובד הראשי.
                  אנא וודא את הבחירות לפני ביצוע המיזוג.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <DuplicateEmployeeMerger />
    </div>
  );
};
