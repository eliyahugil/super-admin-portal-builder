
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useEmployeesOptions } from './hooks/useEmployeesOptions';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DocumentUploadDialog: React.FC<DocumentUploadDialogProps> = ({ open, onOpenChange }) => {
  const [file, setFile] = useState<File | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const options = useEmployeesOptions();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleEmployeeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEmployee(e.target.value);
  };

  const handleUpload = async () => {
    if (!file || !selectedEmployee) {
      toast({ title: 'נא למלא את כל השדות', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const filePath = `employee-documents/${selectedEmployee}/${timestamp}-${file.name}`;

      // העלאת קובץ ל-Supabase Storage - יש ליצור באקט בשם employee-files
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('employee-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('employee-files')
        .getPublicUrl(filePath);

      // שמירת רשומת מסמך בבסיס נתונים
      const { data: user } = await supabase.auth.getUser();
      const { error: insertError } = await supabase
        .from('employee_documents')
        .insert({
          employee_id: selectedEmployee,
          document_name: file.name,
          document_type: fileExt,
          file_url: urlData.publicUrl,
          uploaded_by: user.user?.id,
        });

      if (insertError) throw insertError;

      toast({
        title: 'המסמך הועלה ונשלח בהצלחה',
        description: 'העובד יתבקש לחתום על המסמך',
      });
      onOpenChange(false);
      setFile(null);
      setSelectedEmployee('');
    } catch (error: any) {
      toast({
        title: 'שגיאה',
        description: 'לא ניתן היה להעלות את המסמך. ודאו שיש הרשאות לבאקט.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>העלה מסמך חדש לחתימה</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={handleFileChange} disabled={loading} />
          <select
            className="block w-full border p-2 rounded"
            value={selectedEmployee}
            onChange={handleEmployeeSelect}
            disabled={loading}
          >
            <option value="">בחר עובד</option>
            {options.map(opt => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <DialogFooter>
          <Button
            disabled={!file || !selectedEmployee || loading}
            onClick={handleUpload}
          >
            העלה ושלח לחתימה
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
