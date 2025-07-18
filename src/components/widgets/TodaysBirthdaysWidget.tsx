import React from 'react';
import { Gift, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTodaysBirthdays } from '@/hooks/useBirthdayNotifications';
import { useBusiness } from '@/hooks/useBusiness';

export const TodaysBirthdaysWidget: React.FC = () => {
  const { businessId } = useBusiness();
  const { data: birthdayEmployees = [], isLoading } = useTodaysBirthdays(businessId);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2" dir="rtl">
            <Gift className="h-5 w-5 text-pink-500" />
            ימי הולדת היום
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">טוען...</div>
        </CardContent>
      </Card>
    );
  }

  if (birthdayEmployees.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2" dir="rtl">
            <Gift className="h-5 w-5 text-pink-500" />
            ימי הולדת היום
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground" dir="rtl">
            אין ימי הולדת היום 🎂
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2" dir="rtl">
          <Gift className="h-5 w-5 text-pink-500" />
          ימי הולדת היום 🎉
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3" dir="rtl">
          {birthdayEmployees.map((employee) => (
            <div
              key={employee.id}
              className="flex items-center justify-between p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center">
                  <Gift className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {employee.first_name} {employee.last_name}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {employee.birth_date && new Date(employee.birth_date).toLocaleDateString('he-IL')}
                  </div>
                </div>
              </div>
              <Badge variant="secondary" className="bg-pink-100 text-pink-800 border-pink-200">
                🎂 יום הולדת
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};