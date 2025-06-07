
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

interface BranchFormData {
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  gps_radius: number;
  is_active: boolean;
}

export const useCreateBranchDialog = (onSuccess: () => void, onClose: () => void) => {
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
  const { businessId } = useCurrentBusiness();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: 'שגיאה',
        description: 'שם הסניף הוא שדה חובה',
        variant: 'destructive',
      });
      return;
    }

    if (!businessId) {
      toast({
        title: 'שגיאה',
        description: 'לא נמצא מזהה עסק. אנא נסה שוב.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Prepare the data exactly as the database expects it
      const branchData = {
        business_id: businessId,
        name: formData.name.trim(),
        address: formData.address.trim() || null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        gps_radius: formData.gps_radius,
        is_active: formData.is_active,
      };

      console.log('Creating branch with data:', branchData);

      const { data: createdBranch, error } = await supabase
        .from('branches')
        .insert(branchData)
        .select()
        .single();

      if (error) {
        console.error('Error creating branch:', error);
        
        logActivity({
          action: 'create_failed',
          target_type: 'branch',
          target_id: 'unknown',
          details: { 
            branch_name: formData.name,
            error: error.message 
          }
        });

        toast({
          title: 'שגיאה',
          description: `לא ניתן ליצור את הסניף: ${error.message}`,
          variant: 'destructive',
        });
        return;
      }

      logActivity({
        action: 'create',
        target_type: 'branch',
        target_id: createdBranch.id,
        details: { 
          branch_name: formData.name,
          address: formData.address,
          gps_radius: formData.gps_radius,
          success: true 
        }
      });

      toast({
        title: 'הצלחה',
        description: `הסניף "${formData.name}" נוצר בהצלחה`,
      });

      setFormData({
        name: '',
        address: '',
        latitude: '',
        longitude: '',
        gps_radius: 100,
        is_active: true,
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      
      logActivity({
        action: 'create_failed',
        target_type: 'branch',
        target_id: 'unknown',
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
