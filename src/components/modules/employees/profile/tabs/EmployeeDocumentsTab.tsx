import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, FolderOpen, Clock, CheckCircle2, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EmployeeTemplateSelector } from '../../EmployeeTemplateSelector';
import { EmployeeDocuments } from '../../EmployeeDocuments';
import { EmployeeAdvancedFileManager } from '../../EmployeeAdvancedFileManager';
import type { Employee } from '@/types/supabase';

interface EmployeeDocumentsTabProps {
  employee: Employee;
  employeeId: string;
  employeeName: string;
}

// כרטיסיית מסמכים בפרופיל עובד - כולל חתימות דיגיטליות וקבצים רגילים
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

      {/* Signed documents and signature status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              מסמכים שנשלחו לחתימה
            </div>
            <label htmlFor="fileUploadNew" className="cursor-pointer">
              <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm">
                <Upload className="h-4 w-4" />
                העלה קובץ חדש
              </div>
              <input
                id="fileUploadNew"
                type="file"
                className="hidden"
                accept="*/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    alert(`נבחר קובץ: ${file.name}`);
                  }
                }}
              />
            </label>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmployeeDocuments
            employeeId={employeeId}
            employeeName={employeeName}
            canEdit={false}
          />
        </CardContent>
      </Card>

      <Separator />

      {/* NEW: File management with approval system */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            ניהול קבצים עם מערכת אישורים
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="regular" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="regular" className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                קבצים רגילים
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                ממתין לאישור
                <Badge variant="secondary" className="ml-1">0</Badge>
              </TabsTrigger>
              <TabsTrigger value="approved" className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                מאושרים
              </TabsTrigger>
            </TabsList>

            <TabsContent value="regular" className="mt-6">
              <EmployeeAdvancedFileManager
                employee={employee}
                employeeId={employeeId}
                employeeName={employeeName}
                showApprovalSystem={false}
              />
            </TabsContent>

            <TabsContent value="pending" className="mt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">קבצים ממתינים לאישור מנהל</h3>
                  <label htmlFor="fileUploadApproval" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                      <Upload className="h-4 w-4" />
                      העלה קובץ לאישור
                    </div>
                    <input
                      id="fileUploadApproval"
                      type="file"
                      className="hidden"
                      accept="*/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          console.log('File selected for approval:', file.name);
                          // כאן נוסיף את הלוגיקה להעלאת הקובץ
                        }
                      }}
                    />
                  </label>
                </div>
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">אין קבצים ממתינים לאישור</h3>
                  <p>השתמש בכפתור למעלה כדי להעלות קובץ שיצטרך אישור מהמנהל</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="approved" className="mt-6">
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">אין קבצים מאושרים</h3>
                <p>קבצים שיאושרו יופיעו כאן עם נתונים שחולצו</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};