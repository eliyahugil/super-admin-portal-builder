import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, AlertTriangle, Users, Settings, Volume2, Smartphone, Mail } from 'lucide-react';
import { useAdvancedNotifications } from '@/hooks/useAdvancedNotifications';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const notificationCategories = [
  {
    id: 'attendance',
    name: 'נוכחות',
    icon: Clock,
    description: 'התראות הקשורות לנוכחות עובדים',
    settings: [
      { key: 'late_arrival', name: 'איחורים לעבודה', description: 'התראה כשעובד מאחר מעבר לזמן שהוגדר' },
      { key: 'early_departure', name: 'עזיבה מוקדמת', description: 'התראה כשעובד עוזב לפני סיום המשמרת' },
      { key: 'missing_checkin', name: 'חסרת כניסה', description: 'התראה כשעובד לא מבצע כניסה למערכת' },
      { key: 'missing_checkout', name: 'חסרת יציאה', description: 'התראה כשעובד לא מבצע יציאה מהמערכת' }
    ]
  },
  {
    id: 'overtime',
    name: 'שעות נוספות',
    icon: AlertTriangle,
    description: 'התראות על שעות נוספות ועבודה מעבר לזמן',
    settings: [
      { key: 'overtime_threshold', name: 'חריגה משעות עבודה', description: 'התראה כשעובד עובד מעבר לזמן המותר' },
      { key: 'weekly_overtime', name: 'שעות נוספות שבועיות', description: 'התראה על חריגה משעות שבועיות' },
      { key: 'continuous_work', name: 'עבודה רצופה', description: 'התראה על עבודה רצופה ללא הפסקה' }
    ]
  },
  {
    id: 'break',
    name: 'הפסקות',
    icon: Users,
    description: 'התראות הקשורות להפסקות עובדים',
    settings: [
      { key: 'break_overdue', name: 'איחור בהפסקה', description: 'התראה כשעובד לא יוצא להפסקה בזמן' },
      { key: 'long_break', name: 'הפסקה ארוכה', description: 'התראה כשעובד בהפסקה מעבר לזמן המותר' },
      { key: 'missing_break', name: 'חסרת הפסקה', description: 'התראה כשעובד לא יוצא להפסקה במשמרת ארוכה' }
    ]
  },
  {
    id: 'shift',
    name: 'משמרות',
    icon: Bell,
    description: 'התראות על הגשות ושינויים במשמרות',
    settings: [
      { key: 'shift_submission', name: 'הגשת משמרות', description: 'התראה על הגשות משמרות חדשות' },
      { key: 'shift_changes', name: 'שינויים במשמרות', description: 'התראה על שינויים במשמרות מתוכננות' },
      { key: 'unfilled_shifts', name: 'משמרות לא מאוישות', description: 'התראה על משמרות שנותרו ללא עובדים' }
    ]
  },
  {
    id: 'system',
    name: 'מערכת',
    icon: Settings,
    description: 'התראות מערכת כלליות',
    settings: [
      { key: 'employee_registration', name: 'רישום עובדים חדשים', description: 'התראה על עובדים חדשים שנרשמו' },
      { key: 'system_errors', name: 'שגיאות מערכת', description: 'התראה על שגיאות ובעיות טכניות' },
      { key: 'maintenance', name: 'תחזוקה', description: 'התראות על עדכונים ותחזוקת מערכת' }
    ]
  }
];

