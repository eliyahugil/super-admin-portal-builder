import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/hooks/useBusiness';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, Check, X } from 'lucide-react';
import { FieldMappingDialog, type FieldMapping } from './FieldMappingDialog';
import type { Employee } from '@/types/supabase';

interface ExcelRow {
  [key: string]: any;
}

interface PreviewEmployee {
  rowIndex: number;
  data: Partial<Employee> & { business_id: string };
  customFields: Record<string, any>;
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
  const [branches, setBranches] = useState<any[]>([]);
  const [existingEmployees, setExistingEmployees] = useState<any[]>([]);
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'import'>('upload');
  const [isImporting, setIsImporting] = useState(false);
  const [showMappingDialog, setShowMappingDialog] = useState(false);

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

        setStep('mapping');
        setShowMappingDialog(true);

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

  const handleMappingConfirm = (mappings: FieldMapping[]) => {
    setFieldMappings(mappings);
    setShowMappingDialog(false);
    generatePreview(mappings);
  };

  const generatePreview = (mappings: FieldMapping[]) => {
    const preview: PreviewEmployee[] = rawData.map((row, index) => {
      const employeeData: Partial<Employee> & { business_id: string } = {
        business_id: businessId!
      };
      const customFields: Record<string, any> = {};
      const errors: string[] = [];

      mappings.forEach(mapping => {
        if (mapping.systemField && mapping.mappedColumns.length > 0) {
          // Combine multiple columns into one value
          const combinedValue = mapping.mappedColumns
            .map(col => row[col] || '')
            .filter(val => val !== '')
            .join(' ')
            .trim();

          if (mapping.isCustomField) {
            // Handle custom fields
            customFields[mapping.customFieldName || mapping.systemField] = combinedValue;
          } else {
            // Handle system fields
            let value = combinedValue;
            
            // Handle special field types
            if (mapping.systemField === 'hire_date' && value) {
              const date = new Date(value);
              if (isNaN(date.getTime())) {
                errors.push(`תאריך לא תקין: ${value}`);
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

            if (mapping.systemField === 'full_name' && value) {
              // Split full name into first and last name if separate names not provided
              const nameParts = value.toString().split(' ');
              if (!employeeData.first_name) {
                employeeData.first_name = nameParts[0] || '';
              }
              if (!employeeData.last_name && nameParts.length > 1) {
                employeeData.last_name = nameParts.slice(1).join(' ');
              }
            }

            if (mapping.systemField === 'weekly_hours_required' && value) {
              const numValue = Number(value);
              if (!isNaN(numValue)) {
                employeeData.weekly_hours_required = numValue;
              }
            }

            // Set the field value (excluding special cases handled above)
            if (mapping.systemField !== 'branch_name' && mapping.systemField !== 'full_name') {
              (employeeData as any)[mapping.systemField] = value;
            }
          }
        }
      });

      // Ensure required fields are present
      if (!employeeData.first_name) {
        errors.push('שם פרטי חובה');
      }
      if (!employeeData.last_name) {
        errors.push('שם משפחה חובה');
      }

      // Set default employee type if not provided
      if (!employeeData.employee_type) {
        employeeData.employee_type = 'permanent';
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
        customFields,
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
        .filter(emp => emp.isValid && !emp.isDuplicate);

      if (validEmployees.length === 0) {
        toast({
          title: 'אין עובדים לייבוא',
          description: 'כל העובדים נפסלו או כפולים',
          variant: 'destructive'
        });
        return;
      }

      // Insert employees
      const employeesToInsert = validEmployees.map(emp => ({
        business_id: emp.data.business_id,
        first_name: emp.data.first_name || '',
        last_name: emp.data.last_name || '',
        email: emp.data.email || null,
        phone: emp.data.phone || null,
        id_number: emp.data.id_number || null,
        employee_id: emp.data.employee_id || null,
        address: emp.data.address || null,
        hire_date: emp.data.hire_date || null,
        employee_type: emp.data.employee_type || 'permanent',
        weekly_hours_required: emp.data.weekly_hours_required || null,
        main_branch_id: emp.data.main_branch_id || null,
        notes: emp.data.notes || null,
        is_active: true
      }));

      const { data: insertedEmployees, error: employeeError } = await supabase
        .from('employees')
        .insert(employeesToInsert)
        .select();

      if (employeeError) {
        toast({
          title: 'שגיאה בייבוא עובדים',
          description: employeeError.message,
          variant: 'destructive'
        });
        return;
      }

      // Insert custom fields for employees that have them
      const customFieldValues: any[] = [];
      validEmployees.forEach((emp, index) => {
        const employeeId = insertedEmployees?.[index]?.id;
        if (employeeId && Object.keys(emp.customFields).length > 0) {
          Object.entries(emp.customFields).forEach(([fieldName, value]) => {
            if (value !== null && value !== undefined && value !== '') {
              customFieldValues.push({
                employee_id: employeeId,
                field_name: fieldName,
                value: value.toString()
              });
            }
          });
        }
      });

      if (customFieldValues.length > 0) {
        const { error: customFieldError } = await supabase
          .from('custom_field_values')
          .insert(customFieldValues);

        if (customFieldError) {
          console.error('Error inserting custom fields:', customFieldError);
          // Don't fail the entire import for custom field errors
        }
      }

      toast({
        title: 'ייבוא הושלם בהצלחה',
        description: `${employeesToInsert.length} עובדים נוספו למערכת`,
      });
      
      // Reset form
      setStep('upload');
      setFile(null);
      setRawData([]);
      setHeaders([]);
      setFieldMappings([]);
      setPreviewData([]);
      setIsOpen(false);

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
    <>
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

          {/* Upload step */}
          {step === 'upload' && (
            <div className="space-y-4">
              <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-lg font-medium">העלה קובץ Excel</span>
                  <p className="text-sm text-gray-500 mt-2">קבצים נתמכים: .xlsx, .xls, .csv</p>
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

          {/* Preview step */}
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
                      <TableHead>שדות מותאמים</TableHead>
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
                          {`${employee.data.first_name || ''} ${employee.data.last_name || ''}`.trim()}
                        </TableCell>
                        <TableCell>{employee.data.email}</TableCell>
                        <TableCell>{employee.data.phone}</TableCell>
                        <TableCell>
                          {Object.keys(employee.customFields).length > 0 ? (
                            <Badge variant="outline">
                              {Object.keys(employee.customFields).length} שדות
                            </Badge>
                          ) : (
                            '-'
                          )}
                        </TableCell>
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
                <Button variant="outline" onClick={() => setShowMappingDialog(true)}>
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

      {/* Field Mapping Dialog */}
      <FieldMappingDialog
        open={showMappingDialog}
        onOpenChange={setShowMappingDialog}
        fileColumns={headers}
        sampleData={rawData.slice(0, 5)}
        onConfirm={handleMappingConfirm}
        systemFields={systemFields}
      />
    </>
  );
};
