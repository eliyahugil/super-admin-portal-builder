
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAuthUtils = () => {
  const { toast } = useToast();

  // Helper function to check authentication
  const checkAuthSession = async (): Promise<boolean> => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Session check error:', error);
        toast({
          title: 'שגיאת אותנטיקציה',
          description: 'נדרש להתחבר מחדש למערכת',
          variant: 'destructive'
        });
        return false;
      }

      if (!session?.access_token) {
        console.warn('⚠️ No valid session found');
        toast({
          title: 'נדרש להתחבר מחדש',
          description: 'הסשן פג תוקף - אנא התחבר מחדש כדי להמשיך',
          variant: 'destructive'
        });
        return false;
      }

      console.log('✅ Valid session confirmed');
      return true;
    } catch (error) {
      console.error('💥 Authentication check failed:', error);
      toast({
        title: 'שגיאת מערכת',
        description: 'לא ניתן לאמת את הסשן - אנא רענן את הדף',
        variant: 'destructive'
      });
      return false;
    }
  };

  return { checkAuthSession };
};
