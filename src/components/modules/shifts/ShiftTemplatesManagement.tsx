
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Clock, Plus, Edit, Trash2 } from 'lucide-react';
import { useBusiness } from '@/hooks/useBusiness';
import { useRealData } from '@/hooks/useRealData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ShiftTemplate {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  shift_type: string;
  required_employees: number;
  is_active: boolean;
  branch_id: string;
  business_id: string;
  created_at: string;
}

export const ShiftTemplatesManagement: React.FC = () => {
  const { businessId, isLoading } = useBusiness();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    start_time: '',
    end_time: '',
    shift_type: 'morning',
    required_employees: 1,
    branch_id: ''
  });

  const { data: templates, refetch } = useRealData<ShiftTemplate>({
    queryKey: ['shift-templates', businessId],
    tableName: 'shift_templates',
    filters: { is_active: true },
    enabled: !!businessId && !isLoading
  });

  const { data: branches } = useRealData<any>({
    queryKey: ['branches-for-templates', businessId],
    tableName: 'branches',
    filters: { is_active: true },
    enabled: !!businessId && !isLoading
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.start_time || !formData.end_time || !formData.branch_id) {
      toast({
        title: "שגיאה",
        description: "אנא מלא את כל השדות הנדרשים",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('shift_templates')
        .insert([{
          ...formData,
          business_id: businessId
        }]);

      if (error) throw error;

      toast({
        title: "הצלחה",
        description: "תבנית המשמרת נוצרה בהצלחה"
      });

      setDialogOpen(false);
      setFormData({
        name: '',
        start_time: '',
        end_time: '',
        shift_type: 'morning',
        required_employees: 1,
        branch_id: ''
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "שגיאה",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deactivateTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('shift_templates')
        .update({ is_active: false })
        .eq('id', templateId);

      if (error) throw error;

      toast({
        title: "הצלחה",
        description: "תבנית המשמרת הוסרה"
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "שגיאה",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-6">טוען...</div>;
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">תבניות משמרות</h2>
          <p className="text-gray-600">נהל תבניות משמרות לעסק</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              הוסף תבנית חדשה
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>תבנית משמרת חדשה</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">שם התבנית *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="למשל: משמרת בוקר"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="branch">סניף *</Label>
                <Select value={formData.branch_id} onValueChange={(value) => setFormData({ ...formData, branch_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר סניף" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches?.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_time">שעת התחלה *</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end_time">שעת סיום *</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="shift_type">סוג משמרת</Label>
                <Select value={formData.shift_type} onValueChange={(value) => setFormData({ ...formData, shift_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">בוקר</SelectItem>
                    <SelectItem value="afternoon">צהריים</SelectItem>
                    <SelectItem value="evening">ערב</SelectItem>
                    <SelectItem value="night">לילה</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="required_employees">מספר עובדים נדרש</Label>
                <Input
                  id="required_employees"
                  type="number"
                  min="1"
                  value={formData.required_employees}
                  onChange={(e) => setFormData({ ...formData, required_employees: parseInt(e.target.value) || 1 })}
                />
              </div>

              <Button type="submit" className="w-full">
                צור תבנית
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates?.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <Badge variant={template.shift_type === 'morning' ? 'default' : 
                              template.shift_type === 'afternoon' ? 'secondary' :
                              template.shift_type === 'evening' ? 'outline' : 'destructive'}>
                  {template.shift_type === 'morning' ? 'בוקר' :
                   template.shift_type === 'afternoon' ? 'צהריים' :
                   template.shift_type === 'evening' ? 'ערב' : 'לילה'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{template.start_time} - {template.end_time}</span>
                </div>
                <div className="text-gray-600">
                  עובדים נדרשים: {template.required_employees}
                </div>
                <div className="text-gray-600">
                  סניף: {branches?.find(b => b.id === template.branch_id)?.name || 'לא נמצא'}
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deactivateTemplate(template.id)}
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  הסר
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates?.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">אין תבניות משמרות</h3>
            <p className="text-gray-600 mb-4">צור תבנית משמרת ראשונה כדי להתחיל</p>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  צור תבנית ראשונה
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
