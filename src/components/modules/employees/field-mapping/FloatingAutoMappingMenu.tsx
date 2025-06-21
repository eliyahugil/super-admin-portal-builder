
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, RefreshCw, CheckCircle, AlertCircle, Settings, Trash2, Eye, EyeOff } from 'lucide-react';
import type { FieldMapping } from '@/hooks/useEmployeeImport/types';

interface FloatingAutoMappingMenuProps {
  mappings: FieldMapping[];
  onReapplyAutoMapping: () => void;
  onClearAllMappings: () => void;
  onRemoveUnmappedFields: () => void;
  onToggleFieldMapping: (mappingId: string) => void;
  onFixMapping: (systemField: string, newColumn: string) => void;
  fileColumns: string[];
  isOpen: boolean;
  onToggle: () => void;
}

export const FloatingAutoMappingMenu: React.FC<FloatingAutoMappingMenuProps> = ({
  mappings,
  onReapplyAutoMapping,
  onClearAllMappings,
  onRemoveUnmappedFields,
  onToggleFieldMapping,
  onFixMapping,
  fileColumns,
  isOpen,
  onToggle,
}) => {
  const [selectedField, setSelectedField] = useState<string | null>(null);

  const autoMappedCount = mappings.filter(m => m.mappedColumns.length > 0).length;
  const totalRequiredFields = mappings.filter(m => m.isRequired).length;
  const mappedRequiredFields = mappings.filter(m => m.isRequired && m.mappedColumns.length > 0).length;
  const unmappedRequired = mappings.filter(m => m.isRequired && m.mappedColumns.length === 0);
  const unmappedOptional = mappings.filter(m => !m.isRequired && m.mappedColumns.length === 0);
  const customFields = mappings.filter(m => m.isCustomField);

  const handleQuickFix = (systemField: string, suggestedColumn: string) => {
    onFixMapping(systemField, suggestedColumn);
    setSelectedField(null);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={onToggle}
          className="rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
        >
          <Settings className="h-5 w-5 mr-2" />
          ניהול מיפוי ({autoMappedCount})
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[500px] overflow-hidden">
      <Card className="shadow-2xl border-2 border-blue-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5" />
              ניהול מיפוי שדות
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex gap-2 text-sm flex-wrap">
            <Badge variant={autoMappedCount > 0 ? "default" : "secondary"}>
              {autoMappedCount} ממופים
            </Badge>
            <Badge variant={mappedRequiredFields === totalRequiredFields ? "default" : "destructive"}>
              חובה: {mappedRequiredFields}/{totalRequiredFields}
            </Badge>
            {customFields.length > 0 && (
              <Badge variant="outline">
                {customFields.length} מותאמים
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4 max-h-80 overflow-y-auto">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={onReapplyAutoMapping}
              size="sm"
              variant="outline"
              className="text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              ריענון אוטומטי
            </Button>
            <Button
              onClick={onClearAllMappings}
              size="sm"
              variant="outline"
              className="text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              ניקוי הכל
            </Button>
            <Button
              onClick={onRemoveUnmappedFields}
              size="sm"
              variant="outline"
              className="text-xs text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              הסר לא ממופים
            </Button>
          </div>

          {/* Unmapped Required Fields */}
          {unmappedRequired.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-sm font-medium text-red-600">
                <AlertCircle className="h-4 w-4" />
                שדות חובה ללא מיפוי ({unmappedRequired.length}):
              </div>
              {unmappedRequired.map((mapping) => (
                <div key={mapping.id} className="bg-red-50 p-2 rounded border border-red-200">
                  <div className="text-sm font-medium text-red-800 mb-1">
                    {mapping.label}
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {fileColumns
                      .filter(col => col.toLowerCase().includes(mapping.systemField.toLowerCase()) || 
                                   mapping.systemField.toLowerCase().includes(col.toLowerCase()))
                      .slice(0, 3)
                      .map((col) => (
                      <Button
                        key={col}
                        size="sm"
                        variant="outline"
                        className="text-xs h-6 px-2 bg-white"
                        onClick={() => handleQuickFix(mapping.systemField, col)}
                      >
                        {col}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Custom Fields Management */}
          {customFields.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-sm font-medium text-blue-600">
                <CheckCircle className="h-4 w-4" />
                שדות מותאמים שנוספו ({customFields.length}):
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {customFields.map((mapping) => (
                  <div key={mapping.id} className="bg-blue-50 p-2 rounded border border-blue-200 flex items-center justify-between">
                    <div className="text-xs">
                      <span className="font-medium text-blue-800">{mapping.label}</span>
                      <span className="text-blue-600 mx-2">←</span>
                      <span className="text-blue-700">{mapping.mappedColumns[0]}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                      onClick={() => onToggleFieldMapping(mapping.id)}
                    >
                      <EyeOff className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Successfully Mapped Fields */}
          {autoMappedCount > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                <CheckCircle className="h-4 w-4" />
                שדות ממופים בהצלחה ({mappings.filter(m => m.mappedColumns.length > 0 && !m.isCustomField).length}):
              </div>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {mappings
                  .filter(m => m.mappedColumns.length > 0 && !m.isCustomField)
                  .slice(0, 4)
                  .map((mapping) => (
                  <div key={mapping.id} className="bg-green-50 p-2 rounded border border-green-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-medium text-green-800">{mapping.label}</span>
                      <span className="text-green-600 mx-2">←</span>
                      <span className="text-green-700">{mapping.mappedColumns[0]}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
                      onClick={() => onToggleFieldMapping(mapping.id)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {mappings.filter(m => m.mappedColumns.length > 0 && !m.isCustomField).length > 4 && (
                  <div className="text-xs text-gray-500 text-center">
                    ועוד {mappings.filter(m => m.mappedColumns.length > 0 && !m.isCustomField).length - 4} שדות...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status Summary */}
          <div className="pt-2 border-t text-xs text-gray-600 space-y-1">
            <div>סה"כ עמודות בקובץ: {fileColumns.length}</div>
            <div>שדות זמינים למיפוי: {mappings.length}</div>
            <div>שדות מותאמים: {customFields.length}</div>
            {mappedRequiredFields === totalRequiredFields ? (
              <div className="text-green-600 font-medium">✅ כל השדות החובה ממופים</div>
            ) : (
              <div className="text-red-600 font-medium">⚠️ יש שדות חובה ללא מיפוי</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
