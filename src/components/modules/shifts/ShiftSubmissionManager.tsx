
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Send, Users, Plus, LogIn } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

export const ShiftSubmissionManager: React.FC = () => {
  const [selectedWeek, setSelectedWeek] = useState('');
  const [notes, setNotes] = useState('');
  const [sendingToAll, setSendingToAll] = useState(false);
  const [tokenToTest, setTokenToTest] = useState('');
  const { toast } = useToast();
  const { businessId, loading: isLoading } = useCurrentBusiness();

  // קבלת רשימת עובדים
  const { data: employees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ['employees', businessId],
    queryFn: async () => {
      if (!businessId) return [];

      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('first_name');

      if (error) throw error;
      return data || [];
    },
    enabled: !!businessId && !isLoading,
  });

  // קבלת טוקנים קיימים
  const { data: existingTokens = [], refetch: refetchTokens } = useQuery({
    queryKey: ['weekly-tokens', businessId, selectedWeek],
    queryFn: async () => {
      if (!businessId || !selectedWeek) return [];

      const weekStart = new Date(selectedWeek);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const { data, error } = await supabase
        .from('employee_weekly_tokens')
        .select(`
          *,
          employee:employees(first_name, last_name, phone)
        `)
        .eq('week_start_date', weekStart.toISOString().split('T')[0])
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    },
    enabled: !!businessId && !!selectedWeek,
  });

  // יצירת שבוע ברירת מחדל (השבוע הבא)
  const getNextWeek = () => {
    const now = new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + (7 - now.getDay()));
    return nextWeek.toISOString().split('T')[0];
  };

  React.useEffect(() => {
    if (!selectedWeek) {
      setSelectedWeek(getNextWeek());
    }
  }, [selectedWeek]);

  // שליחת טוקנים לכל העובדים
  const sendToAllEmployees = async () => {
    if (!selectedWeek || !businessId) {
      toast({
        title: 'שגיאה',
        description: 'יש לבחור שבוע תחילה',
        variant: 'destructive',
      });
      return;
    }

    setSendingToAll(true);
    
    try {
      const weekStart = new Date(selectedWeek);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      let successCount = 0;
      let errorCount = 0;
      const whatsappLinks: string[] = [];

      for (const employee of employees) {
        try {
          // בדיקה אם כבר קיים טוכן לעובד זה
          const existingToken = existingTokens.find(t => t.employee_id === employee.id);
          
          let token = existingToken?.token;
          
          if (!existingToken) {
            // יצירת טוכן חדש
            const newToken = crypto.randomUUID().replace(/-/g, '');
            const expiresAt = new Date(weekEnd);
            expiresAt.setDate(expiresAt.getDate() + 7);

            const { data: tokenData, error: tokenError } = await supabase
              .from('employee_weekly_tokens')
              .insert({
                employee_id: employee.id,
                token: newToken,
                week_start_date: weekStart.toISOString().split('T')[0],
                week_end_date: weekEnd.toISOString().split('T')[0],
                expires_at: expiresAt.toISOString(),
                is_active: true
              })
              .select()
              .single();

            if (tokenError) throw tokenError;
            token = newToken;
          }

          // יצירת קישור WhatsApp
          if (employee.phone && token) {
            const submissionUrl = `${window.location.origin}/weekly-shift-submission/${token}`;
            const message = `שלום ${employee.first_name}! 👋\n\nזהו הקישור להגשת המשמרות שלך לשבוע ${weekStart.toLocaleDateString('he-IL')} - ${weekEnd.toLocaleDateString('he-IL')}:\n\n${submissionUrl}\n\n⏰ אנא הגש את המשמרות עד יום רביעי\n💼 מערכת ניהול העובדים`;
            
            const cleanPhone = employee.phone.replace(/[^\d]/g, '');
            const whatsappPhone = cleanPhone.startsWith('0') ? '972' + cleanPhone.slice(1) : cleanPhone;
            const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;
            
            whatsappLinks.push(whatsappUrl);
          }

          successCount++;
        } catch (error) {
          console.error(`Error processing employee ${employee.first_name}:`, error);
          errorCount++;
        }
      }

      // פתיחת כל הקישורים ב-WhatsApp
      whatsappLinks.forEach((link, index) => {
        setTimeout(() => {
          window.open(link, '_blank');
        }, index * 1000); // השהיה של שנייה בין כל פתיחה
      });

      toast({
        title: 'הושלם בהצלחה',
        description: `נשלחו טוכנים ל-${successCount} עובדים${errorCount > 0 ? `, ${errorCount} שגיאות` : ''}. קישורי WhatsApp נפתחו בכרטיסיות חדשות.`,
      });

      refetchTokens();
    } catch (error) {
      console.error('Error sending to all employees:', error);
      toast({
        title: 'שגיאה',
        description: 'שגיאה בשליחת הטוכנים',
        variant: 'destructive',
      });
    } finally {
      setSendingToAll(false);
    }
  };

  // פונקציה לכניסה לטוקן
  const goToToken = () => {
    if (!tokenToTest.trim()) {
      toast({
        title: 'שגיאה',
        description: 'יש להזין טוקן',
        variant: 'destructive',
      });
      return;
    }

    // פתיחת דף הגשת המשמרות בטאב חדש
    const submissionUrl = `${window.location.origin}/weekly-shift-submission/${tokenToTest}`;
    window.open(submissionUrl, '_blank');
  };

  if (isLoading || employeesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">טוען...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          מערכת הגשת משמרות
        </h1>
        <p className="text-gray-600">
          שלח לכל העובדים קישורים להגשת משמרות בקלות
        </p>
      </div>

      {/* בחירת שבוע */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            בחירת שבוע להגשה
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              תאריך תחילת השבוע (יום ראשון)
            </label>
            <Input
              type="date"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="max-w-xs"
            />
          </div>
          
          {selectedWeek && (
            <div className="text-sm text-gray-600">
              השבוע שנבחר: {new Date(selectedWeek).toLocaleDateString('he-IL')} - {new Date(new Date(selectedWeek).getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('he-IL')}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">
              הערות כלליות (אופציונלי)
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="הערות נוספות לעובדים..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* סטטיסטיקות */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{employees.length}</div>
                <div className="text-sm text-gray-600">סה״כ עובדים</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Send className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{existingTokens.length}</div>
                <div className="text-sm text-gray-600">טוכנים נשלחו</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-gray-600">הגישו משמרות</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* כפתור שליחה לכולם */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>שליחה לכל העובדים</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              לחיצה על הכפתור תיצור טוכנים לכל העובדים ותפתח את WhatsApp עם הודעות מוכנות לשליחה
            </p>
            
            <Button
              onClick={sendToAllEmployees}
              disabled={!selectedWeek || sendingToAll || employees.length === 0}
              size="lg"
              className="w-full"
            >
              <Send className="h-5 w-5 mr-2" />
              {sendingToAll ? 'שולח...' : `שלח לכל ${employees.length} העובדים`}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* בדיקת טוקן */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogIn className="h-5 w-5" />
            בדיקת טוכן
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              הזן טוכן כדי לבדוק איך נראה מסך ההגשה לעובדים
            </p>
            
            <div className="flex gap-2">
              <Input
                value={tokenToTest}
                onChange={(e) => setTokenToTest(e.target.value)}
                placeholder="הזן טוכן..."
                className="flex-1"
              />
              <Button onClick={goToToken} disabled={!tokenToTest.trim()}>
                <LogIn className="h-4 w-4 mr-2" />
                כניסה לטוכן
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* רשימת עובדים עם סטטוס */}
      {employees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>סטטוס עובדים</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {employees.map((employee) => {
                const hasToken = existingTokens.some(t => t.employee_id === employee.id);
                
                return (
                  <div key={employee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium">
                          {employee.first_name} {employee.last_name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {employee.phone || 'אין טלפון'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={hasToken ? "default" : "secondary"}>
                        {hasToken ? 'נשלח טוכן' : 'טרם נשלח'}
                      </Badge>
                      {!employee.phone && (
                        <Badge variant="destructive">אין טלפון</Badge>
                      )}
                      {hasToken && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            const token = existingTokens.find(t => t.employee_id === employee.id)?.token;
                            if (token) {
                              setTokenToTest(token);
                              toast({
                                title: 'הטוכן הועתק',
                                description: 'כעת ניתן לבדוק את הטוכן בחלק "בדיקת טוכן" למעלה',
                              });
                            }
                          }}
                          className="text-xs"
                        >
                          העתק טוכן
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
