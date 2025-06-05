
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, GripVertical, Sparkles, RefreshCw, Folder, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  generateTableName, 
  generateRoute, 
  generateIcon, 
  validateModuleName,
  getCustomerNumberForUser,
  createCustomModuleWithTable
} from '@/utils/moduleUtils';
import type { CustomField, SubModule } from '@/utils/moduleTypes';

interface CustomModuleCreatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CustomModuleCreator: React.FC<CustomModuleCreatorProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const [moduleName, setModuleName] = useState('');
  const [moduleDescription, setModuleDescription] = useState('');
  const [moduleIcon, setModuleIcon] = useState('📋');
  const [fields, setFields] = useState<CustomField[]>([]);
  const [subModules, setSubModules] = useState<SubModule[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fieldTypes = [
    { value: 'text', label: 'טקסט' },
    { value: 'number', label: 'מספר' },
    { value: 'email', label: 'אימייל' },
    { value: 'date', label: 'תאריך' },
    { value: 'boolean', label: 'כן/לא' },
    { value: 'select', label: 'רשימה נפתחת' },
    { value: 'textarea', label: 'טקסט ארוך' }
  ];

  // Auto-generate icon when module name changes
  const handleModuleNameChange = (name: string) => {
    setModuleName(name);
    if (name.trim()) {
      const autoIcon = generateIcon(name);
      setModuleIcon(autoIcon);
    }
  };

  const addField = () => {
    const newField: CustomField = {
      id: Date.now().toString(),
      name: '',
      type: 'text',
      required: false
    };
    setFields([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<CustomField>) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
  };

  const addSubModule = () => {
    const newSubModule: SubModule = {
      id: Date.now().toString(),
      name: '',
      description: '',
      route: '',
      icon: '📄',
      display_order: subModules.length + 1
    };
    setSubModules([...subModules, newSubModule]);
  };

  const updateSubModule = (id: string, updates: Partial<SubModule>) => {
    setSubModules(subModules.map(subModule => 
      subModule.id === id ? { ...subModule, ...updates } : subModule
    ));
  };

  const removeSubModule = (id: string) => {
    setSubModules(subModules.filter(subModule => subModule.id !== id));
  };

  const validateFields = () => {
    const nameValidation = validateModuleName(moduleName);
    if (!nameValidation.isValid) {
      toast({
        title: 'שגיאה',
        description: nameValidation.error,
        variant: 'destructive'
      });
      return false;
    }

    if (fields.length === 0) {
      toast({
        title: 'שגיאה', 
        description: 'יש להוסיף לפחות שדה אחד למודל',
        variant: 'destructive'
      });
      return false;
    }

    for (const field of fields) {
      if (!field.name.trim()) {
        toast({
          title: 'שגיאה',
          description: 'כל השדות חייבים להכיל שם',
          variant: 'destructive'
        });
        return false;
      }
    }

    // Validate sub-modules if any
    for (const subModule of subModules) {
      if (!subModule.name.trim()) {
        toast({
          title: 'שגיאה',
          description: 'כל תת-המודלים חייבים להכיל שם',
          variant: 'destructive'
        });
        return false;
      }
      if (!subModule.route.trim()) {
        toast({
          title: 'שגיאה',
          description: 'כל תת-המודלים חייבים להכיל נתיב',
          variant: 'destructive'
        });
        return false;
      }
    }

    return true;
  };

  const handleCreate = async () => {
    if (!validateFields()) return;

    setLoading(true);
    try {
      console.log('Starting custom module creation...');
      
      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        toast({
          title: 'שגיאה',
          description: 'משתמש לא מזוהה',
          variant: 'destructive'
        });
        return;
      }

      // Use the enhanced creation function with sub-modules
      const result = await createCustomModuleWithTable(
        moduleName,
        moduleDescription,
        fields,
        subModules,
        userData.user.id
      );

      if (!result.success) {
        toast({
          title: 'שגיאה',
          description: result.error || 'לא ניתן ליצור את המודל',
          variant: 'destructive'
        });
        return;
      }

      const customerNumber = await getCustomerNumberForUser(userData.user.id);
      const customerText = customerNumber === 0 ? 'מנהל על (0)' : customerNumber.toString();
      const subModulesText = subModules.length > 0 ? ` עם ${subModules.length} תת-מודלים` : '';
      
      toast({
        title: 'הצלחה',
        description: `המודל "${moduleName}" נוצר בהצלחה עם מספר לקוח ${customerText}${subModulesText}`,
      });

      // Reset form
      setModuleName('');
      setModuleDescription('');
      setModuleIcon('📋');
      setFields([]);
      setSubModules([]);
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error in handleCreate:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בלתי צפויה',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            יצירת מודל מותאם אישית
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Module Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>פרטי המודל</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="moduleName">שם המודל</Label>
                <Input
                  id="moduleName"
                  value={moduleName}
                  onChange={(e) => handleModuleNameChange(e.target.value)}
                  placeholder="לדוגמה: ניהול פרויקטים, מעקב משימות, רישום לקוחות"
                />
                {moduleName && (
                  <div className="mt-2 text-xs space-y-1">
                    <div className="text-gray-500">
                      <span className="font-medium">שם טבלה:</span> {generateTableName(moduleName, 'temp-id', 0)}
                    </div>
                    <div className="text-gray-500">
                      <span className="font-medium">נתיב:</span> /custom/{generateRoute(moduleName)}
                    </div>
                    <div className="text-blue-600 font-medium flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      המודל יקבל מספר לקוח ייחודי אוטומטית
                    </div>
                    <div className="text-green-600 font-medium flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      דף ייעודי יווצר אוטומטית למודל זה עם ממשק ניהול מלא
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="moduleDescription">תיאור המודל</Label>
                <Textarea
                  id="moduleDescription"
                  value={moduleDescription}
                  onChange={(e) => setModuleDescription(e.target.value)}
                  placeholder="תיאור קצר של המודל ותפקידו"
                />
              </div>

              <div>
                <Label htmlFor="moduleIcon" className="flex items-center gap-2">
                  אייקון המודל (נבחר אוטומטית)
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setModuleIcon(generateIcon(moduleName))}
                    className="h-6 w-6 p-0"
                    title="רענן אייקון"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="moduleIcon"
                    value={moduleIcon}
                    onChange={(e) => setModuleIcon(e.target.value)}
                    placeholder="📋"
                    className="w-20"
                  />
                  <div className="text-xs text-gray-500">
                    האייקון נבחר אוטומטית על בסיס שם המודל
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sub-Modules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Folder className="h-5 w-5" />
                  תת-מודלים (אופציונלי)
                </div>
                <Button onClick={addSubModule} size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  הוסף תת-מודל
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {subModules.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  ללא תת-מודלים. ניתן להוסיף תת-מודלים לארגון טוב יותר של התוכן.
                </div>
              ) : (
                <div className="space-y-4">
                  {subModules.map((subModule, index) => (
                    <div key={subModule.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">תת-מודל {index + 1}</span>
                        </div>
                        <Button
                          onClick={() => removeSubModule(subModule.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>שם תת-המודל</Label>
                          <Input
                            value={subModule.name}
                            onChange={(e) => updateSubModule(subModule.id, { 
                              name: e.target.value,
                              route: generateRoute(e.target.value)
                            })}
                            placeholder="לדוגמה: ניהול קבצים, דוחות"
                          />
                        </div>

                        <div>
                          <Label>נתיב תת-המודל</Label>
                          <Input
                            value={subModule.route}
                            onChange={(e) => updateSubModule(subModule.id, { route: e.target.value })}
                            placeholder="לדוגמה: files, reports"
                          />
                        </div>
                      </div>

                      <div>
                        <Label>תיאור תת-המודל</Label>
                        <Input
                          value={subModule.description || ''}
                          onChange={(e) => updateSubModule(subModule.id, { description: e.target.value })}
                          placeholder="תיאור קצר של תפקיד תת-המודל"
                        />
                      </div>

                      <div>
                        <Label>אייקון תת-המודל</Label>
                        <Input
                          value={subModule.icon}
                          onChange={(e) => updateSubModule(subModule.id, { icon: e.target.value })}
                          placeholder="📄"
                          className="w-20"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fields Definition */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                שדות המודל
                <Button onClick={addField} size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  הוסף שדה
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {fields.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  לא הוגדרו שדות עדיין. לחץ על "הוסף שדה" כדי להתחיל.
                </div>
              ) : (
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">שדה {index + 1}</span>
                        </div>
                        <Button
                          onClick={() => removeField(field.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>שם השדה</Label>
                          <Input
                            value={field.name}
                            onChange={(e) => updateField(field.id, { name: e.target.value })}
                            placeholder="לדוגמה: שם הפרויקט"
                          />
                        </div>

                        <div>
                          <Label>סוג השדה</Label>
                          <Select
                            value={field.type}
                            onValueChange={(value) => updateField(field.id, { type: value })}
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
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={field.required}
                          onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                        />
                        <Label>שדה חובה</Label>
                      </div>

                      {field.type === 'select' && (
                        <div>
                          <Label>אפשרויות (מופרדות בפסיקים)</Label>
                          <Input
                            value={field.options?.join(', ') || ''}
                            onChange={(e) => updateField(field.id, { 
                              options: e.target.value.split(',').map(opt => opt.trim()).filter(Boolean)
                            })}
                            placeholder="אפשרויות 1, אפשרות 2, אפשרות 3"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              ביטול
            </Button>
            <Button
              onClick={handleCreate}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              <Sparkles className="h-4 w-4" />
              צור מודל
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
