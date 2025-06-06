
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Copy, Database, Download, Upload } from 'lucide-react';
import { useBusiness } from '@/hooks/useBusiness';

export const BusinessSettingsAdvanced: React.FC = () => {
  const { business, businessId } = useBusiness();

  const handleExportData = () => {
    // TODO: Implement data export functionality
    console.log('Exporting business data...');
  };

  const handleCloneBusiness = () => {
    // TODO: Implement business cloning functionality  
    console.log('Cloning business...');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">הגדרות מתקדמות</h1>
        <p className="text-gray-600 mt-2">פעולות מתקדמות ולא הפיכות</p>
      </div>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            ניהול נתונים
          </CardTitle>
          <CardDescription>ייצא, גבה או העתק את נתוני העסק</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">ייצוא נתונים</h3>
              <p className="text-sm text-gray-600">הורד את כל נתוני העסק בפורמט Excel</p>
            </div>
            <Button variant="outline" onClick={handleExportData}>
              <Download className="h-4 w-4 mr-2" />
              ייצא נתונים
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">שכפול עסק</h3>
              <p className="text-sm text-gray-600">צור עסק חדש עם אותן הגדרות ועובדים</p>
            </div>
            <Button variant="outline" onClick={handleCloneBusiness}>
              <Copy className="h-4 w-4 mr-2" />
              שכפל עסק
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            אזור סכנה
          </CardTitle>
          <CardDescription>פעולות לא הפיכות - השתמש בזהירות</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
            <div>
              <h3 className="font-medium text-red-800">מחיקת עסק</h3>
              <p className="text-sm text-red-600">מחק את העסק וכל הנתונים הקשורים אליו לצמיתות</p>
            </div>
            <Button variant="destructive" disabled>
              מחק עסק
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-orange-200 rounded-lg bg-orange-50">
            <div>
              <h3 className="font-medium text-orange-800">איפוס נתונים</h3>
              <p className="text-sm text-orange-600">מחק את כל נתוני העובדים והמשמרות</p>
            </div>
            <Button variant="outline" className="text-orange-600 border-orange-300" disabled>
              איפוס נתונים
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
