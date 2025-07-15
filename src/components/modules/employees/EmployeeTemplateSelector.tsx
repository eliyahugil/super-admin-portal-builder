import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Send, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface EmployeeTemplateSelectorProps {
  employeeId: string;
  employeeName: string;
}

interface TemplateDocument {
  id: string;
  document_name: string;
  document_type: string;
  file_url: string;
  created_at: string;
}

export const EmployeeTemplateSelector: React.FC<EmployeeTemplateSelectorProps> = ({
  employeeId,
  employeeName
}) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  // שליפת תבניות זמינות
  const { data: templates, isLoading } = useQuery({
    queryKey: ['template-documents', profile?.business_id],
    queryFn: async (): Promise<TemplateDocument[]> => {
      if (!profile?.business_id) return [];

      const { data, error } = await supabase
        .from('employee_documents')
        .select('id, document_name, document_type, file_url, created_at')
        .eq('is_template', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching templates:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!profile?.business_id,
  });

  const handleTemplateToggle = (templateId: string) => {
    setSelectedTemplates(prev => 
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const handleSendTemplates = async () => {
    if (selectedTemplates.length === 0) {
      toast({
        title: 'לא נבחרו תבניות',
        description: 'יש לבחור לפחות תבנית אחת לשליחה',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const templateId of selectedTemplates) {
        const template = templates?.find(t => t.id === templateId);
        if (!template) continue;

        // יצירת חתימה דיגיטלית עבור העובד והתבנית
        const { error } = await supabase
          .from('employee_document_signatures')
          .insert({
            employee_id: employeeId,
            document_id: templateId,
            status: 'pending',
            sent_at: new Date().toISOString(),
          });

        if (error) {
          console.error('Error creating signature for template:', templateId, error);
          errorCount++;
        } else {
          successCount++;
        }
      }

      if (successCount > 0) {
        toast({
          title: 'תבניות נשלחו בהצלחה',
          description: `${successCount} תבניות נשלחו לחתימה ל${employeeName}`,
        });
        setSelectedTemplates([]);
      }

      if (errorCount > 0) {
        toast({
          title: 'שגיאה בשליחת חלק מהתבניות',
          description: `${errorCount} תבניות לא נשלחו בגלל שגיאה`,
          variant: 'destructive',
        });
      }

    } catch (error) {
      console.error('Error sending templates:', error);
      toast({
        title: 'שגיאה בשליחה',
        description: 'אירעה שגיאה בשליחת התבניות',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="mr-2">טוען תבניות...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!templates || templates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            תבניות לחתימה
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            לא נמצאו תבניות זמינות לשליחה
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
          שליחת תבניות לחתימה
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          עבור: {employeeName}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* רשימת תבניות */}
        <div className="space-y-2">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedTemplates.includes(template.id)
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:bg-muted/50'
              }`}
              onClick={() => handleTemplateToggle(template.id)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded border-2 ${
                  selectedTemplates.includes(template.id)
                    ? 'bg-primary border-primary'
                    : 'border-muted-foreground'
                }`}>
                  {selectedTemplates.includes(template.id) && (
                    <div className="text-primary-foreground text-xs flex items-center justify-center">✓</div>
                  )}
                </div>
                <div>
                  <div className="font-medium">{template.document_name}</div>
                  <div className="text-sm text-muted-foreground">
                    <Badge variant="secondary">{template.document_type}</Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* כפתור שליחה */}
        {selectedTemplates.length > 0 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              נבחרו {selectedTemplates.length} תבניות
            </div>
            <Button
              onClick={handleSendTemplates}
              disabled={sending || selectedTemplates.length === 0}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              {sending ? 'שולח...' : 'שלח לחתימה'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};