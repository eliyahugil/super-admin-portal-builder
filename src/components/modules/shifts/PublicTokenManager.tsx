import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { usePublicShifts } from '@/hooks/usePublicShifts';
import { useBusiness } from '@/hooks/useBusiness';
import { Copy, Plus, Calendar, Users, Timer } from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';
import { he } from 'date-fns/locale';

export const PublicTokenManager: React.FC = () => {
  const { toast } = useToast();
  const { businessId } = useBusiness();
  const { generateToken } = usePublicShifts();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [newToken, setNewToken] = useState<string | null>(null);
  
  const [tokenForm, setTokenForm] = useState({
    weekOffset: 0, // 0 = this week, 1 = next week, etc.
    expiryDays: 7,
    maxSubmissions: 50,
  });

  const getWeekDates = (offset: number = 0) => {
    const today = new Date();
    const weekStart = startOfWeek(addDays(today, offset * 7), { weekStartsOn: 0 }); // Sunday
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
    const { start, end } = getWeekDates(tokenForm.weekOffset);
    
    const message = `🕐 הגשת משמרות - שבוע ${format(start, 'd/M', { locale: he })} - ${format(end, 'd/M', { locale: he })}

🎯 לחץ על הקישור להגשת המשמרות שלך:
${url}

⏰ חשוב להגיש עד: ${format(addDays(new Date(), tokenForm.expiryDays), 'dd/MM/yyyy HH:mm', { locale: he })}

צוות הניהול 📋`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const { start: weekStart, end: weekEnd } = getWeekDates(tokenForm.weekOffset);

  return (
    <div className="space-y-6" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            יצירת טוקן ציבורי חדש
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Week Selection */}
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

          {/* Expiry Days */}
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

          {/* Max Submissions */}
          <div>
            <Label htmlFor="maxSubmissions">מספר הגשות מקסימלי</Label>
            <Input
              id="maxSubmissions"
              type="number"
              min="1"
              max="200"
              value={tokenForm.maxSubmissions}
              onChange={(e) => setTokenForm(prev => ({ ...prev, maxSubmissions: parseInt(e.target.value) || 50 }))}
            />
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerateToken}
            disabled={isGenerating || !businessId}
            className="w-full"
          >
            {isGenerating ? 'יוצר טוקן...' : 'צור טוקן ציבורי'}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Token Display */}
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
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span>שבוע: {format(weekStart, 'd/M')} - {format(weekEnd, 'd/M')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-orange-500" />
                <span>פג תוקף: {format(addDays(new Date(), tokenForm.expiryDays), 'd/M/yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500" />
                <span>מקס הגשות: {tokenForm.maxSubmissions}</span>
              </div>
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

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>הוראות שימוש</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-2">
          <p>• הטוקן הציבורי מאפשר לעובדים להגיש משמרות ללא התחברות למערכת</p>
          <p>• ניתן לשתף את הקישור ב-WhatsApp או להעתיק אותו</p>
          <p>• הטוקן יפוג לאחר מספר הימים שנקבע</p>
          <p>• ניתן לקבוע מספר הגשות מקסימלי למניעת ספאם</p>
          <p>• כל ההגשות יופיעו במערכת לאישור</p>
        </CardContent>
      </Card>
    </div>
  );
};