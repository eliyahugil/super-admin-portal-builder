
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { TYPE_CATEGORIES, TypeCategoryKey, EMPLOYEE_TYPE_OPTIONS } from '@/constants/typeCategories';
import { useToast } from '@/hooks/use-toast';

interface Props {
  typeCategory: TypeCategoryKey;
  value: string;
  onChange: (val: string) => void;
  businessId?: string;
}

interface OptionType {
  id: string;
  value: string;
  label: string;
}

export function CategorySelectWithAdd({ typeCategory, value, onChange, businessId }: Props) {
  const config = TYPE_CATEGORIES[typeCategory];
  const [items, setItems] = useState<OptionType[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchItems = async () => {
    try {
      // For employee types, use static options
      if (typeCategory === 'employee_type') {
        const mappedOptions = EMPLOYEE_TYPE_OPTIONS.map((opt, index) => ({
          id: `static-${index}`,
          value: opt.value,
          label: opt.label
        }));
        setItems(mappedOptions);
        return;
      }

      // For branches, fetch from database
      if (typeCategory === 'branch' && businessId) {
        const { data } = await supabase
          .from('branches')
          .select('id, name')
          .eq('business_id', businessId)
          .eq('is_active', true);
        
        if (data) {
          const mappedItems = data.map(branch => ({
            id: branch.id,
            value: branch.id,
            label: branch.name
          }));
          setItems(mappedItems);
        }
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const handleAddNew = async () => {
    if (!newValue || !newLabel) {
      toast({
        title: "שגיאה",
        description: "יש למלא את כל השדות",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      if (typeCategory === 'employee_type') {
        // For employee types, just add to local state (since it's static)
        const newItem = {
          id: `custom-${Date.now()}`,
          value: newValue,
          label: newLabel
        };
        setItems(prev => [...prev, newItem]);
        onChange(newValue);
        
        toast({
          title: "הצלחה",
          description: "סוג העובד נוסף בהצלחה"
        });
      } else if (typeCategory === 'branch' && businessId) {
        // For branches, add to database
        const { data, error } = await supabase
          .from('branches')
          .insert([{
            business_id: businessId,
            name: newLabel,
            is_active: true
          }])
          .select()
          .single();

        if (error) throw error;

        const newItem = {
          id: data.id,
          value: data.id,
          label: data.name
        };
        setItems(prev => [...prev, newItem]);
        onChange(data.id);
        
        toast({
          title: "הצלחה",
          description: "הסניף נוסף בהצלחה"
        });
      }

      setDialogOpen(false);
      setNewValue('');
      setNewLabel('');
    } catch (error) {
      console.error('Error adding new item:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה בהוספת הערך החדש",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [typeCategory, businessId]);

  return (
    <>
      <Select 
        onValueChange={(val) => (val === '__add__' ? setDialogOpen(true) : onChange(val))} 
        value={value}
      >
        <SelectTrigger>
          <SelectValue placeholder={config.placeholder} />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.id} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
          <SelectItem value="__add__" className="text-blue-600 font-medium">
            ➕ הוסף ערך חדש
          </SelectItem>
        </SelectContent>
      </Select>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>הוסף {config.label}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>שם לתצוגה</Label>
              <Input 
                placeholder={`לדוגמה: ${config.label} חדש`}
                value={newLabel} 
                onChange={(e) => setNewLabel(e.target.value)} 
              />
            </div>
            <div>
              <Label>ערך למערכת (אנגלית בלבד)</Label>
              <Input 
                placeholder="לדוגמה: new_value"
                value={newValue} 
                onChange={(e) => setNewValue(e.target.value)} 
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddNew} disabled={loading} className="flex-1">
                {loading ? 'מוסיף...' : 'שמור והוסף'}
              </Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                ביטול
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
