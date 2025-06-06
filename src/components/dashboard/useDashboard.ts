
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Business {
  id: string;
  name: string;
  description: string;
  logo_url?: string;
  contact_email?: string;
  is_active: boolean;
  created_at: string;
}

interface Stats {
  totalBusinesses: number;
  activeBusinesses: number;
  totalUsers: number;
}

export const useDashboard = () => {
  const { isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [stats, setStats] = useState<Stats>({ totalBusinesses: 0, activeBusinesses: 0, totalUsers: 0 });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBusinesses = async () => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching businesses:', error);
        toast({
          title: 'שגיאה',
          description: 'לא ניתן לטעון את העסקים',
          variant: 'destructive',
        });
        return;
      }

      setBusinesses(data || []);
    } catch (error) {
      console.error('Error in fetchBusinesses:', error);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch business stats
      const { count: totalBusinesses } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true });

      const { count: activeBusinesses } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Fetch user stats
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalBusinesses: totalBusinesses || 0,
        activeBusinesses: activeBusinesses || 0,
        totalUsers: totalUsers || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchBusinesses(), fetchStats()]);
      setLoading(false);
    };

    if (isSuperAdmin) {
      loadData();
    }
  }, [isSuperAdmin]);

  const handleManageBusiness = (businessId: string) => {
    // Navigate to business-specific settings
    navigate(`/business/${businessId}/modules/settings`);
  };

  const handleEditBusiness = (business: Business) => {
    // Navigate to business-specific profile settings
    navigate(`/business/${business.id}/modules/settings/profile`);
  };

  const handleCreateBusiness = () => {
    // Navigate to create business page
    navigate('/admin/businesses/create');
  };

  return {
    isSuperAdmin,
    businesses,
    stats,
    loading,
    handleManageBusiness,
    handleEditBusiness,
    handleCreateBusiness,
  };
};
