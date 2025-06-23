
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
import { useBranchesData } from '@/hooks/useBranchesData';

// Use the actual Supabase types instead of custom types
interface ShiftTemplate {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  shift_type: 'morning' | 'afternoon' | 'evening' | 'night' | 'full_day';
  required_employees: number;
  is_active: boolean;
  branch_id: string;
  created_at: string;
  is_archived: boolean;
  role_name?: string;
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

  // Get branches data
  const { data: branches = [] } = useBranchesData(businessId);

  const [formData, setFormData] = React.useState({
    name: '',
    start_time: '',
    end_time: '',
    shift_type: 'morning' as const,
    required_employees: 1,
    branch_id: ''
  });

  const shiftTypes = [
    { value: 'morning', label: 'בוקר' },
    { value: 'afternoon', label: 'צהריים' },
    { value: 'evening', label: 'ערב' },
    { value: 'night', label: 'לילה' },
    { value: 'full_day', label: 'יום מלא' }
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
      // Get templates and filter by business through branches
      const { data: branchIds } = await supabase
        .from('branches')
        .select('id')
        .eq('business_id', businessId);

      if (!branchIds || branchIds.length === 0) {
        setTemplates([]);
        return;
      }

      const { data, error } = await supabase
        .from('shift_templates')
        .select('*')
        .in('branch_id', branchIds.map(b => b.id))
        .eq('is_active', true)
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
    if (!businessId || !formData.name || !formData.start_time || !formData.end_time || !formData.branch_id) {
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
          name: formData.name,
          start_time: formData.start_time,
          end_time: formData.end_time,
          shift_type: formData.shift_type,
          required_employees: formData.required_employees,
          branch_id: formData.branch_id
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
        .update({ is_active: false })
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
      shift_type: 'morning',
      required_employees: 1,
      branch_id: ''
    });
    setShowCreateForm(false);
    setEditingTemplate(null);
  };

  const getShiftTypeLabel = (type: string) => {
    return shiftTypes.find(st => st.value === type)?.label || type;
  };

  const getBranchName = (branchId: string) => {
    return branches.find(b => b.id === branchId)?.name || 'לא ידוע';
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
                    <Label htmlFor="shift_type">סוג משמרת</Label>
                    <Select value={formData.shift_type} onValueChange={(value) => setFormData(prev => ({ ...prev, shift_type: value as any }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {shiftTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="branch_id">סניף</Label>
                  <Select value={formData.branch_id} onValueChange={(value) => setFormData(prev => ({ ...prev, branch_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="בחר סניף" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">
                        {getShiftTypeLabel(template.shift_type)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {getBranchName(template.branch_id)}
                      </Badge>
                    </div>
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
