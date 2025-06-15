
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FileText, ChevronDown, ChevronUp, FileCheck } from 'lucide-react';
import { GroupedFiles, EmployeeFile, SignedDocument } from '../types';
import { EmployeeFileCard } from './EmployeeFileCard';
import { SignedDocumentCard } from './SignedDocumentCard';

interface EmployeeFilesGroupProps {
  group: GroupedFiles;
  isExpanded: boolean;
  onToggleExpansion: (employeeId: string) => void;
  onDownload: (file: EmployeeFile) => void;
  onDownloadSignedDocument: (document: SignedDocument) => void;
}

export const EmployeeFilesGroup: React.FC<EmployeeFilesGroupProps> = ({
  group,
  isExpanded,
  onToggleExpansion,
  onDownload,
  onDownloadSignedDocument,
}) => {
  const totalItems = group.files.length + group.signedDocuments.length;

  return (
    <Card className="overflow-hidden">
      <CardHeader 
        className="cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => onToggleExpansion(group.employee.id)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
            
            <div className="flex items-center gap-2">
              {group.files.length > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <span>{group.files.length} קבצים</span>
                  <FileText className="h-3 w-3" />
                </Badge>
              )}
              
              {group.signedDocuments.length > 0 && (
                <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
                  <span>{group.signedDocuments.length} מסמכים חתומים</span>
                  <FileCheck className="h-3 w-3" />
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <h3 className="font-semibold text-lg">
                {group.employee.first_name} {group.employee.last_name}
              </h3>
              {group.employee.employee_id && (
                <p className="text-sm text-gray-600">
                  מזהה עובד: {group.employee.employee_id}
                </p>
              )}
            </div>
            
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {group.employee.first_name.charAt(0)}{group.employee.last_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="border-t pt-4">
            {totalItems === 0 ? (
              <div className="text-center py-8 text-gray-500">
                אין קבצים או מסמכים חתומים עבור עובד זה
              </div>
            ) : (
              <div className="space-y-6">
                {/* קבצים רגילים */}
                {group.files.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      קבצים שהועלו ({group.files.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {group.files.map((file) => (
                        <EmployeeFileCard
                          key={file.id}
                          file={file}
                          onDownload={onDownload}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* מסמכים חתומים */}
                {group.signedDocuments.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <FileCheck className="h-4 w-4 text-green-600" />
                      מסמכים חתומים ({group.signedDocuments.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {group.signedDocuments.map((document) => (
                        <SignedDocumentCard
                          key={document.id}
                          document={document}
                          onDownload={onDownloadSignedDocument}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};
