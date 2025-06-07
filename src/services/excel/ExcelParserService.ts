
import * as XLSX from 'xlsx';

export interface ExcelRow {
  [key: string]: any;
}

export interface ParsedExcelData {
  headers: string[];
  data: ExcelRow[];
}

export class ExcelParserService {
  static parseExcelFile(file: File): Promise<ParsedExcelData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length < 2) {
            throw new Error('הקובץ חייב להכיל לפחות שורת כותרות ושורת נתונים אחת');
          }

          const headerRow = jsonData[0] as string[];
          const dataRows = jsonData.slice(1).filter(row => 
            Array.isArray(row) && row.some(cell => cell !== null && cell !== undefined && cell !== '')
          );

          const parsedData = dataRows.map((row: any) => {
            const obj: ExcelRow = {};
            headerRow.forEach((header, index) => {
              obj[header] = row[index] || '';
            });
            return obj;
          });

          resolve({
            headers: headerRow,
            data: parsedData
          });
        } catch (error) {
          reject(new Error('שגיאה בקריאת הקובץ - אנא ודא שהקובץ הוא Excel תקין'));
        }
      };

      reader.onerror = () => reject(new Error('שגיאה בקריאת הקובץ'));
      reader.readAsArrayBuffer(file);
    });
  }

  static generateTemplate(): void {
    const templateData = [
      ['שם פרטי', 'שם משפחה', 'אימייל', 'טלפון', 'מספר זהות', 'כתובת', 'תאריך תחילת עבודה', 'סניף', 'תפקיד', 'הערות'],
      ['יוסי', 'כהן', 'yossi@example.com', '0501234567', '123456789', 'תל אביב', '2024-01-15', 'סניף ראשי', 'עובד', 'עובד חדש']
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'עובדים');
    XLSX.writeFile(wb, 'תבנית_עובדים.xlsx');
  }
}
