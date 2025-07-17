import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Settings, Clock, Users, HelpCircle } from 'lucide-react';
import type { Employee } from '@/types/employee';

interface EmployeeShiftSettingsProps {
  employee: Employee;
  onUpdate: () => void;
}

type ShiftTimeType = 'any' | 'morning' | 'evening' | 'night';

const shiftTimeOptions = [
  { value: 'any', label: 'כל המשמרות', icon: '🕐' },
  { value: 'morning', label: 'משמרות בוקר', icon: '🌅' },
  { value: 'evening', label: 'משמרות ערב', icon: '🌆' },
  { value: 'night', label: 'משמרות לילה', icon: '🌙' },
];

export const EmployeeShiftSettings: React.FC<EmployeeShiftSettingsProps> = ({
  employee,
  onUpdate
}) => {
  const [quota, setQuota] = useState(employee.shift_submission_quota || 3);
  const [preferredShiftTime, setPreferredShiftTime] = useState<ShiftTimeType>(employee.preferred_shift_time || 'any');
  const [canChooseUnassigned, setCanChooseUnassigned] = useState(employee.can_choose_unassigned_shifts ?? true);
  const [notes, setNotes] = useState(employee.submission_notes || '');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('employees')
        .update({
          shift_submission_quota: quota,
          preferred_shift_time: preferredShiftTime,
          can_choose_unassigned_shifts: canChooseUnassigned,
          submission_notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', employee.id);

      if (error) throw error;

      toast({
        title: 'נשמר בהצלחה',
        description: 'הגדרות הגשת המשמרות עודכנו',
      });

      onUpdate();
    } catch (error) {
      console.error('Error updating employee shift settings:', error);
      toast({
        title: 'שגיאה',
        description: 'שגיאה בשמירת ההגדרות',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedShiftOption = shiftTimeOptions.find(opt => opt.value === preferredShiftTime);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          הגדרות הגשת משמרות - {employee.first_name} {employee.last_name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* חובת הגשה */}
        <div className="space-y-2">
          <Label htmlFor="quota" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            חובת הגשה (מספר משמרות)
          </Label>
          <Input
            id="quota"
            type="number"
            min="1"
            max="10"
            value={quota}
            onChange={(e) => setQuota(parseInt(e.target.value) || 1)}
            className="max-w-xs"
          />
          <p className="text-sm text-muted-foreground">
            כמה משמרות העובד חייב להגיש כל שבוע (1-10)
          </p>
        </div>

        {/* העדפת משמרות */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            העדפת משמרות
          </Label>
          <Select value={preferredShiftTime} onValueChange={(value: ShiftTimeType) => setPreferredShiftTime(value)}>
            <SelectTrigger className="max-w-xs">
              <SelectValue>
                <div className="flex items-center gap-2">
                  <span>{selectedShiftOption?.icon}</span>
                  <span>{selectedShiftOption?.label}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {shiftTimeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <span>{option.icon}</span>
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            סוג המשמרות שהעובד מעדיף לעבוד
          </p>
        </div>

        {/* אפשרות לבחור משמרות לא מוקצות */}
        <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div className="space-y-1">
            <Label htmlFor="unassigned" className="flex items-center gap-2 font-medium">
              <HelpCircle className="h-4 w-4 text-orange-600" />
              בחירת משמרות לא מוקצות
            </Label>
            <p className="text-sm text-orange-700">
              האם העובד יכול לבחור משמרות שהוא לא משויך אליהן בשגרה (יופעו עם סימן שאלה)
            </p>
          </div>
          <Switch
            id="unassigned"
            checked={canChooseUnassigned}
            onCheckedChange={setCanChooseUnassigned}
          />
        </div>

        {/* הערות */}
        <div className="space-y-2">
          <Label htmlFor="notes">הערות מיוחדות</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="הערות מיוחדות להגשת משמרות..."
            rows={3}
          />
          <p className="text-sm text-muted-foreground">
            הערות שיוצגו לעובד בעת הגשת המשמרות
          </p>
        </div>

        {/* כפתור שמירה */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'שומר...' : 'שמור הגדרות'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};