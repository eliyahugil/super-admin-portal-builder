import React, { useState } from 'react';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Copy, Calendar, Layout, Save } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface SchedulingTemplate {
  id?: string;
  business_id: string;
  template_name: string;
  template_type: 'weekly' | 'monthly' | 'seasonal';
  description?: string;
  template_data: {
    shifts: Array<{
      day: number;
      start_time: string;
      end_time: string;
      required_employees: number;
      preferred_roles?: string[];
      branch_id?: string;
    }>;
    rules?: {
      auto_assign: boolean;
      respect_preferences: boolean;
      balance_hours: boolean;
    };
  };
  is_active: boolean;
}

const TEMPLATE_TYPES = [
  { value: 'weekly', label: 'שבועי', description: 'תבנית שחוזרת כל שבוע' },
  { value: 'monthly', label: 'חודשי', description: 'תבנית שחוזרת כל חודש' },
  { value: 'seasonal', label: 'עונתי', description: 'תבנית לעונות שונות' }
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

export const SchedulingTemplates: React.FC = () => {
  const { businessId } = useCurrentBusiness();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Partial<SchedulingTemplate>>({
    business_id: businessId || '',
    template_name: '',
    template_type: 'weekly',
    description: '',
    template_data: {
      shifts: [],
      rules: {
        auto_assign: true,
        respect_preferences: true,
        balance_hours: true
      }
    },
    is_active: true
  });

  // שליפת תבניות
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['scheduling-templates', businessId],
    queryFn: async () => {
      if (!businessId) return [];
      
      const { data, error } = await supabase
        .from('scheduling_templates')
        .select('*')
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

  // יצירת תבנית חדשה
  const createTemplateMutation = useMutation({
    mutationFn: async (template: Partial<SchedulingTemplate>) => {
      const { error } = await supabase
        .from('scheduling_templates')
        .insert([template as any]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduling-templates', businessId] });
      setIsDialogOpen(false);
      resetNewTemplate();
      toast({
        title: "תבנית נוצרה בהצלחה",
        description: "התבנית החדשה נוספה למערכת."
      });
    },
    onError: (error) => {
      toast({
        title: "שגיאה ביצירת התבנית",
        description: "אנא נסה שוב.",
        variant: "destructive"
      });
      console.error('Error creating template:', error);
    }
  });

  // מחיקת תבנית
  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await supabase
        .from('scheduling_templates')
        .delete()
        .eq('id', templateId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduling-templates', businessId] });
      toast({
        title: "תבנית נמחקה בהצלחה",
        description: "התבנית הוסרה מהמערכת."
      });
    },
    onError: (error) => {
      toast({
        title: "שגיאה במחיקת התבנית",
        description: "אנא נסה שוב.",
        variant: "destructive"
      });
      console.error('Error deleting template:', error);
    }
  });

  // שכפול תבנית
  const duplicateTemplateMutation = useMutation({
    mutationFn: async (template: SchedulingTemplate) => {
      const duplicatedTemplate = {
        ...template,
        id: undefined,
        template_name: `${template.template_name} - עותק`,
        created_at: undefined,
        updated_at: undefined
      };
      
      const { error } = await supabase
        .from('scheduling_templates')
        .insert([duplicatedTemplate]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduling-templates', businessId] });
      toast({
        title: "תבנית שוכפלה בהצלחה",
        description: "נוצר עותק חדש של התבנית."
      });
    },
    onError: (error) => {
      toast({
        title: "שגיאה בשכפול התבנית",
        description: "אנא נסה שוב.",
        variant: "destructive"
      });
      console.error('Error duplicating template:', error);
    }
  });

  // הפעלת תבנית
  const applyTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const { data, error } = await supabase.functions.invoke('apply-scheduling-template', {
        body: { templateId, businessId }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "תבנית הופעלה בהצלחה",
        description: "הסידור נוצר על בסיס התבנית."
      });
    },
    onError: (error) => {
      toast({
        title: "שגיאה בהפעלת התבנית",
        description: "אנא נסה שוב.",
        variant: "destructive"
      });
      console.error('Error applying template:', error);
    }
  });

  const resetNewTemplate = () => {
    setNewTemplate({
      business_id: businessId || '',
      template_name: '',
      template_type: 'weekly',
      description: '',
      template_data: {
        shifts: [],
        rules: {
          auto_assign: true,
          respect_preferences: true,
          balance_hours: true
        }
      },
      is_active: true
    });
  };

  const handleCreateTemplate = () => {
    if (!newTemplate.template_name?.trim()) {
      toast({
        title: "שגיאה",
        description: "אנא הזן שם לתבנית.",
        variant: "destructive"
      });
      return;
    }

    createTemplateMutation.mutate(newTemplate);
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm('האם אתה בטוח שברצונך למחוק תבנית זו?')) {
      deleteTemplateMutation.mutate(templateId);
    }
  };

  const handleDuplicateTemplate = (template: SchedulingTemplate) => {
    duplicateTemplateMutation.mutate(template);
  };

  const handleApplyTemplate = (templateId: string) => {
    if (confirm('האם אתה בטוח שברצונך ליישם תבנית זו? זה ייצור סידור חדש.')) {
      applyTemplateMutation.mutate(templateId);
    }
  };

  const addShiftToTemplate = () => {
    const newShift = {
      day: 0,
      start_time: '09:00',
      end_time: '17:00',
      required_employees: 1,
      preferred_roles: [],
      branch_id: branches[0]?.id || ''
    };

    setNewTemplate(prev => ({
      ...prev,
      template_data: {
        ...prev.template_data!,
        shifts: [...(prev.template_data?.shifts || []), newShift]
      }
    }));
  };

  const removeShiftFromTemplate = (index: number) => {
    setNewTemplate(prev => ({
      ...prev,
      template_data: {
        ...prev.template_data!,
        shifts: prev.template_data?.shifts?.filter((_, i) => i !== index) || []
      }
    }));
  };

  const updateShiftInTemplate = (index: number, field: string, value: any) => {
    setNewTemplate(prev => ({
      ...prev,
      template_data: {
        ...prev.template_data!,
        shifts: prev.template_data?.shifts?.map((shift, i) => 
          i === index ? { ...shift, [field]: value } : shift
        ) || []
      }
    }));
  };

  const getTemplateTypeData = (type: string) => {
    return TEMPLATE_TYPES.find(tt => tt.value === type) || TEMPLATE_TYPES[0];
  };

  const getDayLabel = (day: number) => {
    return DAYS_OF_WEEK.find(d => d.value === day)?.label || 'לא ידוע';
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">טוען...</div>;
  }

  return (
    <div className="space-y-6">
      {/* כפתור הוספת תבנית */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">תבניות סידור</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              יצירת תבנית חדשה
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>יצירת תבנית סידור חדשה</DialogTitle>
              <DialogDescription>
                צור תבנית שניתן להשתמש בה שוב ושוב ליצירת סידורים
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* פרטי תבנית */}
              <div className="space-y-4">
                <h4 className="font-medium">פרטי תבנית</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>שם התבנית</Label>
                    <Input
                      value={newTemplate.template_name || ''}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, template_name: e.target.value }))}
                      placeholder="למשל: סידור קיץ רגיל"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>סוג תבנית</Label>
                    <Select
                      value={newTemplate.template_type}
                      onValueChange={(value: any) => setNewTemplate(prev => ({ ...prev, template_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TEMPLATE_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label} - {type.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>תיאור (אופציונלי)</Label>
                  <Textarea
                    value={newTemplate.description || ''}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="תיאור קצר של התבנית ומתי להשתמש בה..."
                  />
                </div>
              </div>

              {/* כללי תבנית */}
              <div className="space-y-4">
                <h4 className="font-medium">כללי תבנית</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-assign">הקצאה אוטומטית של עובדים</Label>
                    <Switch
                      id="auto-assign"
                      checked={newTemplate.template_data?.rules?.auto_assign || false}
                      onCheckedChange={(checked) => 
                        setNewTemplate(prev => ({
                          ...prev,
                          template_data: {
                            ...prev.template_data!,
                            rules: { ...prev.template_data?.rules!, auto_assign: checked }
                          }
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="respect-preferences">התחשבות בהעדפות עובדים</Label>
                    <Switch
                      id="respect-preferences"
                      checked={newTemplate.template_data?.rules?.respect_preferences || false}
                      onCheckedChange={(checked) => 
                        setNewTemplate(prev => ({
                          ...prev,
                          template_data: {
                            ...prev.template_data!,
                            rules: { ...prev.template_data?.rules!, respect_preferences: checked }
                          }
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="balance-hours">איזון שעות בין עובדים</Label>
                    <Switch
                      id="balance-hours"
                      checked={newTemplate.template_data?.rules?.balance_hours || false}
                      onCheckedChange={(checked) => 
                        setNewTemplate(prev => ({
                          ...prev,
                          template_data: {
                            ...prev.template_data!,
                            rules: { ...prev.template_data?.rules!, balance_hours: checked }
                          }
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* משמרות */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">משמרות בתבנית</h4>
                  <Button type="button" onClick={addShiftToTemplate} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    הוסף משמרת
                  </Button>
                </div>

                <div className="space-y-3">
                  {newTemplate.template_data?.shifts?.map((shift, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <h5 className="font-medium">משמרת {index + 1}</h5>
                        <Button 
                          type="button"
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeShiftFromTemplate(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>יום בשבוע</Label>
                          <Select
                            value={shift.day.toString()}
                            onValueChange={(value) => updateShiftInTemplate(index, 'day', parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {DAYS_OF_WEEK.map(day => (
                                <SelectItem key={day.value} value={day.value.toString()}>
                                  {day.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>סניף</Label>
                          <Select
                            value={shift.branch_id || ''}
                            onValueChange={(value) => updateShiftInTemplate(index, 'branch_id', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="בחר סניף" />
                            </SelectTrigger>
                            <SelectContent>
                              {branches.map(branch => (
                                <SelectItem key={branch.id} value={branch.id}>
                                  {branch.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>שעת התחלה</Label>
                          <Input
                            type="time"
                            value={shift.start_time}
                            onChange={(e) => updateShiftInTemplate(index, 'start_time', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>שעת סיום</Label>
                          <Input
                            type="time"
                            value={shift.end_time}
                            onChange={(e) => updateShiftInTemplate(index, 'end_time', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>מספר עובדים נדרש</Label>
                          <Input
                            type="number"
                            min="1"
                            value={shift.required_employees}
                            onChange={(e) => updateShiftInTemplate(index, 'required_employees', parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {(!newTemplate.template_data?.shifts || newTemplate.template_data.shifts.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      לא הוגדרו משמרות עדיין. לחץ על "הוסף משמרת" כדי להתחיל.
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  ביטול
                </Button>
                <Button onClick={handleCreateTemplate} disabled={createTemplateMutation.isPending}>
                  {createTemplateMutation.isPending ? 'יוצר...' : 'צור תבנית'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* רשימת תבניות */}
      <div className="grid gap-4">
        {templates.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center space-y-2">
                <Layout className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">אין תבניות סידור מוגדרות</p>
                <p className="text-sm text-muted-foreground">
                  צור תבניות כדי לזרז את תהליך יצירת הסידורים
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          templates.map((template) => {
            const typeData = getTemplateTypeData(template.template_type);
            
            return (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle className="text-lg">{template.template_name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">
                            {typeData.label}
                          </Badge>
                          <Badge variant="outline">
                            {template.template_data.shifts?.length || 0} משמרות
                          </Badge>
                          {!template.is_active && (
                            <Badge variant="destructive">לא פעיל</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleApplyTemplate(template.id!)}
                        disabled={applyTemplateMutation.isPending}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        הפעל
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDuplicateTemplate(template)}
                        disabled={duplicateTemplateMutation.isPending}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id!)}
                        disabled={deleteTemplateMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {template.description && (
                    <p className="text-muted-foreground mb-4">{template.description}</p>
                  )}
                  
                  <div className="space-y-2">
                    <h5 className="font-medium">משמרות בתבנית:</h5>
                    <div className="grid gap-2">
                      {template.template_data.shifts?.map((shift, index) => (
                        <div key={index} className="flex items-center justify-between text-sm bg-muted p-2 rounded">
                          <span>
                            {getDayLabel(shift.day)} - {shift.start_time} עד {shift.end_time}
                          </span>
                          <span className="text-muted-foreground">
                            {shift.required_employees} עובדים
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {template.template_data.rules && (
                    <div className="mt-4 pt-4 border-t">
                      <h5 className="font-medium mb-2">כללי תבנית:</h5>
                      <div className="flex flex-wrap gap-2">
                        {template.template_data.rules.auto_assign && (
                          <Badge variant="outline">הקצאה אוטומטית</Badge>
                        )}
                        {template.template_data.rules.respect_preferences && (
                          <Badge variant="outline">התחשבות בהעדפות</Badge>
                        )}
                        {template.template_data.rules.balance_hours && (
                          <Badge variant="outline">איזון שעות</Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};