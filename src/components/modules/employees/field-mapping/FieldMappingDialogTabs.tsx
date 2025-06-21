
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Info } from 'lucide-react';
import { FieldMappingList } from './FieldMappingList';
import { DataPreviewTable } from './DataPreviewTable';
import { FieldMappingPreview } from '../FieldMappingPreview';
import type { FieldMapping } from '@/hooks/useEmployeeImport/types';

interface FieldMappingDialogTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  mappings: FieldMapping[];
  fileColumns: string[];
  sampleData: any[];
  systemFields: Array<{ value: string; label: string }>;
  validationErrors: string[];
  unmappedColumns: string[];
  onUpdateMapping: (mappingId: string, updates: Partial<FieldMapping>) => void;
  onRemoveMapping: (mappingId: string) => void;
  onAddSystemField?: (newField: { value: string; label: string }) => Promise<boolean>;
}

export const FieldMappingDialogTabs: React.FC<FieldMappingDialogTabsProps> = ({
  activeTab,
  onTabChange,
  mappings,
  fileColumns,
  sampleData,
  systemFields,
  validationErrors,
  unmappedColumns,
  onUpdateMapping,
  onRemoveMapping,
  onAddSystemField,
}) => {
  // Convert mappings to simple format for DataPreviewTable
  const simpleMappings = mappings.map(mapping => ({
    systemField: mapping.systemField,
    mappedColumns: mapping.mappedColumns
  }));

  return (
    <div className="flex-1 overflow-hidden">
      <Tabs value={activeTab} onValueChange={onTabChange} className="h-full flex flex-col">
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
                  systemFields={[...systemFields]}
                  onUpdateMapping={onUpdateMapping}
                  onRemoveMapping={onRemoveMapping}
                  onAddSystemField={onAddSystemField}
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
                  systemFields={[...systemFields]}
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
  );
};
