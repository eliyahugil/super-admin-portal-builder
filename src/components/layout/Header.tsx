
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
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4" dir="rtl">
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
            {businessName && (
              <p className="text-xs sm:text-sm text-gray-600">
                {isSuperAdmin ? `נבחר: ${businessName}` : businessName}
              </p>
            )}
            {isSuperAdmin && !businessId && (
              <p className="text-xs sm:text-sm text-orange-600">
                יש לבחור עסק מהתפריט למעלה
              </p>
            )}
          </div>
        </div>

        {/* Business Switcher - Center (only on desktop) */}
        {!isMobile && (
          <div className="flex-1 flex justify-center">
            <BusinessSwitcher />
          </div>
        )}

        {/* User Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">
                {user.email}
              </span>
            </div>
          )}
          <Button
            onClick={signOut}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">יציאה</span>
          </Button>
        </div>
      </div>
      
      {/* Business Switcher for Mobile - Below header */}
      {isMobile && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <BusinessSwitcher />
        </div>
      )}
    </header>
  );
};
