
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

export interface Order {
  id: string;
  business_id: string;
  order_number: string;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  total_amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  order_type: 'delivery' | 'pickup' | 'dine_in';
  delivery_address?: string;
  pickup_location?: string;
  created_at: string;
  updated_at: string;
  estimated_delivery?: string;
  notes?: string;
}

export const useOrdersData = (selectedBusinessId?: string | null) => {
  const { profile } = useAuth();
  const { businessId, isSuperAdmin } = useCurrentBusiness();

  const targetBusinessId = selectedBusinessId || businessId;

  console.log('🛒 useOrdersData - Query parameters:', {
    userRole: profile?.role,
    businessId,
    selectedBusinessId,
    targetBusinessId,
    isSuperAdmin
  });

  return useQuery({
    queryKey: ['orders-data', targetBusinessId, profile?.role],
    queryFn: async (): Promise<Order[]> => {
      console.log('📊 useOrdersData - Starting query...');
      
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
      // In real implementation, this would query the orders table
      console.log('🛒 Returning mock orders data for business:', targetBusinessId);
      
      const mockOrders: Order[] = [
        {
          id: '1',
          business_id: targetBusinessId,
          order_number: '1001',
          customer_name: 'אבי כהן',
          customer_phone: '052-1234567',
          customer_email: 'avi@example.com',
          total_amount: 150.00,
          currency: 'ILS',
          status: 'processing',
          order_type: 'delivery',
          delivery_address: 'רחוב הרצל 25, תל אביב',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          estimated_delivery: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          notes: 'הזמנה דחופה'
        },
        {
          id: '2',
          business_id: targetBusinessId,
          order_number: '1002',
          customer_name: 'שרה לוי',
          customer_phone: '053-7654321',
          total_amount: 89.50,
          currency: 'ILS',
          status: 'delivered',
          order_type: 'pickup',
          pickup_location: 'סניף רמת גן',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        }
      ];

      return mockOrders;
    },
    // CRITICAL FIX: Only enable query when we have a target business ID
    enabled: !!profile && !!targetBusinessId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
