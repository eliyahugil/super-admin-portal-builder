import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useEmployees } from '@/hooks/useEmployees';
import { useEmployeeTokens } from '@/hooks/useEmployeeTokens';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { Copy, Send, UserCheck, Calendar, RefreshCw } from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';
import { he } from 'date-fns/locale';

export const EmployeeTokenManager: React.FC = () => {
  const { toast } = useToast();
  const { businessId } = useCurrentBusiness();
  const { data: employees = [] } = useEmployees(businessId);
  const { generateEmployeeTokens, resetAndGenerateTokens } = useEmployeeTokens();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTokens, setGeneratedTokens] = useState<any[]>([]);

  const getWeekDates = (offset: number = 0) => {
    const today = new Date();
    const weekStart = startOfWeek(addDays(today, offset * 7), { weekStartsOn: 0 });
    const weekEnd = addDays(weekStart, 6);
    return { start: weekStart, end: weekEnd };
  };

  const handleGenerateAllTokens = async () => {
    if (!businessId) {
      toast({
        title: 'שגיאה',
        description: 'לא נמצא מזהה עסק',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const { start, end } = getWeekDates(0); // Current week
      
      const result = await generateEmployeeTokens.mutateAsync({
        business_id: businessId,
        week_start_date: format(start, 'yyyy-MM-dd'),
        week_end_date: format(end, 'yyyy-MM-dd')
      });

      setGeneratedTokens(result.tokens);
      
      toast({
        title: 'טוקנים נוצרו בהצלחה!',
        description: `נוצרו ${result.successful_tokens} טוקנים מתוך ${result.total_employees} עובדים`,
      });

      if (result.failed_tokens > 0) {
        toast({
          title: 'אזהרה',
          description: `${result.failed_tokens} טוקנים נכשלו ביצירה`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error generating tokens:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה ביצירת הטוקנים',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleResetAndGenerate = async () => {
    if (!businessId) {
      toast({
        title: 'שגיאה',
        description: 'לא נמצא מזהה עסק',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const { start, end } = getWeekDates(0); // Current week
      
      const result = await resetAndGenerateTokens.mutateAsync({
        business_id: businessId,
        week_start_date: format(start, 'yyyy-MM-dd'),
        week_end_date: format(end, 'yyyy-MM-dd')
      });

      setGeneratedTokens(result.tokens);
      
      toast({
        title: 'טוקנים חודשו בהצלחה!',
        description: `נמחקו טוקנים ישנים ונוצרו ${result.successful_tokens} טוקנים חדשים`,
      });
    } catch (error) {
      console.error('Error resetting and generating tokens:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בחידוש הטוקנים',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyTokenUrl = (token: string, employeeName: string) => {
    const url = `${window.location.origin}/public/weekly-shifts/${token}`;
    navigator.clipboard.writeText(url);
    toast({
      title: `קישור של ${employeeName} הועתק!`,
      description: 'הקישור הועתק ללוח העבודה',
    });
  };

  const shareViaWhatsApp = (token: string, employeeName: string, employeeCode: string) => {
    const url = `${window.location.origin}/public/weekly-shifts/${token}`;
    const { start, end } = getWeekDates(0);
    
    const message = `🕐 הגשת משמרות אישית - ${employeeName}
שבוע ${format(start, 'd/M', { locale: he })} - ${format(end, 'd/M', { locale: he })}

🎯 שלום ${employeeName.split(' ')[0]}, לחץ על הקישור להגשת המשמרות שלך:
${url}

⏰ זמן פתיחה: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: he })}

צוות הניהול 📋`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const generateBulkWhatsAppMessage = () => {
    const { start, end } = getWeekDates(0);
    
    let message = `🕐 הגשת משמרות שבועיות - ${format(start, 'd/M')} עד ${format(end, 'd/M')}\n\n`;
    
    generatedTokens.forEach(({ employee_name, token }) => {
      const url = `${window.location.origin}/public/weekly-shifts/${token}`;
      message += `👤 ${employee_name}:\n${url}\n\n`;
    });

    message += `⏰ זמן פתיחה: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: he })}\n\nצוות הניהול 📋`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            ניהול טוקנים אישיים לעובדים
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            צור טוקנים אישיים קבועים לכל עובד לצורך הגשת משמרות שבועיות
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleGenerateAllTokens}
              disabled={isGenerating}
              className="flex-1"
            >
              <UserCheck className="h-4 w-4 ml-2" />
              {isGenerating ? 'יוצר טוקנים...' : `צור טוקנים לכל העובדים (${employees.length})`}
            </Button>
            
            <Button
              onClick={handleResetAndGenerate}
              disabled={isGenerating}
              variant="outline"
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 ml-2" />
              {isGenerating ? 'מחדש...' : 'אפס וחדש טוקנים'}
            </Button>
          </div>

          {generatedTokens.length > 0 && (
            <div className="mt-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">טוקנים שנוצרו ({generatedTokens.length})</h3>
                <Button
                  onClick={generateBulkWhatsAppMessage}
                  variant="outline"
                  size="sm"
                >
                  <Send className="h-4 w-4 ml-2" />
                  שלח הכל בוואטסאפ
                </Button>
              </div>
              
              <div className="grid gap-3">
                {generatedTokens.map((tokenData, index) => (
                  <Card key={index} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{tokenData.employee_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            קוד עובד: {tokenData.employee_code} | שבוע: {tokenData.week_start_date} - {tokenData.week_end_date}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyTokenUrl(tokenData.token, tokenData.employee_name)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => shareViaWhatsApp(
                              tokenData.token, 
                              tokenData.employee_name, 
                              tokenData.employee_code
                            )}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};