
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, ArrowLeft, CheckCircle, Info } from 'lucide-react';
import { FieldMappingList } from './field-mapping/FieldMappingList';
import { DataPreviewTable } from './field-mapping/DataPreviewTable';
import { FieldMappingPreview } from './FieldMappingPreview';
import { useFieldMappingLogic } from './field-mapping/useFieldMappingLogic';
import { useFieldMappingAutoDetection } from './hooks/useFieldMappingAutoDetection';
import { FloatingAutoMappingMenu } from './field-mapping/FloatingAutoMappingMenu';
import type { FieldMapping } from '@/hooks/useEmployeeImport/types';

interface FieldMappingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileColumns: string[];
  sampleData: any[];
  onConfirm: (mappings: FieldMapping[]) => void;
  onBack?: () => void;
  systemFields?: Array<{ value: string; label: string }>;
}

export const FieldMappingDialog: React.FC<FieldMappingDialogProps> = ({
  open,
  onOpenChange,
  fileColumns,
  sampleData,
  onConfirm,
  onBack,
  systemFields,
}) => {
  console.log('🗺️ FieldMappingDialog rendered with:', {
    open,
    fileColumnsCount: fileColumns.length,
    sampleDataCount: sampleData.length,
    systemFieldsCount: systemFields?.length || 0
  });

  const {
    mappings,
    setMappings,
    unmappedColumns,
    mappedSystemFields,
    addMapping,
    updateMapping,
    removeMapping,
    canProceed,
    validationErrors
  } = useFieldMappingLogic(fileColumns, systemFields);

  const {
    autoDetectedMappings,
    applyAutoDetection,
    hasAutoDetections
  } = useFieldMappingAutoDetection(fileColumns, systemFields);

  const [activeTab, setActiveTab] = useState('mapping');

  useEffect(() => {
    console.log('🔄 FieldMappingDialog - mappings updated:', {
      mappingsCount: mappings.length,
      canProceed,
      validationErrors: validationErrors.length
    });
  }, [mappings, canProceed, validationErrors]);

  const handleConfirm = () => {
    console.log('✅ FieldMappingDialog - confirming mappings:', mappings);
    onConfirm(mappings);
  };

  const handleBack = () => {
    console.log('⬅️ FieldMappingDialog - going back');
    if (onBack) {
      onBack();
    } else {
      onOpenChange(false);
    }
  };

  // Convert mappings to simple format for DataPreviewTable
  const simpleMappings = mappings.map(mapping => ({
    systemField: mapping.systemField,
    mappedColumns: mapping.mappedColumns
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">מיפוי שדות לייבוא</DialogTitle>
            <div className="flex items-center gap-2">
              {hasAutoDetections && (
                <FloatingAutoMappingMenu
                  autoDetectedMappings={autoDetectedMappings}
                  onApplyAutoDetection={applyAutoDetection}
                />
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                חזור
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="mx-6 mb-4">
              <TabsTrigger value="mapping" className="flex items-center gap-2">
                <span>מיפוי שדות</span>
                {mappings.length > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {mappings.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <span>תצוגה מקדימה</span>
              </TabsTrigger>
              <TabsTrigger value="data" className="flex items-center gap-2">
                <span>נתוני הקובץ</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden px-6">
              <TabsContent value="mapping" className="h-full mt-0">
                <ScrollArea className="h-full">
                  <div className="space-y-4 pb-6">
                    {validationErrors.length > 0 && (
                      <Alert className="bg-red-50 border-red-200">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          <ul className="list-disc list-inside space-y-1">
                            {validationErrors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}

                    {unmappedColumns.length > 0 && (
                      <Alert className="bg-yellow-50 border-yellow-200">
                        <Info className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-yellow-800">
                          יש {unmappedColumns.length} עמודות שלא מופו: {unmappedColumns.join(', ')}
                        </AlertDescription>
                      </Alert>
                    )}

                    <FieldMappingList
                      mappings={mappings}
                      fileColumns={fileColumns}
                      systemFields={systemFields}
                      onAddMapping={addMapping}
                      onUpdateMapping={updateMapping}
                      onRemoveMapping={removeMapping}
                    />
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="preview" className="h-full mt-0">
                <ScrollArea className="h-full">
                  <div className="pb-6">
                    <FieldMappingPreview
                      mappings={mappings}
                      sampleData={sampleData}
                      systemFields={systemFields || []}
                    />
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="data" className="h-full mt-0">
                <ScrollArea className="h-full">
                  <div className="pb-6">
                    <DataPreviewTable
                      fileColumns={fileColumns}
                      sampleData={sampleData}
                      mappings={simpleMappings}
                    />
                  </div>
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="border-t p-6 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {mappings.length} שדות ממופים מתוך {fileColumns.length} עמודות
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleBack}
            >
              ביטול
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!canProceed}
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              המשך לתצוגה מקדימה
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
