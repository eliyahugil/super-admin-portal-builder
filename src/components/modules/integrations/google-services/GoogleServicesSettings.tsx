
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

export const GoogleServicesSettings: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>הגדרות אינטגרציה</CardTitle>
        <CardDescription>
          נהל הגדרות מתקדמות לשירותי Google
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">סנכרון אוטומטי</h4>
              <p className="text-sm text-gray-600 mb-3">
                סנכרן נתונים מGoogle כל שעה
              </p>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                הגדר
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">התראות</h4>
              <p className="text-sm text-gray-600 mb-3">
                קבל התראות על אירועים ושינויים
              </p>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                הגדר
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">בחירת נתונים</h4>
              <p className="text-sm text-gray-600 mb-3">
                בחר אילו נתונים לסנכרן
              </p>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                הגדר
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">גיבוי</h4>
              <p className="text-sm text-gray-600 mb-3">
                גבה נתונים ל-Google Drive
              </p>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                הגדר
              </Button>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};
