
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, ArrowRight } from 'lucide-react';
import { BranchForm } from '@/components/modules/branches/BranchForm';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface BranchFormData {
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  gps_radius: number;
  is_active: boolean;
}

export const BranchEditPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { businessId } = useCurrentBusiness();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<BranchFormData>({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    gps_radius: 100,
    is_active: true,
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);

  console.log('BranchEditPage - Current state:', {
    branchId: id,
    businessId,
    isLoading,
    formData
  });

  // Fetch branch data
  useEffect(() => {
    const fetchBranch = async () => {
      if (!id || !businessId) return;

      try {
        console.log('Fetching branch for edit:', { id, businessId });
        
        const { data, error } = await supabase
          .from('branches')
          .select('*')
          .eq('id', id)
          .eq('business_id', businessId)
          .single();

        if (error) {
          console.error('Error fetching branch:', error);
          toast({
            title: 'שגיאה',
            description: 'לא ניתן לטעון את נתוני הסניף',
            variant: 'destructive',
          });
          navigate('/branches');
          return;
        }

        if (!data) {
          toast({
            title: 'שגיאה',
            description: 'הסניף לא נמצא או שאין לך הרשאה לערוך אותו',
            variant: 'destructive',
          });
          navigate('/branches');
          return;
        }

        console.log('Branch data loaded for editing:', data);

        setFormData({
          name: data.name || '',
          address: data.address || '',
          latitude: data.latitude ? data.latitude.toString() : '',
          longitude: data.longitude ? data.longitude.toString() : '',
          gps_radius: data.gps_radius || 100,
          is_active: data.is_active ?? true,
        });

      } catch (error) {
        console.error('Unexpected error fetching branch:', error);
        toast({
          title: 'שגיאה',
          description: 'אירעה שגיאה בטעינת נתוני הסניף',
          variant: 'destructive',
        });
        navigate('/branches');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchBranch();
  }, [id, businessId, navigate, toast]);

  // Update branch mutation
  const updateBranchMutation = useMutation({
    mutationFn: async (data: BranchFormData) => {
      console.log('Updating branch with data:', data);
      
      if (!id || !businessId) {
        throw new Error('חסרים נתונים נדרשים לעדכון הסניף');
      }

      const branchData = {
        name: data.name.trim(),
        address: data.address.trim() || null,
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
        gps_radius: data.gps_radius,
        is_active: data.is_active,
        updated_at: new Date().toISOString(),
      };

      console.log('Updating branch in database:', branchData);

      const { data: result, error } = await supabase
        .from('branches')
        .update(branchData)
        .eq('id', id)
        .eq('business_id', businessId)
        .select()
        .single();

      if (error) {
        console.error('Database error updating branch:', error);
        throw new Error(`שגיאה בעדכון הסניף: ${error.message}`);
      }
      
      console.log('Branch updated successfully:', result);
      return result;
    },
    onSuccess: (result) => {
      console.log('Branch update successful:', result);
      toast({
        title: 'הצלחה',
        description: `הסניף "${result.name}" עודכן בהצלחה`,
      });
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['branches', businessId] });
      queryClient.invalidateQueries({ queryKey: ['business-branches', businessId] });
      
      // Navigate back to list
      navigate('/branches');
    },
    onError: (error) => {
      console.error('Branch update failed:', error);
      toast({
        title: 'שגיאה',
        description: error instanceof Error ? error.message : 'אירעה שגיאה בעדכון הסניף',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started for edit with data:', formData);
    
    if (!formData.name.trim()) {
      toast({
        title: 'שגיאה',
        description: 'שם הסניף הוא שדה חובה',
        variant: 'destructive',
      });
      return;
    }

    updateBranchMutation.mutate(formData);
  };

  const handleCancel = () => {
    navigate('/branches');
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">טוען נתוני סניף...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6" dir="rtl">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <span 
            onClick={() => navigate('/branches')}
            className="cursor-pointer hover:text-blue-600"
          >
            סניפים
          </span>
          <ArrowRight className="h-4 w-4" />
          <span>עריכת סניף</span>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-6 w-6" />
            עריכת סניף
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">עדכן את פרטי הסניף</p>
          {businessId && (
            <p className="text-sm text-blue-600 mt-2">עסק: {businessId}</p>
          )}
        </CardContent>
      </Card>

      <BranchForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isLoading={updateBranchMutation.isPending}
      />
    </div>
  );
};
