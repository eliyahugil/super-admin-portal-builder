
import React from 'react';
import { ImportButton } from './ImportButton';
import { ImportProcessDialog } from './ImportProcessDialog';
import { ImportMappingDialog } from './ImportMappingDialog';
import { ImportErrorBoundary } from './ImportErrorBoundary';
import { useEmployeeImport } from '@/hooks/useEmployeeImport';

export const ImportManager: React.FC = () => {
  console.log('📥 ImportManager rendering');
  
  const importHook = useEmployeeImport();
  
  console.log('📥 ImportManager hook state:', {
    step: importHook.step,
    hasFile: !!importHook.file,
    businessId: importHook.businessId
  });

  return (
    <ImportErrorBoundary>
      <div className="space-y-4">
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-green-800 text-sm mb-2">כפתור הייבוא:</p>
          <ImportButton onClick={() => {
            console.log('🚀 Import button clicked, calling resetForm');
            importHook.resetForm();
          }} />
        </div>
        
        <ImportProcessDialog importHook={importHook} />
        
        <ImportMappingDialog importHook={importHook} />
      </div>
    </ImportErrorBoundary>
  );
};
