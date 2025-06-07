
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';

export const AuthForm: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Get auth context with error handling
  let authContext;
  try {
    authContext = useAuth();
    console.log('✅ AuthForm - Got auth context:', {
      hasUser: !!authContext.user,
      hasProfile: !!authContext.profile,
      loading: authContext.loading
    });
  } catch (error) {
    console.error('❌ AuthForm - Failed to get auth context:', error);
    // Return loading state if auth context is not ready
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">מאתחל מערכת אימות...</p>
          <p className="mt-1 text-xs text-gray-400">טוען הקשר לאימות...</p>
        </div>
      </div>
    );
  }

  const { signIn, signUp, user, profile, loading: authLoading } = authContext;

  // Handle redirects after successful authentication
  useEffect(() => {
    // Don't redirect if still loading or no complete auth data
    if (authLoading || !user || !profile) {
      console.log('AuthForm - Not ready to redirect:', { authLoading, hasUser: !!user, hasProfile: !!profile });
      return;
    }

    // Prevent redirect loops
    if (location.pathname !== '/auth') {
      console.log('AuthForm - Not on auth page, skipping redirect');
      return;
    }

    console.log('AuthForm - User authenticated, redirecting:', {
      user: user.email,
      role: profile.role
    });
    
    if (profile.role === 'super_admin') {
      console.log('AuthForm - Redirecting super admin to /admin');
      navigate('/admin', { replace: true });
    } else {
      console.log('AuthForm - Redirecting regular user to /modules/employees');
      navigate('/modules/employees', { replace: true });
    }
  }, [user, profile, authLoading, navigate, location.pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('AuthForm - Submitting form:', { isLogin, email });
    setLoading(true);

    try {
      let result;
      
      if (isLogin) {
        console.log('AuthForm - Attempting login');
        result = await signIn(email, password);
      } else {
        console.log('AuthForm - Attempting signup');
        result = await signUp(email, password, fullName);
      }

      if (result.error) {
        console.error('AuthForm - Auth error:', result.error);
        toast({
          title: 'שגיאה',
          description: result.error.message,
          variant: 'destructive',
        });
      } else if (!isLogin) {
        console.log('AuthForm - Signup successful');
        toast({
          title: 'הרשמה בוצעה בהצלחה',
          description: 'אנא בדוק את המייל שלך לאישור החשבון',
        });
      }
    } catch (error) {
      console.error('AuthForm - Exception:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה במערכת',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while auth is loading
  if (authLoading) {
    console.log('AuthForm - Auth still loading...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">טוען...</p>
          <p className="mt-1 text-xs text-gray-400">בודק מצב אימות...</p>
        </div>
      </div>
    );
  }

  console.log('AuthForm - Rendering form');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            מערכת ניהול עסקית
          </CardTitle>
          <CardDescription>
            {isLogin ? 'התחבר לחשבון שלך' : 'צור חשבון חדש'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">שם מלא</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  dir="rtl"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">אימייל</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">סיסמה</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || authLoading}
            >
              {loading ? 'מעבד...' : (isLogin ? 'התחבר' : 'הירשם')}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm"
              disabled={loading || authLoading}
            >
              {isLogin ? 'אין לך חשבון? הירשם כאן' : 'יש לך חשבון? התחבר כאן'}
            </Button>
          </div>

          {/* Debug info in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
              <div>User: {user?.email || 'None'}</div>
              <div>Profile: {profile?.role || 'None'}</div>
              <div>Auth Loading: {authLoading ? 'Yes' : 'No'}</div>
              <div>Form Loading: {loading ? 'Yes' : 'No'}</div>
              <div>Current Path: {location.pathname}</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
