
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

export interface InventoryItem {
  id: string;
  business_id: string;
  name: string;
  sku: string;
  category: string;
  current_stock: number;
  min_stock: number;
  max_stock?: number;
  price: number;
  cost?: number;
  description?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export const useInventoryData = (selectedBusinessId?: string | null) => {
  const { profile } = useAuth();
  const { businessId, isSuperAdmin } = useCurrentBusiness();

  const targetBusinessId = selectedBusinessId || businessId;

  console.log('📦 useInventoryData - Query parameters:', {
    userRole: profile?.role,
    businessId,
    selectedBusinessId,
    targetBusinessId,
    isSuperAdmin
  });

  return useQuery({
    queryKey: ['inventory-data', targetBusinessId, profile?.role],
    queryFn: async (): Promise<InventoryItem[]> => {
      console.log('📊 useInventoryData - Starting query...');
      
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

      // For demo purposes, return mock data only for specific demo user
      // In real implementation, this would query the inventory table
      console.log('📦 Returning mock inventory data for business:', targetBusinessId);
      
      const mockInventoryItems: InventoryItem[] = [
        {
          id: '1',
          business_id: targetBusinessId,
          name: 'מוצר מלאי 1',
          sku: 'INV001',
          category: 'אלקטרוניקה',
          current_stock: 25,
          min_stock: 10,
          max_stock: 100,
          price: 299.99,
          cost: 150.00,
          description: 'מוצר דמה למלאי',
          location: 'מחסן A',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          business_id: targetBusinessId,
          name: 'מוצר מלאי 2',
          sku: 'INV002',
          category: 'ביגוד',
          current_stock: 5,
          min_stock: 10,
          max_stock: 50,
          price: 89.99,
          cost: 45.00,
          description: 'מוצר דמה למלאי - מלאי נמוך',
          location: 'מחסן B',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      return mockInventoryItems;
    },
    // CRITICAL FIX: Only enable query when we have a target business ID
    enabled: !!profile && !!targetBusinessId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
