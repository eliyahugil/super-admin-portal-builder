
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';
import { SimpleAccessRequestForm } from './SimpleAccessRequestForm';
import { Building, User, Mail, Lock, Eye, EyeOff, Phone } from 'lucide-react';

export const AuthForm: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
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
    // Don't redirect if still loading
    if (authLoading) {
      console.log('AuthForm - Auth still loading, waiting...');
      return;
    }

    // Only redirect if we have both user and profile
    if (!user || !profile) {
      console.log('AuthForm - Missing user or profile:', { hasUser: !!user, hasProfile: !!profile });
      return;
    }

    // Prevent redirect loops
    if (location.pathname !== '/auth') {
      console.log('AuthForm - Not on auth page, skipping redirect');
      return;
    }

    console.log('AuthForm - User authenticated, checking business access:', {
      user: user.email,
      role: profile.role,
      businessId: profile.business_id
    });
    
    // Check if user has business access or is super admin
    if (profile.role === 'super_admin') {
      console.log('AuthForm - Redirecting super admin to /admin');
      navigate('/admin', { replace: true });
    } else if (profile.business_id) {
      console.log('AuthForm - User has business access, redirecting to modules');
      navigate('/modules/employees', { replace: true });
    } else {
      console.log('AuthForm - User needs to request business access');
      // User is authenticated but has no business access - show simple access request form
      return;
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
        console.log('AuthForm - Attempting signup with phone:', phone);
        result = await signUp(email, password, fullName, phone);
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
      } else {
        console.log('AuthForm - Login successful, waiting for redirect...');
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: 'שגיאה',
        description: 'אנא הכנס כתובת מייל',
        variant: 'destructive'
      });
      return;
    }

    console.log('🔄 Sending password reset email to:', email);
    setResetLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`
      });

      if (error) {
        console.error('❌ Password reset error:', error);
        toast({
          title: 'שגיאה',
          description: 'שגיאה בשליחת המייל. נסה שוב מאוחר יותר.',
          variant: 'destructive'
        });
        return;
      }

      console.log('✅ Password reset email sent successfully');
      toast({
        title: 'מייל נשלח בהצלחה',
        description: 'קישור לאיפוס סיסמה נשלח אליך במייל',
      });
      
      // Reset form and go back to login
      setForgotPasswordMode(false);
      setEmail('');
    } catch (error) {
      console.error('💥 Exception in password reset:', error);
      toast({
        title: 'שגיאה',
        description: 'שגיאה בשליחת המייל. נסה שוב מאוחר יותר.',
        variant: 'destructive'
      });
    } finally {
      setResetLoading(false);
    }
  };

  // Show loading state while auth is loading
  if (authLoading) {
    console.log('AuthForm - Auth still loading...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">טוען...</p>
          <p className="mt-1 text-xs text-gray-400">בודק מצב אימות...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated but has no business access, show simple access request form
  if (user && profile && profile.role !== 'super_admin' && !profile.business_id) {
    console.log('AuthForm - Showing simple access request form for user without business');
    return <SimpleAccessRequestForm />;
  }

  console.log('AuthForm - Rendering auth form');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4" dir="rtl">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Building className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            מערכת ניהול עסקית
          </h1>
          <p className="text-gray-600 text-sm sm:text-base mt-2">
            {isLogin ? 'התחבר לחשבון שלך' : 'צור חשבון חדש'}
          </p>
        </div>

        {/* Auth Form */}
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-semibold">
              {forgotPasswordMode ? 'איפוס סיסמה' : (isLogin ? 'התחברות' : 'הרשמה')}
            </CardTitle>
            <CardDescription className="text-sm">
              {forgotPasswordMode 
                ? 'הכנס את כתובת המייל שלך כדי לקבל קישור לאיפוס סיסמה'
                : (isLogin 
                  ? 'הכנס את פרטי החשבון שלך' 
                  : 'מלא את הפרטים כדי ליצור חשבון חדש'
                )
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={forgotPasswordMode ? handleForgotPassword : handleSubmit} className="space-y-4">
              {!isLogin && !forgotPasswordMode && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="flex items-center gap-2 text-sm font-medium">
                    <User className="h-4 w-4" />
                    שם מלא
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="הכנס את שמך המלא"
                    required
                    dir="rtl"
                    className="text-right"
                  />
                </div>
              )}

              {!isLogin && !forgotPasswordMode && (
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium">
                    <Phone className="h-4 w-4" />
                    מספר טלפון
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="הכנס מספר טלפון"
                    dir="ltr"
                    className="text-left"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    לדוגמה: 050-1234567
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                  <Mail className="h-4 w-4" />
                  כתובת מייל
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@company.com"
                  required
                  dir="ltr"
                  className="text-left"
                />
              </div>
              
              {!forgotPasswordMode && (
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium">
                  <Lock className="h-4 w-4" />
                  סיסמה
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="הכנס סיסמה"
                    required
                    dir="ltr"
                    className="text-left pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {!isLogin && (
                  <p className="text-xs text-gray-500 mt-1">
                    הסיסמה חייבת להכיל לפחות 6 תווים
                  </p>
                )}
              </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full mt-6" 
                disabled={(forgotPasswordMode ? resetLoading : loading) || authLoading}
                size="lg"
              >
                {(forgotPasswordMode ? resetLoading : loading) ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>מעבד...</span>
                  </div>
                ) : (
                  forgotPasswordMode ? 'שלח קישור איפוס' : (isLogin ? 'התחבר' : 'הירשם')
                )}
              </Button>
            </form>
            
            {/* Switch Mode & Forgot Password */}
            <div className="mt-6 text-center space-y-2">
              {!forgotPasswordMode ? (
                <>
                  <Button
                    variant="link"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setEmail('');
                      setPassword('');
                      setFullName('');
                      setPhone('');
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800"
                    disabled={loading || authLoading}
                  >
                    {isLogin ? 'אין לך חשבון? הירשם כאן' : 'יש לך חשבון? התחבר כאן'}
                  </Button>
                  
                  {isLogin && (
                    <div>
                      <Button
                        variant="link"
                        onClick={() => setForgotPasswordMode(true)}
                        className="text-sm text-gray-600 hover:text-gray-800"
                        disabled={loading || authLoading}
                      >
                        שכחתי סיסמה
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <Button
                  variant="link"
                  onClick={() => {
                    setForgotPasswordMode(false);
                    setEmail('');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                  disabled={resetLoading}
                >
                  חזרה להתחברות
                </Button>
              )}
            </div>

            {/* Debug info in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-3 bg-gray-100 rounded text-xs space-y-1">
                <div><strong>Debug Info:</strong></div>
                <div>User: {user?.email || 'None'}</div>
                <div>Profile: {profile?.role || 'None'}</div>
                <div>Business ID: {profile?.business_id || 'None'}</div>
                <div>Auth Loading: {authLoading ? 'Yes' : 'No'}</div>
                <div>Form Loading: {loading ? 'Yes' : 'No'}</div>
                <div>Current Path: {location.pathname}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="text-center text-xs text-gray-500">
          <p>בהתחברות אתה מסכים לתנאי השימוש ולמדיניות הפרטיות</p>
        </div>
      </div>
    </div>
  );
};
