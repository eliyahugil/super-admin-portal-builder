
import React, { useState } from 'react';
import { DocumentUploadDialog } from '@/components/modules/employees/DocumentUploadDialog';
import { EmployeeDocuments } from '@/components/modules/employees/EmployeeDocuments';
import { Button } from '@/components/ui/button';
import { FilePlus } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';

const EmployeeDocumentsPage: React.FC = () => {
  const [uploadOpen, setUploadOpen] = useState(false);
  const { user } = useAuth();

  console.log('📄 EmployeeDocumentsPage - Rendering with user:', user?.role);

  return (
    <div className="max-w-7xl mx-auto py-10" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">מסמכים לחתימה</h1>
        <Button
          variant="default"
          onClick={() => setUploadOpen(true)}
          className="flex items-center gap-1"
        >
          <FilePlus className="h-5 w-5 ml-1" />
          מסמך חדש לחתימה
        </Button>
      </div>
      <div className="bg-purple-50 rounded-lg p-8 text-purple-700 mb-4">
        כאן ניתן להעלות מסמכים, לשלוח אותם לעובדים לחתימה ולעקוב אחרי הסטטוס של כל מסמך.
      </div>
      <DocumentUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
      {/* גלריית מסמכים למנהל - הצגת סטטוס ותזכורות */}
      <div className="mt-8">
        <EmployeeDocuments
          employeeId={''} // עמוד זה הוא לריכוז כל המסמכים של העסק, למנהל. ניתן להוסיף פילטר עובד בהמשך
          employeeName="(כל העובדים)"
          canEdit={true}
        />
      </div>
    </div>
  );
};

export default EmployeeDocumentsPage;
