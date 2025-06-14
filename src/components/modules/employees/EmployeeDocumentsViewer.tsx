
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface Props {
  document: any;
  onClose: () => void;
}

export const EmployeeDocumentsViewer: React.FC<Props> = ({ document, onClose }) => {
  const isImage = document.file_url && (
    document.file_url.includes('.jpg') || 
    document.file_url.includes('.jpeg') || 
    document.file_url.includes('.png')
  );

  const isPdf = document.file_url && document.file_url.includes('.pdf');

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{document.document_name}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          {isImage && (
            <img 
              src={document.file_url} 
              alt={document.document_name}
              className="max-w-full h-auto mx-auto"
            />
          )}
          
          {isPdf && (
            <iframe
              src={document.file_url}
              className="w-full h-[600px] border"
              title={document.document_name}
            />
          )}
          
          {!isImage && !isPdf && (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">לא ניתן להציג את הקובץ בדפדפן</p>
              <Button 
                onClick={() => window.open(document.file_url, '_blank')}
                variant="outline"
              >
                פתח בכרטיסייה חדשה
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
