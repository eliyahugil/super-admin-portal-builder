
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Settings, Database, Bell, Shield, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdvancedSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessId?: string | null;
}

export const AdvancedSettingsDialog: React.FC<AdvancedSettingsDialogProps> = ({
  open,
  onOpenChange,
  businessId
}) => {
  const { toast } = useToast();
  const [settings, setSettings] = React.useState({
    autoArchiveInactive: false,
    archiveAfterDays: 90,
    enableNotifications: true,
    notificationHours: 24,
    requireApproval: false,
    maxWeeklyHours: 168,
    enableBranchRestrictions: false,
    backupFrequency: 'weekly'
  });

  const handleSaveSettings = () => {
    console.log('💾 Saving advanced settings:', settings);
    toast({
      title: 'הגדרות נשמרו',
      description: 'ההגדרות המתקדמות נשמרו בהצלחה',
    });
    onOpenChange(false);
  };

  const settingSections = [
    {
      title: 'ניהול נתונים',
      icon: Database,
      settings: [
        {
          key: 'autoArchiveInactive',
          label: 'ארכוב אוטומטי של עובדים לא פעילים',
          description: 'העבר אוטומטית עובדים לארכיון אם לא היו פעילים זמן מה',
          type: 'switch' as const
        },
        {
          key: 'archiveAfterDays',
          label: 'ימים לארכוב אוטומטי',
          description: 'מספר הימים לאחר חוסר פעילות',
          type: 'number' as const,
          condition: 'autoArchiveInactive'
        }
      ]
    },
    {
      title: 'התראות',
      icon: Bell,
      settings: [
        {
          key: 'enableNotifications',
          label: 'התראות אוטומטיות',
          description: 'שלח התראות על אירועים חשובים',
          type: 'switch' as const
        },
        {
          key: 'notificationHours',
          label: 'התראה מוקדמת (שעות)',
          description: 'כמה שעות לפני האירוע לשלוח התראה',
          type: 'number' as const,
          condition: 'enableNotifications'
        }
      ]
    },
    {
      title: 'בקרת גישה',
      icon: Shield,
      settings: [
        {
          key: 'requireApproval',
          label: 'דרוש אישור למשמרות',
          description: 'כל משמרת חדשה דורשת אישור מנהל',
          type: 'switch' as const
        },
        {
          key: 'enableBranchRestrictions',
          label: 'הגבלות סניפים',
          description: 'הגבל עובדים לסניפים מסוימים בלבד',
          type: 'switch' as const
        }
      ]
    },
    {
      title: 'הגדרות זמן',
      icon: Clock,
      settings: [
        {
          key: 'maxWeeklyHours',
          label: 'מקסימום שעות שבועיות',
          description: 'מספר השעות המקסימלי לשבוע',
          type: 'number' as const
        }
      ]
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            הגדרות מתקדמות
          </DialogTitle>
          <DialogDescription>
            הגדר את המערכת בהתאם לצרכים הספציפיים של העסק
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {settingSections.map((section, sectionIndex) => (
            <Card key={sectionIndex}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <section.icon className="h-5 w-5" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {section.settings.map((setting, settingIndex) => {
                  const shouldShow = !setting.condition || settings[setting.condition as keyof typeof settings];
                  
                  if (!shouldShow) return null;

                  return (
                    <div key={settingIndex} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="font-medium">{setting.label}</Label>
                          <p className="text-sm text-gray-600">{setting.description}</p>
                        </div>
                        
                        {setting.type === 'switch' ? (
                          <Switch
                            checked={settings[setting.key as keyof typeof settings] as boolean}
                            onCheckedChange={(checked) => 
                              setSettings(prev => ({ ...prev, [setting.key]: checked }))
                            }
                          />
                        ) : (
                          <Input
                            type="number"
                            value={settings[setting.key as keyof typeof settings] as number}
                            onChange={(e) => 
                              setSettings(prev => ({ ...prev, [setting.key]: parseInt(e.target.value) || 0 }))
                            }
                            className="w-24"
                          />
                        )}
                      </div>
                      {settingIndex < section.settings.length - 1 && <Separator />}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ביטול
          </Button>
          <Button onClick={handleSaveSettings}>
            שמור הגדרות
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
