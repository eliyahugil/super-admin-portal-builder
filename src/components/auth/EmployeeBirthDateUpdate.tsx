import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Info } from 'lucide-react';

interface EmployeeBirthDateUpdateProps {
  employeeId: string;
  employeeName: string;
  onComplete: () => void;
}

export const EmployeeBirthDateUpdate: React.FC<EmployeeBirthDateUpdateProps> = ({
  employeeId,
  employeeName,
  onComplete
}) => {
  const [birthDate, setBirthDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate birth date
      const date = new Date(birthDate);
      const today = new Date();
      const age = today.getFullYear() - date.getFullYear();
      
      if (age < 16 || age > 100) {
        toast({
          title: 'תאריך לא תקין',
          description: 'אנא בדוק את התאריך שהוזן',
          variant: 'destructive',
        });
        return;
      }

      // Update employee birth date and mark as not first login
      const { error } = await supabase
        .from('employees')
        .update({
          birth_date: birthDate,
          is_first_login: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', employeeId);

      if (error) {
        console.error('❌ Error updating birth date:', error);
        toast({
          title: 'שגיאה',
          description: 'לא הצלחנו לעדכן את תאריך הלידה',
          variant: 'destructive',
        });
        return;
      }

      console.log('✅ Birth date updated successfully');
      toast({
        title: 'עדכון בוצע בהצלחה',
        description: 'תאריך הלידה נשמר. מעתה הסיסמה שלך תהיה הספרות של תאריך הלידה בפורמט DDMMYY',
      });

      onComplete();

    } catch (error) {
      console.error('❌ Unexpected error:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה לא צפויה',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Format birth date to DDMMYY for password example
  const getPasswordExample = (date: string) => {
    if (!date) return '';
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear().toString().slice(-2);
    return `${day}${month}${year}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
          <CardTitle className="text-xl">עדכון תאריך לידה</CardTitle>
          <p className="text-sm text-muted-foreground">
            שלום {employeeName}, נדרש לעדכן את תאריך הלידה שלך
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="birthDate">תאריך לידה</Label>
              <Input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
                max={new Date().toISOString().split('T')[0]}
                min="1920-01-01"
              />
              <p className="text-xs text-muted-foreground">
                תאריך הלידה שישמש ליצירת הסיסמה החדשה
              </p>
            </div>

            {birthDate && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 mb-1">
                      הסיסמה החדשה שלך תהיה:
                    </p>
                    <p className="font-mono text-lg text-blue-800 bg-white px-2 py-1 rounded">
                      {getPasswordExample(birthDate)}
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      פורמט: יום-חודש-שנה (DDMMYY)
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !birthDate}
            >
              {loading ? 'שומר...' : 'שמור ומשך'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-sm mb-2">חשוב לדעת:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• התאריך ישמש ליצירת סיסמה אישית</li>
              <li>• הסיסמה תהיה 6 ספרות בפורמט DDMMYY</li>
              <li>• לדוגמה: נולדת ב-15/03/1990 → הסיסמה: 150390</li>
              <li>• המידע נשמר באופן מוצפן ומאובטח</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};