
import { ExcelParserService } from './excel/ExcelParserService';
import { ExcelFileManager } from './excel/ExcelFileManager';
import { EmployeeImportService } from './excel/EmployeeImportService';

// Re-export types for backward compatibility
export type { ParsedExcelData } from './excel/ExcelParserService';
export type { PreviewEmployee } from '@/hooks/useEmployeeImport/types';
export type { ImportResult } from '@/hooks/useEmployeeImport/types';

export class ExcelImportService {
  // File management methods
  static parseExcelFile = ExcelParserService.parseFile;
  static generateTemplate = ExcelParserService.generateTemplate;
  static generatePreview = ExcelFileManager.generatePreview;
  static validateFileFormat = ExcelParserService.validateFileFormat;

  // Database import methods
  static importEmployees = EmployeeImportService.importEmployees;
}