export const AdvancedNotificationSettings: React.FC = () => {
  const { settings, updateSetting, playNotificationSound } = useAdvancedNotifications();
  const [activeCategory, setActiveCategory] = useState('attendance');

  const getSetting = (settingType: string, settingKey: string) => {
    return settings.find(s => s.setting_type === settingType && s.setting_key === settingKey);
  };

  const handleToggleSetting = async (settingType: string, settingKey: string, enabled: boolean) => {
    await updateSetting(settingType, settingKey, { is_enabled: enabled });
  };

  const handleUpdateThreshold = async (settingType: string, settingKey: string, value: number, unit: string) => {
    await updateSetting(settingType, settingKey, { threshold_value: value, threshold_unit: unit });
  };

  const handleToggleSound = async (settingType: string, settingKey: string, enabled: boolean) => {
    await updateSetting(settingType, settingKey, { sound_enabled: enabled });
  };

  const handleToggleMobile = async (settingType: string, settingKey: string, enabled: boolean) => {
    await updateSetting(settingType, settingKey, { mobile_enabled: enabled });
  };

  const handleToggleEmail = async (settingType: string, settingKey: string, enabled: boolean) => {
    await updateSetting(settingType, settingKey, { email_enabled: enabled });
  };

  const testSound = (severity: 'info' | 'warning' | 'error' | 'critical') => {
    playNotificationSound(severity);
  };

  const activeMenu = notificationCategories.find(c => c.id === activeCategory);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center gap-2">
        <Bell className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">הגדרות התראות מתקדמות</h2>
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full">
          {notificationCategories.map((category) => {
            const Icon = category.icon;
            return (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {category.name}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {notificationCategories.map((category) => (
          <TabsContent key={category.id} value={category.id}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <category.icon className="h-6 w-6 text-primary" />
                  <div>
                    <CardTitle>{category.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {category.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {category.settings.map((settingDef) => {
                  const setting = getSetting(category.id, settingDef.key);
                  const isEnabled = setting?.is_enabled ?? true;
                  const thresholdValue = setting?.threshold_value ?? 15;
                  const thresholdUnit = setting?.threshold_unit ?? 'minutes';
                  const soundEnabled = setting?.sound_enabled ?? true;
                  const mobileEnabled = setting?.mobile_enabled ?? true;
                  const emailEnabled = setting?.email_enabled ?? false;

                  return (
                    <div key={settingDef.key} className="space-y-4 p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Label className="text-base font-medium">{settingDef.name}</Label>
                            {isEnabled && (
                              <Badge variant="outline" className="text-green-600 border-green-300">
                                פעיל
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {settingDef.description}
                          </p>
                        </div>
                        <Switch
                          checked={isEnabled}
                          onCheckedChange={(checked) => 
                            handleToggleSetting(category.id, settingDef.key, checked)
                          }
                        />
                      </div>

                      {isEnabled && (
                        <div className="space-y-4 pt-4 border-t">
                          {/* הגדרת סף זמן */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm">סף זמן</Label>
                              <Input
                                type="number"
                                value={thresholdValue}
                                onChange={(e) => 
                                  handleUpdateThreshold(
                                    category.id, 
                                    settingDef.key, 
                                    parseInt(e.target.value) || 0, 
                                    thresholdUnit
                                  )
                                }
                                min="1"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm">יחידת זמן</Label>
                              <Select
                                value={thresholdUnit}
                                onValueChange={(value) =>
                                  handleUpdateThreshold(category.id, settingDef.key, thresholdValue, value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="minutes">דקות</SelectItem>
                                  <SelectItem value="hours">שעות</SelectItem>
                                  <SelectItem value="days">ימים</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <Separator />

                          {/* אפשרויות התראה */}
                          <div className="space-y-3">
                            <Label className="text-sm font-medium">אפשרויות התראה:</Label>
                            
                            <div className="grid grid-cols-3 gap-4">
                              <div className="flex items-center gap-3">
                                <Volume2 className="h-4 w-4 text-muted-foreground" />
                                <div className="flex-1">
                                  <Label className="text-sm">צליל</Label>
                                  <Switch
                                    checked={soundEnabled}
                                    onCheckedChange={(checked) =>
                                      handleToggleSound(category.id, settingDef.key, checked)
                                    }
                                    className="mt-1"
                                  />
                                </div>
                                {soundEnabled && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => testSound('info')}
                                    className="h-6 px-2 text-xs"
                                  >
                                    בדיקה
                                  </Button>
                                )}
                              </div>

                              <div className="flex items-center gap-3">
                                <Smartphone className="h-4 w-4 text-muted-foreground" />
                                <div className="flex-1">
                                  <Label className="text-sm">מובייל</Label>
                                  <Switch
                                    checked={mobileEnabled}
                                    onCheckedChange={(checked) =>
                                      handleToggleMobile(category.id, settingDef.key, checked)
                                    }
                                    className="mt-1"
                                  />
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <div className="flex-1">
                                  <Label className="text-sm">אימייל</Label>
                                  <Switch
                                    checked={emailEnabled}
                                    onCheckedChange={(checked) =>
                                      handleToggleEmail(category.id, settingDef.key, checked)
                                    }
                                    className="mt-1"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* בדיקת צלילים */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            בדיקת צלילי התראה
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => testSound('info')}>
              מידע
            </Button>
            <Button variant="outline" onClick={() => testSound('warning')}>
              אזהרה
            </Button>
            <Button variant="outline" onClick={() => testSound('error')}>
              שגיאה
            </Button>
            <Button variant="outline" onClick={() => testSound('critical')}>
              קריטי
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};