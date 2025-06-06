
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Download, Calendar } from 'lucide-react';

interface Document {
  id: string;
  file_name: string;
  file_path: string;
  document_type: string;
  created_at: string;
}

interface EmployeeDocumentsViewerProps {
  employeeId: string;
}

export const EmployeeDocumentsViewer: React.FC<EmployeeDocumentsViewerProps> = ({ employeeId }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const { data, error } = await supabase
          .from('employee_documents')
          .select('id, file_name, file_path, document_type, created_at')
          .eq('employee_id', employeeId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching documents:', error);
          toast({
            title: 'שגיאה',
            description: 'לא ניתן לטעון את המסמכים',
            variant: 'destructive',
          });
          return;
        }

        setDocuments(data || []);
      } catch (error) {
        console.error('Exception fetching documents:', error);
        toast({
          title: 'שגיאה',
          description: 'לא ניתן לטעון את המסמכים',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) {
      fetchDocuments();
    }
  }, [employeeId, toast]);

  const downloadFile = async (path: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('employee_docs')
        .download(path);

      if (error) {
        console.error('Error downloading file:', error);
        toast({
          title: 'שגיאה',
          description: 'לא ניתן להוריד את הקובץ',
          variant: 'destructive',
        });
        return;
      }

      if (data) {
        const url = URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast({
          title: 'הורדה הושלמה',
          description: `הקובץ ${fileName} הורד בהצלחה`,
        });
      }
    } catch (error) {
      console.error('Exception downloading file:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן להוריד את הקובץ',
        variant: 'destructive',
      });
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      contract: 'חוזה עבודה',
      id_copy: 'צילום תעודת זהות',
      certificate: 'תעודות הכשרה',
      medical: 'מסמכים רפואיים',
      other: 'אחר',
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            מסמכים
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          מסמכים ({documents.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p>אין מסמכים</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {doc.file_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {getDocumentTypeLabel(doc.document_type)}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(doc.created_at).toLocaleDateString('he-IL')}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => downloadFile(doc.file_path, doc.file_name)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  הורד
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
