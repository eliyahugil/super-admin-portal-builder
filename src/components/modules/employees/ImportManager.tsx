
import React from 'react';
import { ImportButton } from './ImportButton';
import { ImportProcessDialog } from './ImportProcessDialog';
import { ImportMappingDialog } from './ImportMappingDialog';
import { ImportErrorBoundary } from './ImportErrorBoundary';
import { useEmployeeImport } from '@/hooks/useEmployeeImport';

interface ImportManagerProps {
  selectedBusinessId?: string | null;
}

export const ImportManager: React.FC<ImportManagerProps> = ({ selectedBusinessId }) => {
  console.log('📥 ImportManager rendering with selectedBusinessId:', selectedBusinessId);
  
  const importHook = useEmployeeImport();
  
  console.log('📥 ImportManager hook state:', {
    step: importHook.step,
    hasFile: !!importHook.file,
    businessId: importHook.businessId,
    selectedBusinessId
  });

  // Use selectedBusinessId if provided, otherwise fall back to the hook's businessId
  const effectiveBusinessId = selectedBusinessId || importHook.businessId;
  console.log('📥 ImportManager effectiveBusinessId:', effectiveBusinessId);

  const isButtonDisabled = !effectiveBusinessId;

  return (
    <ImportErrorBoundary>
      <div className="space-y-4">
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-green-800 text-sm mb-2">כפתור הייבוא:</p>
          {isButtonDisabled && (
            <p className="text-amber-600 text-xs mb-2">יש לבחור עסק כדי להפעיל את הייבוא</p>
          )}
          <ImportButton 
            onClick={() => {
              console.log('🚀 Import button clicked, calling resetForm');
              importHook.resetForm();
            }}
            disabled={isButtonDisabled}
          />
        </div>
        
        <ImportProcessDialog importHook={{ ...importHook, businessId: effectiveBusinessId }} />
        
        <ImportMappingDialog importHook={{ ...importHook, businessId: effectiveBusinessId }} />
      </div>
    </ImportErrorBoundary>
  );
};
