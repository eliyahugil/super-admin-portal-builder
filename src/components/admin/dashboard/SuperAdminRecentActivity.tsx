
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock } from 'lucide-react';

interface ActivityItem {
  type: string;
  title: string;
  description: string;
  time: string;
  status: 'pending' | 'completed';
}

export const SuperAdminRecentActivity: React.FC = () => {
  const recentActivity: ActivityItem[] = [
    {
      type: 'business',
      title: 'עסק חדש נרשם',
      description: 'קפה ברחוב הראשי - דורש אישור',
      time: '10 דקות',
      status: 'pending'
    },
    {
      type: 'module',
      title: 'מודול עודכן',
      description: 'ניהול עובדים - גרסה 2.1',
      time: '2 שעות',
      status: 'completed'
    },
    {
      type: 'integration',
      title: 'אינטגרציה חדשה',
      description: 'WhatsApp API - הוגדרה בהצלחה',
      time: '1 יום',
      status: 'completed'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>פעילות אחרונה</CardTitle>
        <CardDescription>עדכונים ופעילות במערכת</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-start space-x-3 space-x-reverse">
              <div className="flex-shrink-0">
                {activity.status === 'pending' ? (
                  <Clock className="h-5 w-5 text-orange-500" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {activity.title}
                </p>
                <p className="text-sm text-gray-500">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  לפני {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
