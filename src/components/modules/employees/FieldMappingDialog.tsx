
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';

interface FieldMappingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileColumns: string[];
  sampleData: any[][];
  onConfirm: (mappings: Record<string, string>) => void;
  onBack?: () => void;
}

const EMPLOYEE_FIELDS = [
  { key: 'first_name', label: 'שם פרטי', required: true },
  { key: 'last_name', label: 'שם משפחה', required: true },
  { key: 'email', label: 'אימייל', required: false },
  { key: 'phone', label: 'טלפון', required: false },
  { key: 'id_number', label: 'תעודת זהות', required: false },
  { key: 'employee_id', label: 'מספר עובד', required: false },
  { key: 'hire_date', label: 'תאריך התחלה', required: false },
  { key: 'address', label: 'כתובת', required: false },
  { key: 'notes', label: 'הערות', required: false },
];

export const FieldMappingDialog: React.FC<FieldMappingDialogProps> = ({
  open,
  onOpenChange,
  fileColumns,
  sampleData,
  onConfirm,
  onBack,
}) => {
  const [mappings, setMappings] = useState<Record<string, string>>({});

  console.log('🗺️ FieldMappingDialog props:', {
    open,
    fileColumns,
    sampleDataLength: sampleData.length,
    mappings
  });

  const handleMappingChange = (employeeField: string, fileColumn: string) => {
    console.log('🔄 Mapping changed:', { employeeField, fileColumn });
    setMappings(prev => ({
      ...prev,
      [employeeField]: fileColumn === 'none' ? '' : fileColumn
    }));
  };

  const handleConfirm = () => {
    console.log('✅ Confirming mappings:', mappings);
    
    // Validate required fields
    const requiredFields = EMPLOYEE_FIELDS.filter(field => field.required);
    const missingFields = requiredFields.filter(field => !mappings[field.key]);
    
    if (missingFields.length > 0) {
      alert(`אנא מפה את השדות הנדרשים: ${missingFields.map(f => f.label).join(', ')}`);
      return;
    }
    
    onConfirm(mappings);
  };

  const getSampleValue = (columnIndex: number) => {
    if (sampleData.length > 0 && sampleData[0] && sampleData[0][columnIndex] !== undefined) {
      return sampleData[0][columnIndex];
    }
    return '';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            מיפוי שדות הקובץ לשדות המערכת
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-blue-800 text-sm">
              קשר בין העמודות בקובץ Excel לשדות במערכת. שדות המסומנים בכוכבית (*) הם חובה.
            </p>
          </div>

          <div className="grid gap-4">
            {EMPLOYEE_FIELDS.map((field) => (
              <Card key={field.key} className="border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4 items-center">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        בחר עמודה מהקובץ:
                      </label>
                      <Select
                        value={mappings[field.key] || 'none'}
                        onValueChange={(value) => handleMappingChange(field.key, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="בחר עמודה..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">--- לא ממופה ---</SelectItem>
                          {fileColumns.map((column, index) => (
                            <SelectItem key={index} value={column}>
                              {column}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {mappings[field.key] && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">
                          דוגמה מהקובץ:
                        </label>
                        <div className="bg-gray-50 p-2 rounded border">
                          <code className="text-sm">
                            {getSampleValue(fileColumns.indexOf(mappings[field.key]))}
                          </code>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-between pt-4">
            {onBack && (
              <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                חזור לעלית קובץ
              </Button>
            )}
            
            <Button 
              onClick={handleConfirm}
              className="flex items-center gap-2 mr-auto"
            >
              המשך לתצוגה מקדימה
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
