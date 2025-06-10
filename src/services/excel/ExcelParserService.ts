
import * as XLSX from 'xlsx';

export interface ExcelRow {
  [key: string]: any;
}

export interface ParsedExcelData {
  data: ExcelRow[];
  headers: string[];
}

export class ExcelParserService {
  /**
   * Parse Excel file and return structured data
   */
  static async parseExcelFile(file: File): Promise<ParsedExcelData> {
    try {
      console.log('📊 Starting Excel file parsing:', file.name);
      
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // Get the first worksheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      if (!worksheet) {
        throw new Error('הקובץ לא מכיל גליונות עבודה תקינים');
      }

      // Convert to JSON with header row
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: '',
        blankrows: false 
      }) as any[][];

      if (jsonData.length === 0) {
        throw new Error('הקובץ ריק או לא מכיל נתונים');
      }

      // Extract headers from first row
      const headers = jsonData[0]?.map((header: any) => 
        String(header || '').trim()
      ).filter(header => header !== '') || [];

      if (headers.length === 0) {
        throw new Error('לא נמצאו כותרות עמודות בשורה הראשונה');
      }

      // Convert remaining rows to objects
      const dataRows = jsonData.slice(1).filter(row => 
        row && row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== '')
      );

      const data: ExcelRow[] = dataRows.map((row, index) => {
        const rowObject: ExcelRow = {};
        headers.forEach((header, colIndex) => {
          const cellValue = row[colIndex];
          rowObject[header] = cellValue !== null && cellValue !== undefined 
            ? String(cellValue).trim() 
            : '';
        });
        return rowObject;
      });

      console.log('✅ Excel parsing completed:', {
        totalRows: data.length,
        headers: headers.length,
        sample: data.slice(0, 3)
      });

      return {
        data,
        headers
      };

    } catch (error) {
      console.error('💥 Excel parsing error:', error);
      throw new Error(
        error instanceof Error 
          ? `שגיאה בקריאת קובץ האקסל: ${error.message}`
          : 'שגיאה לא צפויה בקריאת הקובץ'
      );
    }
  }

  /**
   * Generate Excel template for employee import
   */
  static generateTemplate(): void {
    console.log('📥 Generating Excel template');
    
    const templateData = [
      // Headers row
      [
        'שם פרטי',
        'שם משפחה', 
        'אימייל',
        'טלפון',
        'תעודת זהות',
        'מספר עובד',
        'כתובת',
        'תאריך התחלה',
        'סוג עובד',
        'שעות שבועיות',
        'סניף ראשי',
        'הערות'
      ],
      // Example row
      [
        'יוסי',
        'כהן',
        'yossi@example.com',
        '050-1234567',
        '123456789',
        'EMP001',
        'תל אביב',
        '01/01/2024',
        'permanent',
        '40',
        'סניף ראשי',
        'עובד מצוין'
      ]
    ];

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(templateData);
    
    // Style the header row
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellAddress]) continue;
      
      worksheet[cellAddress].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: 'E3F2FD' } }
      };
    }

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'עובדים');
    
    // Generate and download file
    XLSX.writeFile(workbook, 'תבנית_ייבוא_עובדים.xlsx');
  }
}
