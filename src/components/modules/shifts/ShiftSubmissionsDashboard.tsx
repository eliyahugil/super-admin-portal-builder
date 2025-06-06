
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useBusiness } from '@/hooks/useBusiness';
import { WeeklyShiftService, ShiftEntry } from '@/services/WeeklyShiftService';
import { Search, Calendar, User, Clock, MessageSquare, FileText, Send } from 'lucide-react';

interface EmployeeData {
  first_name: string;
  last_name: string;
  employee_id: string;
  phone?: string;
  business_id: string;
}

interface ShiftSubmission {
  id: string;
  employee_id: string;
  token: string;
  submitted_at: string;
  shifts: any; // JSON from database
  week_start_date: string;
  week_end_date: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  employee?: EmployeeData;
}

export const ShiftSubmissionsDashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { businessId, isLoading } = useBusiness();

  // Get shift submissions
  const { data: submissions, isLoading: submissionsLoading } = useQuery({
    queryKey: ['shift-submissions', businessId],
    queryFn: async () => {
      if (!businessId) return [];
      return await WeeklyShiftService.getShiftSubmissionsForBusiness(businessId);
    },
    enabled: !!businessId && !isLoading,
  });

  // WhatsApp functions
  const sendWhatsApp = (phone: string | undefined, employeeName: string, weekStart: string, weekEnd: string) => {
    if (!phone) {
      toast({
        title: 'שגיאה',
        description: 'לא נמצא מספר טלפון לעובד זה',
        variant: 'destructive',
      });
      return;
    }

    const message = `שלום ${employeeName}! 👋\n\nקיבלנו את בקשת המשמרות שלך לשבוע ${new Date(weekStart).toLocaleDateString('he-IL')} - ${new Date(weekEnd).toLocaleDateString('he-IL')}.\n\nתודה רבה! ✅\nצוות הניהול`;
    
    const cleanPhone = phone.replace(/[^\d]/g, '');
    const whatsappPhone = cleanPhone.startsWith('0') ? '972' + cleanPhone.slice(1) : cleanPhone;
    const url = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;
    
    window.open(url, '_blank');
    
    toast({
      title: 'נשלח',
      description: `הודעה נשלחה ל${employeeName}`,
    });
  };

  const sendReminderToAll = () => {
    const unsubmittedEmployees = submissions?.filter((s: ShiftSubmission) => !s.submitted_at);
    
    if (!unsubmittedEmployees || unsubmittedEmployees.length === 0) {
      toast({
        title: 'אין מה לשלוח',
        description: 'כל העובדים כבר הגישו משמרות',
      });
      return;
    }

    const reminderMessage = `היי! 👋\n\nתזכורת להגשת משמרות לשבוע הקרוב.\n\nאנא הגישו עד סוף היום.\n\nתודה! 🙏`;
    
    unsubmittedEmployees.forEach((emp: ShiftSubmission) => {
      if (emp.employee?.phone) {
        const cleanPhone = emp.employee.phone.replace(/[^\d]/g, '');
        const whatsappPhone = cleanPhone.startsWith('0') ? '972' + cleanPhone.slice(1) : cleanPhone;
        const url = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(reminderMessage)}`;
        setTimeout(() => window.open(url, '_blank'), 500);
      }
    });

    toast({
      title: 'תזכורות נשלחו',
      description: `נשלחו תזכורות ל${unsubmittedEmployees.length} עובדים`,
    });
  };

  // Parse shifts from JSON and ensure it's an array
  const parseShifts = (shiftsData: any): ShiftEntry[] => {
    if (!shiftsData) return [];
    
    if (typeof shiftsData === 'string') {
      try {
        return JSON.parse(shiftsData);
      } catch {
        return [];
      }
    }
    
    if (Array.isArray(shiftsData)) {
      return shiftsData;
    }
    
    return [];
  };

  const filteredSubmissions = submissions?.filter((submission: ShiftSubmission) =>
    submission.employee?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.employee?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.employee?.employee_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading || submissionsLoading) {
    return <div className="container mx-auto px-4 py-8" dir="rtl">טוען...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">דשבורד הגשות משמרות</h1>
        <p className="text-gray-600">מעקב אחר הגשות משמרות שבועיות מעובדים</p>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 flex gap-4">
        <Button
          onClick={sendReminderToAll}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Send className="h-4 w-4" />
          שלח תזכורת לכולם
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="חפש לפי שם עובד..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">סה"כ הגשות</p>
                <p className="text-2xl font-bold">{submissions?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <User className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">עובדים פעילים</p>
                <p className="text-2xl font-bold">
                  {new Set(submissions?.map((s: ShiftSubmission) => s.employee_id)).size || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">השבוע</p>
                <p className="text-2xl font-bold">
                  {submissions?.filter((s: ShiftSubmission) => {
                    const weekStart = new Date(s.week_start_date);
                    const now = new Date();
                    const thisWeekStart = new Date(now.setDate(now.getDate() - now.getDay()));
                    return weekStart >= thisWeekStart;
                  }).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submissions List */}
      <div className="space-y-6">
        {filteredSubmissions?.map((submission: ShiftSubmission) => {
          const parsedShifts = parseShifts(submission.shifts);
          
          return (
            <Card key={submission.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-blue-600" />
                    <div>
                      <h3 className="font-semibold">
                        {submission.employee?.first_name} {submission.employee?.last_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        מס' עובד: {submission.employee?.employee_id}
                      </p>
                    </div>
                  </div>
                  <div className="text-left flex items-center gap-3">
                    <Badge variant="default">הוגש</Badge>
                    <Button
                      onClick={() => sendWhatsApp(
                        submission.employee?.phone,
                        `${submission.employee?.first_name} ${submission.employee?.last_name}`,
                        submission.week_start_date,
                        submission.week_end_date
                      )}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      שלח בוואטסאפ
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  הוגש: {new Date(submission.submitted_at).toLocaleDateString('he-IL')} {new Date(submission.submitted_at).toLocaleTimeString('he-IL')}
                </p>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      שבוע: {new Date(submission.week_start_date).toLocaleDateString('he-IL')} - {new Date(submission.week_end_date).toLocaleDateString('he-IL')}
                    </span>
                  </div>

                  {submission.notes && (
                    <div className="bg-blue-50 p-3 rounded-md">
                      <p className="text-sm text-blue-800">
                        <strong>הערות כלליות:</strong> {submission.notes}
                      </p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <h4 className="font-medium">משמרות שהוגשו ({parsedShifts.length}):</h4>
                    
                    {parsedShifts.map((shift: ShiftEntry, index: number) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-md">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                          <div>
                            <strong>תאריך:</strong> {new Date(shift.date).toLocaleDateString('he-IL')}
                          </div>
                          <div>
                            <strong>שעות:</strong> {shift.start_time} - {shift.end_time}
                          </div>
                          <div>
                            <strong>סניף:</strong> {shift.branch_preference}
                          </div>
                          {shift.role_preference && (
                            <div>
                              <strong>תפקיד:</strong> {shift.role_preference}
                            </div>
                          )}
                        </div>
                        {shift.notes && (
                          <div className="mt-2 text-sm text-gray-600">
                            <strong>הערות:</strong> {shift.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredSubmissions?.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">אין הגשות משמרות</h3>
          <p className="text-gray-600">לא נמצאו הגשות משמרות במערכת</p>
        </div>
      )}
    </div>
  );
};
