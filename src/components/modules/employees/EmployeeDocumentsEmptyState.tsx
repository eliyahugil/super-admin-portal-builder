
import React from 'react';
import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  employeeName: string;
  canEdit: boolean;
  uploading: boolean;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const EmployeeDocumentsEmptyState: React.FC<Props> = ({
  employeeName,
  canEdit,
  uploading,
  handleFileUpload
}) => (
  <div className="text-center py-8">
    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">אין מסמכים</h3>
    <p className="text-gray-500 mb-4">לא הועלו עדיין מסמכים עבור {employeeName}</p>
    {canEdit && (
      <div className="relative inline-block">
        <input
          type="file"
          onChange={handleFileUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          disabled={uploading}
        />
        <Button disabled={uploading}>
          <Plus className="h-4 w-4 mr-2" />
          העלה מסמך ראשון
        </Button>
      </div>
    )}
  </div>
);
