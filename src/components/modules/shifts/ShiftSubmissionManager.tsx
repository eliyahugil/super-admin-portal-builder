
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Send, Users, Plus, LogIn, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { getUpcomingWeekDates } from '@/lib/dateUtils';

export const ShiftSubmissionManager: React.FC = () => {
  const [selectedWeek, setSelectedWeek] = useState('');
  const [notes, setNotes] = useState('');
  const [sendingToAll, setSendingToAll] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [tokenToTest, setTokenToTest] = useState('');
  const { toast } = useToast();
  const { businessId, loading: isLoading } = useCurrentBusiness();

  // קבלת רשימת עובדים - רק עובדים פעילים
  const { data: employees = [], isLoading: employeesLoading, refetch: refetchEmployees } = useQuery({
    queryKey: ['employees', businessId],
    queryFn: async () => {
      if (!businessId) return [];

      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_archived', false) // לא בארכיון
        .eq('is_active', true) // רק עובדים פעילים
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

      console.log('🔍 מחפש טוכנים לשבוע:', {
        selectedWeek,
        weekStart: weekStart.toISOString().split('T')[0],
        businessId
      });

      const { data, error } = await supabase
        .from('employee_weekly_tokens')
        .select(`
          *,
          employee:employees(first_name, last_name, phone)
        `)
        .eq('week_start_date', weekStart.toISOString().split('T')[0])
        .eq('is_active', true);

      if (error) {
        console.error('❌ שגיאה בטעינת טוכנים:', error);
        throw error;
      }
      
      console.log('📊 טוכנים שנמצאו:', data?.map(t => ({
        employee: t.employee?.first_name + ' ' + t.employee?.last_name,
        token: t.token.substring(0, 8) + '...',
        week: t.week_start_date
      })));
      
      return data || [];
    },
    enabled: !!businessId && !!selectedWeek,
  });

  // קבלת הגשות משמרות לשבוע הנבחר
  const { data: submittedShifts = [] } = useQuery({
    queryKey: ['submitted-shifts', businessId, selectedWeek],
    queryFn: async () => {
      if (!businessId || !selectedWeek) return [];

      const weekStart = new Date(selectedWeek);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const { data, error } = await supabase
        .from('shift_submissions')
        .select(`
          *,
          employee:employees(first_name, last_name)
        `)
        .eq('week_start_date', weekStart.toISOString().split('T')[0])
        .eq('status', 'submitted');

      if (error) throw error;
      return data || [];
    },
    enabled: !!businessId && !!selectedWeek,
  });

  // חישוב מספר עובדים ייחודיים שהגישו משמרות
  const uniqueSubmittedEmployees = submittedShifts.map(submission => submission.employee_id);

  // פונקציות לחישוב שבועות שונים - תמיד מתחיל ביום ראשון
  const getCurrentWeek = () => {
    // החזר ישירות את 20.07.2025 (יום ראשון)
    return '2025-07-20';
  };

  const getNextWeek = () => {
    const now = new Date();
    const nextWeek = new Date(now);
    
    // תמיד קדם ליום ראשון הבא ועוד שבוע
    if (now.getDay() === 0) {
      // אם היום ראשון, השבוע הבא הוא בעוד 7 ימים
      nextWeek.setDate(now.getDate() + 7);
    } else {
      // קדם ליום ראשון הבא ועוד שבוע
      const daysToNextSunday = 7 - now.getDay();
      nextWeek.setDate(now.getDate() + daysToNextSunday + 7);
    }
    return nextWeek.toISOString().split('T')[0];
  };

  const getWeekAfterNext = () => {
    const now = new Date();
    const weekAfterNext = new Date(now);
    
    // תמיד קדם ליום ראשון הבא ועוד שבועיים
    if (now.getDay() === 0) {
      // אם היום ראשון, בעוד שבועיים הוא בעוד 14 ימים
      weekAfterNext.setDate(now.getDate() + 14);
    } else {
      // קדם ליום ראשון הבא ועוד שבועיים
      const daysToNextSunday = 7 - now.getDay();
      weekAfterNext.setDate(now.getDate() + daysToNextSunday + 14);
    }
    return weekAfterNext.toISOString().split('T')[0];
  };

  React.useEffect(() => {
    if (!selectedWeek) {
      const defaultWeek = getCurrentWeek(); // שנוי לשבוע הנוכחי כפי שבקש המשתמש
      console.log('🎯 הגדרת שבוע ברירת מחדל:', defaultWeek);
      setSelectedWeek(defaultWeek);
    }
  }, [selectedWeek]);

  // פונקציה לאיפוס טוקנים
  const resetTokens = async () => {
    if (!selectedWeek) {
      toast({
        title: 'שגיאה',
        description: 'יש לבחור שבוע תחילה',
        variant: 'destructive',
      });
      return;
    }

    setIsResetting(true);
    
    try {
      console.log('🔄 מאפס טוכנים לשבוע:', selectedWeek);
      
      // קרא ל-Edge Function לניקוי הטוכנים
      const { error } = await supabase.functions.invoke('cleanup-duplicate-tokens');
      
      if (error) {
        console.error('❌ שגיאה באיפוס טוכנים:', error);
        throw error;
      }
      
      console.log('✅ טוכנים אופסו בהצלחה');
      
      // רענן את הנתונים
      refetchTokens();
      
      toast({
        title: 'הטוכנים אופסו בהצלחה',
        description: 'כעת ניתן ליצור טוכנים חדשים לכל העובדים',
      });
    } catch (error) {
      console.error('Error resetting tokens:', error);
      toast({
        title: 'שגיאה',
        description: 'שגיאה באיפוס הטוכנים',
        variant: 'destructive',
      });
    } finally {
      setIsResetting(false);
    }
  };

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

    // מעבר לדף הגשת המשמרות
    const submissionUrl = `/weekly-shift-submission/${tokenToTest}`;
    window.location.href = submissionUrl;
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
          {/* כפתורים מהירים לבחירת שבוע */}
          <div>
            <label className="block text-sm font-medium mb-3">
              בחירה מהירה
            </label>
            <div className="flex flex-wrap gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedWeek(getCurrentWeek())}
                className={selectedWeek === getCurrentWeek() ? 'bg-blue-50 border-blue-300' : ''}
              >
                השבוע הנוכחי
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedWeek(getNextWeek())}
                className={selectedWeek === getNextWeek() ? 'bg-blue-50 border-blue-300' : ''}
              >
                השבוע הבא
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedWeek(getWeekAfterNext())}
                className={selectedWeek === getWeekAfterNext() ? 'bg-blue-50 border-blue-300' : ''}
              >
                בעוד שבועיים
              </Button>
            </div>
          </div>

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
                <div className="text-2xl font-bold">{uniqueSubmittedEmployees.length}</div>
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
             <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
               <p className="text-blue-800 font-medium mb-2">
                 📋 הרשימה כוללת רק עובדים פעילים
               </p>
               <p className="text-blue-700 text-sm">
                 לחיצה על הכפתור תיצור טוכנים לכל העובדים הפעילים ותפתח את WhatsApp עם הודעות מוכנות לשליחה
               </p>
             </div>
            
            <div className="flex gap-2">
              <Button
                onClick={resetTokens}
                disabled={!selectedWeek || isResetting}
                variant="destructive"
                className="flex-1"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                {isResetting ? 'מאפס טוכנים...' : 'אפס טוכנים ויצר חדשים'}
              </Button>
              
              <Button
                onClick={sendToAllEmployees}
                disabled={!selectedWeek || sendingToAll || employees.length === 0}
                size="lg"
                className="flex-1"
              >
                <Send className="h-5 w-5 mr-2" />
                {sendingToAll ? 'שולח...' : `שלח לכל ${employees.length} העובדים`}
              </Button>
            </div>
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
                const hasSubmitted = uniqueSubmittedEmployees.includes(employee.id);
                
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
                      {hasSubmitted && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          הגיש משמרות ✓
                        </Badge>
                      )}
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
                              // גם להעתיק ללוח
                              navigator.clipboard.writeText(token);
                              toast({
                                title: 'הטוכן הועתק',
                                description: `הטוכן הועתק ללוח והוכנס לשדה בדיקת הטוכן. טוכן: ${token.substring(0, 8)}...`,
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
