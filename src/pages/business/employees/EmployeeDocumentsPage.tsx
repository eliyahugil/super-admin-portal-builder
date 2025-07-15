
import React, { useState } from 'react';
import { DocumentUploadDialog } from '@/components/modules/employees/DocumentUploadDialog';
import { EmployeeDocuments } from '@/components/modules/employees/EmployeeDocuments';
import { DocumentTemplatesManager } from '@/components/modules/employees/DocumentTemplatesManager';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FilePlus, FileText } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

const EmployeeDocumentsPage: React.FC = () => {
  const [uploadOpen, setUploadOpen] = useState(false);
  const { user } = useAuth();
  const { businessId } = useCurrentBusiness();

  console.log('📄 EmployeeDocumentsPage - Rendering with user:', user?.role);

  return (
    <div className="max-w-7xl mx-auto py-10" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">ניהול מסמכים</h1>
        <Button
          variant="default"
          onClick={() => setUploadOpen(true)}
          className="flex items-center gap-1"
        >
          <FilePlus className="h-5 w-5 ml-1" />
          מסמך חדש לחתימה
        </Button>
      </div>
      
      <div className="bg-purple-50 rounded-lg p-8 text-purple-700 mb-6">
        כאן ניתן לנהל תבניות מסמכים, להעלות מסמכים, לשלוח אותם לעובדים לחתימה ולעקוב אחרי הסטטוס של כל מסמך.
      </div>

      <Tabs defaultValue="documents" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FilePlus className="h-4 w-4" />
            מסמכים לחתימה
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            תבניות מסמכים
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="mt-6">
          <EmployeeDocuments
            employeeId={''} // עמוד זה הוא לריכוז כל המסמכים של העסק, למנהל
            employeeName="(כל העובדים)"
            canEdit={true}
          />
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <DocumentTemplatesManager businessId={businessId} />
        </TabsContent>
      </Tabs>

      <DocumentUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  );
};

export default EmployeeDocumentsPage;
