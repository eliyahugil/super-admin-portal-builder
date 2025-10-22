import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';

const CreateMissingAdmin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const { toast } = useToast();

  const businessData = {
    id: 'f61e330f-ab0f-4407-9f6f-fb9474f8ef79',
    name: 'שרון ושלמה.ג ייצור ושיווק מאפים בעמ',
    email: 'boraxgil69@gmail.com',
    fullName: 'שרון ושלמה',
    password: '123456'
  };

  const createAdmin = async () => {
    setLoading(true);
    setResult(null);

    try {
      console.log('Calling create-admin-user Edge Function...');
      
      const { data, error } = await supabase.functions.invoke('create-admin-user', {
        body: {
          email: businessData.email,
          password: businessData.password,
          full_name: businessData.fullName,
          business_id: businessData.id
        }
      });

      if (error) {
        console.error('Edge Function error:', error);
        throw new Error(error.message || 'שגיאה ביצירת המשתמש');
      }

      if (!data.success) {
        throw new Error(data.error || 'שגיאה ביצירת המשתמש');
      }

      console.log('User created successfully:', data);
      
      setResult({
        success: true,
        message: `המשתמש נוצר בהצלחה!\n\nפרטי התחברות:\nמייל: ${businessData.email}\nסיסמה: ${businessData.password}`
      });

      toast({
        title: 'הצלחה! 🎉',
        description: 'המשתמש נוצר בהצלחה',
      });

    } catch (error) {
      console.error('Error creating admin:', error);
      const errorMessage = error instanceof Error ? error.message : 'שגיאה לא ידועה';
      
      setResult({
        success: false,
        message: `שגיאה: ${errorMessage}`
      });

      toast({
        title: 'שגיאה',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-6 w-6" />
            יצירת מנהל חסר לעסק קיים
          </CardTitle>
          <CardDescription>
            יצירת משתמש מנהל לעסק "שרון ושלמה.ג ייצור ושיווק מאפים בעמ"
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-900 mb-2">פרטי העסק:</h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• <strong>שם העסק:</strong> {businessData.name}</li>
              <li>• <strong>מייל:</strong> {businessData.email}</li>
              <li>• <strong>שם המנהל:</strong> {businessData.fullName}</li>
            </ul>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h3 className="font-medium text-yellow-900 mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              פרטי התחברות שייווצרו:
            </h3>
            <ul className="text-yellow-800 text-sm space-y-1">
              <li>• <strong>מייל:</strong> {businessData.email}</li>
              <li>• <strong>סיסמה ראשונית:</strong> {businessData.password}</li>
            </ul>
            <p className="text-yellow-700 text-xs mt-2">
              * יש להחליף את הסיסמה בהתחברות הראשונה
            </p>
          </div>

          {result && (
            <div className={`p-4 rounded-lg border ${
              result.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className={`flex items-start gap-2 ${
                result.success ? 'text-green-900' : 'text-red-900'
              }`}>
                {result.success ? (
                  <CheckCircle2 className="h-5 w-5 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 mt-0.5" />
                )}
                <div className="flex-1">
                  <h4 className="font-medium mb-1">
                    {result.success ? 'הצלחה!' : 'שגיאה'}
                  </h4>
                  <p className="text-sm whitespace-pre-line">{result.message}</p>
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={createAdmin}
            disabled={loading || (result?.success === true)}
            className="w-full"
            size="lg"
          >
            {loading ? 'יוצר משתמש...' : result?.success ? 'המשתמש נוצר בהצלחה ✓' : 'צור משתמש מנהל'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateMissingAdmin;
