
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileTypeLabel = (fileType: string): string => {
  if (!fileType) return 'קובץ';
  
  if (fileType.includes('image')) return 'תמונה';
  if (fileType.includes('pdf')) return 'PDF';
  if (fileType.includes('word') || fileType.includes('document')) return 'מסמך';
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'גיליון אלקטרוני';
  if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'מצגת';
  
  return 'קובץ';
};

export const getDocumentTypeLabel = (documentType: string): string => {
  switch (documentType) {
    case 'contract':
      return 'חוזה';
    case 'form':
      return 'טופס';
    case 'id':
      return 'תעודת זהות';
    case 'certificate':
      return 'אישור';
    case 'agreement':
      return 'הסכם';
    default:
      return 'מסמך';
  }
};
