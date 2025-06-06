
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, Phone } from 'lucide-react';

export const ShiftSubmissionSuccess: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center" dir="rtl">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              בקשת המשמרת נשלחה בהצלחה!
            </CardTitle>
          </CardHeader>
          
          <CardContent className="text-center space-y-6">
            <p className="text-gray-600">
              תודה שהגשת את בקשתך למשמרת. הבקשה נשלחה למנהל והוא יבדוק אותה בהקדם.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 text-blue-800 mb-2">
                <Clock className="h-5 w-5" />
                <span className="font-medium">מה קורה עכשיו?</span>
              </div>
              <ul className="text-sm text-blue-700 space-y-1 text-right">
                <li>• המנהל יבדוק את הבקשה שלך</li>
                <li>• תקבל הודעה כשהבקשה תאושר או תידחה</li>
                <li>• הבקשה תופיע במערכת המשמרות</li>
              </ul>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 text-gray-800 mb-2">
                <Phone className="h-5 w-5" />
                <span className="font-medium">צריך עזרה?</span>
              </div>
              <p className="text-sm text-gray-600">
                אם יש לך שאלות או צריך לעדכן משהו בבקשה, פנה למנהל שלך ישירות.
              </p>
            </div>

            <div className="text-sm text-gray-500">
              ניתן לסגור את הדף הזה בבטחה.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
