
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
      <div className="w-full h-16 bg-white border-b border-gray-200 px-6 py-4 flex items-center mobile-header-fix" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        height: '64px',
        width: '100%'
      }}>
        <div className="flex items-center justify-between w-full">
          <div className="animate-pulse bg-gray-200 h-6 w-32 rounded"></div>
          <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-16 bg-white border-b border-gray-200 px-3 sm:px-6 flex items-center mobile-header-fix" dir="rtl" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 99999,
      height: '64px',
      width: '100%'
    }}>
      <div className="flex items-center justify-between w-full h-full">
        {/* Mobile Menu Button and Logo */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          {isMobile && onMobileMenuToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMobileMenuToggle}
              className="p-1.5 sm:p-2 flex-shrink-0"
            >
              <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          )}
          
          <div className="text-right min-w-0 flex-1">
            <h1 className="text-sm sm:text-lg md:text-xl font-bold text-gray-900 truncate">
              מערכת ניהול AllForYou
            </h1>
            
            {/* Status display - Hidden on very small screens */}
            <div className="hidden sm:flex flex-col gap-1 mt-0.5">
              {isSuperAdmin && !businessId && (
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <p className="text-xs text-purple-700 font-medium">
                    👑 מצב מנהל מערכת ראשי
                  </p>
                </div>
              )}
              
              {businessName && businessId && (
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full"></div>
                  <p className="text-xs text-blue-700 font-medium">
                    🏢 עובד על: {businessName}
                  </p>
                </div>
              )}
              
              {isSuperAdmin && !businessId && !businessName && (
                <p className="text-xs text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-md">
                  💡 בחר עסק מהתפריט
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Business Switcher and Notifications and User Profile Menu - Right side */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {isSuperAdmin && !isMobile && <BusinessSwitcher />}
          <NotificationIcon />
          <UserProfileMenu />
        </div>
      </div>
    </div>
  );
};
