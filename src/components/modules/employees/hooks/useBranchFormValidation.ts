
import { useToast } from '@/hooks/use-toast';

interface BranchFormData {
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  gps_radius: number;
  is_active: boolean;
}

export const useBranchFormValidation = () => {
  const { toast } = useToast();

  const validateBranchForm = (formData: BranchFormData): boolean => {
    if (!formData.name.trim()) {
      toast({
        title: 'שגיאה',
        description: 'שם הסניף הוא שדה חובה',
        variant: 'destructive',
      });
      return false;
    }

    if (formData.latitude && (isNaN(parseFloat(formData.latitude)) || Math.abs(parseFloat(formData.latitude)) > 90)) {
      toast({
        title: 'שגיאה',
        description: 'קו רוחב חייב להיות בין -90 ל-90',
        variant: 'destructive',
      });
      return false;
    }

    if (formData.longitude && (isNaN(parseFloat(formData.longitude)) || Math.abs(parseFloat(formData.longitude)) > 180)) {
      toast({
        title: 'שגיאה',
        description: 'קו אורך חייב להיות בין -180 ל-180',
        variant: 'destructive',
      });
      return false;
    }

    if (formData.gps_radius < 10 || formData.gps_radius > 1000) {
      toast({
        title: 'שגיאה',
        description: 'רדיוס GPS חייב להיות בין 10 ל-1000 מטרים',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  return { validateBranchForm };
};
