
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useBusiness } from '@/hooks/useBusiness';
import { WeeklyShiftService } from '@/services/WeeklyShiftService';
import { Search, Calendar, User, Clock, MessageSquare, FileText } from 'lucide-react';

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

  const sendWhatsApp = (phone: string | undefined, employeeName: string, weekStart: string, weekEnd: string) => {
    if (!phone) {
      toast({
        title: 'שגיאה',
        description: 'לא נמצא מספר טלפון לעובד זה',
        variant: 'destructive',
      });
      return;
    }

    const message = `שלום ${employeeName}, קיבלנו את בקשת המשמרות שלך לשבוע ${new Date(weekStart).toLocaleDateString('he-IL')} - ${new Date(weekEnd).toLocaleDateString('he-IL')}. תודה!`;
    
    const cleanPhone = phone.replace(/[^\d]/g, '');
    const whatsappPhone = cleanPhone.startsWith('0') ? '972' + cleanPhone.slice(1) : cleanPhone;
    const url = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;
    
    window.open(url, '_blank');
  };

  const filteredSubmissions = submissions?.filter(submission =>
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
                  {new Set(submissions?.map(s => s.employee_id)).size || 0}
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
                  {submissions?.filter(s => {
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
        {filteredSubmissions?.map((submission) => (
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
                <div className="text-left">
                  <Badge variant="default">הוגש</Badge>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(submission.submitted_at).toLocaleDateString('he-IL')} {new Date(submission.submitted_at).toLocaleTimeString('he-IL')}
                  </p>
                </div>
              </div>
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
                  <h4 className="font-medium">משמרות שהוגשו ({submission.shifts?.length || 0}):</h4>
                  
                  {submission.shifts?.map((shift: any, index: number) => (
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

                <div className="flex justify-end">
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
            </CardContent>
          </Card>
        ))}
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
