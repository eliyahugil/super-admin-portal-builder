
import { validateEmployeeData } from '@/utils/employeeValidation';
import type { PreviewEmployee } from '@/hooks/useEmployeeImport/types';

interface GeneratePreviewOptions {
  rawData: any[];
  fieldMappings: Record<string, string>;
  businessId: string;
  branches: Array<{ id: string; name: string }>;
  existingEmployees: Array<{ email?: string; id_number?: string; employee_id?: string }>;
}

export class ExcelFileManager {
  static async generatePreview({
    rawData,
    fieldMappings,
    businessId,
    branches,
    existingEmployees
  }: GeneratePreviewOptions): Promise<PreviewEmployee[]> {
    console.log('🔄 ExcelFileManager.generatePreview started:', {
      rawDataCount: rawData.length,
      businessId,
      branchesCount: branches.length,
      existingEmployeesCount: existingEmployees.length
    });

    const previewData: PreviewEmployee[] = [];

    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      console.log(`📋 Processing row ${i + 1}:`, row);

      try {
        // Map fields based on user selection
        const mappedData: any = {
          business_id: businessId,
        };

        // Apply field mappings
        Object.entries(fieldMappings).forEach(([dbField, excelColumn]) => {
          if (excelColumn && excelColumn !== 'unmapped') {
            mappedData[dbField] = row[excelColumn];
          }
        });

        console.log(`🗺️ Mapped data for row ${i + 1}:`, mappedData);

        // Handle branch mapping
        if (mappedData.main_branch_name) {
          const branch = branches.find(b => 
            b.name.toLowerCase() === mappedData.main_branch_name.toLowerCase()
          );
          mappedData.main_branch_id = branch?.id || null;
        }

        // Validate employee data - only pass the mapped data
        const validation = validateEmployeeData(mappedData);
        
        // Check for duplicates
        const isDuplicate = this.checkForDuplicates(mappedData, existingEmployees);

        const previewEmployee: PreviewEmployee = {
          ...mappedData,
          first_name: mappedData.first_name || '',
          last_name: mappedData.last_name || '',
          employee_type: mappedData.employee_type || 'permanent',
          isValid: validation.isValid,
          isDuplicate,
          validationErrors: validation.errors,
        };

        previewData.push(previewEmployee);

        console.log(`✅ Preview employee created for row ${i + 1}:`, {
          name: `${previewEmployee.first_name} ${previewEmployee.last_name}`,
          isValid: previewEmployee.isValid,
          isDuplicate: previewEmployee.isDuplicate,
          errorsCount: previewEmployee.validationErrors.length
        });

      } catch (error) {
        console.error(`💥 Error processing row ${i + 1}:`, error);
        
        // Create an invalid preview employee for the error
        const errorEmployee: PreviewEmployee = {
          business_id: businessId,
          first_name: row[fieldMappings.first_name] || 'שגיאה',
          last_name: row[fieldMappings.last_name] || 'בעיבוד',
          employee_type: 'permanent',
          isValid: false,
          isDuplicate: false,
          validationErrors: [`שגיאה בעיבוד השורה: ${error instanceof Error ? error.message : 'שגיאה לא צפויה'}`],
        };

        previewData.push(errorEmployee);
      }
    }

    console.log('📊 ExcelFileManager.generatePreview completed:', {
      totalRows: previewData.length,
      validRows: previewData.filter(emp => emp.isValid).length,
      duplicateRows: previewData.filter(emp => emp.isDuplicate).length,
      errorRows: previewData.filter(emp => !emp.isValid).length
    });

    return previewData;
  }

  private static checkForDuplicates(
    employeeData: any, 
    existingEmployees: Array<{ email?: string; id_number?: string; employee_id?: string }>
  ): boolean {
    const { email, id_number, employee_id } = employeeData;

    return existingEmployees.some(existing => {
      // Check email match
      if (email && existing.email && 
          email.toLowerCase() === existing.email.toLowerCase()) {
        return true;
      }

      // Check ID number match
      if (id_number && existing.id_number && 
          id_number === existing.id_number) {
        return true;
      }

      // Check employee ID match
      if (employee_id && existing.employee_id && 
          employee_id === existing.employee_id) {
        return true;
      }

      return false;
    });
  }
}
