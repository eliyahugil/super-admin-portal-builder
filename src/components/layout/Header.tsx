
import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useBusiness } from '@/hooks/useBusiness';
import { useAuth } from '@/components/auth/AuthContext';
import { LogOut, User } from 'lucide-react';

export const Header: React.FC = () => {
  const { business, isSuperAdmin } = useBusiness();
  const { profile, user, loading, signOut } = useAuth();

  console.log('🎯 Header render - Auth state:', {
    hasUser: !!user,
    hasProfile: !!profile,
    loading,
    profileRole: profile?.role,
    profileName: profile?.full_name,
    profileEmail: profile?.email,
    isSuperAdmin
  });

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold text-gray-900">
          {business?.name || 'מערכת ניהול'}
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        {loading ? (
          <span className="text-sm text-gray-400">טוען...</span>
        ) : profile && user ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-gray-500" />
              <div className="flex flex-col items-end">
                <span className="text-gray-900 font-medium">
                  {profile.full_name || 'משתמש'}
                </span>
                <span className="text-xs text-gray-500">
                  {user.email}
                </span>
              </div>
            </div>
            <div className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
              {profile.role === 'super_admin' ? 'מנהל על' : 'משתמש עסקי'}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-600 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
              <span>התנתק</span>
            </Button>
          </div>
        ) : (
          <span className="text-sm text-red-600">אין פרופיל</span>
        )}
      </div>
    </header>
  );
};
