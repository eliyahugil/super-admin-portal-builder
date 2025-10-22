
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans';
import { BusinessFormData } from './types';

export const useBusinessCreation = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { plans, getModulesForPlan } = useSubscriptionPlans();

  const createBusinessWithAutoAdmin = async (
    formData: BusinessFormData,
    useSubscriptionPlan: boolean,
    selectedPlanId: string,
    selectedModules: string[]
  ) => {
    setLoading(true);

    try {
      console.log('🚀 Starting automatic business and admin creation...');
      
      // Get current session for authorization
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('לא מחובר למערכת');
      }

      // Determine final module list
      const finalModules = useSubscriptionPlan && selectedPlanId
        ? getModulesForPlan(selectedPlanId)
        : selectedModules;

      // Call the Edge Function to create business and admin user
      const { data, error } = await supabase.functions.invoke('create-business-admin', {
        body: {
          businessData: {
            name: formData.name,
            contact_phone: formData.contact_phone,
            address: formData.address,
            description: formData.description,
            selectedModules: finalModules
          },
          adminData: {
            email: formData.contact_email,  // משתמש באימייל העסק למנהל
            full_name: formData.admin_full_name
          },
          subscriptionData: useSubscriptionPlan ? {
            plan_id: selectedPlanId,
            start_date: new Date().toISOString().split('T')[0]
          } : null
        }
      });

      if (error) {
        console.error('Error from Edge Function:', error);
        throw new Error(error.message || 'שגיאה ביצירת העסק והמנהל');
      }

      if (!data.success) {
        throw new Error(data.error || 'שגיאה ביצירת העסק והמנהל');
      }

      console.log('✅ Business and admin created successfully:', data);

      // Show success messages
      toast({
        title: 'הצלחה! 🎉',
        description: `העסק "${data.business.name}" והמנהל נוצרו בהצלחה`,
      });
      
      toast({
        title: 'פרטי כניסה למנהל העסק',
        description: `המייל: ${data.admin.email}\nהסיסמה הראשונית: 123456\n\nיש להחליף את הסיסמה בהתחברות הראשונה`,
        variant: 'default',
      });

      if (useSubscriptionPlan && selectedPlanId) {
        const selectedPlan = plans.find(p => p.id === selectedPlanId);
        toast({
          title: 'תוכנית מנוי הוקצתה',
          description: `תוכנית "${selectedPlan?.name}" הוקצתה לעסק בהצלחה`,
        });
      }

      // Navigate back to admin dashboard
      navigate('/admin');

      return true;

    } catch (error) {
      console.error('💥 Error in createBusinessWithAutoAdmin:', error);
      toast({
        title: 'שגיאה',
        description: error instanceof Error ? error.message : 'שגיאה ביצירת העסק והמנהל',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createBusinessWithAutoAdmin
  };
};
