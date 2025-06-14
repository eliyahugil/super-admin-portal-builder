
import React, { useState } from 'react';
import { DocumentUploadDialog } from '@/components/modules/employees/DocumentUploadDialog';
import { Button } from '@/components/ui/button';
import { FilePlus } from 'lucide-react';

const EmployeeDocumentsPage: React.FC = () => {
  const [uploadOpen, setUploadOpen] = useState(false);

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
      {/* כאן גלריית מסמכים חתומים ו/או ממתינים לחתימה */}
    </div>
  );
};

export default EmployeeDocumentsPage;
