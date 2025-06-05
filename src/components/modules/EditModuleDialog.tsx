
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Module {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  route: string | null;
  is_active: boolean;
}

interface EditModuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  module: Module | null;
  onSuccess: () => void;
}

export const EditModuleDialog: React.FC<EditModuleDialogProps> = ({
  open,
  onOpenChange,
  module,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    route: '',
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (module && open) {
      setFormData({
        name: module.name,
        description: module.description || '',
        icon: module.icon || '',
        route: module.route || '',
        is_active: module.is_active,
      });
    }
  }, [module, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!module) return;
    
    if (!formData.name.trim()) {
      toast({
        title: 'שגיאה',
        description: 'שם המודל הוא שדה חובה',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('modules')
        .update({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          icon: formData.icon.trim() || null,
          route: formData.route.trim() || null,
          is_active: formData.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', module.id);

      if (error) {
        console.error('Error updating module:', error);
        toast({
          title: 'שגיאה',
          description: 'לא ניתן לעדכן את המודל',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'הצלחה',
        description: 'המודל עודכן בהצלחה',
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>עריכת מודל</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">שם המודל *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="הזן שם למודל"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">תיאור</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="הזן תיאור למודל"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="icon">אייקון</Label>
            <Input
              id="icon"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="🏢"
              className="text-center"
            />
          </div>

          <div>
            <Label htmlFor="route">נתיב</Label>
            <Input
              id="route"
              value={formData.route}
              onChange={(e) => setFormData({ ...formData, route: e.target.value })}
              placeholder="/module-route"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_active">מודל פעיל</Label>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>

          <div className="flex justify-end space-x-2 space-x-reverse pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              ביטול
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'מעדכן...' : 'עדכן מודל'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
