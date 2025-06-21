
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Info } from 'lucide-react';
import { FieldMappingList } from './FieldMappingList';
import { DataPreviewTable } from './DataPreviewTable';
import { FieldMappingPreview } from '../FieldMappingPreview';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
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
  const { businessId } = useCurrentBusiness();
  
  // Convert mappings to simple format for DataPreviewTable
  const simpleMappings = mappings.map(mapping => ({
    systemField: mapping.systemField,
    mappedColumns: mapping.mappedColumns || []
  }));

  // Filter out mappings with no mapped columns for preview
  const activeMappings = mappings.filter(mapping => 
    mapping.mappedColumns && mapping.mappedColumns.length > 0
  );

  console.log('🗺️ FieldMappingDialogTabs - mappings data:', {
    totalMappings: mappings.length,
    activeMappings: activeMappings.length,
    sampleMappings: activeMappings.slice(0, 2).map(m => ({
      systemField: m.systemField,
      mappedColumns: m.mappedColumns,
      label: m.label
    })),
    sampleDataRows: sampleData.length,
    fileColumns: fileColumns.length
  });

  return (
    <div className="flex-1 overflow-hidden">
      <Tabs value={activeTab} onValueChange={onTabChange} className="h-full flex flex-col">
        <TabsList className="mx-6 mb-4">
          <TabsTrigger value="mapping" className="flex items-center gap-2">
            <span>מיפוי שדות</span>
            {mappings.length > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {activeMappings.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <span>תצוגה מקדימה</span>
            {activeMappings.length > 0 && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                {activeMappings.length}
              </span>
            )}
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
                {activeMappings.length > 0 ? (
                  <FieldMappingPreview
                    mappings={activeMappings}
                    sampleData={sampleData}
                    systemFields={[...systemFields]}
                    businessId={businessId}
                  />
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-500 mb-4">
                      <Info className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-medium mb-2">אין מיפויים פעילים</h3>
                      <p>כדי לראות תצוגה מקדימה של הנתונים, עליך למפות לפחות שדה אחד בלשונית "מיפוי שדות"</p>
                    </div>
                  </div>
                )}
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
