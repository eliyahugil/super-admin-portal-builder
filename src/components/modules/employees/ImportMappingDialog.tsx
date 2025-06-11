
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus, Eye } from 'lucide-react';
import { defaultSystemFields } from './constants/FieldMappingConstants';
import { useFieldMappingAutoDetection } from './hooks/useFieldMappingAutoDetection';
import { useFieldMappingValidation } from './hooks/useFieldMappingValidation';
import type { FieldMapping } from './types/FieldMappingTypes';

interface ImportMappingDialogProps {
  importHook: any;
}

export const ImportMappingDialog: React.FC<ImportMappingDialogProps> = ({ importHook }) => {
  const {
    showMappingDialog,
    setShowMappingDialog,
    headers,
    rawData,
    confirmMapping
  } = importHook;

  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [activeTab, setActiveTab] = useState('mapping');
  
  const { autoDetectMappings } = useFieldMappingAutoDetection();
  const { validateMappings } = useFieldMappingValidation();

  useEffect(() => {
    if (showMappingDialog && headers.length > 0) {
      const detectedMappings = autoDetectMappings(headers);
      setMappings(detectedMappings);
    }
  }, [showMappingDialog, headers, autoDetectMappings]);

  const handleAddMapping = () => {
    const newMapping: FieldMapping = {
      id: `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      systemField: '',
      mappedColumns: [],
      isCustomField: false
    };
    setMappings([...mappings, newMapping]);
  };

  const handleRemoveMapping = (id: string) => {
    setMappings(mappings.filter(m => m.id !== id));
  };

  const handleMappingChange = (id: string, updates: Partial<FieldMapping>) => {
    setMappings(mappings.map(m => 
      m.id === id ? { ...m, ...updates } : m
    ));
  };

  const handleColumnToggle = (mappingId: string, column: string) => {
    setMappings(mappings.map(m => {
      if (m.id === mappingId) {
        const isSelected = m.mappedColumns.includes(column);
        return {
          ...m,
          mappedColumns: isSelected 
            ? m.mappedColumns.filter(c => c !== column)
            : [...m.mappedColumns, column]
        };
      }
      return m;
    }));
  };

  const handleConfirm = async () => {
    if (validateMappings(mappings)) {
      await confirmMapping(mappings);
    }
  };

  const sampleData = rawData.slice(0, 3);

  return (
    <Dialog open={showMappingDialog} onOpenChange={setShowMappingDialog}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-right">מיפוי שדות</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mapping">מיפוי שדות</TabsTrigger>
            <TabsTrigger value="preview">תצוגה מקדימה</TabsTrigger>
          </TabsList>

          <TabsContent value="mapping" className="space-y-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">מיפוי עמודות לשדות מערכת</h3>
                <Button onClick={handleAddMapping} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  הוסף מיפוי
                </Button>
              </div>

              {mappings.map((mapping) => (
                <Card key={mapping.id}>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>שדה מערכת</Label>
                        <Select
                          value={mapping.systemField}
                          onValueChange={(value) => 
                            handleMappingChange(mapping.id, { systemField: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="בחר שדה מערכת" />
                          </SelectTrigger>
                          <SelectContent>
                            {defaultSystemFields.map((field) => (
                              <SelectItem key={field.value} value={field.value}>
                                {field.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>עמודות מקובץ</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {headers.map((header) => (
                            <Badge
                              key={header}
                              variant={mapping.mappedColumns.includes(header) ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() => handleColumnToggle(mapping.id, header)}
                            >
                              {header}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveMapping(mapping.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  תצוגה מקדימה של הנתונים
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        {headers.map((header) => (
                          <th key={header} className="border border-gray-200 px-4 py-2 text-right">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sampleData.map((row, index) => (
                        <tr key={index}>
                          {headers.map((header) => (
                            <td key={header} className="border border-gray-200 px-4 py-2 text-right">
                              {row[header] || ''}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowMappingDialog(false)}>
            ביטול
          </Button>
          <Button onClick={handleConfirm}>
            המשך לתצוגה מקדימה
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
