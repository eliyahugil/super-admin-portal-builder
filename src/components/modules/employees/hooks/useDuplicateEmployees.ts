
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

  console.log('🔍 useDuplicateEmployees - Business ID:', businessId);

  // Fetch all employees for duplicate detection
  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees-for-duplicates', businessId],
    queryFn: async (): Promise<Employee[]> => {
      if (!businessId) {
        console.log('❌ No business ID available for duplicate detection');
        return [];
      }

      console.log('🔍 Fetching employees for duplicate detection, business:', businessId);

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
        console.error('❌ Error fetching employees for duplicate detection:', error);
        throw error;
      }

      console.log('✅ Fetched employees for duplicate detection:', {
        count: data?.length || 0,
        businessId
      });

      return data || [];
    },
    enabled: !!businessId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Detect duplicate groups
  const duplicateGroups: DuplicateGroup[] = React.useMemo(() => {
    console.log('🔍 Analyzing duplicates for', employees.length, 'employees');
    
    if (employees.length < 2) {
      console.log('❌ Not enough employees to detect duplicates');
      return [];
    }

    const groups: DuplicateGroup[] = [];
    const processed = new Set<string>();

    employees.forEach((employee, index) => {
      if (processed.has(employee.id)) return;

      const duplicates: Employee[] = [employee];
      let reason = '';
      let similarity = 0;

      // Check for matches with remaining employees
      employees.slice(index + 1).forEach(otherEmployee => {
        if (processed.has(otherEmployee.id)) return;

        // Check for exact name matches
        const nameMatch = (
          employee.first_name?.toLowerCase().trim() === otherEmployee.first_name?.toLowerCase().trim() &&
          employee.last_name?.toLowerCase().trim() === otherEmployee.last_name?.toLowerCase().trim()
        );

        // Check for email matches
        const emailMatch = employee.email && otherEmployee.email && 
          employee.email.toLowerCase() === otherEmployee.email.toLowerCase();

        // Check for phone matches (normalize phone numbers)
        const phoneMatch = employee.phone && otherEmployee.phone &&
          employee.phone.replace(/\D/g, '') === otherEmployee.phone.replace(/\D/g, '');

        // Check for employee ID matches
        const idMatch = employee.employee_id && otherEmployee.employee_id &&
          employee.employee_id === otherEmployee.employee_id;

        // Check for ID number matches
        const idNumberMatch = employee.id_number && otherEmployee.id_number &&
          employee.id_number === otherEmployee.id_number;

        // Check for similar names (fuzzy matching)
        const similarNameMatch = !nameMatch && (
          employee.first_name?.toLowerCase().includes(otherEmployee.first_name?.toLowerCase() || '') ||
          otherEmployee.first_name?.toLowerCase().includes(employee.first_name?.toLowerCase() || '')
        ) && (
          employee.last_name?.toLowerCase().includes(otherEmployee.last_name?.toLowerCase() || '') ||
          otherEmployee.last_name?.toLowerCase().includes(employee.last_name?.toLowerCase() || '')
        );

        if (nameMatch || emailMatch || phoneMatch || idMatch || idNumberMatch || similarNameMatch) {
          duplicates.push(otherEmployee);
          processed.add(otherEmployee.id);

          // Determine the reason and similarity score
          if (nameMatch && emailMatch) {
            reason = 'שם מלא ואימייל זהים';
            similarity = Math.max(similarity, 0.95);
          } else if (nameMatch && phoneMatch) {
            reason = 'שם מלא וטלפון זהים';
            similarity = Math.max(similarity, 0.9);
          } else if (idNumberMatch) {
            reason = 'תעודת זהות זהה';
            similarity = Math.max(similarity, 0.95);
          } else if (idMatch) {
            reason = 'מספר עובד זהה';
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
          } else if (similarNameMatch) {
            reason = 'שמות דומים';
            similarity = Math.max(similarity, 0.6);
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

    console.log('✅ Found duplicate groups:', {
      groupsCount: groups.length,
      totalDuplicates: groups.reduce((sum, group) => sum + group.employees.length, 0)
    });

    return groups.sort((a, b) => b.similarity - a.similarity);
  }, [employees]);

  // Merge employees mutation
  const mergeEmployeesMutation = useMutation({
    mutationFn: async (mergeDataArray: EmployeeMergeData[]) => {
      console.log('🔄 Starting employee merge process:', mergeDataArray);

      for (const mergeData of mergeDataArray) {
        const { primaryEmployeeId, duplicateEmployeeIds, mergedData } = mergeData;

        console.log('🔄 Processing merge:', {
          primary: primaryEmployeeId,
          duplicates: duplicateEmployeeIds.length
        });

        // Update the primary employee with merged data
        const { error: updateError } = await supabase
          .from('employees')
          .update({
            first_name: mergedData.first_name,
            last_name: mergedData.last_name,
            email: mergedData.email,
            phone: mergedData.phone,
            address: mergedData.address,
            employee_id: mergedData.employee_id,
            id_number: mergedData.id_number,
            notes: mergedData.notes
          })
          .eq('id', primaryEmployeeId);

        if (updateError) {
          console.error('❌ Error updating primary employee:', updateError);
          throw updateError;
        }

        // Delete duplicate employees completely (they are merged into primary)
        const { error: deleteError } = await supabase
          .from('employees')
          .delete()
          .in('id', duplicateEmployeeIds);

        if (deleteError) {
          console.error('❌ Error deleting duplicate employees:', deleteError);
          throw deleteError;
        }

        console.log(`✅ Merged ${duplicateEmployeeIds.length} duplicates into primary employee ${primaryEmployeeId}`);
      }

      return mergeDataArray;
    },
    onSuccess: (mergeDataArray) => {
      const totalMerged = mergeDataArray.reduce((sum, data) => sum + data.duplicateEmployeeIds.length, 0);
      
      console.log('✅ Merge completed successfully:', { totalMerged });
      
      toast({
        title: 'הצלחה',
        description: `בוצע מיזוג של ${totalMerged} עובדים כפולים`,
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employees-for-duplicates'] });
      queryClient.invalidateQueries({ queryKey: ['employee-stats'] });
    },
    onError: (error) => {
      console.error('❌ Error merging employees:', error);
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
