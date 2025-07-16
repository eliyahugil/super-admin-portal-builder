import React, { useState } from 'react';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Clock, Users, MapPin, Calendar } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

interface SchedulingRule {
  id?: string;
  business_id: string;
  branch_id?: string;
  rule_type: 'opening_hours' | 'min_employees_per_shift' | 'max_employees_per_shift' | 'required_roles' | 'break_duration' | 'overtime_rules' | 'shift_spacing' | 'weekly_hours_limit' | 'consecutive_days_limit' | 'weekend_coverage';
  shift_type?: 'morning' | 'evening' | 'night';
  days_of_week?: number[];
  start_time?: string;
  end_time?: string;
  value_numeric?: number;
  value_json?: any;
  is_active: boolean;
}

const RULE_TYPES = [
  { value: 'opening_hours', label: 'שעות פתיחה', icon: Clock, description: 'הגדרת שעות פעילות הסניף' },
  { value: 'min_employees_per_shift', label: 'מינימום עובדים למשמרת', icon: Users, description: 'מספר מינימלי של עובדים הנדרש למשמרת' },
  { value: 'max_employees_per_shift', label: 'מקסימום עובדים למשמרת', icon: Users, description: 'מספר מקסימלי של עובדים למשמרת' },
  { value: 'required_roles', label: 'תפקידים נדרשים', icon: Users, description: 'תפקידים חובה שצריכים להיות במשמרת' },
  { value: 'break_duration', label: 'משך הפסקות', icon: Clock, description: 'זמן הפסקה מינימלי לעובדים' },
  { value: 'overtime_rules', label: 'כללי שעות נוספות', icon: Clock, description: 'כללים לעבודה מעבר לשעות הרגילות' },
  { value: 'shift_spacing', label: 'מרווח בין משמרות', icon: Clock, description: 'זמן מינימלי בין משמרות לאותו עובד' },
  { value: 'weekly_hours_limit', label: 'הגבלת שעות שבועיות', icon: Users, description: 'מקסימום שעות לעובד בשבוע' },
  { value: 'consecutive_days_limit', label: 'הגבלת ימים רצופים', icon: Calendar, description: 'מקסימום ימי עבודה רצופים' },
  { value: 'weekend_coverage', label: 'כיסוי סוף שבוע', icon: Calendar, description: 'דרישות מיוחדות לסוף שבוע' }
] as const;

const SHIFT_TYPES = [
  { value: 'morning', label: 'בוקר' },
  { value: 'evening', label: 'ערב' },
  { value: 'night', label: 'לילה' }
] as const;

const DAYS_OF_WEEK = [
  { value: 0, label: 'ראשון' },
  { value: 1, label: 'שני' },
  { value: 2, label: 'שלישי' },
  { value: 3, label: 'רביעי' },
  { value: 4, label: 'חמישי' },
  { value: 5, label: 'שישי' },
  { value: 6, label: 'שבת' }
] as const;

