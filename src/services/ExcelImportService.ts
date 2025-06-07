
import { ExcelParserService } from './excel/ExcelParserService';
import { EmployeeDataTransformer } from './excel/EmployeeDataTransformer';
import { EmployeeImportDatabase } from './excel/EmployeeImportDatabase';

// Re-export types for backward compatibility
export type { ExcelRow, ParsedExcelData } from './excel/ExcelParserService';
export type { PreviewEmployee } from './excel/EmployeeDataTransformer';
export type { ImportResult } from './excel/EmployeeImportDatabase';

export class ExcelImportService {
  // Excel parsing methods
  static parseExcelFile = ExcelParserService.parseExcelFile;
  static generateTemplate = ExcelParserService.generateTemplate;

  // Data transformation methods
  static generatePreview = EmployeeDataTransformer.generatePreview;

  // Database import methods
  static importEmployees = EmployeeImportDatabase.importEmployees;
}
