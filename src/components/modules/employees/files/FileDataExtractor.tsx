import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Download, 
  User, 
  Calendar,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Briefcase
} from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface ExtractedData {
  personal_info?: {
    name?: string;
    id_number?: string;
    birth_date?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  employment_info?: {
    position?: string;
    start_date?: string;
    salary?: string;
    department?: string;
  };
  documents?: {
    type?: string;
    issue_date?: string;
    expiry_date?: string;
    document_number?: string;
  };
  education?: {
    degree?: string;
    institution?: string;
    graduation_year?: string;
  };
}

interface FileDataExtractorProps {
  file: {
    id: string;
    file_name: string;
    extracted_data: ExtractedData;
    is_auto_extracted: boolean;
    created_at: string;
  };
  onApplyToProfile?: (data: ExtractedData) => void;
}

// קומפוננט להצגת נתונים שחולצו מקבצים
export const FileDataExtractor: React.FC<FileDataExtractorProps> = ({
  file,
  onApplyToProfile
}) => {
  const [applying, setApplying] = useState(false);

  const handleApplyToProfile = async () => {
    if (!onApplyToProfile) return;
    
    setApplying(true);
    try {
      await onApplyToProfile(file.extracted_data);
    } finally {
      setApplying(false);
    }
  };

  const hasExtractedData = file.extracted_data && Object.keys(file.extracted_data).length > 0;

  if (!hasExtractedData) {
    return (
      <Card className="w-full" dir="rtl">
        <CardContent className="p-6 text-center text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>לא נמצאו נתונים לחילוץ בקובץ זה</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full" dir="rtl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            נתונים שחולצו מהקובץ
          </CardTitle>
          <div className="flex items-center gap-2">
            {file.is_auto_extracted && (
              <Badge variant="secondary">חילוץ אוטומטי</Badge>
            )}
            <Badge variant="outline">
              {format(new Date(file.created_at), 'dd/MM/yyyy', { locale: he })}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* מידע אישי */}
        {file.extracted_data.personal_info && (
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              מידע אישי
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {file.extracted_data.personal_info.name && (
                <div>
                  <span className="font-medium">שם:</span> {file.extracted_data.personal_info.name}
                </div>
              )}
              {file.extracted_data.personal_info.id_number && (
                <div className="flex items-center gap-1">
                  <CreditCard className="h-3 w-3" />
                  <span className="font-medium">ת.ז:</span> {file.extracted_data.personal_info.id_number}
                </div>
              )}
              {file.extracted_data.personal_info.birth_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span className="font-medium">תאריך לידה:</span> {file.extracted_data.personal_info.birth_date}
                </div>
              )}
              {file.extracted_data.personal_info.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  <span className="font-medium">טלפון:</span> {file.extracted_data.personal_info.phone}
                </div>
              )}
              {file.extracted_data.personal_info.email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  <span className="font-medium">אימייל:</span> {file.extracted_data.personal_info.email}
                </div>
              )}
              {file.extracted_data.personal_info.address && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span className="font-medium">כתובת:</span> {file.extracted_data.personal_info.address}
                </div>
              )}
            </div>
          </div>
        )}

        {/* מידע תעסוקתי */}
        {file.extracted_data.employment_info && (
          <>
            <Separator />
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                מידע תעסוקתי
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {file.extracted_data.employment_info.position && (
                  <div>
                    <span className="font-medium">תפקיד:</span> {file.extracted_data.employment_info.position}
                  </div>
                )}
                {file.extracted_data.employment_info.start_date && (
                  <div>
                    <span className="font-medium">תאריך התחלה:</span> {file.extracted_data.employment_info.start_date}
                  </div>
                )}
                {file.extracted_data.employment_info.salary && (
                  <div>
                    <span className="font-medium">שכר:</span> {file.extracted_data.employment_info.salary}
                  </div>
                )}
                {file.extracted_data.employment_info.department && (
                  <div>
                    <span className="font-medium">מחלקה:</span> {file.extracted_data.employment_info.department}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* מידע מסמכים */}
        {file.extracted_data.documents && (
          <>
            <Separator />
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                פרטי מסמך
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {file.extracted_data.documents.type && (
                  <div>
                    <span className="font-medium">סוג מסמך:</span> {file.extracted_data.documents.type}
                  </div>
                )}
                {file.extracted_data.documents.document_number && (
                  <div>
                    <span className="font-medium">מספר מסמך:</span> {file.extracted_data.documents.document_number}
                  </div>
                )}
                {file.extracted_data.documents.issue_date && (
                  <div>
                    <span className="font-medium">תאריך הנפקה:</span> {file.extracted_data.documents.issue_date}
                  </div>
                )}
                {file.extracted_data.documents.expiry_date && (
                  <div>
                    <span className="font-medium">תאריך תפוגה:</span> {file.extracted_data.documents.expiry_date}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* מידע השכלה */}
        {file.extracted_data.education && (
          <>
            <Separator />
            <div>
              <h4 className="font-semibold mb-3">השכלה</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {file.extracted_data.education.degree && (
                  <div>
                    <span className="font-medium">תואר:</span> {file.extracted_data.education.degree}
                  </div>
                )}
                {file.extracted_data.education.institution && (
                  <div>
                    <span className="font-medium">מוסד:</span> {file.extracted_data.education.institution}
                  </div>
                )}
                {file.extracted_data.education.graduation_year && (
                  <div>
                    <span className="font-medium">שנת סיום:</span> {file.extracted_data.education.graduation_year}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* כפתור העברה לפרופיל */}
        {onApplyToProfile && (
          <>
            <Separator />
            <div className="flex justify-end">
              <Button 
                onClick={handleApplyToProfile}
                disabled={applying}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {applying ? 'מעביר לפרופיל...' : 'העבר נתונים לפרופיל העובד'}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};