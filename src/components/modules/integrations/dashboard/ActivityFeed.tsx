
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Mail, FileText } from 'lucide-react';
import { ActivityItem } from './types';

export const ActivityFeed: React.FC = () => {
  const recentActivity: ActivityItem[] = [
    {
      type: 'calendar',
      action: 'סונכרן אירוע חדש',
      details: 'פגישת צוות - מחר 10:00',
      time: '5 דקות',
      icon: Calendar
    },
    {
      type: 'gmail',
      action: 'נשלח אימייל',
      details: 'התראה על משמרת חדשה',
      time: '15 דקות',
      icon: Mail
    },
    {
      type: 'drive',
      action: 'נשמר קובץ',
      details: 'דוח משמרות חודשי.pdf',
      time: '1 שעה',
      icon: FileText
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>פעילות אחרונה</CardTitle>
        <CardDescription>
          עדכונים מהשעות האחרונות
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentActivity.map((activity, index) => {
          const IconComponent = activity.icon;
          return (
            <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
              <IconComponent className="h-5 w-5 text-gray-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm">{activity.action}</p>
                <p className="text-xs text-gray-600">{activity.details}</p>
                <p className="text-xs text-gray-400 mt-1">לפני {activity.time}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
