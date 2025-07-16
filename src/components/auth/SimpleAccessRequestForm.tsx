
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { Building2, Clock } from 'lucide-react';
import { useAuth } from './AuthContext';

export const SimpleAccessRequestForm: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [requestReason, setRequestReason] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: 'שגיאה',
        description: 'משתמש לא מזוהה',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from('user_access_requests')
        .insert({
          user_id: user.id,
          requested_business_id: null, // No specific business selected
          requested_role: 'business_user',
          request_reason: requestReason || 'בקשה לגישה למערכת'
        });

      if (error) throw error;

      toast({
        title: '✅ בקשה נשלחה בהצלחה',
        description: 'הבקשה שלך נרשמה במערכת ונשלחה למנהל לאישור',
      });

      console.log('✅ Access request submitted successfully for user:', user.id);
      setHasSubmitted(true);
    } catch (error: any) {
      console.error('Error submitting access request:', error);
      toast({
        title: 'שגיאה',
        description: error.message || 'לא ניתן לשלוח את הבקשה',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (hasSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Clock className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-700">
              בקשה נשלחה בהצלחה ✓
            </CardTitle>
            <CardDescription>
              הבקשה שלך נמצאת בטיפול מנהל המערכת
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
              <h4 className="font-medium text-green-900 mb-2">מה קורה עכשיו?</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>✓ הבקשה שלך נקלטה במערכת</li>
                <li>• מנהל המערכת יבדוק את הבקשה</li>
                <li>• הוא ישייך אותך לעסק המתאים</li>
                <li>• תקבל אישור באימייל כשהבקשה תאושר</li>
                <li>• לאחר מכן תוכל להתחבר ולהשתמש במערכת</li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
              <h4 className="font-medium text-blue-900 mb-2">🕐 זמן טיפול משוער</h4>
              <p className="text-sm text-blue-800">
                הבקשה בדרך כלל מטופלת תוך 24-48 שעות עבודה
              </p>
            </div>
            
            <div className="text-center space-y-2">
              <Button 
                variant="outline" 
                onClick={() => supabase.auth.signOut()}
                className="w-full"
              >
                יציאה מהמערכת
              </Button>
              <p className="text-xs text-gray-500">
                תוכל להתחבר שוב לאחר אישור הבקשה
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Building2 className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            בקשת גישה למערכת
          </CardTitle>
          <CardDescription>
            החשבון שלך נוצר בהצלחה. כדי לגשת למערכת, נא לבקש אישור ממנהל המערכת
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">מידע נוסף (אופציונלי)</Label>
              <Textarea
                id="reason"
                value={requestReason}
                onChange={(e) => setRequestReason(e.target.value)}
                placeholder="תוכל להוסיף מידע נוסף שיעזור למנהל המערכת לזהות אותך..."
                className="min-h-[80px]"
              />
              <p className="text-xs text-gray-500">
                לדוגמה: שם מלא, תפקיד, מחלקה או כל מידע רלוונטי אחר
              </p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  שולח בקשה...
                </>
              ) : (
                'שלח בקשת גישה'
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">איך זה עובד?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• מנהל המערכת יקבל את הבקשה</li>
              <li>• הוא ישייך אותך לעסק הרלוונטי</li>
              <li>• תקבל אישור כשהגישה תיפתח</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
