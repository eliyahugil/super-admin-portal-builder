
import { useMemo } from 'react';
import { format } from 'date-fns';
import { EmployeeFile, SignedDocument, GroupedFiles, FiltersState } from '../types';

export const useFilesGrouping = (
  employeeFiles: EmployeeFile[] | undefined,
  signedDocuments: SignedDocument[] | undefined,
  filters: FiltersState
) => {
  return useMemo(() => {
    console.log('🔄 Grouping files and signed documents:', {
      filesCount: employeeFiles?.length || 0,
      signedDocsCount: signedDocuments?.length || 0
    });

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

    console.log('📊 Grouped results before filtering:', 
      grouped.map(g => ({
        employee: g.employee.first_name + ' ' + g.employee.last_name,
        filesCount: g.files.length,
        signedDocsCount: g.signedDocuments.length
      }))
    );

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
};
