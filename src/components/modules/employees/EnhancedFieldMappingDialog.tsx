
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { EnhancedFieldMappingRow } from './field-mapping/EnhancedFieldMappingRow';
import { CustomFieldManager } from './field-mapping/CustomFieldManager';
import { FieldMappingPreview } from './FieldMappingPreview';
import { useFieldMappingLogic } from './field-mapping/useFieldMappingLogic';
import type { FieldMapping } from '@/hooks/useEmployeeImport/types';

interface EnhancedFieldMappingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileColumns: string[];
  sampleData: any[][];
  onConfirm: (mappings: FieldMapping[]) => void;
  onBack?: () => void;
  businessId?: string;
}

const SYSTEM_FIELDS = [
  { value: 'first_name', label: 'שם פרטי' },
  { value: 'last_name', label: 'שם משפחה' },
  { value: 'email', label: 'אימייל' },
  { value: 'phone', label: 'טלפון' },
  { value: 'id_number', label: 'תעודת זהות' },
  { value: 'employee_id', label: 'מספר עובד' },
  { value: 'hire_date', label: 'תאריך התחלה' },
  { value: 'address', label: 'כתובת' },
  { value: 'employee_type', label: 'סוג עובד' },
  { value: 'weekly_hours_required', label: 'שעות שבועיות נדרשות' },
  { value: 'notes', label: 'הערות' },
];

