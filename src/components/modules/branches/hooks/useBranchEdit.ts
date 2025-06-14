
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { Branch } from '@/types/branch';

interface BranchFormData {
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  gps_radius: number;
  is_active: boolean;
}

export const useBranchEdit = (
  branch: Branch | null,
  onSuccess: () => void,
  onClose: () => void
) => {
  const [formData, setFormData] = useState<BranchFormData>({
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
    
    if (!branch || !formData.name.trim()) {
      toast({
        title: 'שגיאה',
        description: 'יש למלא את שם הסניף',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const updateData: any = {
        name: formData.name.trim(),
        address: formData.address.trim() || null,
        gps_radius: formData.gps_radius,
        is_active: formData.is_active,
        updated_at: new Date().toISOString(),
      };

      // Add coordinates if provided
      if (formData.latitude && formData.longitude) {
        updateData.latitude = parseFloat(formData.latitude);
        updateData.longitude = parseFloat(formData.longitude);
      }

      const { error } = await supabase
        .from('branches')
        .update(updateData)
        .eq('id', branch.id);

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
          changes: updateData 
        }
      });

      toast({
        title: 'הצלחה',
        description: 'הסניף עודכן בהצלחה',
      });

      onSuccess();
      onClose();
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

  return {
    formData,
    setFormData,
    handleSubmit,
    loading,
  };
};
