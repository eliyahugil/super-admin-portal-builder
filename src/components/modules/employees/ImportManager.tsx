
import React from 'react';
import { ImportButton } from './ImportButton';
import { ImportProcessDialog } from './ImportProcessDialog';
import { ImportMappingDialog } from './ImportMappingDialog';
import { ImportErrorBoundary } from './ImportErrorBoundary';
import { useEmployeeImport } from '@/hooks/useEmployeeImport';

interface ImportManagerProps {
  selectedBusinessId?: string | null;
  onRefetch?: () => void;
}

export const ImportManager: React.FC<ImportManagerProps> = ({ 
  selectedBusinessId,
  onRefetch 
}) => {
  console.log('📥 ImportManager rendering with selectedBusinessId:', selectedBusinessId);
  
  // Pass selectedBusinessId to the hook
  const importHook = useEmployeeImport(selectedBusinessId);
  
  console.log('📥 ImportManager hook state:', {
    step: importHook.step,
    hasFile: !!importHook.file,
    businessId: importHook.businessId,
    selectedBusinessId
  });

  const effectiveBusinessId = importHook.businessId;
  console.log('📥 ImportManager effectiveBusinessId:', effectiveBusinessId);

  const isButtonDisabled = !effectiveBusinessId;

  const handleImportClick = () => {
    console.log('🚀 Import button clicked with businessId:', effectiveBusinessId);
    
    if (!effectiveBusinessId) {
      console.warn('⚠️ No business ID available for import');
      return;
    }

    // Reset the form and start the import process
    importHook.resetForm();
    
    // Force the dialog to open by setting step to upload
    importHook.setStep('upload');
  };

  return (
    <ImportErrorBoundary>
      <div className="space-y-4">
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-green-800 text-sm mb-2">כפתור הייבוא:</p>
          {isButtonDisabled && (
            <p className="text-amber-600 text-xs mb-2">יש לבחור עסק כדי להפעיל את הייבוא</p>
          )}
          <ImportButton 
            onClick={handleImportClick}
            disabled={isButtonDisabled}
          />
        </div>
        
        <ImportProcessDialog importHook={importHook} />
        
        <ImportMappingDialog importHook={importHook} />
      </div>
    </ImportErrorBoundary>
  );
};
