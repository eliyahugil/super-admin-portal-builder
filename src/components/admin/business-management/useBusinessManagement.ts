
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useBusinessesData } from '@/hooks/useRealData';

interface EnrichedBusiness {
  id: string;
  name: string;
  contact_email: string;
  admin_email: string;
  contact_phone: string;
  is_active: boolean;
  created_at: string;
  employee_count?: number;
  branches_count?: number;
  last_activity?: string;
}

export const useBusinessManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const navigate = useNavigate();

  const { data: businesses = [], isLoading: loading, error } = useBusinessesData();

  // Enrich businesses with employee and branch counts
  const { data: enrichedBusinesses = [] } = useQuery({
    queryKey: ['enriched-businesses', businesses],
    queryFn: async (): Promise<EnrichedBusiness[]> => {
      if (!businesses.length) {
        console.log('No businesses to enrich');
        return [];
      }

      console.log('Enriching businesses with counts:', businesses.length);

      const enriched = await Promise.all(
        businesses.map(async (business): Promise<EnrichedBusiness> => {
          try {
            // Get employee count
            const { count: employeeCount } = await supabase
              .from('employees')
              .select('*', { count: 'exact', head: true })
              .eq('business_id', business.id)
              .eq('is_active', true);

            // Get branches count
            const { count: branchesCount } = await supabase
              .from('branches')
              .select('*', { count: 'exact', head: true })
              .eq('business_id', business.id)
              .eq('is_active', true);

            // Get last activity from recent employee or branch updates
            const { data: lastActivity } = await supabase
              .from('employees')
              .select('updated_at')
              .eq('business_id', business.id)
              .order('updated_at', { ascending: false })
              .limit(1);

            return {
              ...business,
              employee_count: employeeCount || 0,
              branches_count: branchesCount || 0,
              last_activity: lastActivity?.[0]?.updated_at || business.created_at,
            };
          } catch (err) {
            console.error(`Failed to fetch counts for business ${business.id}:`, err);
            return {
              ...business,
              employee_count: 0,
              branches_count: 0,
              last_activity: business.created_at,
            };
          }
        })
      );

      console.log('Enriched businesses:', enriched);
      return enriched;
    },
    enabled: !!businesses.length,
  });

  const filteredBusinesses = useMemo(() => {
    return enrichedBusinesses.filter(business => {
      const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           business.contact_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           business.admin_email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || 
                           (selectedStatus === 'active' && business.is_active) ||
                           (selectedStatus === 'inactive' && !business.is_active);
      return matchesSearch && matchesStatus;
    });
  }, [enrichedBusinesses, searchTerm, selectedStatus]);

  const stats = useMemo(() => {
    const totalEmployees = enrichedBusinesses.reduce((sum, b) => sum + (b.employee_count || 0), 0);
    const activeBusinesses = enrichedBusinesses.filter(b => b.is_active).length;
    
    return {
      totalBusinesses: enrichedBusinesses.length,
      activeBusinesses,
      totalEmployees
    };
  }, [enrichedBusinesses]);

  const handleView = (businessId: string) => {
    navigate(`/business/${businessId}/dashboard`);
  };

  const handleSettings = (businessId: string) => {
    navigate(`/business/${businessId}/modules/settings`);
  };

  const handleEdit = (businessId: string) => {
    navigate(`/modules/employees?business=${businessId}`);
  };

  const handleCreateBusiness = () => {
    navigate('/admin/businesses/create');
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    enrichedBusinesses,
    filteredBusinesses,
    loading,
    error,
    stats,
    handlers: {
      handleView,
      handleSettings,
      handleEdit,
      handleCreateBusiness
    }
  };
};
