
import * as XLSX from 'xlsx';

export interface ParsedExcelData {
  data: Record<string, any>[];
  headers: string[];
}

export class ExcelParserService {
  static async parseFile(file: File): Promise<ParsedExcelData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get the first worksheet
          const worksheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[worksheetName];
          
          // Convert to JSON with headers
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            defval: ''
          }) as any[][];

          if (jsonData.length === 0) {
            throw new Error('הקובץ ריק');
          }

          // Extract headers from first row
          const headers = jsonData[0].map(header => String(header).trim()).filter(Boolean);
          
          if (headers.length === 0) {
            throw new Error('לא נמצאו כותרות בקובץ');
          }

          // Convert data rows to objects
          const dataRows = jsonData.slice(1).filter(row => 
            row.some(cell => cell !== undefined && cell !== null && cell !== '')
          );

          const parsedData = dataRows.map(row => {
            const rowData: Record<string, any> = {};
            headers.forEach((header, index) => {
              const value = row[index];
              rowData[header] = value !== undefined && value !== null ? String(value).trim() : '';
            });
            return rowData;
          });

          console.log('📊 ExcelParserService - Parsed data:', {
            headers,
            dataCount: parsedData.length,
            sampleData: parsedData.slice(0, 2)
          });

          resolve({
            data: parsedData,
            headers
          });

        } catch (error) {
          console.error('💥 ExcelParserService - Parse error:', error);
          reject(new Error(`שגיאה בקריאת הקובץ: ${error instanceof Error ? error.message : 'שגיאה לא צפויה'}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('שגיאה בקריאת הקובץ'));
      };

      reader.readAsArrayBuffer(file);
    });
  }

  static generateTemplate(): void {
    const templateData = [
      {
        'שם פרטי': 'דוגמה',
        'שם משפחה': 'עובד',
        'אימייל': 'employee@example.com',
        'טלפון': '050-1234567',
        'תעודת זהות': '123456789',
        'מספר עובד': 'EMP001',
        'כתובת': 'רחוב הדוגמה 1, תל אביב',
        'תאריך התחלה': '01/01/2024',
        'סוג עובד': 'קבוע',
        'שעות שבועיות נדרשות': '40',
        'הערות': 'עובד דוגמה'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'תבנית עובדים');
    
    // Set column widths
    const columnWidths = [
      { wch: 15 }, // שם פרטי
      { wch: 15 }, // שם משפחה
      { wch: 25 }, // אימייל
      { wch: 15 }, // טלפון
      { wch: 15 }, // תעודת זהות
      { wch: 10 }, // מספר עובד
      { wch: 30 }, // כתובת
      { wch: 15 }, // תאריך התחלה
      { wch: 10 }, // סוג עובד
      { wch: 20 }, // שעות שבועיות
      { wch: 30 }  // הערות
    ];
    
    ws['!cols'] = columnWidths;

    XLSX.writeFile(wb, 'תבנית_ייבוא_עובדים.xlsx');
  }
}
