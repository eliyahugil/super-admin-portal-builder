
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

      // For demo purposes, return mock data
      // In real implementation, this would query a financial_transactions table
      console.log('💰 Returning mock financial data for business:', targetBusinessId);
      
      const mockTransactions: FinancialTransaction[] = [
        {
          id: '1',
          business_id: targetBusinessId,
          transaction_type: 'income',
          amount: 5000,
          currency: 'ILS',
          description: 'תשלום מלקוח',
          category: 'מכירות',
          transaction_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          created_by: profile.id
        },
        {
          id: '2',
          business_id: targetBusinessId,
          transaction_type: 'expense',
          amount: 1200,
          currency: 'ILS',
          description: 'משכורות עובדים',
          category: 'שכר',
          transaction_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          created_by: profile.id
        }
      ];

      return mockTransactions;
    },
    // CRITICAL FIX: Only enable query when we have a target business ID
    enabled: !!profile && !!targetBusinessId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
