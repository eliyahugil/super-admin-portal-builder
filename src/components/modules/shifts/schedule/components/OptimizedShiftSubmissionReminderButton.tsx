
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Bell, Users, Clock, AlertCircle } from 'lucide-react';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Employee } from '../types';

interface OptimizedShiftSubmissionReminderButtonProps {
  employees: Employee[];
  businessId: string;
}

export const OptimizedShiftSubmissionReminderButton: React.FC<OptimizedShiftSubmissionReminderButtonProps> = ({
  employees,
  businessId
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);

  // Only fetch when dialog is open to improve performance
  const { data: unsubmittedEmployees = [], isLoading } = useQuery({
    queryKey: ['unsubmitted-employees', businessId],
    queryFn: async () => {
      if (!businessId) return [];
      
      const { data: submissions, error } = await supabase
        .from('shift_submissions')
        .select('employee_id')
        .eq('business_id', businessId)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Last 7 days

      if (error) {
        console.error('Error fetching submissions:', error);
        return [];
      }

      const submittedEmployeeIds = new Set(submissions?.map(s => s.employee_id) || []);
      
      return employees.filter(emp => 
        emp.is_active !== false && 
        emp.is_archived !== true && 
        !submittedEmployeeIds.has(emp.id)
      );
    },
    enabled: isOpen && !!businessId && employees.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  const unsubmittedCount = useMemo(() => {
    return unsubmittedEmployees.length;
  }, [unsubmittedEmployees]);

  const handleSendReminder = async () => {
    if (unsubmittedEmployees.length === 0) return;

    setSendingReminder(true);
    
    try {
      const { error } = await supabase
        .from('shift_submission_reminders')
        .insert({
          business_id: businessId,
          employee_ids: unsubmittedEmployees.map(emp => emp.id),
          reminder_type: 'weekly_submission',
          sent_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success(`נשלחה תזכורת ל-${unsubmittedEmployees.length} עובדים`);
      setIsOpen(false);
      
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast.error('שגיאה בשליחת התזכורת');
    } finally {
      setSendingReminder(false);
    }
  };

  // Show count badge only when there are unsubmitted employees
  const shouldShowBadge = unsubmittedCount > 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="relative"
          disabled={employees.length === 0}
        >
          <Bell className="h-4 w-4" />
          <span className="hidden sm:inline ml-2">תזכורת הגשה</span>
          {shouldShowBadge && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unsubmittedCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            תזכורת הגשת משמרות
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    סיכום הגשות
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">סך הכל עובדים פעילים:</span>
                    <Badge variant="secondary">{employees.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">הגישו השבוע:</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {employees.length - unsubmittedCount}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">לא הגישו:</span>
                    <Badge variant="destructive">{unsubmittedCount}</Badge>
                  </div>
                </CardContent>
              </Card>

              {unsubmittedCount > 0 && (
                <>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        עובדים שלא הגישו
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {unsubmittedEmployees.map(employee => (
                          <div key={employee.id} className="flex items-center justify-between text-sm">
                            <span>{employee.first_name} {employee.last_name}</span>
                            <Clock className="h-3 w-3 text-gray-400" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">שליחת תזכורת</span>
                    </div>
                    <p className="text-sm text-yellow-700 mt-1">
                      תזכורת תישלח לכל העובדים שלא הגישו בקשות משמרות השבוע
                    </p>
                  </div>

                  <Button 
                    onClick={handleSendReminder}
                    disabled={sendingReminder}
                    className="w-full"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    {sendingReminder ? 'שולח תזכורת...' : `שלח תזכורת ל-${unsubmittedCount} עובדים`}
                  </Button>
                </>
              )}

              {unsubmittedCount === 0 && (
                <div className="text-center py-4">
                  <div className="mb-2">
                    <Users className="h-12 w-12 text-green-500 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-green-800 mb-2">כל העובדים הגישו!</h3>
                  <p className="text-sm text-green-600">
                    כל העובדים הפעילים הגישו בקשות משמרות השבוע
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