export const SchedulingRulesManager: React.FC = () => {
  const { businessId } = useCurrentBusiness();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRule, setNewRule] = useState<Partial<SchedulingRule>>({
    business_id: businessId || '',
    rule_type: 'opening_hours',
    is_active: true,
    days_of_week: []
  });

  // שליפת כללי סידור
  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['scheduling-rules', businessId],
    queryFn: async () => {
      if (!businessId) return [];
      
      const { data, error } = await supabase
        .from('business_scheduling_rules')
        .select(`
          *,
          branches:branch_id(name)
        `)
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!businessId
  });

  // שליפת סניפים
  const { data: branches = [] } = useQuery({
    queryKey: ['branches', businessId],
    queryFn: async () => {
      if (!businessId) return [];
      
      const { data, error } = await supabase
        .from('branches')
        .select('id, name')
        .eq('business_id', businessId)
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    },
    enabled: !!businessId
  });

  // יצירת כלל חדש
  const createRuleMutation = useMutation({
    mutationFn: async (rule: Partial<SchedulingRule>) => {
      const { error } = await supabase
        .from('business_scheduling_rules')
        .insert([rule as any]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduling-rules', businessId] });
      setIsDialogOpen(false);
      setNewRule({
        business_id: businessId || '',
        rule_type: 'opening_hours',
        is_active: true,
        days_of_week: []
      });
      toast({
        title: "כלל נוצר בהצלחה",
        description: "הכלל החדש נוסף למערכת הסידור."
      });
    },
    onError: (error) => {
      toast({
        title: "שגיאה ביצירת הכלל",
        description: "אנא נסה שוב.",
        variant: "destructive"
      });
      console.error('Error creating rule:', error);
    }
  });

  // מחיקת כלל
  const deleteRuleMutation = useMutation({
    mutationFn: async (ruleId: string) => {
      const { error } = await supabase
        .from('business_scheduling_rules')
        .delete()
        .eq('id', ruleId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduling-rules', businessId] });
      toast({
        title: "כלל נמחק בהצלחה",
        description: "הכלל הוסר מהמערכת."
      });
    },
    onError: (error) => {
      toast({
        title: "שגיאה במחיקת הכלל",
        description: "אנא נסה שוב.",
        variant: "destructive"
      });
      console.error('Error deleting rule:', error);
    }
  });

  const handleCreateRule = () => {
    if (!newRule.rule_type) {
      toast({
        title: "שגיאה",
        description: "אנא בחר סוג כלל.",
        variant: "destructive"
      });
      return;
    }

    createRuleMutation.mutate(newRule);
  };

  const handleDeleteRule = (ruleId: string) => {
    if (confirm('האם אתה בטוח שברצונך למחוק כלל זה?')) {
      deleteRuleMutation.mutate(ruleId);
    }
  };

  const handleDayChange = (day: number, checked: boolean) => {
    const currentDays = newRule.days_of_week || [];
    if (checked) {
      setNewRule(prev => ({
        ...prev,
        days_of_week: [...currentDays, day].sort()
      }));
    } else {
      setNewRule(prev => ({
        ...prev,
        days_of_week: currentDays.filter(d => d !== day)
      }));
    }
  };

  const getRuleTypeLabel = (type: string) => {
    return RULE_TYPES.find(rt => rt.value === type)?.label || type;
  };

  const getShiftTypeLabel = (type: string) => {
    return SHIFT_TYPES.find(st => st.value === type)?.label || type;
  };

  const getDaysLabel = (days?: number[]) => {
    if (!days || days.length === 0) return 'כל הימים';
    return days.map(d => DAYS_OF_WEEK.find(dow => dow.value === d)?.label).join(', ');
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">טוען...</div>;
  }

  return (
    <div className="space-y-6">
      {/* כפתור הוספת כלל */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">כללי סידור פעילים</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              הוסף כלל חדש
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>יצירת כלל סידור חדש</DialogTitle>
              <DialogDescription>
                הוסף כלל חדש למערכת הסידור האוטומטי
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>סוג הכלל</Label>
                <Select
                  value={newRule.rule_type}
                  onValueChange={(value: any) => setNewRule(prev => ({ ...prev, rule_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RULE_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{type.label}</span>
                          <span className="text-xs text-muted-foreground">{type.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>סניף (אופציונלי)</Label>
                <Select
                  value={newRule.branch_id || 'all_branches'}
                  onValueChange={(value) => setNewRule(prev => ({ ...prev, branch_id: value === 'all_branches' ? undefined : value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="כל הסניפים" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_branches">כל הסניפים</SelectItem>
                    {branches.map(branch => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>סוג משמרת (אופציונלי)</Label>
                <Select
                  value={newRule.shift_type || 'all_shifts'}
                  onValueChange={(value: 'morning' | 'evening' | 'night' | 'all_shifts') => 
                    setNewRule(prev => ({ ...prev, shift_type: value === 'all_shifts' ? undefined : value as any }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="כל המשמרות" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_shifts">כל המשמרות</SelectItem>
                    {SHIFT_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>ימים בשבוע</Label>
                <div className="grid grid-cols-4 gap-2">
                  {DAYS_OF_WEEK.map(day => (
                    <div key={day.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`day-${day.value}`}
                        checked={newRule.days_of_week?.includes(day.value) || false}
                        onCheckedChange={(checked) => handleDayChange(day.value, checked as boolean)}
                      />
                      <Label htmlFor={`day-${day.value}`}>{day.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {(newRule.rule_type === 'opening_hours') && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>שעת התחלה</Label>
                    <Input
                      type="time"
                      value={newRule.start_time || ''}
                      onChange={(e) => setNewRule(prev => ({ ...prev, start_time: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>שעת סיום</Label>
                    <Input
                      type="time"
                      value={newRule.end_time || ''}
                      onChange={(e) => setNewRule(prev => ({ ...prev, end_time: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              {(newRule.rule_type === 'min_employees_per_shift' || 
                newRule.rule_type === 'max_employees_per_shift' ||
                newRule.rule_type === 'break_duration' ||
                newRule.rule_type === 'shift_spacing' ||
                newRule.rule_type === 'weekly_hours_limit' ||
                newRule.rule_type === 'consecutive_days_limit') && (
                <div className="space-y-2">
                  <Label>
                    {newRule.rule_type === 'min_employees_per_shift' && 'מספר מינימלי של עובדים'}
                    {newRule.rule_type === 'max_employees_per_shift' && 'מספר מקסימלי של עובדים'}
                    {newRule.rule_type === 'break_duration' && 'משך הפסקה (דקות)'}
                    {newRule.rule_type === 'shift_spacing' && 'מרווח בין משמרות (שעות)'}
                    {newRule.rule_type === 'weekly_hours_limit' && 'מקסימום שעות שבועיות'}
                    {newRule.rule_type === 'consecutive_days_limit' && 'מקסימום ימים רצופים'}
                  </Label>
                  <Input
                    type="number"
                    value={newRule.value_numeric || ''}
                    onChange={(e) => setNewRule(prev => ({ ...prev, value_numeric: Number(e.target.value) }))}
                    min="0"
                    max={newRule.rule_type === 'break_duration' ? '480' : newRule.rule_type === 'shift_spacing' ? '24' : newRule.rule_type === 'weekly_hours_limit' ? '60' : '14'}
                  />
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  ביטול
                </Button>
                <Button onClick={handleCreateRule} disabled={createRuleMutation.isPending}>
                  {createRuleMutation.isPending ? 'יוצר...' : 'צור כלל'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* רשימת כללים */}
      <div className="grid gap-4">
        {rules.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center space-y-2">
                <p className="text-muted-foreground">אין כללי סידור מוגדרים</p>
                <p className="text-sm text-muted-foreground">
                  הוסף כללים כדי להתאים את הסידור האוטומטי לצרכי העסק
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          rules.map((rule) => (
            <Card key={rule.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const RuleIcon = RULE_TYPES.find(rt => rt.value === rule.rule_type)?.icon || Clock;
                      return <RuleIcon className="h-5 w-5 text-primary" />;
                    })()}
                    <div>
                      <CardTitle className="text-lg">{getRuleTypeLabel(rule.rule_type)}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        {rule.shift_type && (
                          <Badge variant="secondary">
                            {getShiftTypeLabel(rule.shift_type)}
                          </Badge>
                        )}
                        {rule.branches && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {rule.branches.name}
                          </Badge>
                        )}
                        {!rule.is_active && (
                          <Badge variant="destructive">לא פעיל</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteRule(rule.id!)}
                    disabled={deleteRuleMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ימים:</span>
                    <span>{getDaysLabel(rule.days_of_week)}</span>
                  </div>
                  
                  {rule.start_time && rule.end_time && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">שעות:</span>
                      <span>{rule.start_time} - {rule.end_time}</span>
                    </div>
                  )}
                  
                  {rule.value_numeric && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ערך:</span>
                      <span>{rule.value_numeric}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};