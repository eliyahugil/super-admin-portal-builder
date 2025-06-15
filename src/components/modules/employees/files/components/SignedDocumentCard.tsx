
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileCheck, Download, Calendar, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { SignedDocument } from '../types';
import { getDocumentTypeLabel } from '../utils';

interface SignedDocumentCardProps {
  document: SignedDocument;
  onDownload: (document: SignedDocument) => void;
}

export const SignedDocumentCard: React.FC<SignedDocumentCardProps> = ({ 
  document, 
  onDownload 
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow border-green-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
              {getDocumentTypeLabel(document.document_type)}
            </Badge>
            <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              נחתם
            </Badge>
          </div>
          <FileCheck className="h-8 w-8 text-green-600 flex-shrink-0" />
        </div>
        
        <h4 className="font-medium text-sm mb-2 truncate text-right" title={document.document_name}>
          {document.document_name}
        </h4>
        
        <div className="space-y-1 text-xs text-gray-500 mb-3 text-right">
          <div className="flex items-center gap-1 justify-end">
            <span>
              נחתם: {format(new Date(document.signed_at), 'dd/MM/yyyy HH:mm', { locale: he })}
            </span>
            <Calendar className="h-3 w-3" />
          </div>
          {document.digital_signature_data && (
            <div className="text-green-600 text-xs">
              חתימה דיגיטלית מאומתת
            </div>
          )}
        </div>
        
        <Button
          size="sm"
          variant="outline"
          className="w-full border-green-200 text-green-700 hover:bg-green-50"
          onClick={() => onDownload(document)}
        >
          <span className="mr-1">צפה והורד</span>
          <Download className="h-3 w-3" />
        </Button>
      </CardContent>
    </Card>
  );
};
