import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmailVerificationHelpProps {
  email?: string;
  onResendVerification?: () => void;
  isResending?: boolean;
}

export const EmailVerificationHelp: React.FC<EmailVerificationHelpProps> = ({
  email,
  onResendVerification,
  isResending = false
}) => {
  const { toast } = useToast();

  const handleCopyEmail = () => {
    if (email) {
      navigator.clipboard.writeText(email);
      toast({
        title: 'הועתק',
        description: 'כתובת המייל הועתקה ללוח',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Clock className="h-12 w-12 text-orange-500" />
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-orange-500 rounded-full animate-ping"></div>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-orange-700">
            נדרש אישור אימייל 📧
          </CardTitle>
          <CardDescription>
            נשלח אליך קישור לאישור החשבון
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <h4 className="font-medium text-orange-900 mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              בדוק את המייל שלך
            </h4>
            <ul className="text-sm text-orange-800 space-y-1">
              <li>• חפש מייל מ"מערכת ניהול עסקית"</li>
              <li>• בדוק גם בתיקיית הספאם/זבל</li>
              <li>• לחץ על הקישור במייל לאישור</li>
              <li>• אחרי האישור תוכל להתחבר למערכת</li>
            </ul>
          </div>

          {email && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">מייל נשלח אל:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm bg-white p-2 rounded border">
                  {email}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyEmail}
                >
                  העתק
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {onResendVerification && (
              <Button
                onClick={onResendVerification}
                disabled={isResending}
                className="w-full"
                variant="outline"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    שולח מחדש...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    שלח מייל אישור מחדש
                  </>
                )}
              </Button>
            )}

            <Button
              onClick={() => window.location.href = '/auth'}
              variant="secondary"
              className="w-full"
            >
              חזרה להתחברות
            </Button>
          </div>

          <div className="text-center">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">טיפ</span>
              </div>
              <p className="text-xs text-green-800">
                לאחר אישור המייל, תוכל לבקש גישה למערכת ומנהל העסק יאשר את הבקשה
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};