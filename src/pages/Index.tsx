
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

  useEffect(() => {
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
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            👨‍💼 מערכת ניהול מתקדמת לעסקים
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            פלטפורמה מקיפה לניהול עובדים, אינטגרציות חכמות, CRM מובנה וכלי ניהול משמרות מתקדמים
          </p>
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
