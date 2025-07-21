import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, FolderOpen, Clock, CheckCircle2, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EmployeeTemplateSelector } from '../../EmployeeTemplateSelector';
import type { Employee } from '@/types/supabase';

interface EmployeeDocumentsTabProps {
  employee: Employee;
  employeeId: string;
  employeeName: string;
}

// כרטיסיית מסמכים בפרופיל עובד אישי
export const EmployeeDocumentsTab: React.FC<EmployeeDocumentsTabProps> = ({
  employee,
  employeeId,
  employeeName
}) => {
  return (
    <div className="space-y-6" dir="rtl">
      {/* Template selector for employee */}
      <EmployeeTemplateSelector
        employeeId={employeeId}
        employeeName={employeeName}
      />

      <Separator />

      {/* Personal files upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              הקבצים האישיים שלי
            </div>
            <label htmlFor="fileUploadPersonal" className="cursor-pointer">
              <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm">
                <Upload className="h-4 w-4" />
                העלה קובץ אישי
              </div>
              <input
                id="fileUploadPersonal"
                type="file"
                className="hidden"
                accept="*/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    alert(`נבחר קובץ: ${file.name} - הקובץ יישלח לאישור המנהל`);
                  }
                }}
              />
            </label>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">עדיין לא העלת קבצים</h3>
            <p>השתמש בכפתור למעלה כדי להעלות קבצים אישיים</p>
            <p className="text-sm mt-2">הקבצים יישלחו לאישור המנהל לפני שיופיעו כאן</p>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Document status tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            סטטוס הקבצים שלי
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                ממתין לאישור
                <Badge variant="secondary" className="ml-1">0</Badge>
              </TabsTrigger>
              <TabsTrigger value="approved" className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                מאושרים
              </TabsTrigger>
              <TabsTrigger value="rejected" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                נדחו
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-6">
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">אין קבצים ממתינים לאישור</h3>
                <p>קבצים שתעלה יופיעו כאן עד שהמנהל יאשר אותם</p>
              </div>
            </TabsContent>

            <TabsContent value="approved" className="mt-6">
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">אין קבצים מאושרים</h3>
                <p>קבצים שהמנהל אישר יופיעו כאן</p>
              </div>
            </TabsContent>

            <TabsContent value="rejected" className="mt-6">
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">אין קבצים שנדחו</h3>
                <p>קבצים שהמנהל דחה יופיעו כאן עם הסיבה</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};