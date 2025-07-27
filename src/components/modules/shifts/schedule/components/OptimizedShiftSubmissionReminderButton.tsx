
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Bell, Users, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useUnsubmittedEmployees } from './useUnsubmittedEmployees';
import { ReminderStats } from './ReminderStats';
import { UnsubmittedEmployeesList } from './UnsubmittedEmployeesList';

interface BasicEmployee {
  id: string;
  first_name: string;
  last_name: string;
  is_active?: boolean;
  is_archived?: boolean;
}

interface OptimizedShiftSubmissionReminderButtonProps {
  employees: BasicEmployee[];
  businessId: string;
}

export const OptimizedShiftSubmissionReminderButton: React.FC<OptimizedShiftSubmissionReminderButtonProps> = ({
  employees,
  businessId
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);

  const { data: unsubmittedEmployees = [], isLoading } = useUnsubmittedEmployees(
    businessId,
    employees,
    isOpen && !!businessId && employees.length > 0
  );

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
          {unsubmittedEmployees.length > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unsubmittedEmployees.length}
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
              <ReminderStats 
                totalEmployees={employees.length}
                unsubmittedCount={unsubmittedEmployees.length}
              />

              {unsubmittedEmployees.length > 0 && (
                <>
                  <UnsubmittedEmployeesList employees={unsubmittedEmployees} />

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
                    {sendingReminder ? 'שולח תזכורת...' : `שלח תזכורת ל-${unsubmittedEmployees.length} עובדים`}
                  </Button>
                </>
              )}

              {unsubmittedEmployees.length === 0 && (
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
