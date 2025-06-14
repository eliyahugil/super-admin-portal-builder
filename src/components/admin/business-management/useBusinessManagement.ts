
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useBusinessesData } from '@/hooks/useRealData';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: businesses = [], isLoading: loading, error } = useBusinessesData();

  // Delete business mutation
  const deleteBusiness = useMutation({
    mutationFn: async (businessId: string) => {
      console.log('Deleting business:', businessId);
      
      const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', businessId);

      if (error) {
        console.error('Error deleting business:', error);
        throw new Error(`שגיאה במחיקת העסק: ${error.message}`);
      }
      
      return businessId;
    },
    onSuccess: (deletedBusinessId) => {
      console.log('Business deleted successfully:', deletedBusinessId);
      toast({
        title: 'הצלחה',
        description: 'העסק נמחק בהצלחה',
      });
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      queryClient.invalidateQueries({ queryKey: ['enriched-businesses'] });
    },
    onError: (error) => {
      console.error('Business deletion failed:', error);
      toast({
        title: 'שגיאה',
        description: error instanceof Error ? error.message : 'אירעה שגיאה במחיקת העסק',
        variant: 'destructive',
      });
    },
  });

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

  const handleDelete = (businessId: string) => {
    deleteBusiness.mutate(businessId);
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
    isDeleting: deleteBusiness.isPending,
    handlers: {
      handleView,
      handleSettings,
      handleEdit,
      handleDelete,
      handleCreateBusiness
    }
  };
};
