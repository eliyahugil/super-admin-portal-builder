
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Plus, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import type { FieldMapping } from '@/hooks/useEmployeeImport/types';

interface FieldMappingListProps {
  mappings: FieldMapping[];
  fileColumns: string[];
  systemFields: Array<{ value: string; label: string }>;
  onUpdateMapping: (mappingId: string, updates: Partial<FieldMapping>) => void;
  onRemoveMapping: (mappingId: string) => void;
  onAddSystemField?: (newField: { value: string; label: string }) => Promise<boolean>;
}

export const FieldMappingList: React.FC<FieldMappingListProps> = ({
  mappings,
  fileColumns,
  systemFields,
  onUpdateMapping,
  onRemoveMapping,
  onAddSystemField,
}) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [showAddFieldDialog, setShowAddFieldDialog] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldLabel, setNewFieldLabel] = useState('');

  console.log('🗺️ FieldMappingList rendered with:', {
    mappingsCount: mappings.length,
    fileColumnsCount: fileColumns.length,
    systemFieldsCount: systemFields.length,
    isMobile,
    sampleMappings: mappings.slice(0, 2).map(m => ({
      id: m.id,
      systemField: m.systemField,
      mappedColumns: m.mappedColumns,
      label: m.label
    }))
  });

  const handleColumnSelection = (mappingId: string, columnName: string) => {
    console.log('📋 Column selection:', { mappingId, columnName });
    const currentMapping = mappings.find(m => m.id === mappingId);
    if (currentMapping) {
      const newMappedColumns = columnName === 'none' ? [] : [columnName];
      onUpdateMapping(mappingId, { mappedColumns: newMappedColumns });
    }
  };

  const handleAddCustomField = async () => {
    if (!newFieldName.trim() || !newFieldLabel.trim()) {
      toast({
        title: 'שגיאה',
        description: 'יש למלא את שם השדה והתווית',
        variant: 'destructive'
      });
      return;
    }

    const success = onAddSystemField ? await onAddSystemField({
      value: newFieldName.toLowerCase().replace(/\s+/g, '_'),
      label: newFieldLabel
    }) : false;

    if (success) {
      setNewFieldName('');
      setNewFieldLabel('');
      setShowAddFieldDialog(false);
      toast({
        title: 'שדה נוסף',
        description: `השדה "${newFieldLabel}" נוסף בהצלחה`,
      });
    } else {
      toast({
        title: 'שגיאה',
        description: 'שגיאה בהוספת השדה החדש',
        variant: 'destructive'
      });
    }
  };

  const getAvailableColumns = (currentMappingId: string) => {
    const usedColumns = mappings
      .filter(m => m.id !== currentMappingId)
      .flatMap(m => m.mappedColumns || []);
    
    return fileColumns.filter(col => !usedColumns.includes(col));
  };

  const getMappingStatus = (mapping: FieldMapping) => {
    if (!mapping.mappedColumns || mapping.mappedColumns.length === 0) {
      return mapping.isRequired ? 'missing-required' : 'unmapped';
    }
    return 'mapped';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'mapped':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'missing-required':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string, isRequired: boolean) => {
    switch (status) {
      case 'mapped':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">ממופה</Badge>;
      case 'missing-required':
        return <Badge variant="destructive">חובה - חסר</Badge>;
      default:
        return isRequired ? 
          <Badge variant="outline" className="border-red-300 text-red-600">חובה</Badge> : 
          <Badge variant="outline">אופציונלי</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Add New Field Button */}
      <div className="flex justify-between items-center">
        <h3 className={`font-semibold ${isMobile ? 'text-base' : 'text-lg'}`}>
          מיפוי שדות מערכת
        </h3>
        
        <Dialog open={showAddFieldDialog} onOpenChange={setShowAddFieldDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span className={isMobile ? 'text-xs' : 'text-sm'}>שדה חדש</span>
            </Button>
          </DialogTrigger>
          <DialogContent className={isMobile ? 'max-w-[95vw]' : 'max-w-md'}>
            <DialogHeader>
              <DialogTitle>הוספת שדה מותאם</DialogTitle>
              <DialogDescription>
                צור שדה חדש לאחסון מידע נוסף על העובדים
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="field-name">שם השדה (באנגלית)</Label>
                <Input
                  id="field-name"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  placeholder="department"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="field-label">תווית השדה (בעברית)</Label>
                <Input
                  id="field-label"
                  value={newFieldLabel}
                  onChange={(e) => setNewFieldLabel(e.target.value)}
                  placeholder="מחלקה"
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowAddFieldDialog(false)}>
                  ביטול
                </Button>
                <Button onClick={handleAddCustomField}>
                  הוסף שדה
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Mappings List - Scrollable */}
      <div className={`space-y-3 ${isMobile ? 'max-h-[60vh]' : 'max-h-[50vh]'} overflow-y-auto pr-2`}>
        {mappings.map((mapping) => {
          const status = getMappingStatus(mapping);
          const availableColumns = getAvailableColumns(mapping.id);
          
          return (
            <Card key={mapping.id} className={`${
              status === 'missing-required' ? 'border-red-300 bg-red-50' : 
              status === 'mapped' ? 'border-green-300 bg-green-50' : 
              'border-gray-200'
            } ${isMobile ? 'p-2' : ''}`}>
              <CardHeader className={`pb-3 ${isMobile ? 'p-3' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status)}
                    <CardTitle className={`${isMobile ? 'text-sm' : 'text-base'}`}>
                      {mapping.label}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(status, mapping.isRequired || false)}
                    {mapping.isCustomField && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveMapping(mapping.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className={`pt-0 ${isMobile ? 'p-3 pt-0' : ''}`}>
                <div className="space-y-2">
                  <Label className={`text-sm font-medium ${isMobile ? 'text-xs' : ''}`}>
                    בחר עמודה מהקובץ:
                  </Label>
                  
                  <Select
                    value={mapping.mappedColumns?.[0] || 'none'}
                    onValueChange={(value) => handleColumnSelection(mapping.id, value)}
                  >
                    <SelectTrigger className={isMobile ? 'text-sm' : ''}>
                      <SelectValue placeholder="בחר עמודה" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">ללא מיפוי</SelectItem>
                      {availableColumns.length > 0 ? (
                        availableColumns.map((column) => (
                          <SelectItem key={column} value={column}>
                            {column}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-available" disabled>
                          אין עמודות זמינות
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  
                  {mapping.mappedColumns && mapping.mappedColumns.length > 0 && (
                    <div className="text-xs text-gray-600">
                      ממופה לעמודה: <span className="font-medium">{mapping.mappedColumns[0]}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {mappings.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">אין שדות זמינים</h3>
            <p className="text-gray-600">נטען מידע על שדות המערכת...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
