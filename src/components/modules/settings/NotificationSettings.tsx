
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Bell, Clock, Calendar } from 'lucide-react';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { useBusiness } from '@/hooks/useBusiness';

export const NotificationSettings: React.FC = () => {
  const { business } = useBusiness();
  const { settings, isLoading, updateSettings, isUpdating } = useBusinessSettings(business?.id);

  const daysOfWeek = [
    { value: 'Sunday', label: 'ראשון' },
    { value: 'Monday', label: 'שני' },
    { value: 'Tuesday', label: 'שלישי' },
    { value: 'Wednesday', label: 'רביעי' },
    { value: 'Thursday', label: 'חמישי' },
    { value: 'Friday', label: 'שישי' },
    { value: 'Saturday', label: 'שבת' },
  ];

  const hours = Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: `${i.toString().padStart(2, '0')}:00`
  }));

  const handleAutoRemindersChange = (enabled: boolean) => {
    updateSettings({
      auto_shift_reminders: enabled,
      reminder_day: settings?.reminder_day || 'Thursday',
      reminder_hour: settings?.reminder_hour || 17,
    });
  };

  const handleReminderDayChange = (day: string) => {
    updateSettings({
      auto_shift_reminders: settings?.auto_shift_reminders || false,
      reminder_day: day,
      reminder_hour: settings?.reminder_hour || 17,
    });
  };

  const handleReminderHourChange = (hour: string) => {
    updateSettings({
      auto_shift_reminders: settings?.auto_shift_reminders || false,
      reminder_day: settings?.reminder_day || 'Thursday',
      reminder_hour: parseInt(hour),
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">טוען הגדרות...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          הגדרות תזכורות
        </CardTitle>
        <CardDescription>
          נהל הגדרות תזכורות אוטומטיות לעובדים
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Auto Reminders Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-reminders">תזכורות אוטומטיות</Label>
            <div className="text-sm text-gray-500">
              שלח תזכורות אוטומטיות לעובדים להגשת משמרות
            </div>
          </div>
          <Switch
            id="auto-reminders"
            checked={settings?.auto_shift_reminders || false}
            onCheckedChange={handleAutoRemindersChange}
            disabled={isUpdating}
          />
        </div>

        {/* Reminder Day Selection */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            יום שליחת התזכורת
          </Label>
          <Select
            value={settings?.reminder_day || 'Thursday'}
            onValueChange={handleReminderDayChange}
            disabled={isUpdating || !settings?.auto_shift_reminders}
          >
            <SelectTrigger>
              <SelectValue placeholder="בחר יום" />
            </SelectTrigger>
            <SelectContent>
              {daysOfWeek.map((day) => (
                <SelectItem key={day.value} value={day.value}>
                  {day.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Reminder Hour Selection */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            שעת שליחת התזכורת
          </Label>
          <Select
            value={settings?.reminder_hour?.toString() || '17'}
            onValueChange={handleReminderHourChange}
            disabled={isUpdating || !settings?.auto_shift_reminders}
          >
            <SelectTrigger>
              <SelectValue placeholder="בחר שעה" />
            </SelectTrigger>
            <SelectContent>
              {hours.map((hour) => (
                <SelectItem key={hour.value} value={hour.value.toString()}>
                  {hour.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Info Message */}
        {settings?.auto_shift_reminders && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-800">
              <strong>תזכורות פעילות:</strong> התזכורות ישלחו בכל יום{' '}
              {daysOfWeek.find(d => d.value === settings.reminder_day)?.label} בשעה{' '}
              {settings.reminder_hour.toString().padStart(2, '0')}:00 לעובדים שלא הגישו משמרות.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
