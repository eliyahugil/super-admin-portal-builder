
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { EmployeeFile, GroupedFiles, FiltersState } from '../types';
import { format } from 'date-fns';

export const useEmployeeFiles = () => {
  const [filters, setFilters] = useState<FiltersState>({
    searchTerm: '',
    dateFilter: '',
    fileTypeFilter: '',
  });
  const [expandedEmployees, setExpandedEmployees] = useState<Set<string>>(new Set());
  const { businessId } = useCurrentBusiness();

  const { data: employeeFiles, isLoading } = useQuery({
    queryKey: ['employee-files-management', businessId, filters.searchTerm, filters.dateFilter, filters.fileTypeFilter],
    queryFn: async () => {
      if (!businessId) return [];

      let query = supabase
        .from('employee_files')
        .select(`
          *,
          employee:employees(
            id,
            first_name,
            last_name,
            employee_id
          )
        `)
        .eq('business_id', businessId)
        .order('uploaded_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!businessId,
  });

  const groupedFiles: GroupedFiles[] = useMemo(() => {
    if (!employeeFiles) return [];

    const grouped = employeeFiles.reduce((acc, file) => {
      if (!file.employee) return acc;

      const employeeId = file.employee.id;
      const existing = acc.find(group => group.employee.id === employeeId);

      if (existing) {
        existing.files.push(file);
      } else {
        acc.push({
          employee: file.employee,
          files: [file]
        });
      }

      return acc;
    }, [] as GroupedFiles[]);

    // Apply filters
    return grouped.filter(group => {
      const employeeName = `${group.employee.first_name} ${group.employee.last_name}`.toLowerCase();
      const employeeId = group.employee.employee_id?.toLowerCase() || '';
      
      const matchesSearch = !filters.searchTerm || 
        employeeName.includes(filters.searchTerm.toLowerCase()) ||
        employeeId.includes(filters.searchTerm.toLowerCase()) ||
        group.files.some(file => file.file_name.toLowerCase().includes(filters.searchTerm.toLowerCase()));

      const matchesDate = !filters.dateFilter || 
        group.files.some(file => {
          const fileDate = format(new Date(file.uploaded_at), 'yyyy-MM-dd');
          return fileDate === filters.dateFilter;
        });

      const matchesFileType = !filters.fileTypeFilter ||
        group.files.some(file => file.file_type.includes(filters.fileTypeFilter));

      return matchesSearch && matchesDate && matchesFileType;
    }).sort((a, b) => a.employee.first_name.localeCompare(b.employee.first_name));
  }, [employeeFiles, filters]);

  const toggleEmployeeExpansion = (employeeId: string) => {
    const newExpanded = new Set(expandedEmployees);
    if (newExpanded.has(employeeId)) {
      newExpanded.delete(employeeId);
    } else {
      newExpanded.add(employeeId);
    }
    setExpandedEmployees(newExpanded);
  };

  const handleDownload = async (file: EmployeeFile) => {
    try {
      const { data, error } = await supabase.storage
        .from('employee-files')
        .download(file.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      dateFilter: '',
      fileTypeFilter: '',
    });
  };

  return {
    filters,
    setFilters,
    groupedFiles,
    isLoading,
    expandedEmployees,
    toggleEmployeeExpansion,
    handleDownload,
    clearFilters,
  };
};
