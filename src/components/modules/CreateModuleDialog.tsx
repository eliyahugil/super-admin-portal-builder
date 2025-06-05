import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useActivityLogger } from '@/hooks/useActivityLogger';

interface CreateModuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CreateModuleDialog: React.FC<CreateModuleDialogProps> = ({
  open,
  onOpenChange,
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
  const { logActivity } = useActivityLogger();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      const moduleData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        icon: formData.icon.trim() || null,
        route: formData.route.trim() || null,
        is_active: formData.is_active,
      };

      const { data: createdModule, error } = await supabase
        .from('modules')
        .insert(moduleData)
        .select()
        .single();

      if (error) {
        console.error('Error creating module:', error);
        
        logActivity({
          action: 'create_failed',
          target_type: 'module',
          target_id: 'unknown',
          details: { 
            module_name: formData.name,
            error: error.message 
          }
        });

        toast({
          title: 'שגיאה',
          description: 'לא ניתן ליצור את המודל',
          variant: 'destructive',
        });
        return;
      }

      logActivity({
        action: 'create',
        target_type: 'module',
        target_id: createdModule.id,
        details: { 
          module_name: formData.name,
          route: formData.route,
          success: true 
        }
      });

      toast({
        title: 'הצלחה',
        description: 'המודל נוצר בהצלחה',
      });

      setFormData({
        name: '',
        description: '',
        icon: '',
        route: '',
        is_active: true,
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      
      logActivity({
        action: 'create_failed',
        target_type: 'module',
        target_id: 'unknown',
        details: { 
          module_name: formData.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });

      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בלתי צפויה',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>צור מודל חדש</DialogTitle>
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
              {loading ? 'יוצר...' : 'צור מודל'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
