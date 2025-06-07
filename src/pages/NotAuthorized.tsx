
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowRight, Home } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';

export const NotAuthorized: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const handleGoHome = () => {
    // Redirect based on user role
    if (profile?.role === 'super_admin') {
      navigate('/admin');
    } else {
      navigate('/modules/employees');
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">
            אין הרשאה
          </CardTitle>
          <CardDescription className="text-gray-600">
            אין לך הרשאות מתאימות לגישה לדף זה
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-gray-500">
            <p>התפקיד שלך: <span className="font-medium">{profile?.role}</span></p>
            <p className="mt-2">אנא פנה למנהל המערכת להרחבת הרשאות</p>
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={handleGoHome} 
              className="w-full"
              variant="default"
            >
              <Home className="ml-2 h-4 w-4" />
              חזור לדף הבית
            </Button>
            
            <Button 
              onClick={handleGoBack} 
              className="w-full"
              variant="outline"
            >
              <ArrowRight className="ml-2 h-4 w-4" />
              חזור לדף הקודם
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotAuthorized;
