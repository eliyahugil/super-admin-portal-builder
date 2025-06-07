
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useBusiness } from '@/hooks/useBusiness';
import { supabase } from '@/integrations/supabase/client';
import { ExcelImportService, type ExcelRow, type PreviewEmployee } from '@/services/ExcelImportService';
import { FieldMapping } from '@/components/modules/employees/types/FieldMappingTypes';

export type ImportStep = 'upload' | 'mapping' | 'preview' | 'import';

export const useEmployeeImport = () => {
  const { businessId } = useBusiness();
  const { toast } = useToast();

  const [step, setStep] = useState<ImportStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [rawData, setRawData] = useState<ExcelRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [previewData, setPreviewData] = useState<PreviewEmployee[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [existingEmployees, setExistingEmployees] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [showMappingDialog, setShowMappingDialog] = useState(false);

  const employeeTypes = [
    { value: 'permanent', label: 'קבוע' },
    { value: 'temporary', label: 'זמני' },
    { value: 'youth', label: 'נוער' },
    { value: 'contractor', label: 'קבלן' }
  ];

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

  useEffect(() => {
    if (businessId) {
      fetchBranches();
      fetchExistingEmployees();
    }
  }, [businessId]);

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

  const handleFileUpload = async (uploadedFile: File) => {
    try {
      setFile(uploadedFile);
      const parsedData = await ExcelImportService.parseExcelFile(uploadedFile);
      
      setHeaders(parsedData.headers);
      setRawData(parsedData.data);
      setStep('mapping');
      setShowMappingDialog(true);
    } catch (error) {
      toast({
        title: 'שגיאה בקריאת הקובץ',
        description: error instanceof Error ? error.message : 'אנא ודא שהקובץ הוא Excel תקין',
        variant: 'destructive'
      });
    }
  };

  const handleMappingConfirm = (mappings: FieldMapping[]) => {
    if (!businessId) return;
    
    setFieldMappings(mappings);
    setShowMappingDialog(false);
    
    const preview = ExcelImportService.generatePreview(
      rawData,
      mappings,
      businessId,
      branches,
      existingEmployees,
      employeeTypes
    );
    
    setPreviewData(preview);
    setStep('preview');
  };

  const handleImport = async () => {
    setIsImporting(true);
    
    try {
      const result = await ExcelImportService.importEmployees(previewData);
      
      if (result.success) {
        toast({
          title: 'ייבוא הושלם בהצלחה',
          description: result.message,
        });
        
        resetForm();
      } else {
        toast({
          title: 'שגיאה בייבוא',
          description: result.message,
          variant: 'destructive'
        });
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

  const resetForm = () => {
    setStep('upload');
    setFile(null);
    setRawData([]);
    setHeaders([]);
    setFieldMappings([]);
    setPreviewData([]);
  };

  const downloadTemplate = () => {
    ExcelImportService.generateTemplate();
  };

  return {
    // State
    step,
    file,
    headers,
    previewData,
    isImporting,
    showMappingDialog,
    systemFields,
    employeeTypes,
    
    // Actions
    handleFileUpload,
    handleMappingConfirm,
    handleImport,
    resetForm,
    downloadTemplate,
    setShowMappingDialog,
    
    // Sample data for mapping dialog
    sampleData: rawData.slice(0, 5)
  };
};
