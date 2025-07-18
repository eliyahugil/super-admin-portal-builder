import React from 'react';
import { Calendar, Gift, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBirthdayNotifications } from '@/hooks/useBirthdayNotifications';
import { useBusiness } from '@/hooks/useBusiness';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';

export const BirthdayNotificationsLog: React.FC = () => {
  const { businessId } = useBusiness();
  const { data: notifications = [], isLoading } = useBirthdayNotifications(businessId);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2" dir="rtl">
            <Gift className="h-5 w-5 text-blue-500" />
            לוג הודעות יום הולדת
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">טוען...</div>
        </CardContent>
      </Card>
    );
  }

  if (notifications.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2" dir="rtl">
            <Gift className="h-5 w-5 text-blue-500" />
            לוג הודעות יום הולדת
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground" dir="rtl">
            עדיין לא נשלחו הודעות יום הולדת
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2" dir="rtl">
          <Gift className="h-5 w-5 text-blue-500" />
          לוג הודעות יום הולדת
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto" dir="rtl">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-start justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
            >
              <div className="flex items-start gap-3 flex-1">
                <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Gift className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900">
                    {notification.employee?.first_name} {notification.employee?.last_name}
                  </div>
                  <div className="text-sm text-gray-600 mt-1 break-words">
                    {notification.message}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(notification.notification_date).toLocaleDateString('he-IL')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(notification.sent_at), { 
                        addSuffix: true, 
                        locale: he 
                      })}
                    </div>
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="border-blue-300 text-blue-700 flex-shrink-0">
                נשלח
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};