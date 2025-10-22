import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { Product } from '@/types/production';

export function useProducts() {
  const { businessId } = useCurrentBusiness();

  return useQuery({
    queryKey: ['products', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('business_id', businessId!)
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return (data || []) as Product[];
    },
    enabled: !!businessId,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { businessId } = useCurrentBusiness();

  return useMutation({
    mutationFn: async (payload: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('products')
        .insert({ ...payload, business_id: businessId })
        .select()
        .single();
      
      if (error) throw error;
      return data as Product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', businessId] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const { businessId } = useCurrentBusiness();

  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<Product> & { id: string }) => {
      const { data, error } = await supabase
        .from('products')
        .update(patch)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', businessId] });
    },
  });
}
