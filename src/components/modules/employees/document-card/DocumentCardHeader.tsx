
import React from 'react';
import { FileText } from 'lucide-react';

interface DocumentCardHeaderProps {
  document: any;
  children: React.ReactNode;
}

export const DocumentCardHeader: React.FC<DocumentCardHeaderProps> = ({
  document,
  children
}) => {
  return (
    <div className="flex items-center gap-3 flex-1">
      <FileText className="h-8 w-8 text-blue-600" />
      <div className="flex-1">
        <h4 className="font-medium">{document.document_name}</h4>
        <div className="flex flex-wrap items-center gap-2 mt-1">
          {children}
        </div>
      </div>
    </div>
  );
};
