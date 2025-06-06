
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useBusiness } from '@/hooks/useBusiness';
import { supabase } from '@/integrations/supabase/client';
import { Clock, Calendar, Send } from 'lucide-react';

interface ScheduleSettings {
  send_day: string;
  send_time: string;
  channel_type: string;
  is_active: boolean;
  message_template?: string;
}

export const ShiftTokenSchedulePage: React.FC = () => {
  const { businessId, isLoading } = useBusiness();
  const { toast } = useToast();
  const [schedule, setSchedule] = useState<ScheduleSettings>({
    send_day: 'Thursday',
    send_time: '09:00',
    channel_type: 'whatsapp',
    is_active: false,
  });
  const [loading, setLoading] = useState(false);

  const daysInHebrew = {
    'Sunday': 'ראשון',
    'Monday': 'שני', 
    'Tuesday': 'שלישי',
    'Wednesday': 'רביעי',
    'Thursday': 'חמישי',
    'Friday': 'שישי',
    'Saturday': 'שבת'
  };

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!businessId || isLoading) return;

      const { data, error } = await supabase
        .from('shift_token_schedules')
        .select('*')
        .eq('business_id', businessId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching schedule:', error);
        return;
      }

      if (data) {
        setSchedule(data);
      }
    };

    fetchSchedule();
  }, [businessId, isLoading]);

  const updateSchedule = async (updates: Partial<ScheduleSettings>) => {
    if (!businessId) return;

    setLoading(true);
    const newData = { ...schedule, ...updates };
    setSchedule(newData);

    try {
      const { error } = await supabase
        .from('shift_token_schedules')
        .upsert({
          ...newData,
          business_id: businessId,
        }, { 
          onConflict: 'business_id',
          ignoreDuplicates: false 
        });

      if (error) throw error;

      toast({
        title: 'הצלחה',
        description: 'הגדרות התזמון נשמרו בהצלחה',
      });
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast({
        title: 'שגיאה',
        description: 'שגיאה בשמירת הגדרות התזמון',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">טוען הגדרות...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">תזמון שליחת טוכני משמרות</h1>
        <p className="text-gray-600">הגדר מתי ואיך לשלוח טוכני משמרות לעובדים</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            הגדרות תזמון
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* יום שליחה */}
          <div className="flex items-center gap-4">
            <Calendar className="h-5 w-5 text-blue-600" />
            <label className="text-sm font-medium min-w-[100px]">יום שליחה:</label>
            <Select
              value={schedule.send_day}
              onValueChange={(value) => updateSchedule({ send_day: value })}
              disabled={loading}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(daysInHebrew).map(([en, he]) => (
                  <SelectItem key={en} value={en}>
                    {he}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* שעת שליחה */}
          <div className="flex items-center gap-4">
            <Clock className="h-5 w-5 text-blue-600" />
            <label className="text-sm font-medium min-w-[100px]">שעת שליחה:</label>
            <Input
              type="time"
              value={schedule.send_time}
              onChange={(e) => updateSchedule({ send_time: e.target.value })}
              disabled={loading}
              className="w-[200px]"
            />
          </div>

          {/* אמצעי שליחה */}
          <div className="flex items-center gap-4">
            <Send className="h-5 w-5 text-blue-600" />
            <label className="text-sm font-medium min-w-[100px]">אמצעי שליחה:</label>
            <Select
              value={schedule.channel_type}
              onValueChange={(value) => updateSchedule({ channel_type: value })}
              disabled={loading}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="whatsapp">וואטסאפ רגיל</SelectItem>
                <SelectItem value="api">WhatsApp API</SelectItem>
                <SelectItem value="link">קישור בלבד</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* הפעלה/כיבוי */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <Switch
              checked={schedule.is_active}
              onCheckedChange={(checked) => updateSchedule({ is_active: checked })}
              disabled={loading}
            />
            <div className="flex-1">
              <p className="font-medium">שליחה אוטומטית פעילה</p>
              <p className="text-sm text-gray-600">
                {schedule.is_active 
                  ? `טוכנים יישלחו בכל יום ${daysInHebrew[schedule.send_day as keyof typeof daysInHebrew]} בשעה ${schedule.send_time}` 
                  : 'שליחה אוטומטית מבוטלת'
                }
              </p>
            </div>
          </div>

          {/* תבנית הודעה */}
          <div className="space-y-2">
            <label className="text-sm font-medium">תבנית הודעה (אופציונלי):</label>
            <textarea
              value={schedule.message_template || ''}
              onChange={(e) => updateSchedule({ message_template: e.target.value })}
              placeholder="השאר ריק לתבנית ברירת מחדל"
              disabled={loading}
              className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500">
              אם לא תמלא, תישלח הודעה סטנדרטית עם הקישור לטוכן
            </p>
          </div>
        </CardContent>
      </Card>

      {/* מידע נוסף */}
      <Card>
        <CardHeader>
          <CardTitle>מידע חשוב</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <p>השליחה האוטומטית תתבצע רק לעובדים פעילים עם מספר טלפון</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <p>ניתן לראות לוג של השליחות בעמוד הגדרות העסק</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <p>WhatsApp API דורש הגדרה נפרדת באינטגרציות</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
