
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Info } from 'lucide-react';
import { FieldMappingList } from './FieldMappingList';
import { DataPreviewTable } from './DataPreviewTable';
import { FieldMappingPreview } from '../FieldMappingPreview';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { useIsMobile } from '@/hooks/use-mobile';
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
  const isMobile = useIsMobile();
  
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
    isMobile,
    sampleMappings: activeMappings.slice(0, 2).map(m => ({
      systemField: m.systemField,
      mappedColumns: m.mappedColumns,
      label: m.label
    })),
    sampleDataRows: sampleData.length,
    fileColumns: fileColumns.length,
    sampleDataStructure: sampleData[0] ? {
      type: Array.isArray(sampleData[0]) ? 'array' : 'object',
      length: Array.isArray(sampleData[0]) ? sampleData[0].length : Object.keys(sampleData[0]).length,
      sample: Array.isArray(sampleData[0]) ? sampleData[0].slice(0, 3) : Object.keys(sampleData[0]).slice(0, 3)
    } : 'no data'
  });

  return (
    <div className="flex-1 overflow-hidden">
      <Tabs value={activeTab} onValueChange={onTabChange} className="h-full flex flex-col">
        <TabsList className={`mx-2 sm:mx-6 mb-2 sm:mb-4 flex-shrink-0 ${isMobile ? 'grid grid-cols-3 h-auto' : 'flex'}`}>
          <TabsTrigger 
            value="mapping" 
            className={`flex items-center gap-1 sm:gap-2 ${isMobile ? 'text-xs p-2' : 'text-sm'}`}
          >
            <span className={isMobile ? 'truncate' : ''}>מיפוי שדות</span>
            {mappings.length > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs px-1 sm:px-2 py-1 rounded-full">
                {activeMappings.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="preview" 
            className={`flex items-center gap-1 sm:gap-2 ${isMobile ? 'text-xs p-2' : 'text-sm'}`}
          >
            <span className={isMobile ? 'truncate' : ''}>תצוגה מקדימה</span>
            {activeMappings.length > 0 && (
              <span className="bg-green-100 text-green-800 text-xs px-1 sm:px-2 py-1 rounded-full">
                {activeMappings.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="data" 
            className={`flex items-center gap-1 sm:gap-2 ${isMobile ? 'text-xs p-2' : 'text-sm'}`}
          >
            <span className={isMobile ? 'truncate' : ''}>נתוני הקובץ</span>
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="mapping" className={`h-full mt-0 px-2 sm:px-6 ${isMobile ? 'pb-4' : ''}`}>
            <div className="h-full flex flex-col">
              {/* Alerts - Fixed height section */}
              <div className={`flex-shrink-0 space-y-2 sm:space-y-4 mb-2 sm:mb-4 ${isMobile ? 'px-1' : ''}`}>
                {validationErrors.length > 0 && (
                  <Alert className="bg-red-50 border-red-200">
                    <AlertTriangle className={`h-4 w-4 text-red-600 ${isMobile ? 'flex-shrink-0' : ''}`} />
                    <AlertDescription className={`text-red-800 ${isMobile ? 'text-sm' : ''}`}>
                      <ul className="list-disc list-inside space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index} className={isMobile ? 'text-xs' : ''}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {unmappedColumns.length > 0 && (
                  <Alert className="bg-yellow-50 border-yellow-200">
                    <Info className={`h-4 w-4 text-yellow-600 ${isMobile ? 'flex-shrink-0' : ''}`} />
                    <AlertDescription className={`text-yellow-800 ${isMobile ? 'text-sm' : ''}`}>
                      <span className={isMobile ? 'text-xs' : ''}>
                        יש {unmappedColumns.length} עמודות שלא מופו: {unmappedColumns.join(', ')}
                      </span>
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className={`pb-4 sm:pb-6 ${isMobile ? 'space-y-3' : ''}`}>
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
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="h-full mt-0">
            {activeMappings.length > 0 ? (
              <div className={isMobile ? 'px-2' : ''}>
                <FieldMappingPreview
                  mappings={activeMappings}
                  sampleData={sampleData}
                  systemFields={[...systemFields]}
                  businessId={businessId}
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center px-4">
                <div className="text-center text-gray-500">
                  <Info className="h-8 sm:h-12 w-8 sm:w-12 mx-auto mb-2 sm:mb-4 text-gray-400" />
                  <h3 className={`font-medium mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>אין מיפויים פעילים</h3>
                  <p className={`${isMobile ? 'text-sm' : 'text-base'}`}>
                    כדי לראות תצוגה מקדימה של הנתונים, עליך למפות לפחות שדה אחד בלשונית "מיפוי שדות"
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="data" className={`h-full mt-0 px-2 sm:px-6 ${isMobile ? 'pb-4' : ''}`}>
            <ScrollArea className="h-full">
              <div className={`pb-4 sm:pb-6 ${isMobile ? 'overflow-x-auto' : ''}`}>
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
