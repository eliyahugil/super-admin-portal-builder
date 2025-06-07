
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRequiredBusinessId } from '@/hooks/useBusinessId';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

interface BranchFormData {
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  gps_radius: number;
  is_active: boolean;
}

export const useBranchCreation = () => {
  const [formData, setFormData] = useState<BranchFormData>({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    gps_radius: 100,
    is_active: true,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isSuperAdmin } = useCurrentBusiness();
  
  // Use the secure hook that validates business ID is present
  let businessId: string | null = null;
  try {
    businessId = useRequiredBusinessId();
  } catch (error) {
    console.log('No business ID available - user may be super admin without business context');
  }

  console.log('useBranchCreation - Current state:', {
    businessId,
    isSuperAdmin,
    formData
  });

  const createBranchMutation = useMutation({
    mutationFn: async (data: BranchFormData) => {
      console.log('Creating branch with form data:', data);
      
      if (!businessId) {
        throw new Error('לא נמצא מזהה עסק. אנא בחר עסק ספציפי ונסה שוב.');
      }

      // Prepare the data with mandatory business_id for security
      const branchData = {
        business_id: businessId, // This ensures RLS policies will work correctly
        name: data.name.trim(),
        address: data.address.trim() || null,
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
        gps_radius: data.gps_radius,
        is_active: data.is_active,
      };

      console.log('Inserting branch data to database with business_id:', branchData);

      // Validate required fields before insertion
      if (!branchData.name) {
        throw new Error('שם הסניף הוא שדה חובה');
      }

      // The RLS policies will automatically ensure this user can only create branches for their business
      const { data: result, error } = await supabase
        .from('branches')
        .insert([branchData])
        .select()
        .single();

      if (error) {
        console.error('Database error creating branch:', error);
        throw new Error(`שגיאה ביצירת הסניף: ${error.message}`);
      }
      
      console.log('Branch created successfully with business isolation:', result);
      return result;
    },
    onSuccess: (result) => {
      console.log('Branch creation successful:', result);
      toast({
        title: 'הצלחה',
        description: `הסניף "${result.name}" נוצר בהצלחה`,
      });
      
      // Invalidate business-specific queries
      queryClient.invalidateQueries({ queryKey: ['branches', businessId] });
      queryClient.invalidateQueries({ queryKey: ['business-branches', businessId] });
      
      // Reset form
      setFormData({
        name: '',
        address: '',
        latitude: '',
        longitude: '',
        gps_radius: 100,
        is_active: true,
      });
    },
    onError: (error) => {
      console.error('Branch creation failed:', error);
      toast({
        title: 'שגיאה',
        description: error instanceof Error ? error.message : 'אירעה שגיאה ביצירת הסניף',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started with data:', formData);
    
    if (!formData.name.trim()) {
      toast({
        title: 'שגיאה',
        description: 'שם הסניף הוא שדה חובה',
        variant: 'destructive',
      });
      return;
    }

    if (!businessId) {
      console.error('No businessId available for branch creation');
      toast({
        title: 'שגיאה',
        description: 'לא נמצא מזהה עסק. אנא בחר עסק ספציפי ונסה שוב.',
        variant: 'destructive',
      });
      return;
    }

    createBranchMutation.mutate(formData);
  };

  return {
    formData,
    setFormData,
    handleSubmit,
    isLoading: createBranchMutation.isPending,
    businessId,
    isSuperAdmin,
  };
};
