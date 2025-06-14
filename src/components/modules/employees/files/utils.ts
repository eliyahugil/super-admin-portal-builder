
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 בתים';
  const k = 1024;
  const sizes = ['בתים', 'ק״ב', 'מ״ב', 'ג״ב'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileTypeLabel = (fileType: string): string => {
  if (fileType.includes('pdf')) return 'PDF';
  if (fileType.includes('image')) return 'תמונה';
  if (fileType.includes('document') || fileType.includes('word')) return 'מסמך';
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'גיליון';
  return 'קובץ';
};
