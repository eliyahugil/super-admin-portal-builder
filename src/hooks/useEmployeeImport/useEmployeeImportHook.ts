
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useBusiness } from '@/hooks/useBusiness';
import { useSecureBusinessData } from '@/hooks/useSecureBusinessData';
import { ExcelImportService } from '@/services/ExcelImportService';
import { EmployeeDataTransformer } from '@/services/excel/EmployeeDataTransformer';
import type { 
  ImportStep, 
  ExcelRow, 
  PreviewEmployee, 
  ImportResult,
  FieldMapping 
} from './types';

export const useEmployeeImport = () => {
  const { toast } = useToast();
  const { businessId } = useBusiness();

  // State management
  const [step, setStep] = useState<ImportStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [rawData, setRawData] = useState<ExcelRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [previewData, setPreviewData] = useState<PreviewEmployee[]>([]);
  const [importResult, setImportResult] = useState<ImportResult>({
    success: false,
    importedCount: 0,
    errorCount: 0,
    message: '',
    errors: [],
    importedEmployees: []
  });
  const [showMappingDialog, setShowMappingDialog] = useState(false);

  // Data dependencies
  const { data: branches = [] } = useSecureBusinessData({
    queryKey: ['branches'],
    tableName: 'branches',
    enabled: !!businessId
  });

  const { data: existingEmployees = [] } = useSecureBusinessData({
    queryKey: ['employees'],
    tableName: 'employees',
    enabled: !!businessId
  });

  // Process uploaded file
  const processFile = useCallback(async (selectedFile: File) => {
    console.log('🎯 Processing file:', selectedFile.name);
    
    if (!businessId) {
      toast({
        title: 'שגיאה',
        description: 'לא נמצא מזהה עסק',
        variant: 'destructive',
      });
      return;
    }

    try {
      setFile(selectedFile);
      setStep('mapping');

      // Parse Excel file
      const parsedData = await ExcelImportService.parseExcelFile(selectedFile);
      console.log('📊 Parsed data:', parsedData);

      setRawData(parsedData.data);
      setHeaders(parsedData.headers);
      setShowMappingDialog(true);

    } catch (error) {
      console.error('💥 Error processing file:', error);
      toast({
        title: 'שגיאה בעיבוד הקובץ',
        description: error instanceof Error ? error.message : 'שגיאה לא צפויה',
        variant: 'destructive',
      });
      resetForm();
    }
  }, [businessId, toast]);

  // Confirm field mapping and generate preview
  const confirmMapping = useCallback(async (mappings: FieldMapping[]) => {
    console.log('🗺️ Confirming mappings:', mappings);
    
    if (!businessId) {
      toast({
        title: 'שגיאה',
        description: 'לא נמצא מזהה עסק',
        variant: 'destructive',
      });
      return;
    }

    try {
      setFieldMappings(mappings);
      setShowMappingDialog(false);
      setStep('preview');

      // Generate preview data using the transformer
      const employeeTypes = [
        { value: 'permanent', label: 'קבוע' },
        { value: 'temporary', label: 'זמני' },
        { value: 'youth', label: 'נוער' },
        { value: 'contractor', label: 'קבלן' }
      ];

      const preview = EmployeeDataTransformer.generatePreview(
        rawData,
        mappings,
        businessId,
        branches,
        existingEmployees,
        employeeTypes
      );

      // Transform to match our PreviewEmployee type
      const transformedPreview: PreviewEmployee[] = preview.map(emp => ({
        first_name: emp.data.first_name,
        last_name: emp.data.last_name,
        email: emp.data.email,
        phone: emp.data.phone,
        id_number: emp.data.id_number,
        employee_id: emp.data.employee_id,
        address: emp.data.address,
        hire_date: emp.data.hire_date,
        employee_type: emp.data.employee_type,
        weekly_hours_required: emp.data.weekly_hours_required,
        main_branch_id: emp.data.main_branch_id,
        notes: emp.data.notes,
        business_id: businessId,
        is_active: true,
        isValid: emp.isValid,
        validationErrors: emp.errors,
        isDuplicate: emp.isDuplicate,
        name: `${emp.data.first_name} ${emp.data.last_name}`
      }));

      console.log('👥 Preview data generated:', transformedPreview.length);
      setPreviewData(transformedPreview);

    } catch (error) {
      console.error('💥 Error generating preview:', error);
      toast({
        title: 'שגיאה ביצירת תצוגה מקדימה',
        description: error instanceof Error ? error.message : 'שגיאה לא צפויה',
        variant: 'destructive',
      });
    }
  }, [businessId, rawData, branches, existingEmployees, toast]);

  // Execute import
  const executeImport = useCallback(async () => {
    console.log('🚀 Starting import execution with data:', previewData.length);
    
    if (!businessId) {
      toast({
        title: 'שגיאה',
        description: 'לא נמצא מזהה עסק',
        variant: 'destructive',
      });
      return;
    }

    if (previewData.length === 0) {
      toast({
        title: 'שגיאה',
        description: 'אין נתוני עובדים לייבוא',
        variant: 'destructive',
      });
      return;
    }

    try {
      setStep('importing');

      // Filter only valid employees for import
      const validEmployees = previewData.filter(emp => emp.isValid && !emp.isDuplicate);
      
      if (validEmployees.length === 0) {
        toast({
          title: 'שגיאה',
          description: 'אין עובדים תקינים לייבוא',
          variant: 'destructive',
        });
        setStep('preview');
        return;
      }

      console.log('📤 Importing valid employees:', validEmployees.length);
      
      // Use the EmployeeImportService
      const result = await ExcelImportService.importEmployees(validEmployees);
      
      console.log('📊 Import execution completed:', result);
      
      setImportResult(result);
      setStep('results');

      if (result.success) {
        toast({
          title: 'הצלחה! 🎉',
          description: `יובאו בהצלחה ${result.importedCount} עובדים`,
        });
        
        // Refresh the employees list
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('employeesImported'));
        }, 1000);
      } else {
        toast({
          title: 'הייבוא הסתיים עם שגיאות',
          description: result.message,
          variant: 'destructive',
        });
      }

    } catch (error) {
      console.error('💥 Error in executeImport:', error);
      
      const errorResult: ImportResult = {
        success: false,
        importedCount: 0,
        errorCount: previewData.length,
        message: `שגיאה בייבוא: ${error instanceof Error ? error.message : 'שגיאה לא צפויה'}`,
        errors: [{
          row: 0,
          employee: 'כללי',
          error: error instanceof Error ? error.message : 'שגיאה לא צפויה'
        }],
        importedEmployees: []
      };

      setImportResult(errorResult);
      setStep('results');

      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בייבוא העובדים',
        variant: 'destructive',
      });
    }
  }, [businessId, previewData, toast]);

  // Reset form
  const resetForm = useCallback(() => {
    console.log('🔄 Resetting import form');
    setStep('upload');
    setFile(null);
    setRawData([]);
    setHeaders([]);
    setFieldMappings([]);
    setPreviewData([]);
    setImportResult({
      success: false,
      importedCount: 0,
      errorCount: 0,
      message: '',
      errors: [],
      importedEmployees: []
    });
    setShowMappingDialog(false);
  }, []);

  // Download template
  const downloadTemplate = useCallback(() => {
    try {
      ExcelImportService.generateTemplate();
      toast({
        title: 'הצלחה',
        description: 'קובץ התבנית הורד בהצלחה',
      });
    } catch (error) {
      console.error('💥 Error downloading template:', error);
      toast({
        title: 'שגיאה',
        description: 'שגיאה בהורדת קובץ התבנית',
        variant: 'destructive',
      });
    }
  }, [toast]);

  return {
    // State
    step,
    setStep,
    file,
    rawData,
    setRawData,
    headers,
    setHeaders,
    fieldMappings,
    setFieldMappings,
    previewData,
    setPreviewData,
    importResult,
    setImportResult,
    showMappingDialog,
    setShowMappingDialog,

    // Handlers
    processFile,
    executeImport,
    confirmMapping,

    // Utilities
    resetForm,
    downloadTemplate,

    // Dependencies
    branches,
    existingEmployees,
    businessId,
  };
};
