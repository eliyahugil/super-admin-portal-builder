
import { ExcelFileManager } from './excel/ExcelFileManager';
import { EmployeeImportDatabase } from './excel/EmployeeImportDatabase';

// Re-export types for backward compatibility
export type { ExcelRow, ParsedExcelData } from './excel/ExcelParserService';
export type { PreviewEmployee } from './excel/EmployeeDataTransformer';
export type { ImportResult } from './excel/EmployeeImportDatabase';

export class ExcelImportService {
  // File management methods
  static parseExcelFile = ExcelFileManager.parseFile;
  static generateTemplate = ExcelFileManager.generateTemplate;
  static generatePreview = ExcelFileManager.generatePreview;
  static validateFileFormat = ExcelFileManager.validateFileFormat;

  // Database import methods
  static importEmployees = EmployeeImportDatabase.importEmployees;
}
