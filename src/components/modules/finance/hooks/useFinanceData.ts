
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

export interface FinancialTransaction {
  id: string;
  business_id: string;
  transaction_type: 'income' | 'expense';
  amount: number;
  currency: string;
  description: string;
  category: string;
  transaction_date: string;
  created_at: string;
  created_by: string;
}

export const useFinanceData = (selectedBusinessId?: string | null) => {
  const { profile } = useAuth();
  const { businessId, isSuperAdmin } = useCurrentBusiness();

  const targetBusinessId = selectedBusinessId || businessId;

  console.log('💰 useFinanceData - Query parameters:', {
    userRole: profile?.role,
    businessId,
    selectedBusinessId,
    targetBusinessId,
    isSuperAdmin
  });

  return useQuery({
    queryKey: ['finance-data', targetBusinessId, profile?.role],
    queryFn: async (): Promise<FinancialTransaction[]> => {
      console.log('📊 useFinanceData - Starting query...');
      
      if (!profile) {
        console.log('❌ No profile available');
        throw new Error('User profile not available');
      }

      // CRITICAL FIX: For super admin without specific business selected, return empty array
      if (isSuperAdmin && !targetBusinessId) {
        console.log('🔒 Super admin without selected business - returning empty array');
        return [];
      }

      if (!targetBusinessId) {
        console.log('❌ No business ID available');
        throw new Error('Business ID required');
      }

      // Query real data from financial_transactions table
      console.log('💰 Fetching financial transactions for business:', targetBusinessId);
      
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('business_id', targetBusinessId)
        .eq('is_active', true)
        .order('transaction_date', { ascending: false });

      if (error) {
        console.error('❌ Error fetching financial transactions:', error);
        throw error;
      }

      console.log('✅ Fetched financial transactions:', data?.length || 0);
      return (data || []) as FinancialTransaction[];
    },
    // CRITICAL FIX: Only enable query when we have a target business ID
    enabled: !!profile && !!targetBusinessId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
