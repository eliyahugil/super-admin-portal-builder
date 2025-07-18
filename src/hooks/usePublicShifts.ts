import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PublicShiftToken, PublicShiftSubmission, PublicShiftForm } from '@/types/publicShift';

export const usePublicShifts = () => {
  const queryClient = useQueryClient();

  // Get token details by token string
  const useToken = (token: string) => {
    return useQuery({
      queryKey: ['public-token', token],
      queryFn: async () => {
        // For now, return mock data until migration is approved
        // Will be replaced with actual Supabase call after migration
        const mockToken: PublicShiftToken = {
          id: '1',
          token,
          business_id: 'ceaee44e-663e-4c31-b873-a3a745921d12',
          week_start_date: '2025-01-20',
          week_end_date: '2025-01-26', 
          expires_at: '2025-01-30T23:59:59',
          is_active: true,
          created_at: new Date().toISOString(),
        };
        
        return mockToken;
      },
      enabled: !!token,
    });
  };

  // Get submissions for a token
  const useTokenSubmissions = (tokenId: string) => {
    return useQuery({
      queryKey: ['token-submissions', tokenId],
      queryFn: async () => {
        // For now, return empty array until migration is approved
        return [] as PublicShiftSubmission[];
      },
      enabled: !!tokenId,
    });
  };

  // Submit shifts via public token
  const submitShifts = useMutation({
    mutationFn: async ({ tokenId, formData }: { tokenId: string; formData: PublicShiftForm }) => {
      // For now, simulate success until migration is approved
      console.log('Simulating shift submission:', { tokenId, formData });
      
      const mockSubmission: PublicShiftSubmission = {
        id: crypto.randomUUID(),
        token_id: tokenId,
        employee_name: formData.employee_name,
        phone: formData.phone,
        shift_preferences: formData.preferences,
        notes: formData.notes,
        submitted_at: new Date().toISOString(),
      };
      
      return mockSubmission;
    },
    onSuccess: (_, { tokenId }) => {
      queryClient.invalidateQueries({ queryKey: ['token-submissions', tokenId] });
    },
  });

  // Generate new token (admin only)
  const generateToken = useMutation({
    mutationFn: async (params: {
      business_id: string;
      employee_id?: string;
      week_start_date: string;
      week_end_date: string;
      expires_at: string;
      max_submissions?: number;
    }) => {
      const token = crypto.randomUUID();
      
      // For now, simulate token generation until migration is approved
      const mockToken: PublicShiftToken = {
        id: crypto.randomUUID(),
        token,
        ...params,
        is_active: true,
        created_at: new Date().toISOString(),
      };
      
      return mockToken;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-tokens'] });
    },
  });

  return {
    useToken,
    useTokenSubmissions,
    submitShifts,
    generateToken,
  };
};