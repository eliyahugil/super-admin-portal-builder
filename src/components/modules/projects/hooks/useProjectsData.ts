import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

export interface Project {
  id: string;
  business_id: string;
  project_name: string;
  description: string | null;
  status: 'active' | 'completed' | 'on_hold' | 'cancelled';
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  actual_cost: number;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  is_active: boolean;
}

export interface ProjectTask {
  id: string;
  project_id: string;
  task_name: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to: string | null;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export const useProjectsData = (selectedBusinessId?: string | null) => {
  const { profile } = useAuth();
  const { businessId, isSuperAdmin } = useCurrentBusiness();

  const targetBusinessId = selectedBusinessId || businessId;

  console.log('🎯 useProjectsData - Query parameters:', {
    userRole: profile?.role,
    businessId,
    selectedBusinessId,
    targetBusinessId,
    isSuperAdmin
  });

  return useQuery({
    queryKey: ['projects-data', targetBusinessId, profile?.role],
    queryFn: async (): Promise<Project[]> => {
      console.log('📊 useProjectsData - Starting query...');
      
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

      // Query real data from projects table
      console.log('🎯 Fetching projects for business:', targetBusinessId);
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('business_id', targetBusinessId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching projects:', error);
        throw error;
      }

      console.log('✅ Fetched projects:', data?.length || 0);
      return (data || []) as Project[];
    },
    // CRITICAL FIX: Only enable query when we have a target business ID
    enabled: !!profile && !!targetBusinessId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useProjectTasks = (projectId: string | null) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['project-tasks', projectId],
    queryFn: async (): Promise<ProjectTask[]> => {
      if (!projectId) {
        return [];
      }

      const { data, error } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching project tasks:', error);
        throw error;
      }

      return (data || []) as ProjectTask[];
    },
    enabled: !!profile && !!projectId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
