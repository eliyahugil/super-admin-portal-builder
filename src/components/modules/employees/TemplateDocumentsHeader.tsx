
import React from 'react';
import { FileText, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  uploading: boolean;
  handleTemplateUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TemplateDocumentsHeader: React.FC<Props> = ({
  uploading,
  handleTemplateUpload,
}) => (
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-2">
      <FileText className="h-6 w-6 text-purple-600" />
      <h3 className="text-xl font-semibold">תבניות מסמכים</h3>
    </div>
    <div className="relative">
      <input
        type="file"
        onChange={handleTemplateUpload}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        disabled={uploading}
      />
      <Button
        disabled={uploading}
        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
      >
        {uploading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            מעלה תבנית...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            העלה תבנית חדשה
          </>
        )}
      </Button>
    </div>
  </div>
);
