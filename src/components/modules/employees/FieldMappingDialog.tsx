
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, ArrowRight, Eye } from 'lucide-react';
import { FieldMappingRow } from './FieldMappingRow';
import { FieldMappingPreview } from './FieldMappingPreview';
import { CustomFieldCreationSection } from './CustomFieldCreationSection';
import { UnmappedColumnsWarning } from './UnmappedColumnsWarning';
import { useFieldMappingAutoDetection } from './hooks/useFieldMappingAutoDetection';
import { useFieldMappingValidation } from './hooks/useFieldMappingValidation';
import { defaultSystemFields } from './constants/FieldMappingConstants';
import { FieldMapping, FieldMappingDialogProps } from './types/FieldMappingTypes';

export const FieldMappingDialog: React.FC<FieldMappingDialogProps> = ({
  open,
  onOpenChange,
  fileColumns,
  sampleData,
  onConfirm,
  systemFields = defaultSystemFields,
}) => {
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  
  const { autoDetectMappings } = useFieldMappingAutoDetection();
  const { validateMappings } = useFieldMappingValidation();

  // Auto-detect initial mappings when dialog opens
  useEffect(() => {
    if (open && fileColumns.length > 0) {
      const autoMappings = autoDetectMappings(fileColumns);
      setMappings(autoMappings);
    }
  }, [open, fileColumns, autoDetectMappings]);

  const addMapping = () => {
    const newMapping: FieldMapping = {
      id: `mapping-${Date.now()}`,
      systemField: '',
      mappedColumns: [],
      isCustomField: false,
    };
    setMappings([...mappings, newMapping]);
  };

  const addCustomField = (mapping: FieldMapping) => {
    setMappings([...mappings, mapping]);
  };

  const updateMapping = (id: string, updates: Partial<FieldMapping>) => {
    setMappings(mappings.map(mapping => 
      mapping.id === id ? { ...mapping, ...updates } : mapping
    ));
  };

  const removeMapping = (id: string) => {
    setMappings(mappings.filter(mapping => mapping.id !== id));
  };

  const handleConfirm = () => {
    if (!validateMappings(mappings)) return;

    const validMappings = mappings.filter(m => 
      m.systemField && m.mappedColumns.length > 0
    );

    onConfirm(validMappings);
    onOpenChange(false);
  };

  const getUnmappedColumns = () => {
    const mappedColumns = mappings.flatMap(m => m.mappedColumns);
    return fileColumns.filter(col => !mappedColumns.includes(col));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            מיפוי שדות
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Field Mappings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">שיוך שדות</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mappings.map((mapping) => (
                <FieldMappingRow
                  key={mapping.id}
                  mapping={mapping}
                  fileColumns={fileColumns}
                  systemFields={systemFields}
                  onUpdate={(updates) => updateMapping(mapping.id, updates)}
                  onRemove={() => removeMapping(mapping.id)}
                />
              ))}

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={addMapping}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  הוסף שיוך
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Custom Field Creation */}
          <CustomFieldCreationSection onAddCustomField={addCustomField} />

          {/* Unmapped Columns Warning */}
          <UnmappedColumnsWarning unmappedColumns={getUnmappedColumns()} />

          {/* Preview Section */}
          {showPreview && (
            <FieldMappingPreview
              mappings={mappings.filter(m => m.systemField && m.mappedColumns.length > 0)}
              sampleData={sampleData}
              systemFields={systemFields}
            />
          )}

          {/* Actions */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              {showPreview ? 'הסתר תצוגה מקדימה' : 'הצג תצוגה מקדימה'}
            </Button>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                ביטול
              </Button>
              <Button
                type="button"
                onClick={handleConfirm}
                disabled={mappings.filter(m => m.systemField && m.mappedColumns.length > 0).length === 0}
              >
                אשר מיפוי
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Re-export types for backward compatibility
export type { FieldMapping } from './types/FieldMappingTypes';
