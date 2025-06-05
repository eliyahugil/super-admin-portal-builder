
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/hooks/useBusiness';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, Check, X, Plus, Eye } from 'lucide-react';

interface ExcelRow {
  [key: string]: any;
}

interface FieldMapping {
  excelHeader: string;
  systemField: string;
  isCustomField?: boolean;
  customFieldType?: 'text' | 'number' | 'date' | 'select';
  selectOptions?: string[];
}

interface PreviewEmployee {
  rowIndex: number;
  data: Record<string, any>;
  isValid: boolean;
  errors: string[];
  isDuplicate?: boolean;
}

export const EmployeeExcelImporter: React.FC = () => {
  const { businessId } = useBusiness();
  const { toast } = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [rawData, setRawData] = useState<ExcelRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [previewData, setPreviewData] = useState<PreviewEmployee[]>([]);
  const [customFields, setCustomFields] = useState<Record<string, any>>({});
  const [branches, setBranches] = useState<any[]>([]);
  const [existingEmployees, setExistingEmployees] = useState<any[]>([]);
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'import'>('upload');
  const [isImporting, setIsImporting] = useState(false);

  // System field options
  const systemFields = [
    { value: 'first_name', label: 'שם פרטי' },
    { value: 'last_name', label: 'שם משפחה' },
    { value: 'full_name', label: 'שם מלא' },
    { value: 'email', label: 'אימייל' },
    { value: 'phone', label: 'טלפון' },
    { value: 'id_number', label: 'מספר זהות' },
    { value: 'employee_id', label: 'מספר עובד' },
    { value: 'address', label: 'כתובת' },
    { value: 'hire_date', label: 'תאריך תחילת עבודה' },
    { value: 'employee_type', label: 'סוג עובד' },
    { value: 'weekly_hours_required', label: 'שעות שבועיות נדרשות' },
    { value: 'notes', label: 'הערות' },
    { value: 'branch_name', label: 'סניף' },
    { value: 'role', label: 'תפקיד' }
  ];

  const employeeTypes = [
    { value: 'permanent', label: 'קבוע' },
    { value: 'temporary', label: 'זמני' },
    { value: 'youth', label: 'נוער' },
    { value: 'contractor', label: 'קבלן' }
  ];

  useEffect(() => {
    if (businessId && isOpen) {
      fetchBranches();
      fetchExistingEmployees();
    }
  }, [businessId, isOpen]);

  const fetchBranches = async () => {
    if (!businessId) return;
    
    const { data, error } = await supabase
      .from('branches')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true);
    
    if (!error && data) {
      setBranches(data);
    }
  };

  const fetchExistingEmployees = async () => {
    if (!businessId) return;
    
    const { data, error } = await supabase
      .from('employees')
      .select('email, phone, id_number, employee_id')
      .eq('business_id', businessId);
    
    if (!error && data) {
      setExistingEmployees(data);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length < 2) {
          toast({
            title: 'שגיאה',
            description: 'הקובץ חייב להכיל לפחות שורת כותרות ושורת נתונים אחת',
            variant: 'destructive'
          });
          return;
        }

        const headerRow = jsonData[0] as string[];
        const dataRows = jsonData.slice(1).filter(row => 
          Array.isArray(row) && row.some(cell => cell !== null && cell !== undefined && cell !== '')
        );

        setHeaders(headerRow);
        setRawData(dataRows.map((row: any) => {
          const obj: ExcelRow = {};
          headerRow.forEach((header, index) => {
            obj[header] = row[index] || '';
          });
          return obj;
        }));

        // Auto-detect field mappings
        const autoMappings = autoDetectFieldMappings(headerRow);
        setFieldMappings(autoMappings);
        setStep('mapping');

      } catch (error) {
        toast({
          title: 'שגיאה בקריאת הקובץ',
          description: 'אנא ודא שהקובץ הוא Excel תקין',
          variant: 'destructive'
        });
      }
    };

    reader.readAsArrayBuffer(uploadedFile);
  };

  const autoDetectFieldMappings = (headers: string[]): FieldMapping[] => {
    const mappings: FieldMapping[] = [];
    
    headers.forEach(header => {
      const lowerHeader = header.toLowerCase().trim();
      let systemField = '';
      
      // Auto-detect common field names
      if (lowerHeader.includes('שם') && (lowerHeader.includes('מלא') || lowerHeader.includes('שלם'))) {
        systemField = 'full_name';
      } else if (lowerHeader.includes('שם') && lowerHeader.includes('פרטי')) {
        systemField = 'first_name';
      } else if (lowerHeader.includes('שם') && lowerHeader.includes('משפחה')) {
        systemField = 'last_name';
      } else if (lowerHeader.includes('טלפון') || lowerHeader.includes('נייד')) {
        systemField = 'phone';
      } else if (lowerHeader.includes('מייל') || lowerHeader.includes('email')) {
        systemField = 'email';
      } else if (lowerHeader.includes('זהות')) {
        systemField = 'id_number';
      } else if (lowerHeader.includes('עובד') && lowerHeader.includes('מספר')) {
        systemField = 'employee_id';
      } else if (lowerHeader.includes('כתובת')) {
        systemField = 'address';
      } else if (lowerHeader.includes('תאריך') && lowerHeader.includes('תחילת')) {
        systemField = 'hire_date';
      } else if (lowerHeader.includes('סניף')) {
        systemField = 'branch_name';
      } else if (lowerHeader.includes('תפקיד')) {
        systemField = 'role';
      } else if (lowerHeader.includes('הערות')) {
        systemField = 'notes';
      }

      mappings.push({
        excelHeader: header,
        systemField: systemField,
        isCustomField: false
      });
    });

    return mappings;
  };

  const updateFieldMapping = (index: number, systemField: string) => {
    const newMappings = [...fieldMappings];
    newMappings[index] = {
      ...newMappings[index],
      systemField,
      isCustomField: systemField === 'custom'
    };
    setFieldMappings(newMappings);
  };

  const addCustomFieldOption = (mappingIndex: number, option: string) => {
    const newMappings = [...fieldMappings];
    const mapping = newMappings[mappingIndex];
    if (mapping.isCustomField) {
      mapping.selectOptions = mapping.selectOptions || [];
      if (!mapping.selectOptions.includes(option)) {
        mapping.selectOptions.push(option);
      }
    }
    setFieldMappings(newMappings);
  };

  const generatePreview = () => {
    const preview: PreviewEmployee[] = rawData.map((row, index) => {
      const employeeData: Record<string, any> = {
        business_id: businessId
      };
      const errors: string[] = [];

      fieldMappings.forEach(mapping => {
        if (mapping.systemField && mapping.systemField !== 'custom') {
          let value = row[mapping.excelHeader];
          
          // Handle special field types
          if (mapping.systemField === 'hire_date' && value) {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
              errors.push(`תאריך לא תקין: ${mapping.excelHeader}`);
            } else {
              value = date.toISOString().split('T')[0];
            }
          }
          
          if (mapping.systemField === 'employee_type' && value) {
            const validType = employeeTypes.find(type => 
              type.label === value || type.value === value
            );
            if (validType) {
              value = validType.value;
            } else {
              value = 'permanent'; // default
            }
          }

          if (mapping.systemField === 'branch_name' && value) {
            const branch = branches.find(b => b.name === value);
            if (branch) {
              employeeData.main_branch_id = branch.id;
            } else {
              errors.push(`סניף לא נמצא: ${value}`);
            }
          }

          employeeData[mapping.systemField] = value;
        } else if (mapping.isCustomField) {
          // Handle custom fields
          const customFieldKey = mapping.excelHeader;
          employeeData[`custom_${customFieldKey.replace(/\s+/g, '_')}`] = row[mapping.excelHeader];
        }
      });

      // Validation
      if (!employeeData.first_name && !employeeData.full_name) {
        errors.push('שם חובה');
      }

      // Check for duplicates
      const isDuplicate = existingEmployees.some(emp => 
        (emp.email && employeeData.email && emp.email === employeeData.email) ||
        (emp.phone && employeeData.phone && emp.phone === employeeData.phone) ||
        (emp.id_number && employeeData.id_number && emp.id_number === employeeData.id_number)
      );

      return {
        rowIndex: index + 1,
        data: employeeData,
        isValid: errors.length === 0,
        errors,
        isDuplicate
      };
    });

    setPreviewData(preview);
    setStep('preview');
  };

  const handleImport = async () => {
    setIsImporting(true);
    
    try {
      const validEmployees = previewData
        .filter(emp => emp.isValid && !emp.isDuplicate)
        .map(emp => emp.data);

      if (validEmployees.length === 0) {
        toast({
          title: 'אין עובדים לייבוא',
          description: 'כל העובדים נפסלו או כפולים',
          variant: 'destructive'
        });
        return;
      }

      const { data, error } = await supabase
        .from('employees')
        .insert(validEmployees);

      if (error) {
        toast({
          title: 'שגיאה בייבוא',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'ייבוא הושלם בהצלחה',
          description: `${validEmployees.length} עובדים נוספו למערכת`,
        });
        
        // Reset form
        setStep('upload');
        setFile(null);
        setRawData([]);
        setHeaders([]);
        setFieldMappings([]);
        setPreviewData([]);
        setIsOpen(false);
      }
    } catch (error) {
      toast({
        title: 'שגיאה לא צפויה',
        description: 'אנא נסה שוב',
        variant: 'destructive'
      });
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      ['שם פרטי', 'שם משפחה', 'אימייל', 'טלפון', 'מספר זהות', 'כתובת', 'תאריך תחילת עבודה', 'סניף', 'תפקיד', 'הערות'],
      ['יוסי', 'כהן', 'yossi@example.com', '0501234567', '123456789', 'תל אביב', '2024-01-15', 'סניף ראשי', 'עובד', 'עובד חדש']
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'עובדים');
    XLSX.writeFile(wb, 'תבנית_עובדים.xlsx');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          ייבוא מקובץ Excel
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ייבוא עובדים מקובץ Excel</DialogTitle>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-4">
            <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
              <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <Label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-lg font-medium">העלה קובץ Excel</span>
                <p className="text-sm text-gray-500 mt-2">קבצים נתמכים: .xlsx, .csv</p>
              </Label>
              <Input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            
            <div className="flex justify-center">
              <Button variant="outline" onClick={downloadTemplate} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                הורד תבנית לדוגמה
              </Button>
            </div>
          </div>
        )}

        {step === 'mapping' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">מיפוי שדות</h3>
            <p className="text-sm text-gray-600">
              התאם כל עמודה בקובץ Excel לשדה במערכת. אם שדה לא קיים, ניתן ליצור שדה מותאם אישית.
            </p>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {fieldMappings.map((mapping, index) => (
                <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="w-1/3">
                    <Label className="font-medium">{mapping.excelHeader}</Label>
                    <p className="text-xs text-gray-500">
                      דוגמה: {rawData[0]?.[mapping.excelHeader] || 'אין נתונים'}
                    </p>
                  </div>
                  
                  <div className="w-1/3">
                    <Select
                      value={mapping.systemField}
                      onValueChange={(value) => updateFieldMapping(index, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="בחר שדה במערכת" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">אל תייבא שדה זה</SelectItem>
                        {systemFields.map(field => (
                          <SelectItem key={field.value} value={field.value}>
                            {field.label}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">
                          <Plus className="h-4 w-4 inline mr-1" />
                          שדה מותאם אישית
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {mapping.isCustomField && (
                    <div className="w-1/3">
                      <Select
                        value={mapping.customFieldType}
                        onValueChange={(value: any) => {
                          const newMappings = [...fieldMappings];
                          newMappings[index].customFieldType = value;
                          setFieldMappings(newMappings);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="סוג שדה" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">טקסט</SelectItem>
                          <SelectItem value="number">מספר</SelectItem>
                          <SelectItem value="date">תאריך</SelectItem>
                          <SelectItem value="select">רשימה נפתחת</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('upload')}>
                חזור
              </Button>
              <Button onClick={generatePreview}>
                הצג תצוגה מקדימה
              </Button>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">תצוגה מקדימה</h3>
              <div className="flex gap-2">
                <Badge variant="outline">
                  {previewData.filter(emp => emp.isValid && !emp.isDuplicate).length} תקינים
                </Badge>
                <Badge variant="destructive">
                  {previewData.filter(emp => !emp.isValid).length} שגויים
                </Badge>
                <Badge variant="secondary">
                  {previewData.filter(emp => emp.isDuplicate).length} כפולים
                </Badge>
              </div>
            </div>

            <div className="max-h-96 overflow-auto border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">סטטוס</TableHead>
                    <TableHead>שורה</TableHead>
                    <TableHead>שם</TableHead>
                    <TableHead>אימייל</TableHead>
                    <TableHead>טלפון</TableHead>
                    <TableHead>שגיאות</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((employee) => (
                    <TableRow key={employee.rowIndex}>
                      <TableCell>
                        {employee.isDuplicate ? (
                          <Badge variant="secondary">כפול</Badge>
                        ) : employee.isValid ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-red-600" />
                        )}
                      </TableCell>
                      <TableCell>{employee.rowIndex}</TableCell>
                      <TableCell>
                        {employee.data.full_name || `${employee.data.first_name || ''} ${employee.data.last_name || ''}`.trim()}
                      </TableCell>
                      <TableCell>{employee.data.email}</TableCell>
                      <TableCell>{employee.data.phone}</TableCell>
                      <TableCell>
                        {employee.errors.length > 0 && (
                          <div className="text-red-600 text-xs">
                            {employee.errors.join(', ')}
                          </div>
                        )}
                        {employee.isDuplicate && (
                          <div className="text-orange-600 text-xs">
                            עובד כבר קיים במערכת
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('mapping')}>
                חזור למיפוי
              </Button>
              <Button 
                onClick={handleImport} 
                disabled={isImporting || previewData.filter(emp => emp.isValid && !emp.isDuplicate).length === 0}
              >
                {isImporting ? 'מייבא...' : 'ייבא עובדים'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
