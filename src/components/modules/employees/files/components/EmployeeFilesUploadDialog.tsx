
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  employee_id: string;
}

interface EmployeeFilesUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[] | undefined;
  uploadingEmployeeId: string;
  setUploadingEmployeeId: (id: string) => void;
  selectedFile: File | null;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => void;
  isUploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const EmployeeFilesUploadDialog: React.FC<EmployeeFilesUploadDialogProps> = ({
  isOpen,
  onClose,
  employees,
  uploadingEmployeeId,
  setUploadingEmployeeId,
  selectedFile,
  onFileSelect,
  onUpload,
  isUploading,
  fileInputRef,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">העלאת קובץ</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">בחר עובד</label>
            <select
              value={uploadingEmployeeId}
              onChange={(e) => setUploadingEmployeeId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">בחר עובד...</option>
              {employees?.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.first_name} {employee.last_name} ({employee.employee_id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">בחר קובץ</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="*"
              onChange={onFileSelect}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {selectedFile && (
            <div className="text-sm text-gray-600">
              קובץ נבחר: {selectedFile.name} ({formatFileSize(selectedFile.size)})
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              onClick={onUpload}
              disabled={!selectedFile || !uploadingEmployeeId || isUploading}
              className="flex-1"
            >
              {isUploading ? 'מעלה...' : 'העלה'}
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              ביטול
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
