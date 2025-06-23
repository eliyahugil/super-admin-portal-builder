
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Plus, Edit, Trash2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ShiftTemplate {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  break_duration?: number;
  description?: string;
  required_employees: number;
  days_of_week: string[];
}

interface ShiftTemplatesManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessId?: string | null;
}

export const ShiftTemplatesManager: React.FC<ShiftTemplatesManagerProps> = ({
  open,
  onOpenChange,
  businessId
}) => {
  const { toast } = useToast();
  const [templates, setTemplates] = React.useState<ShiftTemplate[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [editingTemplate, setEditingTemplate] = React.useState<ShiftTemplate | null>(null);
  const [showCreateForm, setShowCreateForm] = React.useState(false);

  const [formData, setFormData] = React.useState({
    name: '',
    start_time: '',
    end_time: '',
    break_duration: 0,
    description: '',
    required_employees: 1,
    days_of_week: [] as string[]
  });

  const daysOfWeek = [
    { value: 'sunday', label: 'ראשון' },
    { value: 'monday', label: 'שני' },
    { value: 'tuesday', label: 'שלישי' },
    { value: 'wednesday', label: 'רביעי' },
    { value: 'thursday', label: 'חמישי' },
    { value: 'friday', label: 'שישי' },
    { value: 'saturday', label: 'שבת' }
  ];

  // Fetch templates when dialog opens
  React.useEffect(() => {
    if (open && businessId) {
      fetchTemplates();
    }
  }, [open, businessId]);

  const fetchTemplates = async () => {
    if (!businessId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('shift_templates')
        .select('*')
        .eq('business_id', businessId)
        .order('name');

      if (error) throw error;

      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: 'שגיאה',
        description: 'שגיאה בטעינת תבניות המשמרות',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!businessId || !formData.name || !formData.start_time || !formData.end_time) {
      toast({
        title: 'שגיאה',
        description: 'יש למלא את כל השדות הנדרשים',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('shift_templates')
        .insert({
          business_id: businessId,
          name: formData.name,
          start_time: formData.start_time,
          end_time: formData.end_time,
          break_duration: formData.break_duration || null,
          description: formData.description || null,
          required_employees: formData.required_employees,
          days_of_week: formData.days_of_week
        });

      if (error) throw error;

      toast({
        title: 'תבנית נוצרה',
        description: 'תבנית המשמרת נוצרה בהצלחה',
      });

      resetForm();
      fetchTemplates();
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: 'שגיאה',
        description: 'שגיאה ביצירת תבנית המשמרת',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('shift_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      toast({
        title: 'תבנית נמחקה',
        description: 'תבנית המשמרת נמחקה בהצלחה',
      });

      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: 'שגיאה',
        description: 'שגיאה במחיקת תבנית המשמרת',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      start_time: '',
      end_time: '',
      break_duration: 0,
      description: '',
      required_employees: 1,
      days_of_week: []
    });
    setShowCreateForm(false);
    setEditingTemplate(null);
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter(d => d !== day)
        : [...prev.days_of_week, day]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            ניהול תבניות משמרות
          </DialogTitle>
          <DialogDescription>
            צור ונהל תבניות משמרות לשימוש חוזר
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Create New Template Button */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">תבניות קיימות</h3>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              תבנית חדשה
            </Button>
          </div>

          {/* Create Form */}
          {showCreateForm && (
            <Card>
              <CardHeader>
                <CardTitle>תבנית משמרת חדשה</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">שם התבנית</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="למשל: משמרת בוקר"
                    />
                  </div>
                  <div>
                    <Label htmlFor="required_employees">מספר עובדים נדרש</Label>
                    <Input
                      id="required_employees"
                      type="number"
                      min="1"
                      value={formData.required_employees}
                      onChange={(e) => setFormData(prev => ({ ...prev, required_employees: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="start_time">שעת התחלה</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_time">שעת סיום</Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="break_duration">הפסקה (דקות)</Label>
                    <Input
                      id="break_duration"
                      type="number"
                      min="0"
                      value={formData.break_duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, break_duration: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div>
                  <Label>ימים בשבוע</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {daysOfWeek.map((day) => (
                      <Badge
                        key={day.value}
                        variant={formData.days_of_week.includes(day.value) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleDay(day.value)}
                      >
                        {day.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">תיאור (אופציונלי)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="תיאור קצר של המשמרת..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleCreateTemplate}>
                    צור תבנית
                  </Button>
                  <Button variant="outline" onClick={resetForm}>
                    ביטול
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Templates List */}
          {loading ? (
            <div className="text-center py-8">טוען תבניות...</div>
          ) : templates.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">אין תבניות קיימות</h3>
                <p className="text-gray-600">צור תבנית ראשונה כדי להתחיל</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{template.name}</span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingTemplate(template)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>{template.start_time} - {template.end_time}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4" />
                      <span>{template.required_employees} עובדים נדרשים</span>
                    </div>

                    {template.days_of_week.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {template.days_of_week.map((day) => {
                          const dayLabel = daysOfWeek.find(d => d.value === day)?.label || day;
                          return (
                            <Badge key={day} variant="secondary" className="text-xs">
                              {dayLabel}
                            </Badge>
                          );
                        })}
                      </div>
                    )}

                    {template.description && (
                      <p className="text-sm text-gray-600">{template.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            סגור
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
