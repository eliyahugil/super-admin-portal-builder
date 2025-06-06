
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Save, X, Edit } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface CustomField {
  id: string;
  field_name: string;
  value: string | null;
}

interface EmployeeCustomFieldsProps {
  employeeId: string;
  businessId: string;
}

export const EmployeeCustomFields: React.FC<EmployeeCustomFieldsProps> = ({
  employeeId,
  businessId
}) => {
  const [fields, setFields] = useState<CustomField[]>([]);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomFields();
  }, [employeeId]);

  const fetchCustomFields = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_field_values')
        .select('*')
        .eq('employee_id', employeeId)
        .order('field_name');

      if (error) throw error;
      setFields(data || []);
    } catch (error) {
      console.error('Error fetching custom fields:', error);
    }
  };

  const saveCustomField = async () => {
    if (!newFieldName.trim()) {
      toast({
        title: 'שגיאה',
        description: 'נא להזין שם שדה',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('custom_field_values')
        .insert({
          employee_id: employeeId,
          field_name: newFieldName.trim(),
          value: newFieldValue.trim() || null
        })
        .select()
        .single();

      if (error) throw error;

      setFields(prev => [...prev, data]);
      setNewFieldName('');
      setNewFieldValue('');
      setShowAddDialog(false);
      
      toast({
        title: 'השדה נוסף בהצלחה',
        description: `השדה "${newFieldName}" נוסף לעובד`,
      });
    } catch (error) {
      console.error('Error saving custom field:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן להוסיף את השדה',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFieldValue = async (fieldId: string, newValue: string) => {
    try {
      const { error } = await supabase
        .from('custom_field_values')
        .update({ value: newValue.trim() || null })
        .eq('id', fieldId);

      if (error) throw error;

      setFields(prev => prev.map(field => 
        field.id === fieldId ? { ...field, value: newValue.trim() || null } : field
      ));
      
      setEditingField(null);
      
      toast({
        title: 'השדה עודכן',
        description: 'הערך נשמר בהצלחה',
      });
    } catch (error) {
      console.error('Error updating field:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לעדכן את השדה',
        variant: 'destructive',
      });
    }
  };

  const deleteField = async (fieldId: string) => {
    try {
      const { error } = await supabase
        .from('custom_field_values')
        .delete()
        .eq('id', fieldId);

      if (error) throw error;

      setFields(prev => prev.filter(field => field.id !== fieldId));
      
      toast({
        title: 'השדה נמחק',
        description: 'השדה הותאם אישית נמחק בהצלחה',
      });
    } catch (error) {
      console.error('Error deleting field:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן למחוק את השדה',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">שדות מותאמים אישית</h3>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              הוסף שדה
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>הוספת שדה חדש</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="fieldName">שם השדה</Label>
                <Input
                  id="fieldName"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  placeholder="לדוגמה: מספר ביטוח לאומי"
                />
              </div>
              <div>
                <Label htmlFor="fieldValue">ערך</Label>
                <Input
                  id="fieldValue"
                  value={newFieldValue}
                  onChange={(e) => setNewFieldValue(e.target.value)}
                  placeholder="הזן ערך (אופציונלי)"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={saveCustomField} 
                  disabled={loading}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'שומר...' : 'שמור'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddDialog(false)}
                  className="flex-1"
                >
                  ביטול
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {fields.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <Plus className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p>אין שדות מותאמים אישית</p>
          <p className="text-sm">לחץ על "הוסף שדה" כדי להתחיל</p>
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((field) => (
            <div key={field.id} className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-700">
                  {field.field_name}
                </div>
                {editingField === field.id ? (
                  <div className="flex gap-2 mt-2">
                    <Input
                      defaultValue={field.value || ''}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          updateFieldValue(field.id, e.currentTarget.value);
                        } else if (e.key === 'Escape') {
                          setEditingField(null);
                        }
                      }}
                      className="flex-1"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        updateFieldValue(field.id, input.value);
                      }}
                    >
                      <Save className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingField(null)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-sm text-gray-600 mt-1">
                    {field.value || 'לא הוגדר'}
                  </div>
                )}
              </div>
              
              {editingField !== field.id && (
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingField(field.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteField(field.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
