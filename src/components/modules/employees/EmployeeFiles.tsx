
import React from 'react';
import { useEmployeeFilesManagement } from './files/hooks/useEmployeeFilesManagement';
import { EmployeeFilesUploadDialog } from './files/components/EmployeeFilesUploadDialog';
import { EmployeeFilesGrid } from './files/components/EmployeeFilesGrid';
import { EmployeeFilesControls } from './files/components/EmployeeFilesControls';

export const EmployeeFiles: React.FC = () => {
  const {
    // State
    searchTerm,
    setSearchTerm,
    selectedEmployee,
    setSelectedEmployee,
    uploadDialogOpen,
    setUploadDialogOpen,
    selectedFile,
    setSelectedFile,
    uploadingEmployeeId,
    setUploadingEmployeeId,
    fileInputRef,
    
    // Data
    employees,
    filteredFiles,
    isLoading,
    
    // Mutations
    uploadFileMutation,
    deleteFileMutation,
    
    // Handlers
    handleDownload,
  } = useEmployeeFilesManagement();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('📄 File selected:', file.name, 'Size:', file.size);
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (selectedFile && uploadingEmployeeId) {
      console.log('🚀 Starting upload for employee:', uploadingEmployeeId);
      uploadFileMutation.mutate({ file: selectedFile, employeeId: uploadingEmployeeId });
    }
  };

  const handleCloseDialog = () => {
    setUploadDialogOpen(false);
    setSelectedFile(null);
    setUploadingEmployeeId('');
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8" dir="rtl">טוען...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">קבצי עובדים</h1>
        <p className="text-gray-600">ניהול מסמכים וקבצים אישיים של העובדים</p>
      </div>

      <EmployeeFilesControls
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedEmployee={selectedEmployee}
        onEmployeeChange={setSelectedEmployee}
        employees={employees}
        onUploadClick={() => setUploadDialogOpen(true)}
      />

      <EmployeeFilesUploadDialog
        isOpen={uploadDialogOpen}
        onClose={handleCloseDialog}
        employees={employees}
        uploadingEmployeeId={uploadingEmployeeId}
        setUploadingEmployeeId={setUploadingEmployeeId}
        selectedFile={selectedFile}
        onFileSelect={handleFileSelect}
        onUpload={handleUpload}
        isUploading={uploadFileMutation.isPending}
        fileInputRef={fileInputRef}
      />

      <EmployeeFilesGrid
        files={filteredFiles}
        onDownload={handleDownload}
        onDelete={(file) => deleteFileMutation.mutate(file)}
        isDeleting={deleteFileMutation.isPending}
      />
    </div>
  );
};
