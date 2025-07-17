import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  Clock, 
  MessageSquare, 
  Shield, 
  Users, 
  CalendarDays, 
  Edit, 
  Save, 
  Plus, 
  Trash2,
  AlertCircle,
  Info
} from 'lucide-react';

interface ShiftDefinition {
  id: string;
  name: string;
  type: 'morning' | 'afternoon' | 'evening' | 'night';
  startTime: string;
  endTime: string;
  color: string;
  minSubmissionHours: number;
  isActive: boolean;
}

interface SubmissionRule {
  id: string;
  name: string;
  type: 'minimum_shifts' | 'maximum_shifts' | 'deadline_hours' | 'custom';
  value: number;
  description: string;
  isActive: boolean;
}

interface SystemMessage {
  id: string;
  key: string;
  title: string;
  content: string;
  type: 'token_header' | 'token_footer' | 'submission_success' | 'submission_error' | 'reminder';
  isActive: boolean;
}

const SystemSettings: React.FC = () => {
  const { toast } = useToast();
  
  // State for shift definitions
  const [shiftDefinitions, setShiftDefinitions] = useState<ShiftDefinition[]>([
    {
      id: '1',
      name: 'משמרת בוקר',
      type: 'morning',
      startTime: '06:00',
      endTime: '14:59',
      color: '#FEF3C7',
      minSubmissionHours: 48,
      isActive: true
    },
    {
      id: '2',
      name: 'משמרת אחר צהריים',
      type: 'afternoon',
      startTime: '15:00',
      endTime: '15:59',
      color: '#DBEAFE',
      minSubmissionHours: 48,
      isActive: true
    },
    {
      id: '3',
      name: 'משמרת ערב',
      type: 'evening',
      startTime: '16:00',
      endTime: '01:59',
      color: '#F3E8FF',
      minSubmissionHours: 72,
      isActive: true
    },
    {
      id: '4',
      name: 'משמרת לילה',
      type: 'night',
      startTime: '02:00',
      endTime: '05:59',
      color: '#F1F5F9',
      minSubmissionHours: 96,
      isActive: false
    }
  ]);

  // State for submission rules
  const [submissionRules, setSubmissionRules] = useState<SubmissionRule[]>([
    {
      id: '1',
      name: 'מינימום משמרות לעובד',
      type: 'minimum_shifts',
      value: 2,
      description: 'כל עובד חייב להגיש לפחות 2 משמרות בשבוע',
      isActive: true
    },
    {
      id: '2',
      name: 'מקסימום משמרות לעובד',
      type: 'maximum_shifts',
      value: 6,
      description: 'עובד לא יכול להגיש יותר מ-6 משמרות בשבוע',
      isActive: true
    },
    {
      id: '3',
      name: 'זמן סגירת הגשה (שעות)',
      type: 'deadline_hours',
      value: 48,
      description: 'ההגשה נסגרת 48 שעות לפני תחילת השבוע',
      isActive: true
    }
  ]);

  // State for system messages
  const [systemMessages, setSystemMessages] = useState<SystemMessage[]>([
    {
      id: '1',
      key: 'token_header',
      title: 'כותרת טוקן שבועי',
      content: 'ברוכים הבאים להגשת משמרות שבועית!\nאנא בחרו את המשמרות המועדפות עליכם.',
      type: 'token_header',
      isActive: true
    },
    {
      id: '2',
      key: 'token_footer',
      title: 'סיום טוקן שבועי',
      content: 'תודה על הגשתכם!\nנחזור אליכם בהקדם עם לוח המשמרות הסופי.',
      type: 'token_footer',
      isActive: true
    },
    {
      id: '3',
      key: 'submission_success',
      title: 'הודעת הצלחה',
      content: 'ההגשה בוצעה בהצלחה! תקבלו עדכון לגבי לוח המשמרות בקרוב.',
      type: 'submission_success',
      isActive: true
    }
  ]);

  const [activeTab, setActiveTab] = useState('shifts');

  const handleSaveShiftDefinition = (shiftId: string, updatedShift: Partial<ShiftDefinition>) => {
    setShiftDefinitions(prev => 
      prev.map(shift => 
        shift.id === shiftId 
          ? { ...shift, ...updatedShift }
          : shift
      )
    );
    
    toast({
      title: 'נשמר בהצלחה',
      description: 'הגדרות המשמרת עודכנו',
    });
  };

  const handleSaveSubmissionRule = (ruleId: string, updatedRule: Partial<SubmissionRule>) => {
    setSubmissionRules(prev => 
      prev.map(rule => 
        rule.id === ruleId 
          ? { ...rule, ...updatedRule }
          : rule
      )
    );
    
    toast({
      title: 'נשמר בהצלחה',
      description: 'חוק ההגשה עודכן',
    });
  };

  const handleSaveSystemMessage = (messageId: string, updatedMessage: Partial<SystemMessage>) => {
    setSystemMessages(prev => 
      prev.map(message => 
        message.id === messageId 
          ? { ...message, ...updatedMessage }
          : message
      )
    );
    
    toast({
      title: 'נשמר בהצלחה',
      description: 'הודעת המערכת עודכנה',
    });
  };

  const addNewShiftDefinition = () => {
    const newShift: ShiftDefinition = {
      id: Date.now().toString(),
      name: 'משמרת חדשה',
      type: 'morning',
      startTime: '08:00',
      endTime: '16:00',
      color: '#E5E7EB',
      minSubmissionHours: 48,
      isActive: true
    };
    
    setShiftDefinitions(prev => [...prev, newShift]);
  };

  const deleteShiftDefinition = (shiftId: string) => {
    setShiftDefinitions(prev => prev.filter(shift => shift.id !== shiftId));
    toast({
      title: 'נמחק בהצלחה',
      description: 'הגדרת המשמרת הוסרה',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">הגדרות מערכת</h1>
          </div>
          <p className="text-gray-600">
            ניהול הגדרות כלליות, חוקי הגשה, הודעות מערכת והגדרות משמרות
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="shifts" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              הגדרות משמרות
            </TabsTrigger>
            <TabsTrigger value="rules" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              חוקי הגשה
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              הודעות מערכת
            </TabsTrigger>
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              הגדרות כלליות
            </TabsTrigger>
          </TabsList>

          {/* Shift Definitions Tab */}
          <TabsContent value="shifts" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      הגדרות משמרות
                    </CardTitle>
                    <CardDescription>
                      הגדרת שעות, שמות וחוקים לכל סוג משמרת
                    </CardDescription>
                  </div>
                  <Button onClick={addNewShiftDefinition} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    הוסף משמרת
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {shiftDefinitions.map((shift) => (
                  <Card key={shift.id} className="border border-gray-200">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: shift.color }}
                          />
                          <CardTitle className="text-lg">{shift.name}</CardTitle>
                          <Badge variant={shift.isActive ? 'default' : 'secondary'}>
                            {shift.isActive ? 'פעיל' : 'לא פעיל'}
                          </Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteShiftDefinition(shift.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`shift-name-${shift.id}`}>שם המשמרת</Label>
                          <Input
                            id={`shift-name-${shift.id}`}
                            value={shift.name}
                            onChange={(e) => handleSaveShiftDefinition(shift.id, { name: e.target.value })}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`shift-type-${shift.id}`}>סוג משמרת</Label>
                          <Select
                            value={shift.type}
                            onValueChange={(value: 'morning' | 'afternoon' | 'evening' | 'night') => 
                              handleSaveShiftDefinition(shift.id, { type: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="morning">בוקר</SelectItem>
                              <SelectItem value="afternoon">אחר צהריים</SelectItem>
                              <SelectItem value="evening">ערב</SelectItem>
                              <SelectItem value="night">לילה</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`shift-color-${shift.id}`}>צבע</Label>
                          <Input
                            id={`shift-color-${shift.id}`}
                            type="color"
                            value={shift.color}
                            onChange={(e) => handleSaveShiftDefinition(shift.id, { color: e.target.value })}
                            className="h-10"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`shift-start-${shift.id}`}>שעת התחלה</Label>
                          <Input
                            id={`shift-start-${shift.id}`}
                            type="time"
                            value={shift.startTime}
                            onChange={(e) => handleSaveShiftDefinition(shift.id, { startTime: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`shift-end-${shift.id}`}>שעת סיום</Label>
                          <Input
                            id={`shift-end-${shift.id}`}
                            type="time"
                            value={shift.endTime}
                            onChange={(e) => handleSaveShiftDefinition(shift.id, { endTime: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`shift-min-hours-${shift.id}`}>מינימום שעות להגשה</Label>
                          <Input
                            id={`shift-min-hours-${shift.id}`}
                            type="number"
                            value={shift.minSubmissionHours}
                            onChange={(e) => handleSaveShiftDefinition(shift.id, { minSubmissionHours: parseInt(e.target.value) })}
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`shift-active-${shift.id}`}
                            checked={shift.isActive}
                            onCheckedChange={(checked) => handleSaveShiftDefinition(shift.id, { isActive: checked })}
                          />
                          <Label htmlFor={`shift-active-${shift.id}`}>משמרת פעילה</Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Submission Rules Tab */}
          <TabsContent value="rules" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  חוקי הגשה ואילוצים
                </CardTitle>
                <CardDescription>
                  הגדרת חוקים ואילוצים עבור הגשת משמרות
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {submissionRules.map((rule) => (
                  <Card key={rule.id} className="border border-gray-200">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-medium">{rule.name}</h3>
                          <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                            {rule.isActive ? 'פעיל' : 'לא פעיל'}
                          </Badge>
                        </div>
                        <Switch
                          checked={rule.isActive}
                          onCheckedChange={(checked) => handleSaveSubmissionRule(rule.id, { isActive: checked })}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`rule-value-${rule.id}`}>ערך</Label>
                          <Input
                            id={`rule-value-${rule.id}`}
                            type="number"
                            value={rule.value}
                            onChange={(e) => handleSaveSubmissionRule(rule.id, { value: parseInt(e.target.value) })}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`rule-description-${rule.id}`}>תיאור</Label>
                          <Input
                            id={`rule-description-${rule.id}`}
                            value={rule.description}
                            onChange={(e) => handleSaveSubmissionRule(rule.id, { description: e.target.value })}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  הודעות מערכת
                </CardTitle>
                <CardDescription>
                  עריכת הודעות שמופיעות בטוקנים ובמערכת
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {systemMessages.map((message) => (
                  <Card key={message.id} className="border border-gray-200">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-lg">{message.title}</CardTitle>
                          <Badge variant={message.isActive ? 'default' : 'secondary'}>
                            {message.isActive ? 'פעיל' : 'לא פעיל'}
                          </Badge>
                        </div>
                        <Switch
                          checked={message.isActive}
                          onCheckedChange={(checked) => handleSaveSystemMessage(message.id, { isActive: checked })}
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor={`message-title-${message.id}`}>כותרת</Label>
                          <Input
                            id={`message-title-${message.id}`}
                            value={message.title}
                            onChange={(e) => handleSaveSystemMessage(message.id, { title: e.target.value })}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`message-content-${message.id}`}>תוכן ההודעה</Label>
                          <Textarea
                            id={`message-content-${message.id}`}
                            value={message.content}
                            onChange={(e) => handleSaveSystemMessage(message.id, { content: e.target.value })}
                            rows={4}
                            placeholder="הכניסו את תוכן ההודעה כאן..."
                          />
                        </div>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Info className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">תצוגה מקדימה:</span>
                          </div>
                          <div className="text-sm text-blue-700 whitespace-pre-wrap">
                            {message.content}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* General Settings Tab */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  הגדרות כלליות
                </CardTitle>
                <CardDescription>
                  הגדרות כלליות של המערכת
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">הגדרות זמן</h3>
                    <div className="space-y-2">
                      <Label htmlFor="default-timezone">אזור זמן ברירת מחדל</Label>
                      <Select defaultValue="israel">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="israel">ישראל (UTC+2/+3)</SelectItem>
                          <SelectItem value="utc">UTC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">הגדרות התראות</h3>
                    <div className="flex items-center space-x-2">
                      <Switch id="email-notifications" defaultChecked />
                      <Label htmlFor="email-notifications">התראות אימייל</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="sms-notifications" />
                      <Label htmlFor="sms-notifications">התראות SMS</Label>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium text-yellow-800">שימו לב</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    שינויים בהגדרות אלו ישפיעו על כל המשתמשים במערכת. 
                    וודאו שאתם מבינים את ההשלכות לפני השמירה.
                  </p>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline">בטל שינויים</Button>
                  <Button className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    שמור הגדרות
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SystemSettings;