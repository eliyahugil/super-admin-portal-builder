
import * as XLSX from 'xlsx';

export interface ParsedExcelData {
  data: any[];
  headers: string[];
}

export class ExcelParserService {
  static async parseFile(file: File): Promise<ParsedExcelData> {
    console.log('📋 Parsing Excel file:', file.name);
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get the first worksheet
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length === 0) {
            reject(new Error('הקובץ ריק או לא מכיל נתונים'));
            return;
          }
          
          // Extract headers from first row
          const headers = (jsonData[0] as string[]).filter(header => header && header.trim() !== '');
          
          if (headers.length === 0) {
            reject(new Error('לא נמצאו כותרות בקובץ'));
            return;
          }
          
          // Convert data rows to objects
          const dataRows = jsonData.slice(1).filter(row => {
            // Filter out empty rows
            return (row as any[]).some(cell => cell !== null && cell !== undefined && cell !== '');
          });
          
          const parsedData = dataRows.map((row: any) => {
            const rowObject: any = {};
            headers.forEach((header, index) => {
              rowObject[header] = row[index] || '';
            });
            return rowObject;
          });
          
          console.log(`✅ Parsed ${parsedData.length} rows with ${headers.length} columns`);
          
          resolve({
            data: parsedData,
            headers
          });
          
        } catch (error) {
          console.error('💥 Error parsing Excel file:', error);
          reject(new Error('שגיאה בפיענוח קובץ האקסל'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('שגיאה בקריאת הקובץ'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  }

  static generateTemplate(): void {
    console.log('📝 Generating employee import template');
    
    const templateData = [
      ['שם פרטי', 'שם משפחה', 'אימייל', 'טלפון', 'תעודת זהות', 'מספר עובד', 'כתובת', 'תאריך התחלה', 'סוג עובד', 'שעות שבועיות', 'סניף ראשי', 'הערות'],
      ['דוגמה', 'משתמש', 'example@email.com', '050-1234567', '123456789', 'EMP001', 'רחוב הדוגמה 1, תל אביב', '2024-01-01', 'קבוע', '40', 'סניף ראשי', 'הערות לדוגמה']
    ];
    
    const worksheet = XLSX.utils.aoa_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'עובדים');
    
    // Download the file
    XLSX.writeFile(workbook, 'תבנית_ייבוא_עובדים.xlsx');
  }

  static validateFileFormat(file: File): boolean {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    
    return allowedTypes.includes(file.type);
  }
}
