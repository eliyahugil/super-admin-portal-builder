
import { ExcelParserService } from './ExcelParserService';
import { EmployeeDataTransformer } from './EmployeeDataTransformer';
import type { ExcelRow, ParsedExcelData } from './ExcelParserService';
import type { PreviewEmployee } from './EmployeeDataTransformer';
import type { FieldMapping } from '@/components/modules/employees/types/FieldMappingTypes';

export class ExcelFileManager {
  /**
   * Parse Excel file and return structured data
   */
  static async parseFile(file: File): Promise<ParsedExcelData> {
    return ExcelParserService.parseExcelFile(file);
  }

  /**
   * Generate Excel template for employee import
   */
  static generateTemplate(): void {
    ExcelParserService.generateTemplate();
  }

  /**
   * Transform raw Excel data to preview employees with validation
   */
  static generatePreview(
    rawData: ExcelRow[],
    fieldMappings: FieldMapping[],
    businessId: string,
    branches: any[],
    existingEmployees: any[],
    employeeTypes: any[]
  ): PreviewEmployee[] {
    return EmployeeDataTransformer.generatePreview(
      rawData,
      fieldMappings,
      businessId,
      branches,
      existingEmployees,
      employeeTypes
    );
  }

  /**
   * Validate Excel file format and content
   */
  static validateFileFormat(file: File): { isValid: boolean; error?: string } {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'סוג קובץ לא נתמך. אנא העלה קובץ Excel או CSV'
      };
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return {
        isValid: false,
        error: 'הקובץ גדול מדי. גודל מקסימלי: 10MB'
      };
    }

    return { isValid: true };
  }
}
