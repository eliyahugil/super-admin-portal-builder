
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit2, Trash2, Search, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface ModuleField {
  id: string;
  field_name: string;
  field_type: string;
  is_required: boolean;
  display_order: number;
  field_options?: any;
}

interface ModuleData {
  id: string;
  data: any;
  created_at: string;
  updated_at: string;
}

interface Module {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  is_custom: boolean;
  route: string | null;
}

export const DynamicModulePage: React.FC = () => {
  const { moduleRoute } = useParams<{ moduleRoute: string }>();
  const [module, setModule] = useState<Module | null>(null);
  const [fields, setFields] = useState<ModuleField[]>([]);
  const [data, setData] = useState<ModuleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [editingRecord, setEditingRecord] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (moduleRoute) {
      fetchModule();
    }
  }, [moduleRoute]);

  useEffect(() => {
    if (module) {
      fetchModuleFields();
      fetchModuleData();
    }
  }, [module]);

  const fetchModule = async () => {
    try {
      const { data: moduleData, error } = await supabase
        .from('modules')
        .select('*')
        .eq('route', `/${moduleRoute}`)
        .eq('is_custom', true)
        .single();

      if (error) {
        console.error('Error fetching module:', error);
        toast({
          title: 'שגיאה',
          description: 'לא ניתן לטעון את המודל',
          variant: 'destructive'
        });
        return;
      }

      setModule(moduleData);
    } catch (error) {
      console.error('Error in fetchModule:', error);
    }
  };

  const fetchModuleFields = async () => {
    if (!module) return;

    try {
      const { data: fieldsData, error } = await supabase
        .from('module_fields')
        .select('*')
        .eq('module_id', module.id)
        .order('display_order');

      if (error) {
        console.error('Error fetching fields:', error);
        return;
      }

      setFields(fieldsData || []);
    } catch (error) {
      console.error('Error in fetchModuleFields:', error);
    }
  };

  const fetchModuleData = async () => {
    if (!module) return;

    try {
      setLoading(true);
      const { data: moduleData, error } = await supabase
        .from('module_data')
        .select('*')
        .eq('module_id', module.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching module data:', error);
        return;
      }

      setData(moduleData || []);
    } catch (error) {
      console.error('Error in fetchModuleData:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecord = async () => {
    if (!module) return;

    // Validate required fields
    const missingRequired = fields.filter(field => 
      field.is_required && (!formData[field.field_name] || formData[field.field_name].toString().trim() === '')
    );

    if (missingRequired.length > 0) {
      toast({
        title: 'שגיאה',
        description: `יש למלא את השדות החובה: ${missingRequired.map(f => f.field_name).join(', ')}`,
        variant: 'destructive'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('module_data')
        .insert({
          module_id: module.id,
          data: formData
        });

      if (error) {
        console.error('Error adding record:', error);
        toast({
          title: 'שגיאה',
          description: 'לא ניתן להוסיף את הרשומה',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'הצלחה',
        description: 'הרשומה נוספה בהצלחה'
      });

      setFormData({});
      setShowAddForm(false);
      fetchModuleData();
    } catch (error) {
      console.error('Error in handleAddRecord:', error);
    }
  };

  const handleUpdateRecord = async (recordId: string) => {
    try {
      const { error } = await supabase
        .from('module_data')
        .update({
          data: formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', recordId);

      if (error) {
        console.error('Error updating record:', error);
        toast({
          title: 'שגיאה',
          description: 'לא ניתן לעדכן את הרשומה',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'הצלחה',
        description: 'הרשומה עודכנה בהצלחה'
      });

      setEditingRecord(null);
      setFormData({});
      setShowAddForm(false);
      fetchModuleData();
    } catch (error) {
      console.error('Error in handleUpdateRecord:', error);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק את הרשומה?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('module_data')
        .delete()
        .eq('id', recordId);

      if (error) {
        console.error('Error deleting record:', error);
        toast({
          title: 'שגיאה',
          description: 'לא ניתן למחוק את הרשומה',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'הצלחה',
        description: 'הרשומה נמחקה בהצלחה'
      });

      fetchModuleData();
    } catch (error) {
      console.error('Error in handleDeleteRecord:', error);
    }
  };

  const startEdit = (record: ModuleData) => {
    setEditingRecord(record.id);
    setFormData(record.data);
    setShowAddForm(true);
  };

  const cancelEdit = () => {
    setEditingRecord(null);
    setFormData({});
    setShowAddForm(false);
  };

  const renderField = (field: ModuleField) => {
    const value = formData[field.field_name] || '';
    
    switch (field.field_type) {
      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => setFormData({...formData, [field.field_name]: e.target.value})}
            required={field.is_required}
          />
        );
      
      case 'select':
        const options = field.field_options?.options || [];
        return (
          <Select
            value={value}
            onValueChange={(newValue) => setFormData({...formData, [field.field_name]: newValue})}
          >
            <SelectTrigger>
              <SelectValue placeholder="בחר אפשרות" />
            </SelectTrigger>
            <SelectContent>
              {options.map((option: string, index: number) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'boolean':
        return (
          <Switch
            checked={value === true || value === 'true'}
            onCheckedChange={(checked) => setFormData({...formData, [field.field_name]: checked})}
          />
        );
      
      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => setFormData({...formData, [field.field_name]: e.target.value})}
            required={field.is_required}
          />
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => setFormData({...formData, [field.field_name]: e.target.value})}
            required={field.is_required}
          />
        );
      
      case 'email':
        return (
          <Input
            type="email"
            value={value}
            onChange={(e) => setFormData({...formData, [field.field_name]: e.target.value})}
            required={field.is_required}
          />
        );
      
      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => setFormData({...formData, [field.field_name]: e.target.value})}
            required={field.is_required}
          />
        );
    }
  };

  const filteredData = data.filter(record => {
    if (!searchTerm) return true;
    
    return fields.some(field => {
      const value = record.data[field.field_name];
      return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  if (loading && !module) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">טוען מודל...</p>
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">מודל לא נמצא</h1>
          <p className="text-gray-600 mb-6">המודל שחיפשת לא קיים או שאין לך הרשאה לצפות בו.</p>
          <Link to="/modules">
            <Button className="flex items-center gap-2 mx-auto">
              <ArrowRight className="h-4 w-4" />
              חזור לניהול מודלים
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Link to="/modules" className="text-blue-600 hover:text-blue-700">
              ניהול מודלים
            </Link>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <span className="text-gray-900">{module.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{module.icon}</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{module.name}</h1>
              {module.description && (
                <p className="text-gray-600">{module.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="חיפוש..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            הוסף רשומה
          </Button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                {editingRecord ? 'עריכת רשומה' : 'הוספת רשומה חדשה'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {fields.map((field) => (
                  <div key={field.id}>
                    <Label>
                      {field.field_name}
                      {field.is_required && <span className="text-red-500 mr-1">*</span>}
                    </Label>
                    {renderField(field)}
                  </div>
                ))}
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={cancelEdit}>
                  ביטול
                </Button>
                <Button
                  onClick={() => editingRecord ? handleUpdateRecord(editingRecord) : handleAddRecord()}
                >
                  {editingRecord ? 'עדכן' : 'הוסף'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>רשומות ({filteredData.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">טוען נתונים...</p>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'לא נמצאו רשומות התואמות לחיפוש' : 'אין רשומות להצגה'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    {fields.map((field) => (
                      <TableHead key={field.id}>{field.field_name}</TableHead>
                    ))}
                    <TableHead>תאריך יצירה</TableHead>
                    <TableHead>פעולות</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((record) => (
                    <TableRow key={record.id}>
                      {fields.map((field) => (
                        <TableCell key={field.id}>
                          {field.field_type === 'boolean' 
                            ? (record.data[field.field_name] ? 'כן' : 'לא')
                            : record.data[field.field_name] || '-'
                          }
                        </TableCell>
                      ))}
                      <TableCell>
                        {new Date(record.created_at).toLocaleDateString('he-IL')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEdit(record)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRecord(record.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
