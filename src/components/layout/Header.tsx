
import React from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { UserProfileMenu } from './UserProfileMenu';
import { NotificationIcon } from '@/components/modules/shifts/notifications/NotificationIcon';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { BusinessSwitcher } from './BusinessSwitcher';

interface HeaderProps {
  onMobileMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle }) => {
  const { loading } = useAuth();
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

        {/* Business Switcher and Notifications and User Profile Menu - Right side */}
        <div className="flex items-center gap-2">
          {isSuperAdmin && <BusinessSwitcher />}
          <NotificationIcon />
          <UserProfileMenu />
        </div>
      </div>
    </header>
  );
};
