import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useEmployees } from '@/hooks/useEmployees';
import { usePublicShifts } from '@/hooks/usePublicShifts';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { Copy, Plus, Calendar, Users, Timer, Eye, User, UsersRound, TrendingDown, AlertTriangle, RotateCcw } from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';
import { he } from 'date-fns/locale';
import { TokenSubmissionsList } from './TokenSubmissionsList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export const PublicTokenManager: React.FC = () => {
  const { toast } = useToast();
  const { businessId } = useCurrentBusiness();
  const { data: employees = [] } = useEmployees(businessId);
  const { generateToken, useBusinessTokens, resetAllTokens } = usePublicShifts();
  const { data: existingTokens = [] } = useBusinessTokens(businessId || '');
  
  const [isResetting, setIsResetting] = useState(false);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [bulkResults, setBulkResults] = useState<Array<{employee: any, token: string}>>([]);
  const [selectedTokenForView, setSelectedTokenForView] = useState<string | null>(null);
  
  // Single token form
  const [tokenForm, setTokenForm] = useState({
    employeeId: '',
    weekOffset: 0,
    expiryDays: 7,
    maxSubmissions: 1,
  });

  // Bulk token form
  const [bulkTokenForm, setBulkTokenForm] = useState({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
    expiryDays: 7,
    maxSubmissions: 1,
    employeeType: 'all',
  });

  const getWeekDates = (offset: number = 0) => {
    const today = new Date();
    const weekStart = startOfWeek(addDays(today, offset * 7), { weekStartsOn: 0 });
    const weekEnd = addDays(weekStart, 6);
    return { start: weekStart, end: weekEnd };
  };

  const handleGenerateToken = async () => {
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
      const { start, end } = getWeekDates(tokenForm.weekOffset);
      const expiresAt = addDays(new Date(), tokenForm.expiryDays);
      
      const result = await generateToken.mutateAsync({
        business_id: businessId,
        employee_id: tokenForm.employeeId,
        week_start_date: format(start, 'yyyy-MM-dd'),
        week_end_date: format(end, 'yyyy-MM-dd'),
        expires_at: expiresAt.toISOString(),
        max_submissions: tokenForm.maxSubmissions,
      });

      setNewToken(result.token);
      
      toast({
        title: 'טוקן נוצר בהצלחה!',
        description: 'הטוקן הציבורי נוצר ומוכן לשימוש',
      });
    } catch (error) {
      console.error('Error generating token:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה ביצירת הטוקן',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBulkGenerateTokens = async () => {
    if (!businessId) {
      toast({
        title: 'שגיאה',
        description: 'לא נמצא מזהה עסק',
        variant: 'destructive',
      });
      return;
    }

    setIsBulkGenerating(true);
    
    try {
      const filteredEmployees = employees.filter(emp => {
        if (bulkTokenForm.employeeType === 'all') return true;
        return emp.employee_type === bulkTokenForm.employeeType;
      });

      if (filteredEmployees.length === 0) {
        toast({
          title: 'שגיאה',
          description: 'לא נמצאו עובדים מסוג זה',
          variant: 'destructive',
        });
        return;
      }

      const expiresAt = addDays(new Date(), bulkTokenForm.expiryDays);
      const results = [];

      for (const employee of filteredEmployees) {
        try {
          const result = await generateToken.mutateAsync({
            business_id: businessId,
            employee_id: employee.id,
            week_start_date: bulkTokenForm.startDate,
            week_end_date: bulkTokenForm.endDate,
            expires_at: expiresAt.toISOString(),
            max_submissions: bulkTokenForm.maxSubmissions,
          });
          results.push({ employee, token: result.token });
        } catch (error) {
          console.error(`Error generating token for ${employee.first_name}:`, error);
        }
      }

      setBulkResults(results);
      
      toast({
        title: 'טוקנים נוצרו בהצלחה!',
        description: `נוצרו ${results.length} טוקנים מתוך ${filteredEmployees.length} עובדים`,
      });
    } catch (error) {
      console.error('Error in bulk generation:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה ביצירת הטוקנים',
        variant: 'destructive',
      });
    } finally {
      setIsBulkGenerating(false);
    }
  };

  const generateBulkWhatsAppMessage = () => {
    const baseUrl = window.location.origin;
    
    let message = `🕐 הגשת משמרות - ${format(new Date(bulkTokenForm.startDate), 'd/M')} עד ${format(new Date(bulkTokenForm.endDate), 'd/M')}\n\n`;
    
    bulkResults.forEach(({ employee, token }) => {
      const url = `${baseUrl}/public/shift-submission/${token}`;
      message += `👤 ${employee.first_name} ${employee.last_name}:\n${url}\n\n`;
    });

    message += `⏰ חשוב להגיש עד: ${format(addDays(new Date(), bulkTokenForm.expiryDays), 'dd/MM/yyyy HH:mm', { locale: he })}\n\nצוות הניהול 📋`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const copyTokenUrl = (token: string) => {
    const url = `${window.location.origin}/public/shift-submission/${token}`;
    navigator.clipboard.writeText(url);
    toast({
      title: 'הקישור הועתק!',
      description: 'הקישור הועתק ללוח העבודה',
    });
  };

  const shareViaWhatsApp = (token: string) => {
    const url = `${window.location.origin}/public/shift-submission/${token}`;
    const selectedEmployee = employees.find(emp => emp.id === tokenForm.employeeId);
    const { start, end } = getWeekDates(tokenForm.weekOffset);
    
    const message = `🕐 הגשת משמרות אישית - ${selectedEmployee?.first_name} ${selectedEmployee?.last_name}
שבוע ${format(start, 'd/M', { locale: he })} - ${format(end, 'd/M', { locale: he })}

🎯 שלום ${selectedEmployee?.first_name}, לחץ על הקישור להגשת המשמרות שלך:
${url}

⏰ חשוב להגיש עד: ${format(addDays(new Date(), tokenForm.expiryDays), 'dd/MM/yyyy HH:mm', { locale: he })}

צוות הניהול 📋`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleResetAllTokens = async () => {
    if (!businessId) {
      toast({
        title: 'שגיאה',
        description: 'לא נמצא מזהה עסק',
        variant: 'destructive',
      });
      return;
    }

    setIsResetting(true);
    
    try {
      await resetAllTokens.mutateAsync(businessId);
      
      toast({
        title: 'טוקנים אופסו בהצלחה!',
        description: 'כל הטוקנים הפעילים הועברו למצב לא פעיל',
      });
    } catch (error) {
      console.error('Error resetting tokens:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה באיפוס הטוקנים',
        variant: 'destructive',
      });
    } finally {
      setIsResetting(false);
    }
  };

  const { start: weekStart, end: weekEnd } = getWeekDates(tokenForm.weekOffset);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Reset all tokens button */}
      <div className="flex justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              className="gap-2"
              disabled={isResetting || existingTokens.filter(t => t.is_active).length === 0}
            >
              <RotateCcw className="h-4 w-4" />
              איפוס כל הטוקנים ({existingTokens.filter(t => t.is_active).length})
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent dir="rtl">
            <AlertDialogHeader>
              <AlertDialogTitle>האם אתה בטוח שברצונך לאפס את כל הטוקנים?</AlertDialogTitle>
              <AlertDialogDescription>
                פעולה זו תבטל את כל הטוקנים הפעילים ({existingTokens.filter(t => t.is_active).length} טוקנים).
                העובדים לא יוכלו יותר להשתמש בקישורים הקיימים.
                <br />
                <strong>פעולה זו לא ניתנת לביטול.</strong>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>ביטול</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleResetAllTokens}
                className="bg-red-600 hover:bg-red-700"
                disabled={isResetting}
              >
                {isResetting ? 'מאפס...' : 'כן, אפס את כל הטוקנים'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="single" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            טוקן אישי
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center gap-2">
            <UsersRound className="h-4 w-4" />
            יצירה גורפת
          </TabsTrigger>
          <TabsTrigger value="existing" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            טוקנים קיימים
          </TabsTrigger>
          <TabsTrigger value="unused" className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            טוקנים לא מנוצלים
          </TabsTrigger>
        </TabsList>

        {/* Single Token Tab */}
        <TabsContent value="single" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                יצירת טוקן אישי לעובד
              </CardTitle>
              <p className="text-sm text-gray-600">צור טוקן אישי לעובד ספציפי לביצוע הגשת משמרות</p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <Label>בחר עובד</Label>
                <Select
                  value={tokenForm.employeeId}
                  onValueChange={(value) => setTokenForm(prev => ({ ...prev, employeeId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר עובד..." />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.first_name} {employee.last_name} - {employee.employee_type || 'עובד כללי'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>בחר שבוע</Label>
                <Select
                  value={tokenForm.weekOffset.toString()}
                  onValueChange={(value) => setTokenForm(prev => ({ ...prev, weekOffset: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">השבוע הנוכחי ({format(getWeekDates(0).start, 'd/M')} - {format(getWeekDates(0).end, 'd/M')})</SelectItem>
                    <SelectItem value="1">השבוע הבא ({format(getWeekDates(1).start, 'd/M')} - {format(getWeekDates(1).end, 'd/M')})</SelectItem>
                    <SelectItem value="2">בעוד שבועיים ({format(getWeekDates(2).start, 'd/M')} - {format(getWeekDates(2).end, 'd/M')})</SelectItem>
                    <SelectItem value="3">בעוד 3 שבועות ({format(getWeekDates(3).start, 'd/M')} - {format(getWeekDates(3).end, 'd/M')})</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="expiryDays">תוקף הטוקן (ימים)</Label>
                <Input
                  id="expiryDays"
                  type="number"
                  min="1"
                  max="30"
                  value={tokenForm.expiryDays}
                  onChange={(e) => setTokenForm(prev => ({ ...prev, expiryDays: parseInt(e.target.value) || 7 }))}
                />
              </div>

              <div>
                <Label htmlFor="maxSubmissions">מספר הגשות מקסימלי</Label>
                <Input
                  id="maxSubmissions"
                  type="number"
                  min="1"
                  max="5"
                  value={tokenForm.maxSubmissions}
                  onChange={(e) => setTokenForm(prev => ({ ...prev, maxSubmissions: parseInt(e.target.value) || 1 }))}
                />
              </div>

              <Button
                onClick={handleGenerateToken}
                disabled={isGenerating || !businessId || !tokenForm.employeeId}
                className="w-full"
              >
                {isGenerating ? 'יוצר טוקן...' : 'צור טוקן אישי לעובד'}
              </Button>
            </CardContent>
          </Card>

          {newToken && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  טוקן נוצר בהצלחה!
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">קישור הגשה:</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyTokenUrl(newToken)}
                      className="gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      העתק
                    </Button>
                  </div>
                  <code className="text-xs break-all bg-gray-100 p-2 rounded block">
                    {window.location.origin}/public/shift-submission/{newToken}
                  </code>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => shareViaWhatsApp(newToken)}
                    className="flex-1"
                    variant="outline"
                  >
                    שתף ב-WhatsApp
                  </Button>
                  <Button
                    onClick={() => copyTokenUrl(newToken)}
                    className="flex-1"
                  >
                    העתק קישור
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Bulk Token Tab */}
        <TabsContent value="bulk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UsersRound className="h-5 w-5" />
                יצירה גורפת לכל העובדים
              </CardTitle>
              <p className="text-sm text-gray-600">צור טוקנים לכל העובדים הפעילים או לקבוצה מסוימת</p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">תאריך התחלה</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={bulkTokenForm.startDate}
                    onChange={(e) => setBulkTokenForm(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">תאריך סיום</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={bulkTokenForm.endDate}
                    onChange={(e) => setBulkTokenForm(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label>סוג עובדים</Label>
                <Select
                  value={bulkTokenForm.employeeType}
                  onValueChange={(value) => setBulkTokenForm(prev => ({ ...prev, employeeType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">כל העובדים ({employees.length})</SelectItem>
                    <SelectItem value="permanent">עובדים קבועים ({employees.filter(e => e.employee_type === 'permanent').length})</SelectItem>
                    <SelectItem value="temporary">עובדים זמניים ({employees.filter(e => e.employee_type === 'temporary').length})</SelectItem>
                    <SelectItem value="youth">עובדי נוער ({employees.filter(e => e.employee_type === 'youth').length})</SelectItem>
                    <SelectItem value="contractor">קבלנים ({employees.filter(e => e.employee_type === 'contractor').length})</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bulkExpiryDays">תוקף הטוקן (ימים)</Label>
                  <Input
                    id="bulkExpiryDays"
                    type="number"
                    min="1"
                    max="30"
                    value={bulkTokenForm.expiryDays}
                    onChange={(e) => setBulkTokenForm(prev => ({ ...prev, expiryDays: parseInt(e.target.value) || 7 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="bulkMaxSubmissions">מספר הגשות מקסימלי</Label>
                  <Input
                    id="bulkMaxSubmissions"
                    type="number"
                    min="1"
                    max="5"
                    value={bulkTokenForm.maxSubmissions}
                    onChange={(e) => setBulkTokenForm(prev => ({ ...prev, maxSubmissions: parseInt(e.target.value) || 1 }))}
                  />
                </div>
              </div>

              <Button
                onClick={handleBulkGenerateTokens}
                disabled={isBulkGenerating || !businessId}
                className="w-full"
                size="lg"
              >
                {isBulkGenerating ? 'יוצר טוקנים...' : `צור טוקנים לכל העובדים (${employees.filter(e => bulkTokenForm.employeeType === 'all' || e.employee_type === bulkTokenForm.employeeType).length})`}
              </Button>
            </CardContent>
          </Card>

          {bulkResults.length > 0 && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center gap-2">
                  <UsersRound className="h-5 w-5" />
                  נוצרו {bulkResults.length} טוקנים בהצלחה!
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {bulkResults.map(({ employee, token }) => (
                    <div key={employee.id} className="bg-white p-3 rounded border text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{employee.first_name} {employee.last_name}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyTokenUrl(token)}
                          className="gap-1"
                        >
                          <Copy className="h-3 w-3" />
                          העתק
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button
                  onClick={generateBulkWhatsAppMessage}
                  className="w-full"
                  variant="outline"
                >
                  שתף הכל ב-WhatsApp
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Existing Tokens Tab */}
        <TabsContent value="existing" className="space-y-6">
          {existingTokens.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  טוקנים קיימים ({existingTokens.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {existingTokens.map((token) => (
                  <div key={token.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-purple-500" />
                          <span className="font-medium">
                            {employees.find(emp => emp.id === token.employee_id)?.first_name} {employees.find(emp => emp.id === token.employee_id)?.last_name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">
                            {format(new Date(token.week_start_date), 'd/M')} - {format(new Date(token.week_end_date), 'd/M')}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Timer className="h-3 w-3" />
                            <span>פג תוקף: {format(new Date(token.expires_at), 'dd/MM/yyyy HH:mm')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{token.current_submissions || 0}/{token.max_submissions || 50} הגשות</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTokenForView(selectedTokenForView === token.id ? null : token.id)}
                          className="gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          {selectedTokenForView === token.id ? 'הסתר' : 'הצג'} הגשות
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyTokenUrl(token.token)}
                          className="gap-1"
                        >
                          <Copy className="h-3 w-3" />
                          העתק קישור
                        </Button>
                      </div>
                    </div>
                    
                    {selectedTokenForView === token.id && (
                      <div className="mt-4">
                        <TokenSubmissionsList tokenId={token.id} />
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">אין טוקנים קיימים</h3>
                <p className="text-gray-500">צור טוקנים חדשים באמצעות הטאבים למעלה</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Unused Tokens Tab */}
        <TabsContent value="unused" className="space-y-6">
          {(() => {
            // Filter tokens that are underutilized
            const underutilizedTokens = existingTokens.filter(token => {
              const currentSubmissions = token.current_submissions || 0;
              const maxSubmissions = token.max_submissions || 1;
              const usagePercentage = (currentSubmissions / maxSubmissions) * 100;
              
              // Consider tokens with less than 50% usage as underutilized
              return usagePercentage < 50 && new Date(token.expires_at) > new Date();
            });

            const expiredUnusedTokens = existingTokens.filter(token => {
              const currentSubmissions = token.current_submissions || 0;
              return currentSubmissions === 0 && new Date(token.expires_at) <= new Date();
            });

            const activeButUnusedTokens = existingTokens.filter(token => {
              const currentSubmissions = token.current_submissions || 0;
              return currentSubmissions === 0 && new Date(token.expires_at) > new Date();
            });

            return (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-orange-200 bg-orange-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-5 w-5 text-orange-600" />
                        <div>
                          <p className="text-sm text-orange-600">טוקנים לא מנוצלים במלואם</p>
                          <p className="text-2xl font-bold text-orange-800">{underutilizedTokens.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <div>
                          <p className="text-sm text-red-600">טוקנים שפגו ללא שימוש</p>
                          <p className="text-2xl font-bold text-red-800">{expiredUnusedTokens.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Timer className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="text-sm text-yellow-600">טוקנים פעילים ללא שימוש</p>
                          <p className="text-2xl font-bold text-yellow-800">{activeButUnusedTokens.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Underutilized Tokens */}
                {underutilizedTokens.length > 0 && (
                  <Card className="border-orange-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-orange-800">
                        <TrendingDown className="h-5 w-5" />
                        טוקנים לא מנוצלים במלואם ({underutilizedTokens.length})
                      </CardTitle>
                      <p className="text-sm text-orange-600">טוקנים שהשימוש בהם נמוך מ-50%</p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {underutilizedTokens.map((token) => {
                        const currentSubmissions = token.current_submissions || 0;
                        const maxSubmissions = token.max_submissions || 1;
                        const usagePercentage = Math.round((currentSubmissions / maxSubmissions) * 100);
                        const employee = employees.find(emp => emp.id === token.employee_id);

                        return (
                          <div key={token.id} className="border rounded-lg p-4 bg-orange-50">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-purple-500" />
                                  <span className="font-medium">
                                    {employee ? `${employee.first_name} ${employee.last_name}` : 'טוקן כללי'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-blue-500" />
                                  <span className="text-sm">
                                    {format(new Date(token.week_start_date), 'd/M')} - {format(new Date(token.week_end_date), 'd/M')}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    <span>{currentSubmissions}/{maxSubmissions} הגשות ({usagePercentage}%)</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Timer className="h-3 w-3" />
                                    <span>פג תוקף: {format(new Date(token.expires_at), 'dd/MM HH:mm')}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyTokenUrl(token.token)}
                                  className="gap-1"
                                >
                                  <Copy className="h-3 w-3" />
                                  העתק קישור
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                )}

                {/* Active but unused tokens */}
                {activeButUnusedTokens.length > 0 && (
                  <Card className="border-yellow-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-yellow-800">
                        <Timer className="h-5 w-5" />
                        טוקנים פעילים ללא שימוש ({activeButUnusedTokens.length})
                      </CardTitle>
                      <p className="text-sm text-yellow-600">טוקנים שטרם נעשה בהם שימוש אבל עדיין תקפים</p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {activeButUnusedTokens.map((token) => {
                        const employee = employees.find(emp => emp.id === token.employee_id);
                        const daysUntilExpiry = Math.ceil((new Date(token.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

                        return (
                          <div key={token.id} className="border rounded-lg p-4 bg-yellow-50">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-purple-500" />
                                  <span className="font-medium">
                                    {employee ? `${employee.first_name} ${employee.last_name}` : 'טוקן כללי'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-blue-500" />
                                  <span className="text-sm">
                                    {format(new Date(token.week_start_date), 'd/M')} - {format(new Date(token.week_end_date), 'd/M')}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    <span>אף הגשה לא בוצעה</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Timer className="h-3 w-3" />
                                    <span>{daysUntilExpiry > 0 ? `נותרו ${daysUntilExpiry} ימים` : 'פג תוקף היום'}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyTokenUrl(token.token)}
                                  className="gap-1"
                                >
                                  <Copy className="h-3 w-3" />
                                  העתק קישור
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                )}

                {/* Expired unused tokens */}
                {expiredUnusedTokens.length > 0 && (
                  <Card className="border-red-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-800">
                        <AlertTriangle className="h-5 w-5" />
                        טוקנים שפגו ללא שימוש ({expiredUnusedTokens.length})
                      </CardTitle>
                      <p className="text-sm text-red-600">טוקנים שפג תוקפם מבלי שנעשה בהם שימוש</p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {expiredUnusedTokens.map((token) => {
                        const employee = employees.find(emp => emp.id === token.employee_id);

                        return (
                          <div key={token.id} className="border rounded-lg p-4 bg-red-50">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-purple-500" />
                                  <span className="font-medium">
                                    {employee ? `${employee.first_name} ${employee.last_name}` : 'טוקן כללי'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-blue-500" />
                                  <span className="text-sm">
                                    {format(new Date(token.week_start_date), 'd/M')} - {format(new Date(token.week_end_date), 'd/M')}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    <span>פג תוקף: {format(new Date(token.expires_at), 'dd/MM/yyyy HH:mm')}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                )}

                {/* No unused tokens */}
                {underutilizedTokens.length === 0 && activeButUnusedTokens.length === 0 && expiredUnusedTokens.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-8">
                      <TrendingDown className="h-12 w-12 mx-auto text-green-400 mb-4" />
                      <h3 className="text-lg font-medium text-green-600 mb-2">כל הטוקנים מנוצלים היטב!</h3>
                      <p className="text-green-500">אין טוקנים לא מנוצלים כרגע</p>
                    </CardContent>
                  </Card>
                )}
              </>
            );
          })()}
        </TabsContent>
      </Tabs>
    </div>
  );
};
