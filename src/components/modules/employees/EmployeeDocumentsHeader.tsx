
import React from 'react';
import { FileText, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  canEdit: boolean;
  uploading: boolean;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disableUpload?: boolean;
}

export const EmployeeDocumentsHeader: React.FC<Props> = ({
  canEdit,
  uploading,
  handleFileUpload,
  disableUpload = false,
}) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <FileText className="h-5 w-5 text-blue-600" />
      <h3 className="text-lg font-semibold">מסמכי העובד</h3>
    </div>
    {canEdit && (
      <div className="relative">
        <input
          type="file"
          onChange={handleFileUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          disabled={uploading || disableUpload}
        />
        <Button
          disabled={uploading || disableUpload}
          className="flex items-center gap-2"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              מעלה...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              העלה מסמך
            </>
          )}
        </Button>
      </div>
    )}
  </div>
);
