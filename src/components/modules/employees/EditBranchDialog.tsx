
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { Branch } from '@/types/branch';

interface EditBranchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  branch: Branch | null;
}

export const EditBranchDialog: React.FC<EditBranchDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  branch,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    gps_radius: 100,
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { logActivity } = useActivityLogger();

  useEffect(() => {
    if (branch) {
      setFormData({
        name: branch.name,
        address: branch.address || '',
        latitude: branch.latitude?.toString() || '',
        longitude: branch.longitude?.toString() || '',
        gps_radius: branch.gps_radius || 100,
        is_active: branch.is_active ?? true,
      });
    }
  }, [branch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!branch) return;

    if (!formData.name.trim()) {
      toast({
        title: 'שגיאה',
        description: 'שם הסניף הוא שדה חובה',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const branchData = {
        name: formData.name.trim(),
        address: formData.address.trim() || null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        gps_radius: formData.gps_radius,
        is_active: formData.is_active,
        updated_at: new Date().toISOString(),
      };

      const { data: updatedBranch, error } = await supabase
        .from('branches')
        .update(branchData)
        .eq('id', branch.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating branch:', error);
        
        logActivity({
          action: 'update_failed',
          target_type: 'branch',
          target_id: branch.id,
          details: { 
            branch_name: formData.name,
            error: error.message 
          }
        });

        toast({
          title: 'שגיאה',
          description: 'לא ניתן לעדכן את הסניף',
          variant: 'destructive',
        });
        return;
      }

      logActivity({
        action: 'update',
        target_type: 'branch',
        target_id: branch.id,
        details: { 
          branch_name: formData.name,
          address: formData.address,
          gps_radius: formData.gps_radius,
          success: true 
        }
      });

      toast({
        title: 'הצלחה',
        description: 'הסניף עודכן בהצלחה',
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      
      logActivity({
        action: 'update_failed',
        target_type: 'branch',
        target_id: branch.id,
        details: { 
          branch_name: formData.name,
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
          <DialogTitle>ערוך סניף</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">שם הסניף *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="הזן שם הסניף"
              required
            />
          </div>

          <div>
            <Label htmlFor="address">כתובת</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="הזן כתובת הסניף"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="latitude">קו רוחב</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                placeholder="31.7683"
              />
            </div>
            <div>
              <Label htmlFor="longitude">קו אורך</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                placeholder="35.2137"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="gps_radius">רדיוס GPS (מטרים)</Label>
            <Input
              id="gps_radius"
              type="number"
              min="10"
              max="1000"
              value={formData.gps_radius}
              onChange={(e) => setFormData({ ...formData, gps_radius: parseInt(e.target.value) || 100 })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_active">סניף פעיל</Label>
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
              {loading ? 'מעדכן...' : 'עדכן סניף'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
