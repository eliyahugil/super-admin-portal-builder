import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { useBusinessShiftTypes } from './hooks/useBusinessShiftTypes';
import { Plus, Edit, Trash2, Clock, Palette, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ShiftType {
  id: string;
  shift_type: string;
  display_name: string;
  start_time: string;
  end_time: string;
  color: string;
  is_active: boolean;
}

export const BusinessShiftTypesManager: React.FC = () => {
  const { businessId } = useCurrentBusiness();
  const { data: shiftTypes, isLoading, refetch } = useBusinessShiftTypes(businessId);
  const [editingType, setEditingType] = useState<ShiftType | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState({
    shift_type: '',
    display_name: '',
    start_time: '',
    end_time: '',
    color: '#3B82F6'
  });

  const resetForm = () => {
    setFormData({
      shift_type: '',
      display_name: '',
      start_time: '',
      end_time: '',
      color: '#3B82F6'
    });
    setEditingType(null);
    setIsCreating(false);
  };

  const handleEdit = (shiftType: ShiftType) => {
    setFormData({
      shift_type: shiftType.shift_type,
      display_name: shiftType.display_name,
      start_time: shiftType.start_time,
      end_time: shiftType.end_time,
      color: shiftType.color
    });
    setEditingType(shiftType);
    setIsCreating(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!businessId) {
      toast.error('לא נמצא מזהה עסק');
      return;
    }

    if (!formData.shift_type || !formData.display_name || !formData.start_time || !formData.end_time) {
      toast.error('יש למלא את כל השדות הנדרשים');
      return;
    }

    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const shiftTypeData = {
        business_id: businessId,
        shift_type: formData.shift_type.toLowerCase(),
        display_name: formData.display_name,
        start_time: formData.start_time,
        end_time: formData.end_time,
        color: formData.color,
        is_active: true
      };

      if (editingType) {
        const { error } = await supabase
          .from('business_shift_types')
          .update(shiftTypeData)
          .eq('id', editingType.id);

        if (error) throw error;
        toast.success('סוג המשמרת עודכן בהצלחה');
      } else {
        const { error } = await supabase
          .from('business_shift_types')
          .insert(shiftTypeData);

        if (error) throw error;
        toast.success('סוג המשמרת נוצר בהצלחה');
      }

      resetForm();
      refetch();
    } catch (error) {
      console.error('Error saving shift type:', error);
      toast.error('שגיאה בשמירת סוג המשמרת');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק סוג משמרת זה?')) return;

    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { error } = await supabase
        .from('business_shift_types')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('סוג המשמרת נמחק בהצלחה');
      refetch();
    } catch (error) {
      console.error('Error deleting shift type:', error);
      toast.error('שגיאה במחיקת סוג המשמרת');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-4">טוען...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">ניהול סוגי משמרות מתקדם</h1>
          <p className="text-muted-foreground text-sm mt-1">
            הגדר טווחי זמנים מותאמים אישית למשמרות בוקר, צהריים וערב
          </p>
        </div>
        <Button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          הוסף סוג משמרת
        </Button>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900">למה זה חשוב?</h3>
              <p className="text-blue-700 text-sm mt-1">
                הגדרת סוגי משמרות עם טווחי זמנים מותאמים מאפשרת למערכת לסווג אוטומטית את המשמרות ולהציגן בצבעים שונים. 
                <strong>חשוב: משמרות "ערב" צריכות להתחיל מ-14:00 כדי להציג נכון במערכת ההגשה.</strong>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingType ? 'עריכת סוג משמרת' : 'יצירת סוג משמרת חדש'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="shift_type">מזהה סוג משמרת (באנגלית)</Label>
                  <Input
                    id="shift_type"
                    value={formData.shift_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, shift_type: e.target.value }))}
                    placeholder="morning, afternoon, evening"
                    disabled={!!editingType}
                  />
                </div>
                <div>
                  <Label htmlFor="display_name">שם תצוגה</Label>
                  <Input
                    id="display_name"
                    value={formData.display_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                    placeholder="בוקר, צהריים, ערב"
                  />
                </div>
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
                  <Label htmlFor="color">צבע</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="w-16 h-10"
                    />
                    <Palette className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit">
                  {editingType ? 'עדכן' : 'צור'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  ביטול
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Shift Types List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shiftTypes?.map((shiftType) => (
          <Card key={shiftType.id} className="relative">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge 
                  style={{ backgroundColor: shiftType.color, color: 'white' }}
                  className="text-sm"
                >
                  {shiftType.display_name}
                </Badge>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(shiftType)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(shiftType.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>
                  {shiftType.start_time} - {shiftType.end_time}
                </span>
              </div>
              
              <div className="mt-2 text-xs text-muted-foreground">
                מזהה: {shiftType.shift_type}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!shiftTypes || shiftTypes.length === 0) && (
        <Card>
          <CardContent className="text-center p-8">
            <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              לא נמצאו סוגי משמרות. לחץ על "הוסף סוג משמרת" כדי להתחיל.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              💡 טיפ: התחל עם הגדרת משמרות בוקר (06:00-14:00), צהריים (14:00-22:00) וערב (22:00-06:00)
            </p>
          </CardContent>
        </Card>
      )}

      {/* Advanced Features Notice */}
      {shiftTypes && shiftTypes.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-medium text-green-900">המערכת פעילה!</h3>
            </div>
            <p className="text-green-700 text-sm">
              ההגדרות שלך פעילות בכל המערכת: טוקני עובדים, תצוגת משמרות, ודוחות.
              המערכת תסווג אוטומטית משמרות על פי הטווחים שהגדרת.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};