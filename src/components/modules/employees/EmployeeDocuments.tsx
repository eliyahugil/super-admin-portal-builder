
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Eye, Upload, Plus, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthContext';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface EmployeeDocumentsProps {
  employeeId: string;
  employeeName: string;
  canEdit?: boolean;
}

export const EmployeeDocuments: React.FC<EmployeeDocumentsProps> = ({ 
  employeeId, 
  employeeName,
  canEdit = true 
}) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: documents, isLoading } = useQuery({
    queryKey: ['employee-documents', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_documents')
        .select(`
          *,
          uploaded_by_profile:profiles!employee_documents_uploaded_by_fkey(full_name)
        `)
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!employeeId,
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const { error } = await supabase
        .from('employee_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-documents', employeeId] });
      toast({
        title: 'הצלחה',
        description: 'המסמך נמחק בהצלחה',
      });
    },
    onError: () => {
      toast({
        title: 'שגיאה',
        description: 'לא ניתן למחוק את המסמך',
        variant: 'destructive',
      });
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile?.id) return;

    try {
      setUploading(true);
      
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const filePath = `employee-documents/${employeeId}/${timestamp}-${file.name}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('employee-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('employee-files')
        .getPublicUrl(filePath);

      // Save document record
      const { error: insertError } = await supabase
        .from('employee_documents')
        .insert({
          employee_id: employeeId,
          document_name: file.name,
          document_type: getFileType(file.name),
          file_url: urlData.publicUrl,
          uploaded_by: profile.id,
        });

      if (insertError) throw insertError;
      
      toast({
        title: 'הצלחה',
        description: 'המסמך הועלה בהצלחה',
      });
      
      queryClient.invalidateQueries({ queryKey: ['employee-documents', employeeId] });
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן להעלות את המסמך',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const getFileType = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'contract';
      case 'doc':
      case 'docx': return 'form';
      case 'jpg':
      case 'jpeg':
      case 'png': return 'id';
      default: return 'other';
    }
  };

  const getDocumentTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'contract': return 'bg-blue-100 text-blue-800';
      case 'id': return 'bg-green-100 text-green-800';
      case 'certificate': return 'bg-purple-100 text-purple-800';
      case 'form': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case 'contract': return 'חוזה';
      case 'id': return 'תעודת זהות';
      case 'certificate': return 'תעודה';
      case 'form': return 'טופס';
      default: return type;
    }
  };

  const handleDownload = (document: any) => {
    if (document.file_url) {
      const link = document.createElement('a');
      link.href = document.file_url;
      link.download = document.document_name;
      link.click();
    }
  };

  const handleView = (document: any) => {
    if (document.file_url) {
      window.open(document.file_url, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
              disabled={uploading}
            />
            <Button 
              disabled={uploading}
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

      {documents && documents.length > 0 ? (
        <div className="space-y-3">
          {documents.map((document) => (
            <Card key={document.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div className="flex-1">
                      <h4 className="font-medium">{document.document_name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getDocumentTypeColor(document.document_type)}>
                          {getDocumentTypeLabel(document.document_type)}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {format(new Date(document.created_at), 'dd/MM/yyyy', { locale: he })}
                        </span>
                        {document.uploaded_by_profile?.full_name && (
                          <span className="text-sm text-gray-500">
                            • הועלה על ידי {document.uploaded_by_profile.full_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleView(document)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownload(document)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {canEdit && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => deleteDocumentMutation.mutate(document.id)}
                        disabled={deleteDocumentMutation.isPending}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
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
          </CardContent>
        </Card>
      )}
    </div>
  );
};
