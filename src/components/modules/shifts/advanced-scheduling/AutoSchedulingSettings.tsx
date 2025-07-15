import React, { useState } from 'react';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Settings, Play, AlertTriangle, CheckCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AutoSchedulingSettingsData {
  id?: string;
  business_id: string;
  algorithm_type: 'basic' | 'advanced' | 'ai_optimized';
  optimization_goals: {
    priorities: string[];
  };
  auto_schedule_enabled: boolean;
  schedule_weeks_ahead: number;
  notification_preferences: {
    notify_employees: boolean;
    notify_managers: boolean;
  };
  conflict_resolution: 'manual_review' | 'auto_resolve' | 'hybrid';
}

export const AutoSchedulingSettings: React.FC = () => {
  const { businessId } = useCurrentBusiness();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [settings, setSettings] = useState<AutoSchedulingSettingsData>({
    business_id: businessId || '',
    algorithm_type: 'basic',
    optimization_goals: { priorities: ['coverage', 'fairness', 'cost'] },
    auto_schedule_enabled: false,
    schedule_weeks_ahead: 2,
    notification_preferences: { notify_employees: true, notify_managers: true },
    conflict_resolution: 'manual_review'
  });

  // שליפת הגדרות קיימות
  const { data: currentSettings, isLoading } = useQuery({
    queryKey: ['auto-scheduling-settings', businessId],
    queryFn: async () => {
      if (!businessId) return null;
      
      const { data, error } = await supabase
        .from('auto_scheduling_settings')
        .select('*')
        .eq('business_id', businessId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    },
    enabled: !!businessId
  });

  // עדכון הגדרות מקומיות כאשר נטענו הגדרות מהשרת
  React.useEffect(() => {
    if (currentSettings) {
      setSettings(currentSettings as AutoSchedulingSettingsData);
    }
  }, [currentSettings]);

  // שמירת הגדרות
  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: AutoSchedulingSettingsData) => {
      if (currentSettings?.id) {
        const { error } = await supabase
          .from('auto_scheduling_settings')
          .update(newSettings)
          .eq('id', currentSettings.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('auto_scheduling_settings')
          .insert([newSettings]);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auto-scheduling-settings', businessId] });
      toast({
        title: "הגדרות נשמרו בהצלחה",
        description: "הגדרות הסידור האוטומטי עודכנו."
      });
    },
    onError: (error) => {
      toast({
        title: "שגיאה בשמירת ההגדרות",
        description: "אנא נסה שוב.",
        variant: "destructive"
      });
      console.error('Error saving settings:', error);
    }
  });

  // יצירת סידור אוטומטי
  const generateScheduleMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-auto-schedule', {
        body: { businessId }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "סידור נוצר בהצלחה",
        description: "הסידור האוטומטי נוצר על בסיס ההגדרות שלך."
      });
    },
    onError: (error) => {
      toast({
        title: "שגיאה ביצירת הסידור",
        description: "אנא נסה שוב או בדוק את ההגדרות.",
        variant: "destructive"
      });
      console.error('Error generating schedule:', error);
    }
  });

  const handleSaveSettings = () => {
    saveSettingsMutation.mutate(settings);
  };

  const handleGenerateSchedule = () => {
    generateScheduleMutation.mutate();
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">טוען...</div>;
  }

  return (
    <div className="space-y-6">
      {/* סטטוס הסידור האוטומטי */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            סטטוס מערכת
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.auto_schedule_enabled ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>סידור אוטומטי פעיל</span>
                  <Badge variant="secondary">
                    {settings.algorithm_type === 'basic' && 'בסיסי'}
                    {settings.algorithm_type === 'advanced' && 'מתקדם'}
                    {settings.algorithm_type === 'ai_optimized' && 'AI מאופטם'}
                  </Badge>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <span>סידור אוטומטי לא פעיל</span>
                </>
              )}
            </div>
            <Button 
              onClick={handleGenerateSchedule}
              disabled={generateScheduleMutation.isPending}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              צור סידור עכשיו
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* הגדרות בסיסיות */}
      <Card>
        <CardHeader>
          <CardTitle>הגדרות בסיסיות</CardTitle>
          <CardDescription>הגדרות כלליות לסידור האוטומטי</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-enabled">הפעלת סידור אוטומטי</Label>
            <Switch
              id="auto-enabled"
              checked={settings.auto_schedule_enabled}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, auto_schedule_enabled: checked }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>סוג אלגוריתם</Label>
            <Select 
              value={settings.algorithm_type} 
              onValueChange={(value: any) => 
                setSettings(prev => ({ ...prev, algorithm_type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">בסיסי - חלוקה פשותה לפי זמינות</SelectItem>
                <SelectItem value="advanced">מתקדם - התחשבות באילוצים ועדיפויות</SelectItem>
                <SelectItem value="ai_optimized">מאופטם AI - אופטימיזציה חכמה</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>תכנון שבועות קדימה: {settings.schedule_weeks_ahead}</Label>
            <Slider
              value={[settings.schedule_weeks_ahead]}
              onValueChange={([value]) => 
                setSettings(prev => ({ ...prev, schedule_weeks_ahead: value }))
              }
              max={12}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>שבוע אחד</span>
              <span>12 שבועות</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>פתרון קונפליקטים</Label>
            <Select 
              value={settings.conflict_resolution} 
              onValueChange={(value: any) => 
                setSettings(prev => ({ ...prev, conflict_resolution: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual_review">בדיקה ידנית - הצגת קונפליקטים למנהל</SelectItem>
                <SelectItem value="auto_resolve">פתרון אוטומטי - המערכת פותרת בעצמה</SelectItem>
                <SelectItem value="hybrid">משולב - פתרון חלקי ובדיקה ידנית</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* העדפות התראות */}
      <Card>
        <CardHeader>
          <CardTitle>העדפות התראות</CardTitle>
          <CardDescription>קביעת מי יקבל התראות על סידורים חדשים</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="notify-employees">שלח התראות לעובדים</Label>
            <Switch
              id="notify-employees"
              checked={settings.notification_preferences.notify_employees}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ 
                  ...prev, 
                  notification_preferences: { 
                    ...prev.notification_preferences, 
                    notify_employees: checked 
                  }
                }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="notify-managers">שלח התראות למנהלים</Label>
            <Switch
              id="notify-managers"
              checked={settings.notification_preferences.notify_managers}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ 
                  ...prev, 
                  notification_preferences: { 
                    ...prev.notification_preferences, 
                    notify_managers: checked 
                  }
                }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* שמירת הגדרות */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSaveSettings}
          disabled={saveSettingsMutation.isPending}
          size="lg"
        >
          {saveSettingsMutation.isPending ? 'שומר...' : 'שמור הגדרות'}
        </Button>
      </div>
    </div>
  );
};