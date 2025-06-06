
import React from 'react';
import { useShiftSubmissions } from './hooks/useShiftSubmissions';
import { ShiftStatsCards } from './dashboard/ShiftStatsCards';
import { ShiftSearch } from './dashboard/ShiftSearch';
import { SendReminderButton } from './dashboard/SendReminderButton';
import { ShiftSubmissionList } from './dashboard/ShiftSubmissionList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { useBusiness } from '@/hooks/useBusiness';

export const ShiftSubmissionsDashboard: React.FC = () => {
  const { 
    searchTerm, 
    setSearchTerm, 
    submissions,
    filteredSubmissions, 
    isLoading,
    parseShifts,
    sendWhatsApp
  } = useShiftSubmissions();

  const { business } = useBusiness();
  const { settings } = useBusinessSettings(business?.id);

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8" dir="rtl">טוען...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">דשבורד הגשות משמרות</h1>
        <p className="text-gray-600">מעקב אחר הגשות משמרות שבועיות מעובדים</p>
      </div>

      {/* Reminder Settings Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5" />
            הגדרות תזכורות
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              {settings?.auto_shift_reminders ? (
                <div className="text-green-600">
                  <p className="font-medium">תזכורות אוטומטיות פעילות</p>
                  <p className="text-sm text-gray-600">
                    תזכורות נשלחות בכל יום {settings.reminder_day} בשעה {settings.reminder_hour.toString().padStart(2, '0')}:00
                  </p>
                </div>
              ) : (
                <div className="text-orange-600">
                  <p className="font-medium">תזכורות אוטומטיות כבויות</p>
                  <p className="text-sm text-gray-600">
                    ניתן לשלוח תזכורות ידנית או להפעיל תזכורות אוטומטיות בהגדרות
                  </p>
                </div>
              )}
            </div>
            <Link to="/modules/settings">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                הגדרות
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <SendReminderButton submissions={submissions} />

      {/* Search */}
      <ShiftSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      {/* Stats Cards */}
      <ShiftStatsCards submissions={submissions} />

      {/* Submissions List */}
      <ShiftSubmissionList 
        filteredSubmissions={filteredSubmissions}
        parseShifts={parseShifts}
        sendWhatsApp={sendWhatsApp}
      />
    </div>
  );
};
