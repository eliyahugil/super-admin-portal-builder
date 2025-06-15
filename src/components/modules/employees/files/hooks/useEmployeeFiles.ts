
import { useEmployeeFilesData } from './useEmployeeFilesData';
import { useSignedDocumentsData } from './useSignedDocumentsData';
import { useFilesGrouping } from './useFilesGrouping';
import { useFilesState } from './useFilesState';
import { useFileActions } from './useFileActions';

export const useEmployeeFiles = () => {
  const {
    filters,
    setFilters,
    expandedEmployees,
    toggleEmployeeExpansion,
    clearFilters,
  } = useFilesState();

  const { data: employeeFiles, isLoading: filesLoading } = useEmployeeFilesData(
    filters.searchTerm,
    filters.dateFilter,
    filters.fileTypeFilter
  );

  const { data: signedDocuments, isLoading: docsLoading } = useSignedDocumentsData();

  const groupedFiles = useFilesGrouping(employeeFiles, signedDocuments, filters);

  const { handleDownload, handleDownloadSignedDocument } = useFileActions();

  const isLoading = filesLoading || docsLoading;

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
