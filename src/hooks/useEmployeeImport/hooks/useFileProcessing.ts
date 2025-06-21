
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
    console.log('🔄 useFileProcessing - processFile called:', {
      fileName: file.name,
      fileSize: file.size,
      businessId
    });

    if (!businessId) {
      console.error('❌ No business ID available for import');
      throw new Error('לא נבחר עסק לייבוא');
    }

    setIsProcessing(true);
    setFile(file);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length === 0) {
        throw new Error('הקובץ ריק');
      }

      const headers = jsonData[0] as string[];
      const dataRows = jsonData.slice(1);
      
      console.log('✅ File processed successfully:', {
        headersCount: headers.length,
        dataRowsCount: dataRows.length
      });

      setHeaders(headers);
      setRawData(dataRows);
      setStep('preview');
      setShowMappingDialog(true);
    } catch (error) {
      console.error('❌ Error processing file:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    console.log('📥 Downloading employee template');
    
    const templateData = [
      ['שם פרטי', 'שם משפחה', 'מספר זהות', 'טלפון', 'אימייל', 'כתובת', 'סוג עובד', 'שעות שבועיות'],
      ['יוסי', 'כהן', '123456789', '050-1234567', 'yossi@example.com', 'תל אביב', 'קבוע', '40'],
      ['דנה', 'לוי', '987654321', '050-9876543', 'dana@example.com', 'חיפה', 'זמני', '20']
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'עובדים');
    XLSX.writeFile(workbook, 'תבנית_עובדים.xlsx');
  };

  return {
    processFile,
    downloadTemplate,
    isProcessing,
  };
};
