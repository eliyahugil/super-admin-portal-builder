
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
  const { profile, user } = useAuth();
  const queryClient = useQueryClient();

  console.log('📋 EmployeeDocuments - Auth state:', { 
    hasProfile: !!profile, 
    hasUser: !!user,
    profileId: profile?.id,
    userId: user?.id,
    employeeId 
  });

  const { data: documents, isLoading } = useQuery({
    queryKey: ['employee-documents', employeeId],
    queryFn: async () => {
      console.log('📄 Fetching documents for employee:', employeeId);
      const { data, error } = await supabase
        .from('employee_documents')
        .select(`
          *,
          uploaded_by_profile:profiles!employee_documents_uploaded_by_fkey(full_name)
        `)
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching documents:', error);
        throw error;
      }
      console.log('✅ Documents fetched:', data?.length || 0);
      return data;
    },
    enabled: !!employeeId,
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async ({ documentId, filePath }: { documentId: string; filePath: string }) => {
      console.log('🗑️ Deleting document:', { documentId, filePath });
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('employee-files')
        .remove([filePath]);

      if (storageError) {
        console.error('❌ Storage delete error:', storageError);
        throw storageError;
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('employee_documents')
        .delete()
        .eq('id', documentId);

      if (dbError) {
        console.error('❌ Database delete error:', dbError);
        throw dbError;
      }
      
      console.log('✅ Document deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-documents', employeeId] });
      toast({
        title: 'הצלחה',
        description: 'המסמך נמחק בהצלחה',
      });
    },
    onError: (error) => {
      console.error('❌ Delete mutation error:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן למחוק את המסמך',
        variant: 'destructive',
      });
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log('❌ No file selected');
      return;
    }

    console.log('📤 Starting file upload process:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      employeeId,
      profileId: profile?.id,
      userId: user?.id
    });

    if (!profile?.id && !user?.id) {
      console.error('❌ No user authentication found');
      toast({
        title: 'שגיאה',
        description: 'נדרש להתחבר למערכת כדי להעלות קבצים',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploading(true);
      
      // Check auth session first
      console.log('🔐 Checking authentication session...');
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Session error:', sessionError);
        throw new Error(`Session error: ${sessionError.message}`);
      }
      
      if (!sessionData.session) {
        console.error('❌ No active session found');
        throw new Error('No active session - please login again');
      }
      
      console.log('✅ Valid session confirmed');
      
      // Generate unique file path
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const fileName = `${timestamp}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `employee-documents/${employeeId}/${fileName}`;
      
      console.log('📁 Uploading to path:', filePath);
      
      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('employee-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Storage upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log('✅ File uploaded to storage successfully:', uploadData.path);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('employee-files')
        .getPublicUrl(filePath);

      console.log('🔗 Generated public URL:', urlData.publicUrl);

      // Save document record
      const uploadedBy = profile?.id || user?.id;
      console.log('💾 Saving document record with uploadedBy:', uploadedBy);
      
      const { data: documentData, error: insertError } = await supabase
        .from('employee_documents')
        .insert({
          employee_id: employeeId,
          document_name: file.name,
          document_type: getFileType(file.name),
          file_url: urlData.publicUrl,
          uploaded_by: uploadedBy,
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Database insert error:', insertError);
        // Clean up uploaded file if database insert fails
        await supabase.storage.from('employee-files').remove([uploadData.path]);
        throw new Error(`Database error: ${insertError.message}`);
      }
      
      console.log('✅ Document record saved successfully:', documentData);
      
      toast({
        title: 'הצלחה',
        description: 'המסמך הועלה בהצלחה',
      });
      
      queryClient.invalidateQueries({ queryKey: ['employee-documents', employeeId] });
    } catch (error) {
      console.error('💥 File upload error:', error);
      toast({
        title: 'שגיאה',
        description: error instanceof Error 
          ? `שגיאה בהעלאת המסמך: ${error.message}` 
          : 'לא ניתן להעלות את המסמך',
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

  const handleDelete = (document: any) => {
    const pathParts = new URL(document.file_url).pathname.split('/');
    const filePath = decodeURIComponent(pathParts.slice(2).join('/'));
    deleteDocumentMutation.mutate({ documentId: document.id, filePath });
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
                        onClick={() => handleDelete(document)}
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