export const EnhancedFieldMappingDialog: React.FC<EnhancedFieldMappingDialogProps> = ({
  open,
  onOpenChange,
  fileColumns,
  sampleData,
  onConfirm,
  onBack,
  businessId,
}) => {
  const [systemFields, setSystemFields] = useState(SYSTEM_FIELDS);
  const [activeTab, setActiveTab] = useState<'mapping' | 'preview'>('mapping');

  const {
    mappings,
    setMappings,
    unmappedColumns,
    addMapping,
    updateMapping,
    removeMapping,
    canProceed,
    validationErrors,
    reapplyAutoMapping,
    clearAllMappings,
    removeUnmappedFields,
  } = useFieldMappingLogic(fileColumns, systemFields);

  console.log('🗺️ EnhancedFieldMappingDialog props:', {
    open,
    fileColumns,
    sampleDataLength: sampleData.length,
    mappingsCount: mappings.length,
    businessId
  });

  const handleAddCustomField = async (customMapping: FieldMapping): Promise<boolean> => {
    try {
      // Add the custom field to system fields list
      const newSystemField = {
        value: customMapping.systemField,
        label: customMapping.label
      };
      
      setSystemFields(prev => [...prev, newSystemField]);
      addMapping(customMapping);
      
      console.log('✅ Custom field added successfully:', customMapping);
      return true;
    } catch (error) {
      console.error('❌ Error adding custom field:', error);
      return false;
    }
  };

  const handleUpdateCustomField = (mappingId: string, newName: string, newLabel: string) => {
    const newSystemField = `custom_${newName.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()}`;
    
    // Update system fields
    setSystemFields(prev => prev.map(field => {
      const mapping = mappings.find(m => m.id === mappingId);
      if (mapping && field.value === mapping.systemField) {
        return { value: newSystemField, label: newLabel };
      }
      return field;
    }));

    // Update mapping
    updateMapping(mappingId, {
      systemField: newSystemField,
      label: newLabel,
      customFieldName: newName
    });
  };

  const handleRemoveCustomField = (mappingId: string) => {
    const mapping = mappings.find(m => m.id === mappingId);
    if (mapping && mapping.isCustomField) {
      // Remove from system fields
      setSystemFields(prev => prev.filter(field => field.value !== mapping.systemField));
      // Remove mapping
      removeMapping(mappingId);
    }
  };

  const handleAddSystemField = async (newField: { value: string; label: string }): Promise<boolean> => {
    try {
      setSystemFields(prev => [...prev, newField]);
      return true;
    } catch (error) {
      console.error('Error adding system field:', error);
      return false;
    }
  };

  const handleConfirm = () => {
    console.log('✅ Confirming enhanced mappings:', {
      totalMappings: mappings.length,
      activeMappings: mappings.filter(m => m.mappedColumns.length > 0).length,
      customFields: mappings.filter(m => m.isCustomField).length,
      multiColumnMappings: mappings.filter(m => m.mappedColumns.length > 1).length
    });
    
    if (!canProceed) {
      alert(`שגיאות במיפוי:\n${validationErrors.join('\n')}`);
      return;
    }

    const activeMappings = mappings.filter(m => m.mappedColumns.length > 0);
    onConfirm(activeMappings);
  };

  const handleAddNewMapping = () => {
    const newMapping: FieldMapping = {
      id: `mapping-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      systemField: '',
      mappedColumns: [],
      isRequired: false,
      label: '',
      isCustomField: false,
    };
    addMapping(newMapping);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            מיפוי מתקדם של שדות - {fileColumns.length} עמודות
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b mb-4">
            <Button
              variant={activeTab === 'mapping' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('mapping')}
              className="rounded-b-none"
            >
              מיפוי שדות
            </Button>
            <Button
              variant={activeTab === 'preview' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('preview')}
              className="rounded-b-none"
              disabled={mappings.filter(m => m.mappedColumns.length > 0).length === 0}
            >
              תצוגה מקדימה
            </Button>
          </div>

          <div className="h-[calc(95vh-12rem)] overflow-y-auto">
            {activeTab === 'mapping' ? (
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={reapplyAutoMapping}
                    className="flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    מיפוי אוטומטי
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllMappings}
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    נקה הכל
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={removeUnmappedFields}
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    הסר שדות לא ממופים
                  </Button>
                  <div className="mr-auto text-sm text-gray-600">
                    {mappings.filter(m => m.mappedColumns.length > 0).length} מתוך {mappings.length} שדות ממופים
                  </div>
                </div>

                {/* Field Mappings */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>מיפויי שדות פעילים</CardTitle>
                    <Button
                      onClick={handleAddNewMapping}
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      הוסף מיפוי
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mappings.map((mapping) => (
                      <EnhancedFieldMappingRow
                        key={mapping.id}
                        mapping={mapping}
                        fileColumns={fileColumns}
                        systemFields={systemFields}
                        onUpdate={updateMapping}
                        onRemove={removeMapping}
                        onAddSystemField={handleAddSystemField}
                      />
                    ))}

                    {mappings.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p>לא הוגדרו מיפויי שדות</p>
                        <p className="text-sm mt-1">לחץ על "הוסף מיפוי" כדי להתחיל</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Custom Fields Manager */}
                <CustomFieldManager
                  mappings={mappings}
                  fileColumns={fileColumns}
                  onAddCustomField={handleAddCustomField}
                  onUpdateCustomField={handleUpdateCustomField}
                  onRemoveCustomField={handleRemoveCustomField}
                />

                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-medium text-red-800 mb-2">שגיאות במיפוי:</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <FieldMappingPreview
                mappings={mappings.filter(m => m.mappedColumns.length > 0)}
                sampleData={sampleData.slice(0, 5).map((row, index) => ({ 
                  ...row.reduce((obj, val, colIndex) => ({ 
                    ...obj, 
                    [fileColumns[colIndex] || `col_${colIndex}`]: val 
                  }), {}),
                  originalRowIndex: index
                }))}
                systemFields={systemFields}
                businessId={businessId}
              />
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between pt-4 border-t">
          {onBack && (
            <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              חזור לעלית קובץ
            </Button>
          )}
          
          <div className="flex gap-2 mr-auto">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              ביטול
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={!canProceed}
              className="flex items-center gap-2"
            >
              המשך לתצוגה מקדימה ({mappings.filter(m => m.mappedColumns.length > 0).length} שדות)
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
