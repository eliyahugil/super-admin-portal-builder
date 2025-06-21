
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Users, Calendar, Settings } from 'lucide-react';
import { ImportToolsCard } from './ImportToolsCard';

interface ManagementToolsGridProps {
  businessId: string | null;
}

export const ManagementToolsGrid: React.FC<ManagementToolsGridProps> = ({ businessId }) => {
  if (!businessId) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>יש לבחור עסק כדי לראות כלי ניהול</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" dir="rtl">
      {/* Import Tools Card */}
      <ImportToolsCard />
      
      {/* Employee Reports Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            דוחות עובדים
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start">
              דוח נוכחות חודשי
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              דוח שעות עבודה
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              רשימת עובדים פעילים
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Management Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            ניהול משמרות
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start">
              תבניות משמרות
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              יצירת לוח זמנים
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
