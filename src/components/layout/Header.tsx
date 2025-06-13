
import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/BackButton';
import { BusinessSwitcher } from './BusinessSwitcher';
import { useBusiness } from '@/hooks/useBusiness';
import { useAuth } from '@/components/auth/AuthContext';
import { useLocation } from 'react-router-dom';
import { LogOut, Menu } from 'lucide-react';

interface HeaderProps {
  showMobileMenu?: boolean;
  onMobileMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  showMobileMenu = false, 
  onMobileMenuToggle 
}) => {
  const { business, isSuperAdmin } = useBusiness();
  const { user, session, loading, signOut } = useAuth();
  const location = useLocation();

  console.log('🎯 Header render - Auth state:', {
    hasUser: !!user,
    hasSession: !!session,
    loading,
    isSuperAdmin
  });

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Only show user info if we have both user and session (truly logged in)
  const isAuthenticated = user && session;

  // Show back button for deep navigation paths
  const showBackButton = location.pathname.split('/').length > 3;

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        {/* Single Menu Button - Only show one based on mobile/desktop state */}
        {showMobileMenu ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileMenuToggle}
            className="h-9 w-9 md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">פתח תפריט</span>
          </Button>
        ) : (
          /* Desktop Sidebar Trigger - Only on desktop */
          <SidebarTrigger className="hidden md:flex" />
        )}
        
        {showBackButton && <BackButton />}
        
        {/* Business/App Title */}
        <div className="flex flex-col">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
            {business?.name || 'מערכת ניהול'}
          </h1>
          {showMobileMenu && business && (
            <span className="text-xs text-gray-500 md:hidden">
              {isSuperAdmin ? 'מנהל על' : 'משתמש עסקי'}
            </span>
          )}
        </div>
      </div>
      
      {/* User Info & Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {loading ? (
          <span className="text-sm text-gray-400">טוען...</span>
        ) : isAuthenticated ? (
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Business Switcher */}
            <BusinessSwitcher />
            
            {/* Logout Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-red-600 p-2 sm:px-3"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">התנתק</span>
            </Button>
          </div>
        ) : (
          <span className="text-sm text-red-600">לא מחובר</span>
        )}
      </div>
    </header>
  );
};
