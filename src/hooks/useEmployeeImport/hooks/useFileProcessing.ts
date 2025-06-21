
import { useState } from 'react';
import * as XLSX from 'xlsx';
import type { ImportStep } from '../types';

interface UseFileProcessingProps {
  businessId: string | null | undefined;
  setFile: (file: File | null) => void;
  setRawData: (data: any[]) => void;
  setHeaders: (headers: string[]) => void;
  setStep: (step: ImportStep) => void;
  setShowMappingDialog: (show: boolean) => void;
}

export const useFileProcessing = ({
  businessId,
  setFile,
  setRawData,
  setHeaders,
  setStep,
  setShowMappingDialog,
}: UseFileProcessingProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = async (file: File) => {
    console.log('📁 useFileProcessing - Processing file:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      businessId
    });

    if (!businessId) {
      console.error('❌ No business ID available for file processing');
      throw new Error('לא נבחר עסק לעיבוד הקובץ');
    }

    setIsProcessing(true);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      console.log('📊 Excel processing:', {
        sheetName,
        worksheetKeys: Object.keys(worksheet).slice(0, 10)
      });

      // Convert to JSON with proper handling
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1, // Use array format instead of object format
        defval: null,
        raw: false // Convert all values to strings
      });

      console.log('📋 Raw JSON data from Excel:', {
        totalRows: jsonData.length,
        firstRow: jsonData[0],
        secondRow: jsonData[1],
        dataType: Array.isArray(jsonData[0]) ? 'array' : 'object'
      });

      if (!jsonData || jsonData.length === 0) {
        throw new Error('הקובץ ריק או לא תקין');
      }

      // First row should be headers
      const rawHeaders = jsonData[0] as any[];
      if (!rawHeaders || rawHeaders.length === 0) {
        throw new Error('לא נמצאו כותרות בקובץ');
      }

      // Generate column names (Column 1, Column 2, etc.)
      const headers = rawHeaders.map((header, index) => {
        if (header && header.toString().trim()) {
          return header.toString().trim();
        }
        return `Column ${index + 1}`;
      });

      console.log('📋 Processed headers:', headers);

      // Data rows (skip the header row)
      const dataRows = jsonData.slice(1).filter(row => {
        // Filter out completely empty rows
        if (!Array.isArray(row)) return false;
        return row.some(cell => cell !== null && cell !== undefined && cell.toString().trim() !== '');
      });

      console.log('📊 Processed data rows:', {
        totalDataRows: dataRows.length,
        sampleRow: dataRows[0],
        sampleRowType: Array.isArray(dataRows[0]) ? 'array' : typeof dataRows[0]
      });

      if (dataRows.length === 0) {
        throw new Error('לא נמצאו נתונים בקובץ');
      }

      // Store the processed data
      setFile(file);
      setHeaders(headers);
      setRawData(dataRows);
      setShowMappingDialog(true);
      
      console.log('✅ File processing completed successfully:', {
        headersCount: headers.length,
        dataRowsCount: dataRows.length,
        fileName: file.name
      });

    } catch (error) {
      console.error('💥 Error processing file:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    console.log('📥 Downloading employee template');
    
    const templateData = [
      ['שם פרטי', 'שם משפחה', 'אימייל', 'טלפון', 'תעודת זהות', 'מספר עובד'],
      ['יוסי', 'כהן', 'yossi@example.com', '050-1234567', '123456789', 'EMP001'],
      ['שרה', 'לוי', 'sara@example.com', '052-9876543', '987654321', 'EMP002'],
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'עובדים');
    XLSX.writeFile(wb, 'template_employees.xlsx');
  };

  return {
    processFile,
    downloadTemplate,
    isProcessing,
  };
};
