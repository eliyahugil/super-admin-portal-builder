
import React from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { BusinessSwitcher } from './BusinessSwitcher';
import { Button } from '@/components/ui/button';
import { LogOut, User, Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface HeaderProps {
  onMobileMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle }) => {
  const { user, signOut, loading } = useAuth();
  const { businessName, isSuperAdmin, businessId } = useCurrentBusiness();
  const isMobile = useIsMobile();

  console.log('🔍 Header - Business state:', { businessName, isSuperAdmin, businessId });

  if (loading) {
    return (
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="animate-pulse bg-gray-200 h-6 w-32 rounded"></div>
          <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 shadow-sm" dir="rtl">
      <div className="flex items-center justify-between">
        {/* Mobile Menu Button and Logo */}
        <div className="flex items-center gap-4">
          {isMobile && onMobileMenuToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMobileMenuToggle}
              className="p-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          <div className="text-right">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">
              מערכת ניהול AllForYou
            </h1>
            
            {/* Status display */}
            <div className="flex flex-col gap-1">
              {isSuperAdmin && !businessId && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <p className="text-xs sm:text-sm text-purple-700 font-medium">
                    👑 מצב מנהל מערכת ראשי
                  </p>
                </div>
              )}
              
              {businessName && businessId && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <p className="text-xs sm:text-sm text-blue-700 font-medium">
                    🏢 עובד על: {businessName}
                  </p>
                </div>
              )}
              
              {isSuperAdmin && !businessId && !businessName && (
                <p className="text-xs sm:text-sm text-orange-600 bg-orange-50 px-2 py-1 rounded-md">
                  💡 בחר עסק מהתפריט למעבר לניהול עסק ספציפי
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Business Switcher - Center (only on desktop) */}
        {!isMobile && (
          <div className="flex-1 flex justify-center max-w-sm mx-4">
            <BusinessSwitcher />
          </div>
        )}

        {/* User Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user && (
            <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">
                {user.email}
              </span>
            </div>
          )}
          <Button
            onClick={signOut}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">יציאה</span>
          </Button>
        </div>
      </div>
      
      {/* Business Switcher for Mobile - Below header */}
      {isMobile && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="mb-2 text-sm text-gray-600 font-medium">בחירת מצב עבודה:</div>
          <BusinessSwitcher />
        </div>
      )}
    </header>
  );
};
