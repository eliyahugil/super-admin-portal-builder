
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { EmployeeChatGroup } from '@/types/employee-chat';

interface AutoGroupCriteria {
  type: 'branch' | 'role' | 'employee_type' | 'department';
  value: string;
  name: string;
}

export const useAutoGroups = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  console.log('🤖 useAutoGroups - Current profile:', profile?.id, profile?.role);

  // Fetch suggested auto groups based on employee data
  const {
    data: suggestedGroups = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['auto-groups-suggestions', profile?.business_id],
    queryFn: async (): Promise<AutoGroupCriteria[]> => {
      if (!profile?.business_id) {
        console.log('❌ No business ID available');
        return [];
      }
      
      console.log('🔄 Fetching auto group suggestions...');
      
      const { data: employees, error } = await supabase
        .from('employees')
        .select(`
          id,
          employee_type,
          main_branch:branches!main_branch_id(
            id,
            name
          ),
          branch_assignments:employee_branch_assignments(
            id,
            role_name,
            branch:branches!employee_branch_assignments_branch_id_fkey(
              id,
              name
            )
          )
        `)
        .eq('business_id', profile.business_id)
        .eq('is_active', true);

      if (error) {
        console.error('❌ Error fetching employees for auto groups:', error);
        throw error;
      }

      const suggestions: AutoGroupCriteria[] = [];
      const seen = new Set<string>();

      // Group by employee type
      employees?.forEach(emp => {
        const key = `employee_type_${emp.employee_type}`;
        if (!seen.has(key)) {
          seen.add(key);
          const typeLabels = {
            permanent: 'עובדים קבועים',
            temporary: 'עובדים זמניים',
            contractor: 'קבלנים',
            youth: 'עובדי נוער'
          };
          suggestions.push({
            type: 'employee_type',
            value: emp.employee_type,
            name: typeLabels[emp.employee_type as keyof typeof typeLabels] || emp.employee_type
          });
        }
      });

      // Group by main branch
      employees?.forEach(emp => {
        if (emp.main_branch) {
          const key = `branch_${emp.main_branch.id}`;
          if (!seen.has(key)) {
            seen.add(key);
            suggestions.push({
              type: 'branch',
              value: emp.main_branch.id,
              name: `סניף ${emp.main_branch.name}`
            });
          }
        }
      });

      // Group by role
      employees?.forEach(emp => {
        emp.branch_assignments?.forEach(assignment => {
          const key = `role_${assignment.role_name}`;
          if (!seen.has(key)) {
            seen.add(key);
            suggestions.push({
              type: 'role',
              value: assignment.role_name,
              name: `תפקיד: ${assignment.role_name}`
            });
          }
        });
      });

      console.log('✅ Auto group suggestions generated:', suggestions.length);
      return suggestions;
    },
    enabled: !!profile?.business_id,
  });

  // Create auto group mutation
  const createAutoGroupMutation = useMutation({
    mutationFn: async (criteria: AutoGroupCriteria) => {
      if (!profile?.id || !profile?.business_id) {
        throw new Error('User profile not available');
      }

      console.log('🤖 Creating auto group:', criteria);

      // First, get employees that match the criteria
      let employeeQuery = supabase
        .from('employees')
        .select(`
          id,
          first_name,
          last_name,
          employee_type,
          main_branch_id,
          branch_assignments:employee_branch_assignments(
            role_name,
            branch_id
          )
        `)
        .eq('business_id', profile.business_id)
        .eq('is_active', true);

      const { data: allEmployees, error: employeeError } = await employeeQuery;

      if (employeeError) {
        console.error('❌ Error fetching employees:', employeeError);
        throw employeeError;
      }

      // Filter employees based on criteria
      const matchingEmployees = allEmployees?.filter(emp => {
        switch (criteria.type) {
          case 'employee_type':
            return emp.employee_type === criteria.value;
          case 'branch':
            return emp.main_branch_id === criteria.value;
          case 'role':
            return emp.branch_assignments?.some(assignment => 
              assignment.role_name === criteria.value
            );
          default:
            return false;
        }
      }) || [];

      if (matchingEmployees.length === 0) {
        throw new Error('אין עובדים התואמים לקריטריון זה');
      }

      // Create the group
      const { data: group, error: groupError } = await supabase
        .from('employee_chat_groups')
        .insert({
          business_id: profile.business_id,
          name: criteria.name,
          description: `קבוצה אוטומטית לפי ${criteria.type}`,
          created_by: profile.id,
          group_type: 'department'
        })
        .select()
        .single();

      if (groupError) {
        console.error('❌ Error creating auto group:', groupError);
        throw groupError;
      }

      // Add members to the group
      const members = matchingEmployees.map(emp => ({
        group_id: group.id,
        employee_id: emp.id,
        added_by: profile.id,
        is_admin: false
      }));

      const { error: membersError } = await supabase
        .from('employee_chat_group_members')
        .insert(members);

      if (membersError) {
        console.error('❌ Error adding members to auto group:', membersError);
        throw membersError;
      }

      console.log('✅ Auto group created successfully:', group);
      return { group, memberCount: matchingEmployees.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['employee-chat-groups'] });
      toast({
        title: 'הצלחה',
        description: `קבוצה אוטומטית נוצרה עם ${data.memberCount} חברים`,
      });
    },
    onError: (error) => {
      console.error('❌ Error creating auto group:', error);
      toast({
        title: 'שגיאה',
        description: 'שגיאה ביצירת הקבוצה האוטומטית',
        variant: 'destructive',
      });
    },
  });

  return {
    suggestedGroups,
    isLoading,
    error,
    createAutoGroup: createAutoGroupMutation.mutate,
    isCreatingAutoGroup: createAutoGroupMutation.isPending,
  };
};
