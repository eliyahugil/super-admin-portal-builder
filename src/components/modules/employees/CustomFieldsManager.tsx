
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Settings } from 'lucide-react';
import { useEmployeeFieldTemplates, type EmployeeFieldTemplate } from '@/hooks/useEmployeeFieldTemplates';

export const CustomFieldsManager: React.FC = () => {
  const { fieldTemplates, isLoading, createFieldTemplate, updateFieldTemplate, deleteFieldTemplate } = useEmployeeFieldTemplates();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<EmployeeFieldTemplate | null>(null);
  const [formData, setFormData] = useState({
    field_name: '',
    field_type: 'text' as const,
    field_options: [] as string[],
    is_required: false,
    display_order: 1,
  });

  const fieldTypes = [
    { value: 'text', label: 'טקסט' },
    { value: 'textarea', label: 'טקסט ארוך' },
    { value: 'number', label: 'מספר' },
    { value: 'email', label: 'אימייל' },
    { value: 'date', label: 'תאריך' },
    { value: 'boolean', label: 'כן/לא' },
    { value: 'select', label: 'רשימה נפתחת' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.field_name.trim()) return;

    const fieldData = {
      field_name: formData.field_name.trim(),
      field_type: formData.field_type,
      field_options: formData.field_type === 'select' ? formData.field_options : [],
      is_required: formData.is_required,
      is_active: true,
      display_order: formData.display_order,
    };

    if (editingField) {
      await updateFieldTemplate(editingField.id, fieldData);
    } else {
      await createFieldTemplate(fieldData);
    }

    resetForm();
    setDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({
      field_name: '',
      field_type: 'text',
      field_options: [],
      is_required: false,
      display_order: 1,
    });
    setEditingField(null);
  };

  const handleEdit = (field: EmployeeFieldTemplate) => {
    setEditingField(field);
    setFormData({
      field_name: field.field_name,
      field_type: field.field_type,
      field_options: field.field_options || [],
      is_required: field.is_required,
      display_order: field.display_order,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (field: EmployeeFieldTemplate) => {
    if (confirm(`האם אתה בטוח שברצונך למחוק את השדה "${field.field_name}"?`)) {
      await deleteFieldTemplate(field.id);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            ניהול שדות מותאמים אישית
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            ניהול שדות מותאמים אישית
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 ml-2" />
                הוסף שדה חדש
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md" dir="rtl">
              <DialogHeader>
                <DialogTitle>
                  {editingField ? 'עריכת שדה מותאם אישית' : 'הוספת שדה מותאם אישית'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="field_name">שם השדה</Label>
                  <Input
                    id="field_name"
                    value={formData.field_name}
                    onChange={(e) => setFormData({ ...formData, field_name: e.target.value })}
                    placeholder="הזן שם השדה"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="field_type">סוג השדה</Label>
                  <Select
                    value={formData.field_type}
                    onValueChange={(value: any) => setFormData({ ...formData, field_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fieldTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.field_type === 'select' && (
                  <div>
                    <Label>אפשרויות (מופרדות בפסיק)</Label>
                    <Input
                      value={formData.field_options.join(', ')}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        field_options: e.target.value.split(',').map(opt => opt.trim()).filter(opt => opt)
                      })}
                      placeholder="אפשרות 1, אפשרות 2, אפשרות 3"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Label htmlFor="is_required">שדה חובה</Label>
                  <Switch
                    id="is_required"
                    checked={formData.is_required}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_required: checked })}
                  />
                </div>

                <div>
                  <Label htmlFor="display_order">סדר תצוגה</Label>
                  <Input
                    id="display_order"
                    type="number"
                    min="1"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 1 })}
                  />
                </div>

                <div className="flex justify-end space-x-2 space-x-reverse pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    ביטול
                  </Button>
                  <Button type="submit">
                    {editingField ? 'עדכן' : 'צור'} שדה
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {fieldTemplates.length === 0 ? (
          <div className="text-center py-8">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">אין שדות מותאמים אישית עדיין</p>
            <p className="text-sm text-gray-400">התחל על ידי הוספת השדה הראשון</p>
          </div>
        ) : (
          <div className="space-y-4">
            {fieldTemplates.map((field) => (
              <div
                key={field.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-gray-900">{field.field_name}</h3>
                    <Badge variant="outline">
                      {fieldTypes.find(t => t.value === field.field_type)?.label}
                    </Badge>
                    {field.is_required && (
                      <Badge variant="destructive" className="text-xs">חובה</Badge>
                    )}
                  </div>
                  {field.field_options && field.field_options.length > 0 && (
                    <div className="text-sm text-gray-600">
                      אפשרויות: {field.field_options.join(', ')}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEdit(field)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(field)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
