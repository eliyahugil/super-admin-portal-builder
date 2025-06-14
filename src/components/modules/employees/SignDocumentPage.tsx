
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { FileText, CheckCircle, Clock, AlertCircle, Signature } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Type for digital signature data
interface DigitalSignatureData {
  signature_text: string;
  signed_by: string;
  signed_at: string;
  ip_address?: string;
  user_agent?: string;
}

// Type guard to check if data is a valid signature object
const isValidSignatureData = (data: any): data is DigitalSignatureData => {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.signature_text === 'string' &&
    typeof data.signed_by === 'string' &&
    typeof data.signed_at === 'string'
  );
};

// עמוד חתימה דיגיטלית לעובדים
export const SignDocumentPage: React.FC = () => {
  const { documentId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [digitalSignature, setDigitalSignature] = useState('');
  const [isSigning, setIsSigning] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // שליפת פרטי המסמך
  const { data: document, isLoading, error } = useQuery({
    queryKey: ['signature-document', documentId],
    queryFn: async () => {
      if (!documentId) throw new Error('Document ID is required');
      
      const { data, error } = await supabase
        .from('employee_documents')
        .select(`
          *,
          assignee:employees!employee_documents_assignee_id_fkey(first_name, last_name, employee_id),
          uploaded_by_profile:profiles!employee_documents_uploaded_by_fkey(full_name)
        `)
        .eq('id', documentId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!documentId,
  });

  // מוטציה לחתימה על המסמך
  const signDocumentMutation = useMutation({
    mutationFn: async () => {
      if (!documentId || !digitalSignature.trim()) {
        throw new Error('חתימה דיגיטלית נדרשת');
      }

      const signatureData: DigitalSignatureData = {
        signature_text: digitalSignature.trim(),
        signed_by: document?.assignee?.first_name + ' ' + document?.assignee?.last_name,
        signed_at: new Date().toISOString(),
        ip_address: 'user_ip', // ניתן להוסיף כאן זיהוי IP אמיתי
        user_agent: navigator.userAgent
      };

      const { error } = await supabase
        .from('employee_documents')
        .update({
          status: 'signed',
          signed_at: new Date().toISOString(),
          digital_signature_data: signatureData
        })
        .eq('id', documentId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'הצלחה!',
        description: 'המסמך נחתם בהצלחה',
      });
      queryClient.invalidateQueries({ queryKey: ['signature-document', documentId] });
    },
    onError: (error: any) => {
      toast({
        title: 'שגיאה',
        description: error.message || 'לא ניתן לחתום על המסמך',
        variant: 'destructive',
      });
    },
  });

  const handleSign = async () => {
    if (!digitalSignature.trim()) {
      toast({
        title: 'שגיאה',
        description: 'יש להזין חתימה דיגיטלית',
        variant: 'destructive',
      });
      return;
    }

    setIsSigning(true);
    try {
      await signDocumentMutation.mutateAsync();
    } finally {
      setIsSigning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4" dir="rtl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4" dir="rtl">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">מסמך לא נמצא</h2>
            <p className="text-gray-600">המסמך שביקשת לחתום עליו לא נמצא או שאין לך הרשאה לצפות בו.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isAlreadySigned = document.status === 'signed' || document.signed_at;
  const signatureData = isValidSignatureData(document.digital_signature_data) 
    ? document.digital_signature_data 
    : null;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4" dir="rtl">
      <div className="space-y-6">
        {/* כותרת */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">חתימה דיגיטלית</h1>
          <p className="text-gray-600">חתום על המסמך באופן דיגיטלי</p>
        </div>

        {/* פרטי המסמך */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600" />
              פרטי המסמך
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">שם המסמך:</label>
                <p className="text-lg font-medium">{document.document_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">סטטוס:</label>
                <div className="mt-1">
                  {isAlreadySigned ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      נחתם
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                      <Clock className="h-4 w-4 mr-1" />
                      ממתין לחתימה
                    </Badge>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">תאריך יצירה:</label>
                <p>{format(new Date(document.created_at), 'dd/MM/yyyy HH:mm', { locale: he })}</p>
              </div>
              {isAlreadySigned && document.signed_at && (
                <div>
                  <label className="text-sm font-medium text-gray-700">תאריך חתימה:</label>
                  <p>{format(new Date(document.signed_at), 'dd/MM/yyyy HH:mm', { locale: he })}</p>
                </div>
              )}
            </div>

            {/* תצוגת המסמך */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-medium mb-2">תוכן המסמך:</h3>
              <div className="bg-white border rounded p-4 max-h-96 overflow-y-auto">
                {document.file_url ? (
                  <iframe
                    src={document.file_url}
                    className="w-full h-80"
                    title={document.document_name}
                  />
                ) : (
                  <p className="text-gray-500">לא ניתן להציג את תוכן המסמך</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* אזור חתימה */}
        {!isAlreadySigned && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Signature className="h-6 w-6 text-green-600" />
                חתימה דיגיטלית
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  הזן את שמך המלא כחתימה דיגיטלית:
                </label>
                <Textarea
                  value={digitalSignature}
                  onChange={(e) => setDigitalSignature(e.target.value)}
                  placeholder="לדוגמה: יוחנן ישראלי"
                  className="text-lg font-cursive"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">
                  החתימה הדיגיטלית מהווה הסכמה משפטית לתוכן המסמך
                </p>
              </div>
              
              <Button
                onClick={handleSign}
                disabled={isSigning || !digitalSignature.trim()}
                className="w-full"
                size="lg"
              >
                {isSigning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    חותם...
                  </>
                ) : (
                  <>
                    <Signature className="h-4 w-4 mr-2" />
                    חתום על המסמך
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* מסמך חתום */}
        {isAlreadySigned && signatureData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-6 w-6" />
                המסמך נחתם בהצלחה
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="space-y-2">
                  <p><strong>נחתם על ידי:</strong> {signatureData.signed_by}</p>
                  <p><strong>חתימה:</strong> {signatureData.signature_text}</p>
                  <p><strong>תאריך חתימה:</strong> {format(new Date(document.signed_at), 'dd/MM/yyyy HH:mm', { locale: he })}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
