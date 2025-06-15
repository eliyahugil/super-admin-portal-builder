
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { EmployeeFile, SignedDocument, GroupedFiles, FiltersState } from '../types';
import { format } from 'date-fns';

export const useEmployeeFiles = () => {
  const [filters, setFilters] = useState<FiltersState>({
    searchTerm: '',
    dateFilter: '',
    fileTypeFilter: '',
  });
  const [expandedEmployees, setExpandedEmployees] = useState<Set<string>>(new Set());
  const { businessId } = useCurrentBusiness();

  const { data: employeeFiles, isLoading: filesLoading } = useQuery({
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

  const { data: signedDocuments, isLoading: docsLoading } = useQuery({
    queryKey: ['signed-documents', businessId],
    queryFn: async () => {
      if (!businessId) return [];

      const { data, error } = await supabase
        .from('employee_documents')
        .select(`
          *,
          employee:employees!employee_documents_employee_id_fkey(
            id,
            first_name,
            last_name,
            employee_id,
            business_id
          )
        `)
        .eq('status', 'signed')
        .not('signed_at', 'is', null)
        .eq('employee.business_id', businessId)
        .order('signed_at', { ascending: false });

      if (error) throw error;
      return data?.filter(doc => doc.employee) || [];
    },
    enabled: !!businessId,
  });

  const isLoading = filesLoading || docsLoading;

  const groupedFiles: GroupedFiles[] = useMemo(() => {
    if (!employeeFiles && !signedDocuments) return [];

    const employees = new Map<string, GroupedFiles>();

    // Add regular files
    employeeFiles?.forEach(file => {
      if (!file.employee) return;

      const employeeId = file.employee.id;
      if (!employees.has(employeeId)) {
        employees.set(employeeId, {
          employee: file.employee,
          files: [],
          signedDocuments: []
        });
      }
      employees.get(employeeId)!.files.push(file);
    });

    // Add signed documents
    signedDocuments?.forEach(doc => {
      if (!doc.employee) return;

      const employeeId = doc.employee.id;
      if (!employees.has(employeeId)) {
        employees.set(employeeId, {
          employee: doc.employee,
          files: [],
          signedDocuments: []
        });
      }
      employees.get(employeeId)!.signedDocuments.push({
        id: doc.id,
        employee_id: doc.employee_id,
        document_name: doc.document_name,
        document_type: doc.document_type,
        file_url: doc.file_url,
        signed_at: doc.signed_at,
        created_at: doc.created_at,
        digital_signature_data: doc.digital_signature_data,
        employee: doc.employee
      });
    });

    const grouped = Array.from(employees.values());

    // Apply filters
    return grouped.filter(group => {
      const employeeName = `${group.employee.first_name} ${group.employee.last_name}`.toLowerCase();
      const employeeId = group.employee.employee_id?.toLowerCase() || '';
      
      const matchesSearch = !filters.searchTerm || 
        employeeName.includes(filters.searchTerm.toLowerCase()) ||
        employeeId.includes(filters.searchTerm.toLowerCase()) ||
        group.files.some(file => file.file_name.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
        group.signedDocuments.some(doc => doc.document_name.toLowerCase().includes(filters.searchTerm.toLowerCase()));

      const matchesDate = !filters.dateFilter || 
        group.files.some(file => {
          const fileDate = format(new Date(file.uploaded_at), 'yyyy-MM-dd');
          return fileDate === filters.dateFilter;
        }) ||
        group.signedDocuments.some(doc => {
          const docDate = format(new Date(doc.signed_at), 'yyyy-MM-dd');
          return docDate === filters.dateFilter;
        });

      const matchesFileType = !filters.fileTypeFilter ||
        group.files.some(file => file.file_type.includes(filters.fileTypeFilter)) ||
        (filters.fileTypeFilter === 'signed_document' && group.signedDocuments.length > 0);

      return matchesSearch && matchesDate && matchesFileType;
    }).sort((a, b) => a.employee.first_name.localeCompare(b.employee.first_name));
  }, [employeeFiles, signedDocuments, filters]);

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

  const handleDownloadSignedDocument = async (doc: SignedDocument) => {
    try {
      // For signed documents, we open the file URL directly
      window.open(doc.file_url, '_blank');
    } catch (error) {
      console.error('Download signed document error:', error);
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
    handleDownloadSignedDocument,
    clearFilters,
  };
};
