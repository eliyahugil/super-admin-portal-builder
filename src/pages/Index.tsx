
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthContext';
import { useBusiness } from '@/hooks/useBusiness';
import { FeaturesGrid } from './index/FeaturesGrid';
import { CallToActionSection } from './index/CallToActionSection';
import { BenefitsSection } from './index/BenefitsSection';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading, profile } = useAuth();
  const { isSuperAdmin } = useBusiness();

  console.log('📄 Index page rendering:', { user: !!user, loading, profile: !!profile });

  useEffect(() => {
    console.log('📄 Index useEffect:', { user: !!user, loading, profile: !!profile, role: profile?.role });
    if (!loading && user && profile) {
      if (profile.role === 'super_admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/modules/employees', { replace: true });
      }
    }
  }, [user, loading, profile, navigate, isSuperAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header with Manager Login Button */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-lg font-semibold text-gray-900">
            👨‍💼 מערכת ניהול עסקים
          </div>
          <button
            onClick={() => navigate('/auth?tab=manager')}
            className="px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors font-medium"
          >
            👔 התחברות למנהל
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Main Content for Employee Login */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            👨‍💼 כניסה לעובדי החברה
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            הגישה למערכת הניהול, צפייה במשמרות, הגשת בקשות והתקבלות התראות
          </p>
          
          {/* Employee Login Section */}
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              כניסה כעובד
            </h2>
            <div className="space-y-4">
              <button
                onClick={() => navigate('/auth?tab=employee')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors text-lg"
              >
                🔐 התחבר כעובד
              </button>
              <div className="text-sm text-gray-500">
                או השתמש בקוד רישום שקיבלת מהמנהל
              </div>
            </div>
          </div>
        </div>

        <FeaturesGrid />
        <CallToActionSection
          onAuth={() => navigate('/auth')}
          onLearnMore={() => navigate('/learn-more')}
          onLogin={() => navigate('/auth')}
        />
        <BenefitsSection />
      </div>
    </div>
  );
};

export default Index;
