
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
      console.log('📦 useInventoryData - Starting query...');
      
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

      // Query real data from inventory_items table
      console.log('📦 Fetching inventory items for business:', targetBusinessId);
      
      const { data, error } = await supabase
        .from('inventory_items')
        .select('id, business_id, item_name, item_code, category, unit_of_measure, cost_price, selling_price, current_quantity, minimum_quantity, created_at, updated_at, created_by, is_active')
        .eq('business_id', targetBusinessId)
        .eq('is_active', true)
        .order('item_name');

      if (error) {
        console.error('❌ Error fetching inventory items:', error);
        throw error;
      }

      console.log('✅ Fetched inventory items:', data?.length || 0);
      
      // Transform data to match InventoryItem interface
      const inventoryItems: InventoryItem[] = (data || []).map(item => ({
        id: item.id,
        business_id: item.business_id,
        name: item.item_name,
        sku: item.item_code,
        category: item.category || 'לא מסווג',
        current_stock: Number(item.current_quantity) || 0,
        min_stock: Number(item.minimum_quantity) || 0,
        price: Number(item.selling_price) || 0,
        cost: Number(item.cost_price) || 0,
        location: '', // Not in schema, can be added if needed
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      return inventoryItems;
    },
    // CRITICAL FIX: Only enable query when we have a target business ID
    enabled: !!profile && !!targetBusinessId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
