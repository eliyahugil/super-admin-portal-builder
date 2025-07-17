
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useBusiness } from '@/hooks/useBusiness';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

interface BusinessDetails {
  id: string;
  name: string;
  contact_phone?: string;
  address?: string;
  logo_url?: string;
  contact_email?: string;
  admin_email?: string;
  description?: string;
}

export const useBusinessForm = () => {
  const { businessId: urlBusinessId } = useParams();
  const { business, businessId: hookBusinessId } = useBusiness();
  const { businessId: currentBusinessId } = useCurrentBusiness();
  const { toast } = useToast();
  
  // עדיפויות: URL -> currentBusiness -> hookBusiness
  const effectiveBusinessId = urlBusinessId || currentBusinessId || hookBusinessId;
  
  const [details, setDetails] = useState<BusinessDetails>({
    id: '',
    name: '',
    contact_phone: '',
    address: '',
    logo_url: '',
    contact_email: '',
    admin_email: '',
    description: ''
  });
  
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchBusinessDetails = async () => {
      if (!effectiveBusinessId) {
        console.log('No business ID available');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', effectiveBusinessId)
          .single();

        if (error) {
          console.error('Error fetching business:', error);
          throw error;
        }
        
        if (data) {
          setDetails(data);
          if (data.address) {
            setAddress(data.address);
          }
        }
      } catch (error) {
        console.error('Error fetching business details:', error);
        toast({
          title: 'שגיאה',
          description: 'לא ניתן לטעון את פרטי העסק',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessDetails();
  }, [effectiveBusinessId, toast]);

  const handleSave = async () => {
    if (!effectiveBusinessId) {
      toast({
        title: 'שגיאה',
        description: 'לא נמצא מזהה עסק',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('businesses')
        .update({
          name: details.name,
          contact_phone: details.contact_phone,
          address: typeof address === 'string' ? address : details.address,
          contact_email: details.contact_email,
          admin_email: details.admin_email,
          description: details.description,
          logo_url: details.logo_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', effectiveBusinessId);

      if (error) throw error;

      toast({
        title: 'נשמר בהצלחה',
        description: 'פרטי העסק עודכנו',
      });
    } catch (error) {
      console.error('Error updating business:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לעדכן את פרטי העסק',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return {
    details,
    setDetails,
    address,
    setAddress,
    loading,
    saving,
    effectiveBusinessId,
    handleSave
  };
};
