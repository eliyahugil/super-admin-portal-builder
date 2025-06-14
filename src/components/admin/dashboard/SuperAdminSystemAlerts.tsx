
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { SystemNotificationManager } from '../SystemNotificationManager';

interface SystemAlert {
  type: 'warning' | 'info';
  title: string;
  description: string;
  action: string;
}

interface SuperAdminSystemAlertsProps {
  pendingApprovals: number;
}

export const SuperAdminSystemAlerts: React.FC<SuperAdminSystemAlertsProps> = ({ pendingApprovals }) => {
  const systemAlerts: SystemAlert[] = [
    {
      type: 'warning',
      title: 'עסקים ממתינים לאישור',
      description: `${pendingApprovals} עסקים ממתינים לבדיקה ואישור`,
      action: 'לבדיקה'
    },
    {
      type: 'info',
      title: 'עדכון מערכת זמין',
      description: 'גרסה 1.2.5 כוללת שיפורים בביצועים',
      action: 'פרטים'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Real-time notifications */}
      <SystemNotificationManager />
      
      {/* System alerts */}
      <Card>
        <CardHeader>
          <CardTitle>התראות מערכת כלליות</CardTitle>
          <CardDescription>התראות חשובות הדורשות תשומת לב</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {systemAlerts.map((alert, index) => (
              <div key={index} className="flex items-start justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-start space-x-3 space-x-reverse">
                  <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {alert.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {alert.description}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  {alert.action}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
