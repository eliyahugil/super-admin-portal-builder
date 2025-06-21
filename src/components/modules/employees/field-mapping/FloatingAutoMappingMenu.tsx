
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, RefreshCw, CheckCircle, AlertCircle, Settings } from 'lucide-react';
import type { FieldMapping } from '@/hooks/useEmployeeImport/types';

interface FloatingAutoMappingMenuProps {
  mappings: FieldMapping[];
  onReapplyAutoMapping: () => void;
  onClearAllMappings: () => void;
  onFixMapping: (systemField: string, newColumn: string) => void;
  fileColumns: string[];
  isOpen: boolean;
  onToggle: () => void;
}

export const FloatingAutoMappingMenu: React.FC<FloatingAutoMappingMenuProps> = ({
  mappings,
  onReapplyAutoMapping,
  onClearAllMappings,
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
          מיפוי אוטומטי ({autoMappedCount})
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 max-h-96 overflow-hidden">
      <Card className="shadow-2xl border-2 border-blue-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5" />
              מיפוי אוטומטי
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
          
          <div className="flex gap-2 text-sm">
            <Badge variant={autoMappedCount > 0 ? "default" : "secondary"}>
              {autoMappedCount} ממופים
            </Badge>
            <Badge variant={mappedRequiredFields === totalRequiredFields ? "default" : "destructive"}>
              חובה: {mappedRequiredFields}/{totalRequiredFields}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 max-h-64 overflow-y-auto">
          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button
              onClick={onReapplyAutoMapping}
              size="sm"
              variant="outline"
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              ריענון
            </Button>
            <Button
              onClick={onClearAllMappings}
              size="sm"
              variant="outline"
              className="flex-1"
            >
              <X className="h-4 w-4 mr-1" />
              ניקוי
            </Button>
          </div>

          {/* Unmapped Required Fields */}
          {unmappedRequired.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-sm font-medium text-red-600">
                <AlertCircle className="h-4 w-4" />
                שדות חובה ללא מיפוי:
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

          {/* Successfully Mapped Fields */}
          {autoMappedCount > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                <CheckCircle className="h-4 w-4" />
                שדות ממופים בהצלחה:
              </div>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {mappings
                  .filter(m => m.mappedColumns.length > 0)
                  .slice(0, 5)
                  .map((mapping) => (
                  <div key={mapping.id} className="bg-green-50 p-2 rounded border border-green-200 text-xs">
                    <span className="font-medium text-green-800">{mapping.label}</span>
                    <span className="text-green-600 mr-2">←</span>
                    <span className="text-green-700">{mapping.mappedColumns[0]}</span>
                  </div>
                ))}
                {mappings.filter(m => m.mappedColumns.length > 0).length > 5 && (
                  <div className="text-xs text-gray-500 text-center">
                    ועוד {mappings.filter(m => m.mappedColumns.length > 0).length - 5} שדות...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status Summary */}
          <div className="pt-2 border-t text-xs text-gray-600 space-y-1">
            <div>סה"כ עמודות בקובץ: {fileColumns.length}</div>
            <div>שדות זמינים למיפוי: {mappings.length}</div>
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
