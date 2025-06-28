
import React from 'react';
import { ImportButton } from './ImportButton';
import { ImportProcessDialog } from './ImportProcessDialog';
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

    // Reset any existing state
    importHook.resetForm();
    
    // Open the dialog by setting step to upload
    importHook.setStep('upload');
    
    console.log('✅ Import dialog should now be open with step: upload');
  };

  return (
    <ImportErrorBoundary>
      <div className="space-y-4" dir="rtl">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h3 className="text-green-800 font-medium mb-2">ייבוא עובדים מקובץ Excel</h3>
          <p className="text-green-700 text-sm mb-3">
            העלה קובץ Excel או CSV עם פרטי העובדים לייבוא מהיר למערכת
          </p>
          
          {isButtonDisabled && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-3">
              <p className="text-yellow-800 text-xs">
                ⚠️ יש לבחור עסק כדי להפעיל את הייבוא
              </p>
            </div>
          )}
          
          <ImportButton 
            onClick={handleImportClick}
            disabled={isButtonDisabled}
          />
        </div>
        
        <ImportProcessDialog importHook={importHook} />
      </div>
    </ImportErrorBoundary>
  );
};
