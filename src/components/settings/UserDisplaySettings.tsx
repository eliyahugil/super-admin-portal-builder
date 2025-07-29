import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Settings, Palette, Type, Layout, Sun, Moon, Monitor } from 'lucide-react';

interface UserDisplaySettingsProps {
  open: boolean;
  onClose: () => void;
}

interface DisplaySettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: number;
  colorScheme: 'default' | 'blue' | 'green' | 'purple' | 'orange';
  compactMode: boolean;
  language: 'he' | 'en';
  density: 'comfortable' | 'compact' | 'spacious';
  animations: boolean;
}

const defaultSettings: DisplaySettings = {
  theme: 'system',
  fontSize: 15,
  colorScheme: 'default',
  compactMode: false,
  language: 'he',
  density: 'comfortable',
  animations: true
};

export const UserDisplaySettings: React.FC<UserDisplaySettingsProps> = ({ open, onClose }) => {
  const [settings, setSettings] = useState<DisplaySettings>(defaultSettings);
  const [isDirty, setIsDirty] = useState(false);
  const { toast } = useToast();

  // טעינת הגדרות מ-localStorage
  useEffect(() => {
    if (open) {
      const savedSettings = localStorage.getItem('userDisplaySettings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          setSettings({ ...defaultSettings, ...parsed });
        } catch (error) {
          console.error('Error parsing saved settings:', error);
        }
      }
      setIsDirty(false);
    }
  }, [open]);

  // עדכון הגדרה
  const updateSetting = <K extends keyof DisplaySettings>(key: K, value: DisplaySettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  // שמירת הגדרות
  const saveSettings = () => {
    try {
      localStorage.setItem('userDisplaySettings', JSON.stringify(settings));
      applySettings(settings);
      setIsDirty(false);
      toast({
        title: "נשמר בהצלחה",
        description: "הגדרות התצוגה נשמרו ויופעלו",
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "שגיאה בשמירת ההגדרות",
        variant: "destructive"
      });
    }
  };

  // החלת הגדרות על ה-DOM
  const applySettings = (settings: DisplaySettings) => {
    const root = document.documentElement;
    
    // גודל גופן
    root.style.fontSize = `${settings.fontSize}px`;
    
    // ערכת צבעים
    if (settings.colorScheme !== 'default') {
      root.setAttribute('data-color-scheme', settings.colorScheme);
    } else {
      root.removeAttribute('data-color-scheme');
    }
    
    // מצב דחוס
    if (settings.compactMode) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }
    
    // צפיפות
    root.setAttribute('data-density', settings.density);
    
    // אנימציות
    if (!settings.animations) {
      root.classList.add('no-animations');
    } else {
      root.classList.remove('no-animations');
    }
    
    // ערכת נושא
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // system - השתמש בהעדפות המערכת
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      if (mediaQuery.matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  // איפוס להגדרות ברירת מחדל
  const resetToDefaults = () => {
    setSettings(defaultSettings);
    setIsDirty(true);
  };

  const colorSchemes = [
    { value: 'default', label: 'ברירת מחדל', colors: ['hsl(222.2 84% 4.9%)', 'hsl(210 40% 98%)'] },
    { value: 'blue', label: 'כחול', colors: ['hsl(221.2 83.2% 53.3%)', 'hsl(210 40% 98%)'] },
    { value: 'green', label: 'ירוק', colors: ['hsl(142.1 76.2% 36.3%)', 'hsl(138 76% 97%)'] },
    { value: 'purple', label: 'סגול', colors: ['hsl(262.1 83.3% 57.8%)', 'hsl(270 20% 98%)'] },
    { value: 'orange', label: 'כתום', colors: ['hsl(24.6 95% 53.1%)', 'hsl(24 76% 97%)'] }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="!w-[95vw] !max-w-[95vw] sm:!max-w-4xl !left-[50%] !translate-x-[-50%] max-h-[95vh] overflow-y-auto p-3 sm:p-6" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            הגדרות תצוגה
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="appearance" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="appearance">מראה</TabsTrigger>
            <TabsTrigger value="layout">פריסה</TabsTrigger>
            <TabsTrigger value="advanced">מתקדם</TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="space-y-6">
            {/* ערכת נושא */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  ערכת נושא
                </CardTitle>
                <CardDescription>בחר את מצב התצוגה המועדף עליך</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant={settings.theme === 'light' ? 'default' : 'outline'}
                    className="h-20 flex-col gap-2"
                    onClick={() => updateSetting('theme', 'light')}
                  >
                    <Sun className="h-6 w-6" />
                    בהיר
                  </Button>
                  <Button
                    variant={settings.theme === 'dark' ? 'default' : 'outline'}
                    className="h-20 flex-col gap-2"
                    onClick={() => updateSetting('theme', 'dark')}
                  >
                    <Moon className="h-6 w-6" />
                    כהה
                  </Button>
                  <Button
                    variant={settings.theme === 'system' ? 'default' : 'outline'}
                    className="h-20 flex-col gap-2"
                    onClick={() => updateSetting('theme', 'system')}
                  >
                    <Monitor className="h-6 w-6" />
                    מערכת
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* ערכת צבעים */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  ערכת צבעים
                </CardTitle>
                <CardDescription>בחר את צבעי המערכת</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {colorSchemes.map((scheme) => (
                    <Button
                      key={scheme.value}
                      variant={settings.colorScheme === scheme.value ? 'default' : 'outline'}
                      className="h-16 flex-col gap-2"
                      onClick={() => updateSetting('colorScheme', scheme.value as any)}
                    >
                      <div className="flex gap-1">
                        {scheme.colors.map((color, i) => (
                          <div
                            key={i}
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <span className="text-xs">{scheme.label}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* גודל גופן */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  גודל גופן
                </CardTitle>
                <CardDescription>התאם את גודל הטקסט במערכת</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>גודל: {settings.fontSize}px</Label>
                  <span className="text-sm text-muted-foreground">דוגמה לטקסט</span>
                </div>
                <Slider
                  value={[settings.fontSize]}
                  onValueChange={(value) => updateSetting('fontSize', value[0])}
                  min={12}
                  max={20}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>קטן</span>
                  <span>גדול</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="layout" className="space-y-6">
            {/* צפיפות */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="h-4 w-4" />
                  צפיפות תצוגה
                </CardTitle>
                <CardDescription>התאם את כמות המידע המוצגת</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={settings.density} onValueChange={(value) => updateSetting('density', value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">דחוס - יותר מידע פחות רווח</SelectItem>
                    <SelectItem value="comfortable">נוח - איזון מושלם</SelectItem>
                    <SelectItem value="spacious">מרווח - יותר רווח פחות מידע</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* מצב דחוס */}
            <Card>
              <CardHeader>
                <CardTitle>מצב דחוס נוסף</CardTitle>
                <CardDescription>הקטן עוד יותר את גודל הרכיבים</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.compactMode}
                    onCheckedChange={(checked) => updateSetting('compactMode', checked)}
                  />
                  <Label>הפעל מצב דחוס</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            {/* אנימציות */}
            <Card>
              <CardHeader>
                <CardTitle>אנימציות</CardTitle>
                <CardDescription>הפעל או כבה אנימציות במערכת</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.animations}
                    onCheckedChange={(checked) => updateSetting('animations', checked)}
                  />
                  <Label>הפעל אנימציות</Label>
                </div>
              </CardContent>
            </Card>

            {/* שפה */}
            <Card>
              <CardHeader>
                <CardTitle>שפה</CardTitle>
                <CardDescription>בחר את שפת הממשק</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={settings.language} onValueChange={(value) => updateSetting('language', value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="he">עברית</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Separator />

        <div className="flex justify-between items-center pt-4">
          <Button variant="outline" onClick={resetToDefaults}>
            איפוס לברירת מחדל
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              ביטול
            </Button>
            <Button onClick={saveSettings} disabled={!isDirty}>
              שמור הגדרות
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};