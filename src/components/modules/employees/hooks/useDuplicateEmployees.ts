
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import type { Employee } from '@/types/employee';

interface DuplicateGroup {
  employees: Employee[];
  reason: string;
  similarity: number;
}

interface EmployeeMergeData {
  primaryEmployeeId: string;
  duplicateEmployeeIds: string[];
  mergedData: Partial<Employee>;
}

export const useDuplicateEmployees = () => {
  const { businessId } = useCurrentBusiness();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all employees for duplicate detection
  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees', businessId],
    queryFn: async (): Promise<Employee[]> => {
      if (!businessId) return [];

      const { data, error } = await supabase
        .from('employees')
        .select(`
          id,
          business_id,
          first_name,
          last_name,
          email,
          phone,
          address,
          employee_id,
          id_number,
          employee_type,
          hire_date,
          termination_date,
          is_active,
          is_archived,
          main_branch_id,
          notes,
          created_at,
          updated_at
        `)
        .eq('business_id', businessId)
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching employees for duplicate detection:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!businessId,
  });

  // Detect duplicate groups
  const duplicateGroups: DuplicateGroup[] = React.useMemo(() => {
    if (employees.length < 2) return [];

    const groups: DuplicateGroup[] = [];
    const processed = new Set<string>();

    employees.forEach((employee, index) => {
      if (processed.has(employee.id)) return;

      const duplicates: Employee[] = [employee];
      let reason = '';
      let similarity = 0;

      // Check for exact name matches
      employees.slice(index + 1).forEach(otherEmployee => {
        if (processed.has(otherEmployee.id)) return;

        const nameMatch = (
          employee.first_name.toLowerCase().trim() === otherEmployee.first_name.toLowerCase().trim() &&
          employee.last_name.toLowerCase().trim() === otherEmployee.last_name.toLowerCase().trim()
        );

        const emailMatch = employee.email && otherEmployee.email && 
          employee.email.toLowerCase() === otherEmployee.email.toLowerCase();

        const phoneMatch = employee.phone && otherEmployee.phone &&
          employee.phone.replace(/\D/g, '') === otherEmployee.phone.replace(/\D/g, '');

        const idMatch = employee.employee_id && otherEmployee.employee_id &&
          employee.employee_id === otherEmployee.employee_id;

        const idNumberMatch = employee.id_number && otherEmployee.id_number &&
          employee.id_number === otherEmployee.id_number;

        if (nameMatch || emailMatch || phoneMatch || idMatch || idNumberMatch) {
          duplicates.push(otherEmployee);
          processed.add(otherEmployee.id);

          // Determine the reason and similarity
          if (nameMatch && emailMatch) {
            reason = 'שם מלא ואימייל זהים';
            similarity = Math.max(similarity, 0.95);
          } else if (nameMatch && phoneMatch) {
            reason = 'שם מלא וטלפון זהים';
            similarity = Math.max(similarity, 0.9);
          } else if (emailMatch) {
            reason = 'אימייל זהה';
            similarity = Math.max(similarity, 0.85);
          } else if (phoneMatch) {
            reason = 'מספר טלפון זהה';
            similarity = Math.max(similarity, 0.8);
          } else if (nameMatch) {
            reason = 'שם מלא זהה';
            similarity = Math.max(similarity, 0.75);
          } else if (idMatch) {
            reason = 'מספר עובד זהה';
            similarity = Math.max(similarity, 0.9);
          } else if (idNumberMatch) {
            reason = 'תעודת זהות זהה';
            similarity = Math.max(similarity, 0.95);
          }
        }
      });

      if (duplicates.length > 1) {
        groups.push({
          employees: duplicates,
          reason,
          similarity
        });
        processed.add(employee.id);
      }
    });

    return groups.sort((a, b) => b.similarity - a.similarity);
  }, [employees]);

  // Merge employees mutation
  const mergeEmployeesMutation = useMutation({
    mutationFn: async (mergeDataArray: EmployeeMergeData[]) => {
      console.log('🔄 Starting employee merge process:', mergeDataArray);

      for (const mergeData of mergeDataArray) {
        const { primaryEmployeeId, duplicateEmployeeIds, mergedData } = mergeData;

        // Update the primary employee with merged data
        const { error: updateError } = await supabase
          .from('employees')
          .update(mergedData)
          .eq('id', primaryEmployeeId);

        if (updateError) {
          console.error('Error updating primary employee:', updateError);
          throw updateError;
        }

        // Archive (soft delete) duplicate employees
        const { error: archiveError } = await supabase
          .from('employees')
          .update({ is_archived: true })
          .in('id', duplicateEmployeeIds);

        if (archiveError) {
          console.error('Error archiving duplicate employees:', archiveError);
          throw archiveError;
        }

        console.log(`✅ Merged ${duplicateEmployeeIds.length} duplicates into primary employee ${primaryEmployeeId}`);
      }

      return mergeDataArray;
    },
    onSuccess: (mergeDataArray) => {
      const totalMerged = mergeDataArray.reduce((sum, data) => sum + data.duplicateEmployeeIds.length, 0);
      
      toast({
        title: 'הצלחה',
        description: `בוצע מיזוג של ${totalMerged} עובדים כפולים`,
      });

      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee-stats'] });
    },
    onError: (error) => {
      console.error('Error merging employees:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לבצע את מיזוג העובדים',
        variant: 'destructive',
      });
    },
  });

  return {
    duplicateGroups,
    isLoading,
    mergeEmployees: mergeEmployeesMutation.mutate,
    isSubmitting: mergeEmployeesMutation.isPending,
  };
};
