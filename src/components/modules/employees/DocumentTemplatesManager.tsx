import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Edit3, Trash2, Send, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SendTemplateDialog } from './SendTemplateDialog';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface DocumentTemplate {
  id: string;
  document_name: string;
  document_type: string;
  file_url: string;
  status: string;
  created_at: string;
  is_template: boolean;
}

interface DocumentTemplatesManagerProps {
  businessId?: string;
}

const PREDEFINED_TEMPLATES = [
  { name: 'מכתב פיטורים', type: 'termination_letter' },
  { name: 'מכתב סיום העסקה', type: 'employment_end_letter' },
  { name: 'מכתב הודעת התפטרות', type: 'resignation_notice' },
  { name: 'חוזה עבודה', type: 'employment_contract' },
  { name: 'הסכם סודיות', type: 'confidentiality_agreement' },
  { name: 'הצהרת בריאות', type: 'health_declaration' },
];

export const DocumentTemplatesManager: React.FC<DocumentTemplatesManagerProps> = ({ businessId }) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    type: '',
    content: '',
    file: null as File | null
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // שאילתה לקבלת תבניות המסמכים
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['document-templates', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_documents')
        .select('*')
        .eq('is_template', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DocumentTemplate[];
    },
  });

  // מוטציה ליצירת תבנית חדשה
  const createTemplateMutation = useMutation({
    mutationFn: async (templateData: typeof newTemplate) => {
      let fileUrl = '';

      if (templateData.file) {
        const fileExt = templateData.file.name.split('.').pop();
        const fileName = `template_${Date.now()}.${fileExt}`;
        const filePath = `document-templates/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('employee-files')
          .upload(filePath, templateData.file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('employee-files')
          .getPublicUrl(filePath);

        fileUrl = urlData.publicUrl;
      }

      const { data: user } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('employee_documents')
        .insert({
          document_name: templateData.name,
          document_type: templateData.type,
          file_url: fileUrl,
          uploaded_by: user.user?.id,
          status: 'active',
          is_template: true,
          employee_id: null
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-templates'] });
      toast({
        title: 'תבנית נוצרה בהצלחה',
        description: 'התבנית החדשה זמינה לשימוש',
      });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      console.error('Error creating template:', error);
      toast({
        title: 'שגיאה ביצירת התבנית',
        description: 'אנא נסה שוב',
        variant: 'destructive',
      });
    },
  });

  // מוטציה למחיקת תבנית
  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await supabase
        .from('employee_documents')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-templates'] });
      toast({
        title: 'תבנית נמחקה בהצלחה',
      });
    },
    onError: (error) => {
      console.error('Error deleting template:', error);
      toast({
        title: 'שגיאה במחיקת התבנית',
        description: 'אנא נסה שוב',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setNewTemplate({
      name: '',
      type: '',
      content: '',
      file: null
    });
  };

  const handleCreateTemplate = () => {
    if (!newTemplate.name || !newTemplate.type) {
      toast({
        title: 'חסרים פרטים',
        description: 'אנא מלא את כל השדות הנדרשים',
        variant: 'destructive',
      });
      return;
    }

    createTemplateMutation.mutate(newTemplate);
  };

  const handleDeleteTemplate = (template: DocumentTemplate) => {
    if (window.confirm(`האם אתה בטוח שברצונך למחוק את התבנית "${template.document_name}"?`)) {
      deleteTemplateMutation.mutate(template.id);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewTemplate(prev => ({ ...prev, file }));
    }
  };

  const handleSelectPredefinedTemplate = (templateType: string) => {
    const template = PREDEFINED_TEMPLATES.find(t => t.type === templateType);
    if (template) {
      setNewTemplate(prev => ({
        ...prev,
        name: template.name,
        type: template.type
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="mr-2">טוען תבניות...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            <CardTitle>תבניות מסמכים</CardTitle>
          </div>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            תבנית חדשה
          </Button>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p>אין תבניות מסמכים עדיין</p>
              <p className="text-sm">צור תבנית ראשונה כדי להתחיל</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <Card key={template.id} className="border-2 hover:border-blue-200 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-lg truncate">{template.document_name}</h3>
                        <Badge variant="outline" className="mt-1">
                          {template.document_type}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 mb-3">
                      נוצר: {new Date(template.created_at).toLocaleDateString('he-IL')}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => {
                          setSelectedTemplate(template);
                          setIsSendDialogOpen(true);
                        }}
                        className="flex-1"
                      >
                        <Send className="h-4 w-4 ml-1" />
                        שלח
                      </Button>
                      {template.file_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(template.file_url, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteTemplate(template)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* דיאלוג ליצירת תבנית חדשה */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>צור תבנית מסמך חדשה</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">בחר תבנית קיימת (אופציונלי)</label>
              <Select onValueChange={handleSelectPredefinedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר מתבניות קיימות או צור חדשה" />
                </SelectTrigger>
                <SelectContent>
                  {PREDEFINED_TEMPLATES.map((template) => (
                    <SelectItem key={template.type} value={template.type}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">שם התבנית *</label>
              <Input
                value={newTemplate.name}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                placeholder="לדוגמה: מכתב פיטורים"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">סוג המסמך *</label>
              <Input
                value={newTemplate.type}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, type: e.target.value }))}
                placeholder="לדוגמה: termination_letter"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">קובץ תבנית (PDF, DOC, DOCX)</label>
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
              />
              {newTemplate.file && (
                <p className="text-sm text-gray-600 mt-1">
                  נבחר: {newTemplate.file.name}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                resetForm();
              }}
            >
              ביטול
            </Button>
            <Button
              onClick={handleCreateTemplate}
              disabled={createTemplateMutation.isPending}
            >
              {createTemplateMutation.isPending ? 'יוצר...' : 'צור תבנית'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* דיאלוג לשליחת תבנית לעובדים */}
      {selectedTemplate && (
        <SendTemplateDialog
          open={isSendDialogOpen}
          onOpenChange={setIsSendDialogOpen}
          template={selectedTemplate}
        />
      )}
    </div>
  );
};