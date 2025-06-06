
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/auth/AuthContext';
import { useBusiness } from '@/hooks/useBusiness';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading, profile } = useAuth();
  const { isSuperAdmin } = useBusiness();

  // Auto-redirect logged in users to their appropriate dashboard
  useEffect(() => {
    console.log('Index page effect - loading:', loading, 'user:', user?.email, 'profile:', profile, 'isSuperAdmin:', isSuperAdmin);
    
    if (!loading && user && profile) {
      console.log('User is authenticated, profile loaded. Redirecting...');
      
      if (profile.role === 'super_admin') {
        console.log('Redirecting super admin to /admin');
        navigate('/admin', { replace: true });
      } else {
        console.log('Redirecting regular user to /modules/employees');
        navigate('/modules/employees', { replace: true });
      }
    }
  }, [user, loading, profile, navigate]);

  // Don't render anything while checking auth status
  if (loading) {
    console.log('Index page loading...');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען...</p>
        </div>
      </div>
    );
  }

  // Only show marketing page to non-authenticated users
  if (user) {
    console.log('User exists but still showing Index page - waiting for profile or redirect');
    return null; // Will redirect via useEffect
  }

  console.log('Showing marketing page to non-authenticated user');

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            👨‍💼 מערכת ניהול מתקדמת לעסקים
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            פלטפורמה מקיפה לניהול עובדים, אינטגרציות חכמות, CRM מובנה וכלי ניהול משמרות מתקדמים
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <FeatureCard 
            title="👥 ניהול עובדים מתקדם"
            description="ניהול מידע עובדים, מסמכים דיגיטליים, מעקב נוכחות, בקשות עובדים וכלי ניהול משמרות חכמים"
            icon="👥"
          />
          <FeatureCard 
            title="🔗 אינטגרציות חכמות"
            description="חיבור קל ומהיר ל-WhatsApp Business, Google Maps, Facebook Leads, מערכות חשבוניות ועוד"
            icon="🔗"
          />
          <FeatureCard 
            title="🤝 CRM מובנה"
            description="מעקב לידים, ניהול לקוחות, אוטומציות שיווקיות וכלי מכירות מתקדמים"
            icon="🤝"
          />
          <FeatureCard 
            title="🏢 ניהול סניפים"
            description="ניהול מרכזי של מספר סניפים, הגדרת תפקידים והרשאות לכל סניף"
            icon="🏢"
          />
          <FeatureCard 
            title="📊 דוחות וניתוחים"
            description="דוחות מפורטים על ביצועי עובדים, נוכחות, מכירות ותובנות עסקיות"
            icon="📊"
          />
          <FeatureCard 
            title="⚙️ התאמה אישית"
            description="מודולים מותאמים אישית, הגדרות גמישות והתאמה לצרכי העסק הספציפיים"
            icon="⚙️"
          />
        </div>

        {/* Call to Action Buttons */}
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-semibold text-gray-900 mb-8">
            מוכנים להתחיל?
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto">
            <Button 
              size="lg" 
              className="w-full sm:w-auto text-lg px-8 py-4 bg-green-600 hover:bg-green-700"
              onClick={() => navigate('/auth')}
            >
              🧪 נסו את המערכת בחינם
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full sm:w-auto text-lg px-8 py-4"
              onClick={() => navigate('/learn-more')}
            >
              📘 למידע נוסף
            </Button>
          </div>

          {/* Login Link */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-gray-600 mb-4">
              כבר יש לכם חשבון?
            </p>
            <Button 
              variant="ghost" 
              size="lg"
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              onClick={() => navigate('/auth')}
            >
              🔐 התחברו כאן
            </Button>
          </div>
        </div>

        {/* Additional Benefits Section */}
        <div className="mt-20 bg-white rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            למה לבחור במערכת שלנו?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <h4 className="font-semibold text-gray-900">הקמה מהירה</h4>
                  <p className="text-gray-600">התקנה ותפעול תוך דקות ספורות</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔒</span>
                <div>
                  <h4 className="font-semibold text-gray-900">אבטחה מתקדמת</h4>
                  <p className="text-gray-600">הגנה מלאה על נתוני העסק והעובדים</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📱</span>
                <div>
                  <h4 className="font-semibold text-gray-900">ממשק ידידותי</h4>
                  <p className="text-gray-600">עיצוב אינטואיטיבי ונוח לשימוש</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <h4 className="font-semibold text-gray-900">תמיכה מלאה</h4>
                  <p className="text-gray-600">צוות התמיכה זמין לעזרה בכל עת</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon }) => {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-blue-500">
      <CardHeader className="text-center pb-4">
        <div className="text-4xl mb-2">{icon}</div>
        <CardTitle className="text-xl font-bold text-gray-900">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-gray-600 text-center leading-relaxed">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
};

export default Index;
