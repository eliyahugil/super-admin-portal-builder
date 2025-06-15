
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
    queryKey: ['signed-documents-for-files', businessId],
    queryFn: async () => {
      if (!businessId) return [];

      // שלוף מסמכים חתומים מטבלת employee_document_signatures
      const { data, error } = await supabase
        .from('employee_document_signatures')
        .select(`
          id,
          employee_id,
          signed_at,
          created_at,
          digital_signature_data,
          employee:employees!employee_document_signatures_employee_id_fkey(
            id,
            first_name,
            last_name,
            employee_id,
            business_id
          ),
          document:employee_documents!employee_document_signatures_document_id_fkey(
            id,
            document_name,
            document_type,
            file_url
          )
        `)
        .eq('status', 'signed')
        .not('signed_at', 'is', null)
        .eq('employee.business_id', businessId)
        .order('signed_at', { ascending: false });

      if (error) {
        console.error('Error fetching signed documents:', error);
        return [];
      }

      // המר את הנתונים לפורמט הנכון
      return data?.filter(item => item.employee && item.document).map(item => ({
        id: item.id,
        employee_id: item.employee_id,
        document_name: item.document.document_name,
        document_type: item.document.document_type,
        file_url: item.document.file_url,
        signed_at: item.signed_at,
        created_at: item.created_at,
        digital_signature_data: item.digital_signature_data,
        employee: item.employee
      })) || [];
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
      employees.get(employeeId)!.signedDocuments.push(doc);
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
